import MovieCard from './MovieCard';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function MovieGrid({ movies, loading, error }) {
  if (loading) return <LoadingSpinner text="Loading movies..." />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-cinema-red font-accent">Error: {error}</p>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-cinema-cream/40 font-accent text-lg tracking-wider">
          No movies showing at the moment
        </p>
        <p className="text-cinema-cream/20 font-body text-sm mt-2">
          Check back soon for new releases
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.movieid} movie={movie} />
      ))}
    </div>
  );
}
