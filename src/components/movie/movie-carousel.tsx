import { MovieCard } from "./movie-card";
import type { Movie } from "@/lib/movies/types";

export function MovieCarousel({ movies }: { movies: Movie[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          className="w-40 shrink-0 snap-start sm:w-48 lg:w-56"
        />
      ))}
    </div>
  );
}
