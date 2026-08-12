export type Movie = {
  id: string;
  title: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  director: string;
  cast: string[];
  description: string;
  /** 0-360 hue used by the generated poster artwork */
  hue: number;
  popularity: number;
  trending?: boolean;
};

export type RecommendationReasonKind = "watched" | "genre" | "director" | "actor";

export type Recommendation = {
  movie: Movie;
  score: number;
  reason: string;
  reasonKind: RecommendationReasonKind;
};

export type RecommendationGroup = {
  key: string;
  title: string;
  subtitle?: string;
  items: Recommendation[];
};

export type UserActivity = {
  watched: string[];
  liked: string[];
};

export type MovieQuery = {
  q?: string;
  genre?: string;
  year?: string;
  minRating?: number;
  sort?: "rating" | "year" | "title";
  limit?: number;
};
