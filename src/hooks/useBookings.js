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

      if (err) throw err;
      setBookings(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createBooking({ sessionId, customerId: custId, seats, ticketDetails, paymentMethod }) {
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

    if (ticketErr) throw ticketErr;

    return booking;
  }

  async function updateBookingPayment(bookingId, status) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ paymentstatus: status })
      .eq('bookingid', bookingId)
      .select()
      .single();
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
