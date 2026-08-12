import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Network } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PosterArt } from "@/components/movie/poster-art";
import { MovieRating } from "@/components/movie/movie-rating";
import { GenreBadge } from "@/components/movie/genre-badge";
import { MovieActions } from "@/components/movie/movie-actions";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie/movie-grid";
import { EmptyState, ErrorState } from "@/components/feedback/states";
import { getMovie, getRelated } from "@/lib/movies/api";

export const Route = createFileRoute("/movies/$id")({
  loader: async ({ params }) => {
    const movie = await getMovie(params.id);
    if (!movie) throw notFound();
    return { movie };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Movie unavailable — MovieGraph" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { movie } = loaderData;
    const title = `${movie.title} (${movie.year}) — MovieGraph`;
    return {
      meta: [
        { title },
        { name: "description", content: movie.description },
        { property: "og:title", content: title },
        { property: "og:description", content: movie.description },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <ErrorState description={error.message} />
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <EmptyState
        title="Looks like this movie doesn't exist."
        description="It may have been removed from the collection."
        action={
          <Button asChild className="rounded-full">
            <Link to="/movies">Back to Movies</Link>
          </Button>
        }
      />
    </div>
  ),
  pendingComponent: () => (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[320px_1fr] md:px-8">
      <Skeleton className="aspect-2/3 w-full rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  ),
  component: MovieDetailsPage,
});

function MovieDetailsPage() {
  const { movie } = Route.useLoaderData();

  const related = useQuery({
    queryKey: ["related", movie.id],
    queryFn: () => getRelated(movie.id),
  });

  return (
    <div className="relative pb-20">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[420px] opacity-30"
        style={{
          background: `radial-gradient(70% 100% at 30% 0%, hsl(${movie.hue} 70% 40%), transparent 70%)`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-[300px_1fr] lg:grid-cols-[360px_1fr]">
          <PosterArt
            movie={movie}
            className="aspect-2/3 w-full rounded-2xl border border-border/60 shadow-[0_30px_80px_-40px_rgba(0,0,0,1)]"
          />

          <div className="min-w-0 space-y-6">
            <div className="space-y-3">
              <h1 className="font-display text-3xl font-extrabold sm:text-5xl">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>{movie.year}</span>
                <MovieRating rating={movie.rating} size="lg" />
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {movie.runtime} min
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g: string) => (
                  <GenreBadge key={g} genre={g} />
                ))}
              </div>
            </div>

            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              {movie.description}
            </p>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Director
                </dt>
                <dd className="mt-1 font-medium">{movie.director}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Cast
                </dt>
                <dd className="mt-1 font-medium">{movie.cast.join(", ")}</dd>
              </div>
            </dl>

            <MovieActions movie={movie} />

            <Button asChild variant="secondary" size="lg" className="rounded-full">
              <Link to="/graph" search={{ movie: movie.id }}>
                <Network className="mr-2 h-4 w-4" /> Explore Movie Graph
              </Link>
            </Button>
          </div>
        </div>

        <section className="mt-16 space-y-5">
          <h2 className="font-display text-2xl font-bold">Movies You May Also Like</h2>
          <p className="text-sm text-muted-foreground">
            Connected through shared genres, cast members and{" "}
            <span className="text-foreground">{movie.director}</span>.
          </p>
          {related.isPending ? (
            <MovieGridSkeleton count={5} />
          ) : related.isError ? (
            <ErrorState description="Couldn't load related movies." onRetry={() => related.refetch()} />
          ) : related.data.length === 0 ? (
            <EmptyState title="No related movies yet." />
          ) : (
            <MovieGrid movies={related.data} />
          )}
        </section>
      </div>
    </div>
  );
}
