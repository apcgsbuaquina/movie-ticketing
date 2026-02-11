import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useBookings } from '../../hooks/useBookings';
import RetroButton from '../../components/ui/RetroButton';
import RetroSelect from '../../components/ui/RetroSelect';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ArrowLeft, Ticket, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const statusColors = {
  Pending: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
  Paid: 'bg-green-600/20 text-green-400 border-green-600/30',
  Refunded: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  Cancelled: 'bg-red-600/20 text-red-400 border-red-600/30',
};

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Refunded', label: 'Refunded' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export default function ManageBookings() {
  const { bookings, loading, fetchAllBookings, updateBookingPayment } = useBookings();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchAllBookings();
  }, []);

  async function handleStatusChange(bookingId, newStatus) {
    try {
      await updateBookingPayment(bookingId, newStatus);
      toast.success(`Booking #${bookingId} updated to ${newStatus}`);
      await fetchAllBookings();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const filtered = filter
    ? bookings.filter((b) => b.paymentstatus === filter)
    : bookings;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-cinema-cream/50 hover:text-cinema-gold text-sm font-accent transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Admin Panel
      </Link>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold text-cinema-cream flex items-center gap-2">
          <Ticket size={22} className="text-cinema-gold" />
          Manage Bookings
        </h1>

        <div className="flex items-center gap-2">
          <span className="text-cinema-cream/40 font-accent text-xs">Filter:</span>
          <select
            className="bg-cinema-dark border border-cinema-gold/30 text-cinema-cream px-3 py-1.5 text-sm font-body"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <p className="text-cinema-cream/40 font-accent text-center py-12">No bookings found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div
              key={booking.bookingid}
              className="bg-cinema-navy/40 border border-cinema-gold/10 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-cinema-cream/40 font-mono text-xs">
                      #{booking.bookingid}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-accent tracking-wider border ${
                        statusColors[booking.paymentstatus] || ''
                      }`}
                    >
                      {booking.paymentstatus}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-cinema-cream">
                    {booking.sessions?.movies?.title || 'Unknown Movie'}
                  </h3>

                  <div className="text-cinema-cream/50 text-sm font-body space-y-0.5">
                    <p>
                      Customer: {booking.customers?.firstname} {booking.customers?.lastname}{' '}
                      ({booking.customers?.email})
                    </p>
                    {booking.sessions?.screens && (
                      <p>
                        Screen: {booking.sessions.screens.cinemabranch} #{booking.sessions.screens.screennumber}
                      </p>
                    )}
                    {booking.sessions?.starttime && (
                      <p>
                        Showtime: {format(new Date(booking.sessions.starttime), 'MMM d, yyyy h:mm a')}
                      </p>
                    )}
                    <p>Booked: {format(new Date(booking.bookingtime), 'MMM d, yyyy h:mm a')}</p>
                  </div>

                  {/* Tickets */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {booking.tickets?.map((ticket) => (
                      <span
                        key={ticket.ticketid}
                        className="bg-cinema-dark/60 border border-cinema-gold/10 px-2 py-0.5 text-xs font-accent text-cinema-cream/60"
                      >
                        {ticket.seats?.rowchar}{ticket.seats?.seatnumber} — {ticket.tickettype} — ₱{Number(ticket.finalprice).toFixed(0)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="text-cinema-gold font-heading font-bold text-xl">
                    ₱{Number(booking.totalamount).toFixed(2)}
                  </div>
                  <div className="text-cinema-cream/40 text-xs font-accent">
                    {booking.paymentmethod}
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-1 justify-end">
                    {booking.paymentstatus === 'Pending' && (
                      <RetroButton
                        size="sm"
                        onClick={() => handleStatusChange(booking.bookingid, 'Paid')}
                      >
                        <CheckCircle size={12} />
                        Mark Paid
                      </RetroButton>
                    )}
                    {booking.paymentstatus === 'Paid' && (
                      <RetroButton
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusChange(booking.bookingid, 'Refunded')}
                      >
                        <RotateCcw size={12} />
                        Refund
                      </RetroButton>
                    )}
                    {booking.paymentstatus !== 'Cancelled' && booking.paymentstatus !== 'Refunded' && (
                      <RetroButton
                        size="sm"
                        variant="danger"
                        onClick={() => handleStatusChange(booking.bookingid, 'Cancelled')}
                      >
                        <XCircle size={12} />
                        Cancel
                      </RetroButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
