import { createFileRoute, Link } from "@tanstack/react-router";
import { Network } from "lucide-react";

import { EmptyState } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/graph")({
  validateSearch: (search: Record<string, unknown>): { movie: string } => ({
    movie: typeof search["movie"] === "string" ? search["movie"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Graph Explorer — MovieGraph" },
      {
        name: "description",
        content:
          "Explore the interactive graph of movies, actors, directors and genres behind MovieGraph recommendations.",
      },
      { property: "og:title", content: "Graph Explorer — MovieGraph" },
      {
        property: "og:description",
        content: "An interactive map of movies, actors, directors and genres.",
      },
    ],
  }),
  component: GraphPage,
});

function GraphPage() {
  const { movie } = Route.useSearch();

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 md:px-8">
      <EmptyState
        icon={<Network className="h-6 w-6" />}
        title="Graph Explorer is coming next"
        description={
          movie
            ? `We'll open the graph centered on "${movie}" — nodes for the movie, its cast, director and genres, with zoom, pan and expandable relationships.`
            : "The interactive node graph of movies, actors, directors and genres lands in the next pass."
        }
        action={
          <Button asChild className="rounded-full">
            <Link to="/movies">Browse movies</Link>
          </Button>
        }
      />
    </div>
  );
}
