import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import RetroTicket from '../components/ui/RetroTicket';
import RetroButton from '../components/ui/RetroButton';
import { CheckCircle, Home, LayoutDashboard } from 'lucide-react';

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const { getBooking } = useBookings();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getBooking(bookingId);
        setBooking(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookingId]);

  if (loading) return <LoadingSpinner text="Loading booking..." />;

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-cinema-cream/40 font-accent">Booking not found</p>
      </div>
    );
  }

  const movie = booking.sessions?.movies;
  const screen = booking.sessions?.screens;
  const session = booking.sessions;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Success icon */}
      <div className="text-center mb-8">
        <CheckCircle size={64} className="text-cinema-gold mx-auto mb-4" />
        <h1 className="font-heading text-3xl font-bold text-cinema-cream mb-1">
          Booking Confirmed!
        </h1>
        <p className="text-cinema-cream/50 font-accent text-sm">
          Booking ID: #{booking.bookingid}
        </p>
        <span className="inline-block mt-2 bg-cinema-gold/20 text-cinema-gold px-3 py-1 font-accent text-xs tracking-wider uppercase">
          {booking.paymentstatus}
        </span>
      </div>

      {/* Tickets */}
      <div className="mb-8">
        <h2 className="font-heading text-lg font-bold text-cinema-gold">Your Tickets</h2>
        <div className="mt-3 space-y-3">
        {booking.tickets?.map((ticket) => (
          <div key={ticket.ticketid} className="jagged-both">
            <RetroTicket
              ticket={ticket}
              booking={booking}
              movie={movie}
              session={session}
              seat={ticket.seats}
              screen={screen}
            />
          </div>
        ))}
        </div>
      </div>

      {/* Details */}
      <div className="bg-cinema-dark/50 border border-cinema-gold/15 p-4 mb-8 space-y-2 text-sm font-body">
        <div className="flex justify-between">
          <span className="text-cinema-cream/60">Payment Method</span>
          <span className="text-cinema-cream">{booking.paymentmethod}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cinema-cream/60">Convenience Fee</span>
          <span className="text-cinema-cream">₱{Number(booking.conveniencefee).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-heading font-bold text-cinema-gold border-t border-cinema-gold/15 pt-2 mt-2">
          <span>Total</span>
          <span>₱{Number(booking.totalamount).toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/">
          <RetroButton variant="secondary">
            <Home size={16} />
            Back to Movies
          </RetroButton>
        </Link>
        <Link to="/dashboard">
          <RetroButton>
            <LayoutDashboard size={16} />
            Go to Dashboard
          </RetroButton>
        </Link>
      </div>
    </div>
  );
}
