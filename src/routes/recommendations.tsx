import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MovieGridSkeleton } from "@/components/movie/movie-grid";
import {
  RecommendationCard,
  RecommendationSection,
} from "@/components/recommendations/recommendation";
import { EmptyState, ErrorState } from "@/components/feedback/states";
import { getRecommendationGroups, getRecommendations } from "@/lib/movies/api";
import { useUser } from "@/lib/user-state";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommended For You — MovieGraph" },
      {
        name: "description",
        content:
          "Personalized movie recommendations based on your watch history, likes and favorite genres — with an explanation for every pick.",
      },
      { property: "og:title", content: "Recommended For You — MovieGraph" },
      {
        property: "og:description",
        content: "Graph-powered picks that explain exactly why they were chosen.",
      },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { user, activity, signIn } = useUser();
  const hasActivity = activity.watched.length + activity.liked.length > 0;

  const top = useQuery({
    queryKey: ["recs", "top", activity],
    queryFn: () => getRecommendations(activity, 10),
    enabled: hasActivity,
  });

  const groups = useQuery({
    queryKey: ["recs", "groups", activity],
    queryFn: () => getRecommendationGroups(activity),
    enabled: hasActivity,
  });

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-14 md:px-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-extrabold sm:text-5xl">Recommended For You</h1>
        <p className="max-w-2xl text-muted-foreground">
          Movies selected based on your watch history, likes, and movie preferences.
        </p>
      </header>

      {!user ? (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="Sign in to get personalized recommendations."
          description="MovieGraph uses your watched and liked movies to walk the graph of directors, actors and genres."
          action={
            <Button className="rounded-full" onClick={() => signIn()}>
              Sign in
            </Button>
          }
        />
      ) : !hasActivity ? (
        <EmptyState
          title="We don't have enough activity to generate recommendations yet."
          description="Mark a few movies as watched or liked and this page will fill up instantly."
          action={
            <Button asChild className="rounded-full">
              <Link to="/movies">Browse movies</Link>
            </Button>
          }
        />
      ) : top.isPending ? (
        <MovieGridSkeleton />
      ) : top.isError ? (
        <ErrorState description="Couldn't build your recommendations." onRetry={() => top.refetch()} />
      ) : (
        <div className="space-y-14">
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Top Recommendations</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {top.data.map((rec) => (
                <RecommendationCard key={rec.movie.id} rec={rec} />
              ))}
            </div>
          </section>

          {groups.isPending ? (
            <MovieGridSkeleton count={5} />
          ) : groups.isError ? (
            <ErrorState
              description="Couldn't load grouped recommendations."
              onRetry={() => groups.refetch()}
            />
          ) : (
            groups.data.map((group) => (
              <RecommendationSection
                key={group.key}
                title={group.title}
                subtitle={group.subtitle}
                items={group.items}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
