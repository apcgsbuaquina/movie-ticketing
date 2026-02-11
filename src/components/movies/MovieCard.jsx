import { Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';

// Generate a deterministic color from movie title
function titleToColor(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 30%, 20%)`;
}

const ratingColors = {
  G: 'bg-green-700/80 text-green-100',
  PG: 'bg-blue-700/80 text-blue-100',
  'PG-13': 'bg-yellow-700/80 text-yellow-100',
  'R-16': 'bg-orange-700/80 text-orange-100',
  'R-18': 'bg-red-700/80 text-red-100',
  X: 'bg-red-900/80 text-red-100',
};

export default function MovieCard({ movie }) {
  const bgColor = titleToColor(movie.title);
  const poster = movie.posterurl;

  return (
    <Link
      to={`/movie/${movie.movieid}`}
      className="group block overflow-hidden transition-all duration-300 retro-glow border border-cinema-gold/10 hover:border-cinema-gold/40 bg-cinema-navy/60"
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative overflow-hidden" style={{ backgroundColor: bgColor }}>
        {poster ? (
          <img
            src={poster}
            alt={`${movie.title} poster`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <span className="font-heading text-3xl font-bold text-cinema-cream/40 leading-tight">
              {movie.title.split(' ').map(w => w[0]).join('').slice(0, 3)}
            </span>
            <span className="font-accent text-xs text-cinema-cream/20 mt-2 tracking-widest uppercase">
              {movie.genre || 'Film'}
            </span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating badge */}
        {movie.mtrcb_rating && (
          <span
            className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-accent font-bold tracking-wider ${
              ratingColors[movie.mtrcb_rating] || 'bg-cinema-charcoal text-cinema-cream'
            }`}
          >
            {movie.mtrcb_rating}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <h3 className="font-heading font-bold text-cinema-cream text-sm leading-tight line-clamp-2 group-hover:text-cinema-gold transition-colors">
          {movie.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-cinema-cream/50 font-accent">
          {movie.durationminutes && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {movie.durationminutes}m
            </span>
          )}
          {movie.genre && (
            <span className="truncate">{movie.genre}</span>
          )}
        </div>

        {movie.distributor && (
          <p className="text-[10px] text-cinema-cream/30 font-accent tracking-wider uppercase truncate">
            {movie.distributor}
          </p>
        )}
      </div>
    </Link>
  );
}
