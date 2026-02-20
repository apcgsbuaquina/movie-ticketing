import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../hooks/useBookings';
import { useLoyalty } from '../hooks/useLoyalty';
import RetroTicket from '../components/ui/RetroTicket';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import RetroCard from '../components/ui/RetroCard';
import {
  Ticket,
  User,
  Crown,
  Star,
  Coins,
  Calendar,
  Phone,
  Mail,
  Briefcase,
  MapPin,
} from 'lucide-react';

export default function UserDashboard() {
  const { user, profile, customerId, userRole } = useAuth();
  const { bookings, loading, fetchBookings } = useBookings(customerId);
  const { loyalty, fetchLoyalty, tierColors, tierBorderColors } = useLoyalty(customerId);

  useEffect(() => {
    if (customerId) {
      fetchBookings();
      fetchLoyalty();
    }
  }, [customerId, fetchBookings, fetchLoyalty]);

  const isCustomerDashboard = userRole === 'Customer' && Boolean(customerId);

  const firstName = profile?.firstname || profile?.first_name || profile?.users?.firstname || '';
  const middleName = profile?.middlename || profile?.middle_name || profile?.users?.middlename || '';
  const lastName = profile?.lastname || profile?.last_name || profile?.users?.lastname || '';
  const suffix = profile?.suffix || profile?.users?.suffix || '';
  const displayName =
    [firstName, middleName, lastName].filter(Boolean).join(' ') ||
    profile?.fullname ||
    profile?.users?.username ||
    user?.email?.split('@')?.[0] ||
    'N/A';

  const displayEmail = profile?.email || profile?.users?.email || user?.email || 'N/A';
  const displayPhone =
    profile?.phonenumber || profile?.phone || profile?.contactnumber || profile?.users?.phonenumber || null;
  const staffPosition = profile?.position || null;
  const staffBranch = profile?.branch || null;
  const dateOfBirth = profile?.dateofbirth || profile?.date_of_birth || null;
  const joinDate = profile?.joindate || profile?.join_date || profile?.createdat || profile?.created_at || null;

  const statusColors = {
    Pending: 'bg-yellow-600/20 text-yellow-400',
    Paid: 'bg-green-600/20 text-green-400',
    Refunded: 'bg-blue-600/20 text-blue-400',
    Cancelled: 'bg-red-600/20 text-red-400',
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-heading text-3xl font-bold text-cinema-cream mb-8 flex items-center gap-2">
        <User size={24} className="text-cinema-gold" />
        My Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Profile Card */}
        <div className="bg-cinema-navy/60 border border-cinema-gold/20 p-5 space-y-3">
          <h2 className="font-heading font-bold text-cinema-gold text-lg flex items-center gap-2">
            <User size={16} />
            Profile
          </h2>
          {profile ? (
            <div className="space-y-2 text-sm font-body">
              <p className="text-cinema-cream font-semibold text-lg">
                {displayName}
                {suffix ? ` ${suffix}` : ''}
              </p>
              <p className="text-cinema-cream/60 flex items-center gap-1.5">
                <Mail size={13} />
                {displayEmail}
              </p>
              {displayPhone && (
                <p className="text-cinema-cream/60 flex items-center gap-1.5">
                  <Phone size={13} />
                  {displayPhone}
                </p>
              )}
              {staffPosition && (
                <p className="text-cinema-cream/60 flex items-center gap-1.5">
                  <Briefcase size={13} />
                  {staffPosition}
                </p>
              )}
              {staffBranch && (
                <p className="text-cinema-cream/60 flex items-center gap-1.5">
                  <MapPin size={13} />
                  {staffBranch}
                </p>
              )}
              <p className="text-cinema-cream/60 flex items-center gap-1.5">
                <Calendar size={13} />
                Born {dateOfBirth ? format(new Date(dateOfBirth), 'MMMM d, yyyy') : 'N/A'}
              </p>
              {joinDate && (
                <p className="text-cinema-cream/40 text-xs font-accent mt-2">
                  Member since {format(new Date(joinDate), 'MMMM yyyy')}
                </p>
              )}
            </div>
          ) : (
            <p className="text-cinema-cream/40">Loading profile...</p>
          )}
        </div>

        {/* Loyalty Card */}
        <div
          className={`bg-cinema-navy/60 border ${
            loyalty ? tierBorderColors[loyalty.membershiptier] || 'border-cinema-gold/20' : 'border-cinema-gold/20'
          } p-5 space-y-3`}
        >
          <h2 className="font-heading font-bold text-cinema-gold text-lg flex items-center gap-2">
            <Crown size={16} />
            Loyalty Program
          </h2>
          {isCustomerDashboard && loyalty ? (
            <div className="space-y-3">
              <div className="text-center py-2">
                <span
                  className={`font-heading text-2xl font-bold ${
                    tierColors[loyalty.membershiptier] || 'text-cinema-cream'
                  }`}
                >
                  {loyalty.membershiptier}
                </span>
                <p className="text-cinema-cream/40 font-accent text-xs mt-1">
                  Membership Tier
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cinema-dark/50 p-2 text-center">
                  <Coins size={14} className="text-cinema-gold mx-auto mb-1" />
                  <div className="text-cinema-gold font-heading font-bold text-lg">
                    {loyalty.currentpoints}
                  </div>
                  <div className="text-cinema-cream/40 font-accent text-[10px] uppercase tracking-wider">
                    Points
                  </div>
                </div>
                <div className="bg-cinema-dark/50 p-2 text-center">
                  <Star size={14} className="text-cinema-gold mx-auto mb-1" />
                  <div className="text-cinema-gold font-heading font-bold text-lg">
                    ₱{Number(loyalty.totalspent || 0).toFixed(0)}
                  </div>
                  <div className="text-cinema-cream/40 font-accent text-[10px] uppercase tracking-wider">
                    Total Spent
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-cinema-cream/40 text-sm">
              {isCustomerDashboard ? 'No loyalty profile found.' : 'Loyalty rewards are available for customer accounts only.'}
            </p>
          )}
        </div>

        {/* Stats Card */}
        <div className="bg-cinema-navy/60 border border-cinema-gold/20 p-5 space-y-3">
          <h2 className="font-heading font-bold text-cinema-gold text-lg flex items-center gap-2">
            <Ticket size={16} />
            Stats
          </h2>
          <div className="space-y-3">
            <div className="bg-cinema-dark/50 p-3 text-center">
              <div className="text-cinema-gold font-heading font-bold text-2xl">
                {isCustomerDashboard ? bookings.length : userRole || 'N/A'}
              </div>
              <div className="text-cinema-cream/40 font-accent text-xs uppercase tracking-wider">
                {isCustomerDashboard ? 'Total Bookings' : 'Account Role'}
              </div>
            </div>
            <div className="bg-cinema-dark/50 p-3 text-center">
              <div className="text-cinema-gold font-heading font-bold text-2xl">
                {isCustomerDashboard ? bookings.reduce((sum, b) => sum + (b.tickets?.length || 0), 0) : (profile?.staffid || user?.id?.slice(0, 8) || 'N/A')}
              </div>
              <div className="text-cinema-cream/40 font-accent text-xs uppercase tracking-wider">
                {isCustomerDashboard ? 'Total Tickets' : 'Account ID'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking History */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Ticket size={18} className="text-cinema-gold" />
          <h2 className="font-heading text-2xl font-bold text-cinema-cream">
            Booking History
          </h2>
          <div className="flex-1 h-px bg-cinema-gold/20" />
        </div>

        {!isCustomerDashboard ? (
          <div className="text-center py-12">
            <p className="text-cinema-cream/40 font-accent">Booking history is available for customer accounts.</p>
          </div>
        ) : loading ? (
          <LoadingSpinner text="Loading bookings..." />
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cinema-cream/40 font-accent">No bookings yet.</p>
            <p className="text-cinema-cream/20 text-sm mt-1">Browse movies and book your first show!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.bookingid}
                className="bg-cinema-navy/40 border border-cinema-gold/10 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="font-accent text-cinema-cream/40 text-xs">
                      Booking #{booking.bookingid}
                    </span>
                    <h3 className="font-heading font-bold text-cinema-cream text-lg">
                      {booking.sessions?.movies?.title || 'Unknown Movie'}
                    </h3>
                    <span className="text-cinema-cream/50 text-sm font-body">
                      {booking.sessions?.starttime
                        ? format(new Date(booking.sessions.starttime), 'EEE, MMM d yyyy — h:mm a')
                        : ''}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-accent tracking-wider ${
                        statusColors[booking.paymentstatus] || 'bg-cinema-charcoal/50 text-cinema-cream/50'
                      }`}
                    >
                      {booking.paymentstatus}
                    </span>
                    <div className="text-cinema-gold font-heading font-bold text-lg mt-1">
                      ₱{Number(booking.totalamount).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Tickets */}
                <div className="space-y-3">
                  {booking.tickets?.map((ticket) => (
                    <div key={ticket.ticketid} className="jagged-both">
                      <RetroTicket
                        ticket={ticket}
                        booking={booking}
                        movie={booking.sessions?.movies}
                        session={booking.sessions}
                        seat={ticket.seats}
                        screen={booking.sessions?.screens}
                      />
                    </div>
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
