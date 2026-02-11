import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSeats(screenId = null) {
  const [seats, setSeats] = useState([]);
  const [takenSeatIds, setTakenSeatIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSeats = useCallback(async (sId = screenId) => {
    if (!sId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('seats')
        .select('*')
        .eq('screenid', sId)
        .order('rowchar', { ascending: true })
        .order('seatnumber', { ascending: true });

      if (err) throw err;
      setSeats(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [screenId]);

  async function fetchTakenSeats(sessionId) {
    const { data, error: err } = await supabase
      .from('tickets')
      .select('seatid')
      .eq('bookingid', supabase.rpc ? undefined : undefined); // We need to get tickets for a session

    // Actually, tickets don't directly have sessionid,
    // but we can get them via bookings for that session
    const { data: tickets, error: ticketErr } = await supabase
      .from('tickets')
      .select('seatid, bookings!inner(sessionid, paymentstatus)')
      .not('bookings.paymentstatus', 'in', '("Cancelled","Refunded")')
      .eq('bookings.sessionid', sessionId);

    if (ticketErr) {
      console.error('Error fetching taken seats:', ticketErr);
      return;
    }

    const taken = new Set((tickets || []).map((t) => t.seatid));
    setTakenSeatIds(taken);
    return taken;
  }

  async function createSeats(seatsToCreate) {
    const { data, error } = await supabase
      .from('seats')
      .insert(seatsToCreate)
      .select();
    if (error) throw error;
    return data;
  }

  async function deleteSeat(seatId) {
    const { error } = await supabase
      .from('seats')
      .delete()
      .eq('seatid', seatId);
    if (error) throw error;
  }

  async function deleteAllSeatsForScreen(sId) {
    const { error } = await supabase
      .from('seats')
      .delete()
      .eq('screenid', sId);
    if (error) throw error;
  }

  // Group seats by row for display
  function getSeatsByRow() {
    const rows = {};
    seats.forEach((seat) => {
      if (!rows[seat.rowchar]) rows[seat.rowchar] = [];
      rows[seat.rowchar].push(seat);
    });
    // Sort seats within each row
    Object.keys(rows).forEach((row) => {
      rows[row].sort((a, b) => a.seatnumber - b.seatnumber);
    });
    return rows;
  }

  return {
    seats,
    takenSeatIds,
    loading,
    error,
    fetchSeats,
    fetchTakenSeats,
    createSeats,
    deleteSeat,
    deleteAllSeatsForScreen,
    getSeatsByRow,
  };
}
