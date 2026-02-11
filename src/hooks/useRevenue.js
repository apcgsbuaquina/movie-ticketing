import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useRevenue() {
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRevenue = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('revenue')
        .select('*')
        .order('date', { ascending: false });

      if (filters.branch) {
        query = query.eq('cinemabranch', filters.branch);
      }
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setRevenue(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  function getRevenueStats() {
    const totalRevenue = revenue.reduce((sum, r) => sum + Number(r.totalrevenue || 0), 0);
    const totalBookings = revenue.reduce((sum, r) => sum + Number(r.totalbookings || 0), 0);
    const totalTickets = revenue.reduce((sum, r) => sum + Number(r.totaltickets || 0), 0);
    return { totalRevenue, totalBookings, totalTickets };
  }

  return {
    revenue,
    loading,
    error,
    fetchRevenue,
    getRevenueStats,
  };
}
