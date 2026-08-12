import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie/movie-grid";
import { EmptyState, ErrorState } from "@/components/feedback/states";
import { listMovies } from "@/lib/movies/api";
import { ALL_DECADES, ALL_GENRES } from "@/lib/movies/data";

type MoviesSearch = {
  q: string;
  genre: string;
  year: string;
  rating: number;
  sort: "rating" | "year" | "title";
};

const PAGE_SIZE = 10;

export const Route = createFileRoute("/movies/")({
  validateSearch: (search: Record<string, unknown>): MoviesSearch => {
    const sort = String(search["sort"] ?? "rating");
    return {
      q: typeof search["q"] === "string" ? search["q"] : "",
      genre: typeof search["genre"] === "string" ? search["genre"] : "all",
      year: typeof search["year"] === "string" ? search["year"] : "all",
      rating: Number(search["rating"]) || 0,
      sort: sort === "year" || sort === "title" ? sort : "rating",
    };
  },
  head: () => ({
    meta: [
      { title: "Browse Movies — MovieGraph" },
      {
        name: "description",
        content:
          "Search the MovieGraph collection by title, actor or director, then filter by genre, decade and rating.",
      },
      { property: "og:title", content: "Browse Movies — MovieGraph" },
      {
        property: "og:description",
        content: "Search, filter and sort the full MovieGraph film collection.",
      },
    ],
  }),
  component: MoviesPage,
});

function MoviesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [visible, setVisible] = useState(PAGE_SIZE);

  const update = (patch: Partial<MoviesSearch>) => {
    setVisible(PAGE_SIZE);
    navigate({ search: (prev: MoviesSearch) => ({ ...prev, ...patch }) });
  };

  const moviesQuery = useQuery({
    queryKey: ["movies", search],
    queryFn: () =>
      listMovies({
        q: search.q,
        genre: search.genre,
        year: search.year,
        minRating: search.rating,
        sort: search.sort,
      }),
  });

  const movies = moviesQuery.data ?? [];
  const shown = movies.slice(0, visible);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 md:px-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Movies</h1>
        <p className="text-muted-foreground">
          The full collection — search by title, actor or director.
        </p>
      </header>

      <div className="space-y-4 rounded-2xl border border-border/60 bg-surface/50 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search by title, actor or director..."
            aria-label="Search movies"
            className="h-11 rounded-full bg-background pl-9"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Select value={search.genre} onValueChange={(v) => update({ genre: v })}>
            <SelectTrigger aria-label="Genre">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genres</SelectItem>
              {ALL_GENRES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={search.year} onValueChange={(v) => update({ year: v })}>
            <SelectTrigger aria-label="Release decade">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {ALL_DECADES.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(search.rating)}
            onValueChange={(v) => update({ rating: Number(v) })}
          >
            <SelectTrigger aria-label="Minimum rating">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any rating</SelectItem>
              <SelectItem value="7">7.0+</SelectItem>
              <SelectItem value="8">8.0+</SelectItem>
              <SelectItem value="8.5">8.5+</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={search.sort}
            onValueChange={(v) => update({ sort: v as MoviesSearch["sort"] })}
          >
            <SelectTrigger aria-label="Sort by">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Top rated</SelectItem>
              <SelectItem value="year">Newest first</SelectItem>
              <SelectItem value="title">Title A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {moviesQuery.isPending ? (
        <MovieGridSkeleton />
      ) : moviesQuery.isError ? (
        <ErrorState
          description="We couldn't load the movie collection."
          onRetry={() => moviesQuery.refetch()}
        />
      ) : movies.length === 0 ? (
        <EmptyState
          title="No movies found."
          description="Try a different search term or loosen your filters."
          action={
            <Button
              className="rounded-full"
              onClick={() => update({ q: "", genre: "all", year: "all", rating: 0 })}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {shown.length} of {movies.length} movies
          </p>
          <MovieGrid movies={shown} />
          {shown.length < movies.length && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
