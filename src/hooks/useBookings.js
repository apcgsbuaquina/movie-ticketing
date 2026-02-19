import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useBookings(customerId = null) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .select(`
          *,
          sessions(*, movies(*), screens(*)),
          tickets(*, seats(*))
        `)
        .eq('customerid', customerId)
        .order('bookingtime', { ascending: false });

      if (err) throw err;
      setBookings(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  async function fetchAllBookings() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .select(`
          *,
          customers(firstname, lastname, email),
          sessions(*, movies(title), screens(cinemabranch, screennumber)),
          tickets(*, seats(rowchar, seatnumber, seattype))
        `)
        .order('bookingtime', { ascending: false });

      if (err) {
        console.error('fetchAllBookings error:', err);
        throw err;
      }

      console.log('fetchAllBookings raw data:', data?.length, 'rows', data);

      // Normalize: ensure paymentstatus is accessible in lowercase
      const normalized = (data || []).map((b) => {
        // If the DB returns PascalCase (e.g. PaymentStatus), map it
        if (!b.paymentstatus && b.PaymentStatus) {
          b.paymentstatus = b.PaymentStatus;
        }
        return b;
      });

      setBookings(normalized);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createBooking({ sessionId, customerId: custId, seats, ticketDetails, paymentMethod }) {
    const seatIds = seats.map((seat) => seat.seatid);

    let takenIds = new Set();
    const { data: rpcTaken, error: rpcTakenErr } = await supabase
      .rpc('get_taken_seat_ids', { p_sessionid: sessionId });

    if (!rpcTakenErr) {
      takenIds = new Set((rpcTaken || []).map((row) => row.seatid));
    } else {
      const { data: existingTickets, error: existingTicketsErr } = await supabase
        .from('tickets')
        .select('seatid')
        .eq('sessionid', sessionId)
        .in('seatid', seatIds);

      if (existingTicketsErr) throw existingTicketsErr;
      takenIds = new Set((existingTickets || []).map((ticket) => ticket.seatid));
    }

    const conflictingSeats = seats.filter((seat) => takenIds.has(seat.seatid));
    if (conflictingSeats.length > 0) {
      const takenSeats = seats
        .filter((seat) => takenIds.has(seat.seatid))
        .map((seat) => `${seat.rowchar}${seat.seatnumber}`)
        .join(', ');

      throw new Error(
        `The following seat(s) are already taken: ${takenSeats}. Please select different seats.`
      );
    }

    // Calculate totals
    const totalTicketPrice = ticketDetails.reduce((sum, t) => sum + t.finalPrice, 0);
    const convenienceFee = 20.00;
    const totalAmount = totalTicketPrice + convenienceFee;

    // 1. Create booking
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        sessionid: sessionId,
        customerid: custId,
        conveniencefee: convenienceFee,
        totalamount: totalAmount,
        paymentmethod: paymentMethod,
        paymentstatus: 'Pending',
      })
      .select()
      .single();

    if (bookingErr) throw bookingErr;

    try {
      // 2. Create tickets (sessionid required for seat-uniqueness constraint)
      const ticketInserts = ticketDetails.map((t, idx) => ({
        bookingid: booking.bookingid,
        seatid: seats[idx].seatid,
        sessionid: sessionId,
        tickettype: t.ticketType,
        senior_pwd_id: t.seniorPwdId || null,
        finalprice: t.finalPrice,
      }));

      const { error: ticketErr } = await supabase
        .from('tickets')
        .insert(ticketInserts);

      if (ticketErr) {
        if (ticketErr.code === '23505' || ticketErr.message?.includes('unique_seat_per_session')) {
          throw new Error('One or more selected seats were just booked by someone else. Please choose different seats.');
        }
        throw ticketErr;
      }

      return booking;
    } catch (err) {
      await supabase
        .from('bookings')
        .delete()
        .eq('bookingid', booking.bookingid);
      throw err;
    }
  }

  async function updateBookingPayment(bookingId, status) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ paymentstatus: status })
      .eq('bookingid', bookingId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function getBooking(bookingId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customers(firstname, lastname, email, phonenumber),
        sessions(*, movies(*), screens(*)),
        tickets(*, seats(*))
      `)
      .eq('bookingid', bookingId)
      .single();
    if (error) throw error;
    return data;
  }

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    fetchAllBookings,
    createBooking,
    updateBookingPayment,
    getBooking,
  };
}
