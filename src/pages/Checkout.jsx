import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../hooks/useBookings';
import { getDiscountForType } from '../components/booking/TicketTypeSelector';
import TicketTypeSelector from '../components/booking/TicketTypeSelector';
import BookingSummary from '../components/booking/BookingSummary';
import RetroButton from '../components/ui/RetroButton';
import RetroSelect from '../components/ui/RetroSelect';
import toast from 'react-hot-toast';
import { ArrowLeft, CreditCard, Sparkles } from 'lucide-react';

const PAYMENT_METHODS = [
  { value: 'GCash', label: 'GCash' },
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Cash', label: 'Cash (Pay at Counter)' },
  { value: 'Points', label: 'Loyalty Points' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { user, customerId, profile } = useAuth();
  const { createBooking } = useBookings();

  const [checkoutData, setCheckoutData] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [seniorPwdIds, setSeniorPwdIds] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('checkoutData');
    if (!stored) {
      navigate('/');
      return;
    }

    const data = JSON.parse(stored);
    setCheckoutData(data);

    // Initialize ticket types
    setTicketTypes(data.selectedSeats.map(() => 'Regular'));
    setSeniorPwdIds(data.selectedSeats.map(() => ''));
  }, [navigate]);

  if (!checkoutData) return null;

  const { session, movie, screen, selectedSeats, basePrice } = checkoutData;

  function handleTicketTypeChange(index, type) {
    const newTypes = [...ticketTypes];
    newTypes[index] = type;
    setTicketTypes(newTypes);
  }

  function handleSeniorPwdIdChange(index, id) {
    const newIds = [...seniorPwdIds];
    newIds[index] = id;
    setSeniorPwdIds(newIds);
  }

  // Calculate ticket details
  const ticketDetails = selectedSeats.map((seat, idx) => {
    const type = ticketTypes[idx] || 'Regular';
    const discount = getDiscountForType(type);
    const finalPrice = basePrice * (1 - discount);
    return {
      ticketType: type,
      seniorPwdId: seniorPwdIds[idx] || null,
      finalPrice,
    };
  });

  async function handleSubmit() {
    if (!customerId) {
      toast.error('Please sign in to complete booking');
      navigate('/login');
      return;
    }

    // Validate Senior/PWD IDs
    for (let i = 0; i < ticketDetails.length; i++) {
      const t = ticketDetails[i];
      if ((t.ticketType === 'Senior Citizen' || t.ticketType === 'PWD') && !t.seniorPwdId) {
        toast.error(`Please enter ID number for seat ${selectedSeats[i].rowchar}${selectedSeats[i].seatnumber}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const booking = await createBooking({
        sessionId: session.sessionid,
        customerId,
        seats: selectedSeats,
        ticketDetails,
        paymentMethod,
      });

      sessionStorage.removeItem('checkoutData');
      toast.success('Booking created successfully!');
      navigate(`/booking-confirmation/${booking.bookingid}`);
    } catch (err) {
      console.error('Booking error:', err);
      const message = err?.message || '';
      if (
        message.includes('already taken') ||
        message.includes('just booked by someone else') ||
        message.includes('unique_seat_per_session')
      ) {
        toast.error('Some seats are no longer available. Please reselect your seats.');
        navigate(`/seat-selection/${session.sessionid}`);
      } else {
        toast.error(message || 'Failed to create booking');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-cinema-cream/50 hover:text-cinema-gold text-sm font-accent transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Back to seats
      </button>

      <h1 className="font-heading text-3xl font-bold text-cinema-cream mb-2 flex items-center gap-2">
        <CreditCard size={24} className="text-cinema-gold" />
        Checkout
      </h1>
      <p className="text-cinema-cream/50 font-body text-sm mb-8">
        Configure your tickets and complete your booking
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Ticket configuration */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-heading text-lg font-bold text-cinema-gold mb-3">
            Ticket Types
          </h2>

          <div className="space-y-2">
            {selectedSeats.map((seat, idx) => (
              <TicketTypeSelector
                key={seat.seatid}
                seat={seat}
                basePrice={basePrice}
                ticketType={ticketTypes[idx]}
                seniorPwdId={seniorPwdIds[idx]}
                onTypeChange={(type) => handleTicketTypeChange(idx, type)}
                onIdChange={(id) => handleSeniorPwdIdChange(idx, id)}
              />
            ))}
          </div>

          {/* Payment Method */}
          <div className="mt-6">
            <h2 className="font-heading text-lg font-bold text-cinema-gold mb-3">
              Payment Method
            </h2>
            <RetroSelect
              options={PAYMENT_METHODS}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>

          {/* Customer info */}
          {profile && (
            <div className="mt-6 bg-cinema-dark/50 border border-cinema-gold/10 p-4">
              <h3 className="font-accent text-xs text-cinema-gold/60 tracking-wider uppercase mb-2">
                Booking As
              </h3>
              <p className="text-cinema-cream font-body">
                {profile.firstname} {profile.lastname}
              </p>
              <p className="text-cinema-cream/50 text-sm">{profile.email}</p>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <BookingSummary
            session={session}
            selectedSeats={selectedSeats}
            ticketDetails={ticketDetails}
            movie={movie}
            screen={screen}
          />

          <RetroButton
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
            className="w-full"
          >
            {submitting ? (
              'Processing...'
            ) : (
              <>
                <Sparkles size={16} />
                Confirm Booking
              </>
            )}
          </RetroButton>

          <p className="text-cinema-cream/30 text-xs font-accent text-center">
            Payment status will be set to Pending. Pay at the counter for cash payments.
          </p>
        </div>
      </div>
    </div>
  );
}
