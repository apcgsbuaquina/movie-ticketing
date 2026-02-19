import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useSeats } from '../hooks/useSeats';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/seats/SeatMap';
import SeatLegend from '../components/seats/SeatLegend';
import RetroButton from '../components/ui/RetroButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { ArrowLeft, Film, Monitor, Clock, Wallet } from 'lucide-react';

export default function SeatSelection() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const { seats, takenSeatIds, fetchSeats, fetchTakenSeats } = useSeats();

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Load session with movie and screen info
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('*, movies(*), screens(*)')
        .eq('sessionid', sessionId)
        .single();

      if (sessionData) {
        setSession(sessionData);

        // Load seats for this screen
        await fetchSeats(sessionData.screenid);

        // Load taken seats for this session
        await fetchTakenSeats(sessionData.sessionid);
      }

      setLoading(false);
    }

    loadData();
  }, [sessionId]);

  async function handleProceed() {
    if (selectedSeats.length === 0) return;

    const latestTaken = await fetchTakenSeats(session.sessionid);
    if (latestTaken) {
      const conflicted = selectedSeats.filter((seat) => latestTaken.has(seat.seatid));
      if (conflicted.length > 0) {
        const conflictedLabels = conflicted
          .map((seat) => `${seat.rowchar}${seat.seatnumber}`)
          .join(', ');

        setSelectedSeats((prev) => prev.filter((seat) => !latestTaken.has(seat.seatid)));
        toast.error(`Seat(s) ${conflictedLabels} were just taken. Please choose other seats.`);
        return;
      }
    }

    // Store selection in sessionStorage for checkout
    sessionStorage.setItem(
      'checkoutData',
      JSON.stringify({
        sessionId: session.sessionid,
        session: session,
        movie: session.movies,
        screen: session.screens,
        selectedSeats: selectedSeats,
        basePrice: Number(session.baseprice),
      })
    );

    navigate('/checkout');
  }

  if (loading) return <LoadingSpinner text="Loading seats..." />;

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-cinema-cream/40 font-accent text-lg">Session not found</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-cinema-black/30 border-b border-cinema-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-cinema-cream/50 hover:text-cinema-gold text-sm font-accent transition-colors mb-3"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="font-heading text-2xl font-bold text-cinema-cream flex items-center gap-2">
                <Film size={20} className="text-cinema-gold" />
                {session.movies?.title}
              </h1>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-cinema-cream/50 font-body">
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {format(new Date(session.starttime), 'EEE, MMM d — h:mm a')}
                </span>
                <span className="flex items-center gap-1">
                  <Monitor size={13} />
                  {session.screens?.cinemabranch} — Screen {session.screens?.screennumber}
                </span>
                {session.experience && (
                  <span className="bg-cinema-teal/20 text-cinema-teal px-1.5 py-0.5 text-xs font-accent">
                    {session.experience}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-cinema-cream/40 font-accent text-xs uppercase tracking-wider">
                Base Price
              </div>
              <div className="text-cinema-gold font-heading font-bold text-xl flex items-center gap-1 justify-end">
                <Wallet size={16} />
                ₱{Number(session.baseprice).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Map */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-heading text-xl font-bold text-cinema-cream text-center mb-2">
          Select Your Seats
        </h2>

        <SeatLegend />

        <div className="mt-6">
          <SeatMap
            seats={seats}
            takenSeatIds={takenSeatIds}
            selectedSeats={selectedSeats}
            onSeatToggle={setSelectedSeats}
          />
        </div>

        {/* Selection summary & proceed */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 bg-cinema-dark/50 border border-cinema-gold/15 p-4">
          <div className="w-full min-w-0">
            {selectedSeats.length > 0 ? (
              <div className="leading-relaxed break-words">
                <span className="text-cinema-cream/60 font-accent text-sm">Selected: </span>
                {selectedSeats.map((seat, i) => (
                  <span key={seat.seatid} className="text-cinema-gold font-heading font-bold">
                    {i > 0 ? ', ' : ''}
                    {seat.rowchar}{seat.seatnumber}
                    <span className="text-cinema-cream/40 text-xs ml-0.5">
                      ({seat.seattype})
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-cinema-cream/40 font-accent text-sm">
                No seats selected
              </p>
            )}
          </div>

          <RetroButton
            onClick={handleProceed}
            disabled={selectedSeats.length === 0}
            size="lg"
            className="w-full sm:w-auto sm:shrink-0"
          >
            Proceed to Checkout
          </RetroButton>
        </div>
      </div>
    </div>
  );
}
