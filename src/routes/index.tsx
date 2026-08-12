import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ArrowRight } from "lucide-react";

import heroImage from "@/assets/hero-cinema.jpg";
import { Button } from "@/components/ui/button";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie/movie-grid";
import { MovieCarousel } from "@/components/movie/movie-carousel";
import { RecommendationCard } from "@/components/recommendations/recommendation";
import { EmptyState, ErrorState } from "@/components/feedback/states";
import { getPopularMovies, getTrendingMovies, getRecommendations } from "@/lib/movies/api";
import { useUser } from "@/lib/user-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MovieGraph — Discover Your Next Favorite Movie" },
      {
        name: "description",
        content:
          "Browse popular and trending films, track what you watch and like, and get graph-powered movie recommendations.",
      },
      { property: "og:title", content: "MovieGraph — Discover Your Next Favorite Movie" },
      {
        property: "og:description",
        content: "Popular films, trending picks and personalized recommendations in one cinematic app.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user, activity } = useUser();

  const popular = useQuery({ queryKey: ["popular"], queryFn: () => getPopularMovies(10) });
  const trending = useQuery({ queryKey: ["trending"], queryFn: getTrendingMovies });
  const recs = useQuery({
    queryKey: ["recs", "preview", activity],
    queryFn: () => getRecommendations(activity, 5),
    enabled: Boolean(user),
  });

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="A lone viewer in a darkened cinema facing a glowing screen"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-4 py-24 md:px-8 md:py-36">
          <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Graph-powered discovery
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.05] text-balance-tight sm:text-6xl lg:text-7xl">
            Discover Your Next Favorite Movie
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            MovieGraph maps the connections between films, actors, directors and genres — then
            turns them into recommendations that actually explain themselves.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link to="/movies">Explore Movies</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-7">
              <Link to="/recommendations">Get Recommendations</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 md:px-8">
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Popular Right Now</h2>
            <Link
              to="/movies"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {popular.isPending ? (
            <MovieGridSkeleton />
          ) : popular.isError ? (
            <ErrorState description="Couldn't load popular movies." onRetry={() => popular.refetch()} />
          ) : (
            <MovieGrid movies={popular.data} />
          )}
        </section>

        <section className="space-y-5">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Trending & Featured</h2>
          {trending.isPending ? (
            <MovieGridSkeleton count={5} />
          ) : trending.isError ? (
            <ErrorState description="Couldn't load trending movies." onRetry={() => trending.refetch()} />
          ) : (
            <MovieCarousel movies={trending.data} />
          )}
        </section>

        <section className="space-y-5">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Recommended For You</h2>
          {!user ? (
            <EmptyState
              icon={<Sparkles className="h-6 w-6" />}
              title="Sign in to get personalized recommendations."
              description="Track what you watch and like, and MovieGraph will explain every suggestion it makes."
              action={
                <Button asChild className="rounded-full">
                  <Link to="/recommendations">See how it works</Link>
                </Button>
              }
            />
          ) : recs.isPending ? (
            <MovieGridSkeleton count={5} />
          ) : recs.isError ? (
            <ErrorState description="Couldn't load recommendations." onRetry={() => recs.refetch()} />
          ) : recs.data.length === 0 ? (
            <EmptyState
              title="We don't have enough activity to generate recommendations yet."
              description="Mark a few movies as watched or liked and your feed will fill up."
              action={
                <Button asChild className="rounded-full">
                  <Link to="/movies">Browse movies</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {recs.data.map((rec) => (
                <RecommendationCard key={rec.movie.id} rec={rec} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
