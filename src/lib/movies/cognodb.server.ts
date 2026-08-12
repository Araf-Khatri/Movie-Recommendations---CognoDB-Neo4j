import neo4j, { type Driver } from "neo4j-driver";

import type { Movie, UserActivity } from "./types";

let driver: Driver | null = null;

function getDriver(): Driver {
  if (driver) return driver;
  const uri = process.env["COGNODB_URI"];
  const user = process.env["COGNODB_USER"];
  const password = process.env["COGNODB_PASSWORD"];
  if (!uri || !user || !password) throw new Error("CognoDB credentials are not configured");
  driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    disableLosslessIntegers: true,
  });
  return driver;
}

export async function runQuery<T = unknown>(
  cypher: string,
  params: Record<string, unknown> = {},
): Promise<T[]> {
  const session = getDriver().session();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((r) => r.toObject() as T);
  } finally {
    await session.close();
  }
}

const MOVIE_PROJECTION = `
  m.id AS id, m.title AS title, m.year AS year, m.rating AS rating,
  m.runtime AS runtime, m.description AS description, m.hue AS hue,
  m.popularity AS popularity, coalesce(m.trending, false) AS trending,
  [(m)-[:IN_GENRE]->(g:Genre) | g.name] AS genres,
  head([(m)<-[:DIRECTED]-(d:Person) | d.name]) AS director,
  [(m)<-[:ACTED_IN]-(a:Person) | a.name] AS cast
`;

type Row = Record<string, unknown>;

function toMovie(row: Row): Movie {
  return {
    id: String(row["id"]),
    title: String(row["title"]),
    year: Number(row["year"]),
    rating: Number(row["rating"]),
    runtime: Number(row["runtime"]),
    genres: (row["genres"] as string[]) ?? [],
    director: (row["director"] as string) ?? "Unknown",
    cast: (row["cast"] as string[]) ?? [],
    description: String(row["description"] ?? ""),
    hue: Number(row["hue"] ?? 0),
    popularity: Number(row["popularity"] ?? 0),
    trending: Boolean(row["trending"]),
  };
}

export async function fetchAllMovies(): Promise<Movie[]> {
  const rows = await runQuery<Row>(`MATCH (m:Movie) RETURN ${MOVIE_PROJECTION}`);
  return rows.map(toMovie);
}

export async function fetchMovie(id: string): Promise<Movie | null> {
  const rows = await runQuery<Row>(
    `MATCH (m:Movie {id: $id}) RETURN ${MOVIE_PROJECTION}`,
    { id },
  );
  return rows[0] ? toMovie(rows[0]) : null;
}

/** Graph traversal: shared director > shared cast > shared genres. */
export async function fetchRelated(id: string, limit: number): Promise<Movie[]> {
  const rows = await runQuery<Row>(
    `
    MATCH (base:Movie {id: $id})
    MATCH (m:Movie)
    WHERE m.id <> base.id
    WITH base, m,
      size([(base)<-[:DIRECTED]-(d:Person)-[:DIRECTED]->(m) | d]) AS sameDirector,
      size([(base)<-[:ACTED_IN]-(a:Person)-[:ACTED_IN]->(m) | a]) AS sharedActors,
      size([(base)-[:IN_GENRE]->(g:Genre)<-[:IN_GENRE]-(m) | g]) AS sharedGenres
    WITH m, sameDirector * 4 + sharedActors * 3 + sharedGenres * 2 AS score
    WHERE score > 0
    RETURN ${MOVIE_PROJECTION}, score
    ORDER BY score DESC, m.rating DESC
    LIMIT $limit
    `,
    { id, limit: neo4j.int(limit) },
  );
  return rows.map(toMovie);
}

export async function fetchActivity(email: string): Promise<UserActivity> {
  const rows = await runQuery<Row>(
    `
    MERGE (u:User {email: $email})
    RETURN [(u)-[:WATCHED]->(m:Movie) | m.id] AS watched,
           [(u)-[:LIKED]->(m:Movie) | m.id] AS liked
    `,
    { email },
  );
  const row = rows[0];
  return {
    watched: (row?.["watched"] as string[]) ?? [],
    liked: (row?.["liked"] as string[]) ?? [],
  };
}

export async function toggleActivity(
  email: string,
  movieId: string,
  kind: "watched" | "liked",
): Promise<UserActivity> {
  const rel = kind === "watched" ? "WATCHED" : "LIKED";
  await runQuery(`MERGE (u:User {email: $email})`, { email });

  const existing = await runQuery<Row>(
    `MATCH (u:User {email: $email})-[r:${rel}]->(m:Movie {id: $movieId}) RETURN count(r) AS c`,
    { email, movieId },
  );

  if (Number(existing[0]?.["c"] ?? 0) > 0) {
    await runQuery(
      `MATCH (u:User {email: $email})-[r:${rel}]->(m:Movie {id: $movieId}) DELETE r`,
      { email, movieId },
    );
  } else {
    await runQuery(
      `
      MATCH (u:User {email: $email})
      MATCH (m:Movie {id: $movieId})
      MERGE (u)-[nr:${rel}]->(m)
      SET nr.at = timestamp()
      `,
      { email, movieId },
    );
  }
  return fetchActivity(email);
}

export async function seedMovies(movies: Movie[]): Promise<number> {
  await runQuery(`CREATE CONSTRAINT movie_id IF NOT EXISTS FOR (m:Movie) REQUIRE m.id IS UNIQUE`);
  await runQuery(`CREATE CONSTRAINT person_name IF NOT EXISTS FOR (p:Person) REQUIRE p.name IS UNIQUE`);
  await runQuery(`CREATE CONSTRAINT genre_name IF NOT EXISTS FOR (g:Genre) REQUIRE g.name IS UNIQUE`);
  await runQuery(`CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE`);

  await runQuery(
    `
    UNWIND $movies AS row
    MERGE (m:Movie {id: row.id})
    SET m.title = row.title, m.year = row.year, m.rating = row.rating,
        m.runtime = row.runtime, m.description = row.description,
        m.hue = row.hue, m.popularity = row.popularity,
        m.trending = coalesce(row.trending, false)
    WITH m, row
    UNWIND row.genres AS genreName
    MERGE (g:Genre {name: genreName})
    MERGE (m)-[:IN_GENRE]->(g)
    WITH DISTINCT m, row
    MERGE (d:Person {name: row.director})
    MERGE (d)-[:DIRECTED]->(m)
    WITH m, row
    UNWIND row.cast AS actorName
    MERGE (a:Person {name: actorName})
    MERGE (a)-[:ACTED_IN]->(m)
    `,
    { movies },
  );

  const rows = await runQuery<Row>(`MATCH (m:Movie) RETURN count(m) AS c`);
  return Number(rows[0]?.["c"] ?? 0);
}
