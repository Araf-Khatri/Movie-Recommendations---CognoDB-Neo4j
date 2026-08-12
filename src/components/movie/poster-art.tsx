import { cn } from "@/lib/utils";
import type { Movie } from "@/lib/movies/types";

/**
 * Generated poster artwork — deterministic per movie, so the UI stays
 * poster-forward without shipping licensed imagery.
 */
export function PosterArt({ movie, className }: { movie: Movie; className?: string }) {
  const { hue, title, year } = movie;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: `radial-gradient(120% 90% at 20% 10%, hsl(${hue} 70% 42% / 0.95), transparent 60%),
                     radial-gradient(90% 80% at 85% 90%, hsl(${(hue + 45) % 360} 75% 34% / 0.9), transparent 55%),
                     linear-gradient(160deg, hsl(${hue} 40% 14%), hsl(${(hue + 20) % 360} 45% 7%))`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 14px)",
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="font-display text-sm font-bold uppercase leading-tight tracking-tight text-white/95 line-clamp-3">
          {title}
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">
          {year}
        </p>
      </div>
    </div>
  );
}
