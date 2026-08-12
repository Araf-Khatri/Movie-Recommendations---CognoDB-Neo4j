import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function MovieRating({
  rating,
  className,
  size = "sm",
}: {
  rating: number;
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold text-primary",
        size === "lg" ? "text-lg" : "text-sm",
        className,
      )}
    >
      <Star className={cn(size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5", "fill-primary")} />
      {rating.toFixed(1)}
    </span>
  );
}
