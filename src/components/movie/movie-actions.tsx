import { Check, Eye, Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/user-state";
import type { Movie } from "@/lib/movies/types";
import { cn } from "@/lib/utils";

export function MovieActions({ movie, className }: { movie: Movie; className?: string }) {
  const { isWatched, isLiked, toggleWatched, toggleLiked } = useUser();
  const watched = isWatched(movie.id);
  const liked = isLiked(movie.id);

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <Button
        size="lg"
        variant={watched ? "secondary" : "default"}
        className="rounded-full"
        onClick={() => {
          toggleWatched(movie.id);
          toast.success(watched ? `Removed ${movie.title} from watched` : `Marked ${movie.title} as watched`);
        }}
      >
        {watched ? <Check className="mr-2 h-4 w-4 text-success" /> : <Eye className="mr-2 h-4 w-4" />}
        {watched ? "Watched" : "Mark as Watched"}
      </Button>

      <Button
        size="lg"
        variant="outline"
        className={cn("rounded-full", liked && "border-primary text-primary")}
        onClick={() => {
          toggleLiked(movie.id);
          toast.success(liked ? `Unliked ${movie.title}` : `Liked ${movie.title}`);
        }}
      >
        <Heart className={cn("mr-2 h-4 w-4", liked && "fill-primary")} />
        {liked ? "Liked" : "Like Movie"}
      </Button>
    </div>
  );
}
