import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PosterArt } from "@/components/movie/poster-art";
import { MovieRating } from "@/components/movie/movie-rating";
import { GenreBadge } from "@/components/movie/genre-badge";
import { EmptyState, ErrorState } from "@/components/feedback/states";
import { searchAll } from "@/lib/movies/api";
import type { Movie } from "@/lib/movies/types";

type SearchParams = { q: string };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Search Movies, Actors & Directors — MovieGraph" },
      {
        name: "description",
        content:
          "Search the MovieGraph collection by movie title, actor or director and jump straight into the details.",
      },
      { property: "og:title", content: "Search — MovieGraph" },
      {
        property: "og:description",
        content: "Find films by title, actor or director across the MovieGraph collection.",
      },
    ],
  }),
  component: SearchPage,
});

function ResultRow({ movie }: { movie: Movie }) {
  return (
    <Link
      to="/movies/$id"
      params={{ id: movie.id }}
      className="group grid grid-cols-[80px_minmax(0,1fr)] gap-4 rounded-2xl border border-border/60 bg-card p-3 transition-colors hover:border-primary/50 sm:grid-cols-[110px_minmax(0,1fr)] sm:p-4"
    >
      <PosterArt movie={movie} className="aspect-2/3 w-full rounded-xl" />
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-base font-semibold sm:text-lg">{movie.title}</h3>
          <span className="text-sm text-muted-foreground">{movie.year}</span>
          <MovieRating rating={movie.rating} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {movie.genres.map((g) => (
            <GenreBadge key={g} genre={g} />
          ))}
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{movie.description}</p>
      </div>
    </Link>
  );
}

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [value, setValue] = useState(q);

  useEffect(() => setValue(q), [q]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (value !== q) navigate({ search: { q: value }, replace: true });
    }, 350);
    return () => clearTimeout(t);
  }, [value, q, navigate]);

  const results = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchAll(q),
    enabled: q.trim().length > 0,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-14 md:px-8">
      <header className="space-y-3 text-center">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Search MovieGraph</h1>
        <p className="text-muted-foreground">Find films by title, actor or director.</p>
      </header>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search movies, actors, directors..."
          aria-label="Search movies, actors, directors"
          className="h-14 rounded-full bg-surface pl-12 text-base"
        />
      </div>

      {q.trim().length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="h-6 w-6" />}
          title="Start typing to search"
          description="Try “Nolan”, “Leonardo DiCaprio” or “Sci-Fi”."
        />
      ) : results.isPending ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 rounded-2xl border border-border/60 bg-card p-3 sm:grid-cols-[110px_minmax(0,1fr)]"
            >
              <Skeleton className="aspect-2/3 w-full rounded-xl" />
              <div className="space-y-3 py-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : results.isError ? (
        <ErrorState
          title="Search failed"
          description={(results.error as Error).message}
          onRetry={() => results.refetch()}
        />
      ) : results.data.length === 0 ? (
        <EmptyState
          title="No movies found. Try searching for another title."
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/movies">Browse all movies</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {results.data.length} result{results.data.length === 1 ? "" : "s"} for “{q}”
          </p>
          {results.data.map((movie) => (
            <ResultRow key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
