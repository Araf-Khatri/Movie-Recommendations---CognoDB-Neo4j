import type { Movie, MovieQuery, Recommendation, RecommendationGroup, UserActivity } from "./types";

export function matchesQuery(movie: Movie, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    movie.title.toLowerCase().includes(needle) ||
    movie.director.toLowerCase().includes(needle) ||
    movie.cast.some((actor) => actor.toLowerCase().includes(needle)) ||
    movie.genres.some((genre) => genre.toLowerCase().includes(needle))
  );
}

export function rankMovies(movies: Movie[], query: MovieQuery = {}): Movie[] {
  const { q = "", genre, year, minRating = 0, sort = "rating" } = query;

  const results = movies.filter((movie) => {
    if (!matchesQuery(movie, q)) return false;
    if (genre && genre !== "all" && !movie.genres.includes(genre)) return false;
    if (year && year !== "all" && `${Math.floor(movie.year / 10) * 10}s` !== year) return false;
    if (movie.rating < minRating) return false;
    return true;
  });

  return results.sort((a, b) => {
    if (sort === "year") return b.year - a.year;
    if (sort === "title") return a.title.localeCompare(b.title);
    return b.rating - a.rating;
  });
}

function topGenres(movies: Movie[], activity: UserActivity): string[] {
  const counts = new Map<string, number>();
  const ids = new Set([...activity.watched, ...activity.liked]);
  for (const id of ids) {
    const movie = movies.find((m) => m.id === id);
    movie?.genres.forEach((g) => counts.set(g, (counts.get(g) ?? 0) + 1));
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([g]) => g);
}

export function buildRecommendations(
  movies: Movie[],
  activity: UserActivity,
  limit = 12,
): Recommendation[] {
  const seen = new Set([...activity.watched, ...activity.liked]);
  if (seen.size === 0) return [];

  const seedMovies = [...seen]
    .map((id) => movies.find((m) => m.id === id))
    .filter((m): m is Movie => Boolean(m));

  const favGenres = topGenres(movies, activity);

  const scored = movies
    .filter((m) => !seen.has(m.id))
    .map((movie) => {
      let score = movie.rating * 2;
      let reason = `Highly rated in ${movie.genres[0]}`;
      let reasonKind: Recommendation["reasonKind"] = "genre";
      let best = 0;

      for (const seed of seedMovies) {
        const sharedActors = movie.cast.filter((a) => seed.cast.includes(a));
        const sharedGenres = movie.genres.filter((g) => seed.genres.includes(g));
        const sameDirector = movie.director === seed.director;

        const local = sharedActors.length * 9 + sharedGenres.length * 5 + (sameDirector ? 12 : 0);
        if (local > best) {
          best = local;
          if (sameDirector) {
            reason = `Directed by ${movie.director}`;
            reasonKind = "director";
          } else if (sharedActors.length) {
            reason = `Features ${sharedActors[0]}, from ${seed.title}`;
            reasonKind = "actor";
          } else {
            reason = `Because you watched ${seed.title}`;
            reasonKind = "watched";
          }
        }
      }

      score += best;
      if (favGenres[0] && movie.genres.includes(favGenres[0])) score += 4;

      return {
        movie,
        score: Math.min(99, Math.round(score * 1.6)),
        reason,
        reasonKind,
      } satisfies Recommendation;
    });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function buildRecommendationGroups(
  movies: Movie[],
  activity: UserActivity,
): RecommendationGroup[] {
  const all = buildRecommendations(movies, activity, 30);
  if (all.length === 0) return [];

  const groups: RecommendationGroup[] = [];
  const watched = activity.watched
    .map((id) => movies.find((m) => m.id === id))
    .filter((m): m is Movie => Boolean(m))
    .slice(0, 3);

  for (const seed of watched) {
    const items = all
      .filter(
        (rec) =>
          rec.movie.director === seed.director ||
          rec.movie.cast.some((a) => seed.cast.includes(a)) ||
          rec.movie.genres.some((g) => seed.genres.includes(g)),
      )
      .slice(0, 5);
    if (items.length) {
      groups.push({
        key: `watched-${seed.id}`,
        title: `Because you watched ${seed.title}`,
        subtitle: `Connected through ${seed.director}, its cast and its genres`,
        items,
      });
    }
  }

  for (const genre of topGenres(movies, activity).slice(0, 2)) {
    const items = all.filter((rec) => rec.movie.genres.includes(genre)).slice(0, 5);
    if (items.length) {
      groups.push({
        key: `genre-${genre}`,
        title: `Because you like ${genre}`,
        subtitle: `Your most-watched genre right now`,
        items,
      });
    }
  }

  return groups;
}
