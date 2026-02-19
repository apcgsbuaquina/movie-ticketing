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
    const { data: rpcData, error: rpcErr } = await supabase
      .rpc('get_taken_seat_ids', { p_sessionid: sessionId });

    if (!rpcErr) {
      const taken = new Set((rpcData || []).map((row) => row.seatid));
      setTakenSeatIds(taken);
      return taken;
    }

    // Fallback if RPC has not been created yet.
    const { data: tickets, error: ticketErr } = await supabase
      .from('tickets')
      .select('seatid, bookings(paymentstatus)')
      .eq('sessionid', sessionId);

    if (ticketErr) {
      console.error('Error fetching taken seats:', ticketErr);
      return;
    }

    const taken = new Set(
      (tickets || [])
        .filter((t) => {
          const status = t.bookings?.paymentstatus;
          if (!status) return true;
          return status !== 'Cancelled' && status !== 'Refunded';
        })
        .map((t) => t.seatid)
    );
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
