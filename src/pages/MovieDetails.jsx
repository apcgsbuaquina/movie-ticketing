import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Calendar,
  Tag,
  Film,
  Monitor,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import RetroButton from '../components/ui/RetroButton';
import RetroCard from '../components/ui/RetroCard';

const ratingDescriptions = {
  G: 'General Audiences',
  PG: 'Parental Guidance',
  'PG-13': 'Parents Strongly Cautioned',
  'R-16': 'Restricted (16+)',
  'R-18': 'Restricted (18+)',
  X: 'Adults Only',
};

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const { data: movieData } = await supabase
        .from('movies')
        .select('*')
        .eq('movieid', id)
        .single();

      if (movieData) {
        setMovie(movieData);

        const { data: sessionData } = await supabase
          .from('sessions')
          .select('*, screens(*)')
          .eq('movieid', id)
          .gte('starttime', new Date().toISOString())
          .order('starttime', { ascending: true });

        setSessions(sessionData || []);
      }

      setLoading(false);
    }

    loadData();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading movie..." />;

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-cinema-cream/40 font-accent text-lg">Movie not found</p>
        <Link to="/" className="text-cinema-gold hover:underline mt-4 inline-block font-body">
          ← Back to movies
        </Link>
      </div>
    );
  }

  // Group sessions by date
  const sessionsByDate = {};
  sessions.forEach((session) => {
    const dateKey = format(new Date(session.starttime), 'yyyy-MM-dd');
    if (!sessionsByDate[dateKey]) sessionsByDate[dateKey] = [];
    sessionsByDate[dateKey].push(session);
  });

  function handleSessionClick(sessionId) {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/session/${sessionId}/seats`);
  }

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-cinema-cream/50 hover:text-cinema-gold text-sm font-accent transition-colors"
        >
          <ArrowLeft size={14} />
          Back to movies
        </Link>
      </div>

      {/* Movie header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="md:w-64 shrink-0">
            {movie.posterurl ? (
              <div className="aspect-[2/3] border-2 border-cinema-gold/20 overflow-hidden">
                <img
                  src={movie.posterurl}
                  alt={`${movie.title} poster`}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div
                className="aspect-[2/3] border-2 border-cinema-gold/20 flex items-center justify-center"
                style={{
                  backgroundColor: `hsl(${[...movie.title].reduce((a, c) => c.charCodeAt(0) + ((a << 5) - a), 0) % 360}, 30%, 20%)`,
                }}
              >
                <div className="text-center p-4">
                  <span className="font-heading text-5xl font-bold text-cinema-cream/30">
                    {movie.title.split(' ').map((w) => w[0]).join('').slice(0, 3)}
                  </span>
                  <div className="mt-2 text-cinema-cream/15 font-accent text-xs tracking-widest uppercase">
                    {movie.genre || 'Film'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              {movie.mtrcb_rating && (
                <span className="inline-block bg-cinema-red/80 text-cinema-cream px-2 py-0.5 text-xs font-accent tracking-wider mb-2">
                  {movie.mtrcb_rating} — {ratingDescriptions[movie.mtrcb_rating] || ''}
                </span>
              )}
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-cinema-cream">
                {movie.title}
              </h1>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-cinema-cream/60 font-body">
              {movie.durationminutes && (
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-cinema-gold/60" />
                  {movie.durationminutes} minutes
                </span>
              )}
              {movie.genre && (
                <span className="flex items-center gap-1.5">
                  <Tag size={15} className="text-cinema-gold/60" />
                  {movie.genre}
                </span>
              )}
              {movie.distributor && (
                <span className="flex items-center gap-1.5">
                  <Film size={15} className="text-cinema-gold/60" />
                  {movie.distributor}
                </span>
              )}
            </div>

            <div className="h-px bg-cinema-gold/10 my-4" />

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-cinema-dark/50 border border-cinema-gold/10 p-3">
                <div className="text-cinema-cream/40 font-accent text-xs uppercase tracking-wider">
                  Showtimes
                </div>
                <div className="text-cinema-gold font-heading font-bold text-xl mt-1">
                  {sessions.length}
                </div>
              </div>
              <div className="bg-cinema-dark/50 border border-cinema-gold/10 p-3">
                <div className="text-cinema-cream/40 font-accent text-xs uppercase tracking-wider">
                  Starting At
                </div>
                <div className="text-cinema-gold font-heading font-bold text-xl mt-1">
                  {sessions.length > 0
                    ? `₱${Math.min(...sessions.map((s) => Number(s.baseprice))).toFixed(0)}`
                    : 'N/A'}
                </div>
              </div>
              <div className="bg-cinema-dark/50 border border-cinema-gold/10 p-3">
                <div className="text-cinema-cream/40 font-accent text-xs uppercase tracking-wider">
                  Dates
                </div>
                <div className="text-cinema-gold font-heading font-bold text-xl mt-1">
                  {Object.keys(sessionsByDate).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <Calendar size={18} className="text-cinema-gold" />
          <h2 className="font-heading text-2xl font-bold text-cinema-cream">
            Showtimes
          </h2>
          <div className="flex-1 h-px bg-cinema-gold/20" />
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cinema-cream/40 font-accent">
              No upcoming showtimes available
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(sessionsByDate).map(([dateKey, dateSessions]) => (
              <div key={dateKey}>
                <h3 className="font-accent text-cinema-gold/70 text-sm tracking-wider uppercase mb-3">
                  {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dateSessions.map((session) => (
                    <button
                      key={session.sessionid}
                      onClick={() => handleSessionClick(session.sessionid)}
                      className="bg-cinema-navy/60 border border-cinema-gold/15 p-4 text-left
                        hover:border-cinema-gold/50 hover:bg-cinema-navy/80
                        transition-all duration-300 retro-glow group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-heading font-bold text-cinema-cream text-lg group-hover:text-cinema-gold transition-colors">
                          {format(new Date(session.starttime), 'h:mm a')}
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-cinema-cream/30 group-hover:text-cinema-gold transition-colors"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        {session.screens && (
                          <span className="flex items-center gap-1 text-cinema-cream/50 font-accent">
                            <Monitor size={11} />
                            {session.screens.cinemabranch} — Screen {session.screens.screennumber}
                          </span>
                        )}
                        {session.experience && (
                          <span className="bg-cinema-teal/20 text-cinema-teal px-1.5 py-0.5 font-accent tracking-wider">
                            {session.experience}
                          </span>
                        )}
                        {session.screens?.screentype && (
                          <span className="bg-cinema-gold/10 text-cinema-gold/70 px-1.5 py-0.5 font-accent tracking-wider">
                            {session.screens.screentype}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 text-cinema-gold font-heading font-bold">
                        ₱{Number(session.baseprice).toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
