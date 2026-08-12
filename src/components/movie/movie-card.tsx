import { Link } from "@tanstack/react-router";
import { Check, Heart } from "lucide-react";

import { PosterArt } from "./poster-art";
import { MovieRating } from "./movie-rating";
import { useUser } from "@/lib/user-state";
import type { Movie } from "@/lib/movies/types";
import { cn } from "@/lib/utils";

export function MovieCard({ movie, className }: { movie: Movie; className?: string }) {
  const { isWatched, isLiked } = useUser();
  const watched = isWatched(movie.id);
  const liked = isLiked(movie.id);

  return (
    <Link
      to="/movies/$id"
      params={{ id: movie.id }}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      <div className="relative">
        <PosterArt movie={movie} className="aspect-2/3 w-full" />
        <div className="absolute right-2 top-2 flex gap-1.5">
          {watched && (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-success/90 text-success-foreground">
              <Check className="h-4 w-4" />
            </span>
          )}
          {liked && (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/90 text-primary-foreground">
              <Heart className="h-3.5 w-3.5 fill-current" />
            </span>
          )}
        </div>
        <div className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10" />
      </div>

      <div className="space-y-1.5 p-3">
        <h3 className="truncate font-display text-sm font-semibold">{movie.title}</h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{movie.year}</span>
          <MovieRating rating={movie.rating} />
        </div>
        <p className="truncate text-xs text-muted-foreground">{movie.genres.join(" · ")}</p>
      </div>
    </Link>
  );
}
