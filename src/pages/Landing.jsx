import { useMovies } from '../hooks/useMovies';
import MovieGrid from '../components/movies/MovieGrid';
import { Film, Ticket } from 'lucide-react';

export default function Landing() {
  const { movies, loading, error } = useMovies();

  return (
    <div className="animate-fade-in">
      {/* Hero / Marquee */}
      <section className="relative overflow-hidden bg-cinema-black/40 border-b border-cinema-gold/10">
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-red/10 via-transparent to-cinema-teal/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8 md:pt-20 md:pb-14 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-cinema-gold/40" />
            <Film size={24} className="text-cinema-gold" />
            <div className="h-px w-12 bg-cinema-gold/40" />
          </div>

          <h1 className="font-heading text-5xl md:text-7xl font-bold text-cinema-cream text-shadow-retro mb-3">
            Now <span className="text-cinema-gold text-shadow-glow animate-flicker">Showing</span>
          </h1>

          <p className="text-cinema-cream/35 font-accent text-sm md:text-base tracking-[0.2em] uppercase max-w-2xl mx-auto">
            Don’t just watch. Experience.
          </p>

          {/* Scrolling marquee */}
          <div className="marquee-container mt-6 py-2 border-t border-b border-cinema-gold/10">
            <div className="marquee-text text-cinema-gold/40 font-accent text-xs tracking-[0.5em] uppercase">
              {movies.length > 0
                ? movies.map((m) => m.title).join('  ★  ')
                : 'Welcome to Cinema — Your Vintage Movie Experience'}
              {'  ★  '}
            </div>
          </div>
        </div>
      </section>

      {/* Movie Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-3 md:-mt-4 py-10 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Ticket size={18} className="text-cinema-gold" />
          <h2 className="font-heading text-2xl font-bold text-cinema-cream">
            Featured Films
          </h2>
          <div className="flex-1 h-px bg-cinema-gold/20" />
        </div>

        <MovieGrid movies={movies} loading={loading} error={error} />
      </section>
    </div>
  );
}
