import { createServerFn } from "@tanstack/react-start";

import type { MovieQuery, UserActivity } from "./types";

export const listMoviesFn = createServerFn({ method: "GET" })
  .inputValidator((data: MovieQuery) => data ?? {})
  .handler(async ({ data }) => {
    const { rankMovies } = await import("./query-utils");
    const { fetchAllMovies } = await import("./cognodb.server");
    return rankMovies(await fetchAllMovies(), data);
  });

export const popularMoviesFn = createServerFn({ method: "GET" })
  .inputValidator((data: { limit?: number }) => data ?? {})
  .handler(async ({ data }) => {
    const { fetchAllMovies } = await import("./cognodb.server");
    const movies = await fetchAllMovies();
    return [...movies].sort((a, b) => b.popularity - a.popularity).slice(0, data.limit ?? 10);
  });

export const trendingMoviesFn = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchAllMovies } = await import("./cognodb.server");
  return (await fetchAllMovies()).filter((m) => m.trending);
});

export const getMovieFn = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { fetchMovie } = await import("./cognodb.server");
    return fetchMovie(data.id);
  });

export const searchMoviesFn = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string }) => data)
  .handler(async ({ data }) => {
    const q = data.q.trim();
    if (!q) return [];
    const { matchesQuery } = await import("./query-utils");
    const { fetchAllMovies } = await import("./cognodb.server");
    const movies = await fetchAllMovies();
    return movies.filter((m) => matchesQuery(m, q)).sort((a, b) => b.rating - a.rating);
  });

export const relatedMoviesFn = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    const { fetchRelated } = await import("./cognodb.server");
    return fetchRelated(data.id, data.limit ?? 6);
  });

export const recommendationsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { activity: UserActivity; limit?: number }) => data)
  .handler(async ({ data }) => {
    const { buildRecommendations } = await import("./query-utils");
    const { fetchAllMovies } = await import("./cognodb.server");
    return buildRecommendations(await fetchAllMovies(), data.activity, data.limit ?? 12);
  });

export const recommendationGroupsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { activity: UserActivity }) => data)
  .handler(async ({ data }) => {
    const { buildRecommendationGroups } = await import("./query-utils");
    const { fetchAllMovies } = await import("./cognodb.server");
    return buildRecommendationGroups(await fetchAllMovies(), data.activity);
  });

export const getActivityFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const { fetchActivity } = await import("./cognodb.server");
    return fetchActivity(data.email);
  });

export const toggleActivityFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; movieId: string; kind: "watched" | "liked" }) => data)
  .handler(async ({ data }) => {
    const { toggleActivity } = await import("./cognodb.server");
    return toggleActivity(data.email, data.movieId, data.kind);
  });
