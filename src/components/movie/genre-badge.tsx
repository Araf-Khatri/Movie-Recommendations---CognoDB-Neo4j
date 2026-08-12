import { cn } from "@/lib/utils";

export function GenreBadge({ genre, className }: { genre: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border/70 bg-surface-strong/70 px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {genre}
    </span>
  );
}
