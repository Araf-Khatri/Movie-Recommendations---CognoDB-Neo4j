import {
  getActivityFn,
  getMovieFn,
  listMoviesFn,
  popularMoviesFn,
  recommendationGroupsFn,
  recommendationsFn,
  relatedMoviesFn,
  searchMoviesFn,
  toggleActivityFn,
  trendingMoviesFn,
} from "./api.functions";
import type { Movie, MovieQuery, Recommendation, RecommendationGroup, UserActivity } from "./types";

/**
 * Thin client for the CognoDB (Bolt/Cypher) graph. Every call goes through a
 * TanStack server function that talks to the cloud instance.
 */

export async function listMovies(query: MovieQuery = {}): Promise<Movie[]> {
  return listMoviesFn({ data: query });
}

export async function getPopularMovies(limit = 10): Promise<Movie[]> {
  return popularMoviesFn({ data: { limit } });
}

export async function getTrendingMovies(): Promise<Movie[]> {
  return trendingMoviesFn();
}

export async function getMovie(id: string): Promise<Movie | null> {
  return getMovieFn({ data: { id } });
}

export async function searchAll(q: string): Promise<Movie[]> {
  return searchMoviesFn({ data: { q } });
}

export async function getRelated(id: string, limit = 6): Promise<Movie[]> {
  return relatedMoviesFn({ data: { id, limit } });
}

export async function getRecommendations(
  activity: UserActivity,
  limit = 12,
): Promise<Recommendation[]> {
  return recommendationsFn({ data: { activity, limit } });
}

export async function getRecommendationGroups(
  activity: UserActivity,
): Promise<RecommendationGroup[]> {
  return recommendationGroupsFn({ data: { activity } });
}

export async function getActivity(email: string): Promise<UserActivity> {
  return getActivityFn({ data: { email } });
}

export async function toggleActivity(
  email: string,
  movieId: string,
  kind: "watched" | "liked",
): Promise<UserActivity> {
  return toggleActivityFn({ data: { email, movieId, kind } });
}
