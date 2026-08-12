import { Link } from "@tanstack/react-router";
import { Clapperboard, Heart, Sparkles, UserRound } from "lucide-react";

import { PosterArt } from "@/components/movie/poster-art";
import { MovieRating } from "@/components/movie/movie-rating";
import { GenreBadge } from "@/components/movie/genre-badge";
import type { Recommendation } from "@/lib/movies/types";
import { cn } from "@/lib/utils";

export function RecommendationScore({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-strong">
        <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-primary">{score}% match</span>
    </div>
  );
}

export function RecommendationReason({ reason, kind }: { reason: string; kind: Recommendation["reasonKind"] }) {
  const Icon =
    kind === "director" ? Clapperboard : kind === "actor" ? UserRound : kind === "watched" ? Sparkles : Heart;

  return (
    <p className="flex items-start gap-2 rounded-lg bg-surface-strong/60 px-2.5 py-2 text-xs text-muted-foreground">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <span className="line-clamp-2">{reason}</span>
    </p>
  );
}

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const { movie } = rec;
  return (
    <Link
      to="/movies/$id"
      params={{ id: movie.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
    >
      <PosterArt movie={movie} className="aspect-2/3 w-full" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm font-semibold leading-tight">{movie.title}</h3>
          <MovieRating rating={movie.rating} />
        </div>
        <div className="flex flex-wrap gap-1">
          {movie.genres.slice(0, 2).map((g) => (
            <GenreBadge key={g} genre={g} />
          ))}
        </div>
        <RecommendationScore score={rec.score} />
        <RecommendationReason reason={rec.reason} kind={rec.reasonKind} />
      </div>
    </Link>
  );
}

export function RecommendationSection({
  title,
  subtitle,
  items,
  className,
}: {
  title: string;
  subtitle?: string | undefined;
  items: Recommendation[];
  className?: string | undefined;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="font-display text-xl font-bold sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((rec) => (
          <RecommendationCard key={rec.movie.id} rec={rec} />
        ))}
      </div>
    </section>
  );
}
