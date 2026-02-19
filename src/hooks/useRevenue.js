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
      // start_date and end_date are required params (no DEFAULT in the DB function)
      const params = {
        start_date: filters.startDate || '2000-01-01',
        end_date: filters.endDate || new Date().toISOString().split('T')[0],
        branch_name: filters.branch || null,
      };

      const { data, error: err } = await supabase.rpc('get_daily_revenue_filtered', params);

      if (err) {
        console.error('Revenue RPC error full:', JSON.stringify(err, null, 2));
        console.error('Revenue RPC error message:', err.message);
        console.error('Revenue RPC error details:', err.details);
        console.error('Revenue RPC error hint:', err.hint);
        console.error('Revenue RPC error code:', err.code);
        console.error('Revenue RPC params sent:', JSON.stringify(params));
        throw new Error(err.message || err.details || err.hint || JSON.stringify(err));
      }

      console.log('Revenue RPC raw response:', data);

      // Normalize column names — the RPC may return varying casing
      // Build a case-insensitive getter so any naming convention works
      function get(row, ...keys) {
        for (const key of keys) {
          if (row[key] !== undefined) return row[key];
        }
        // Fallback: try case-insensitive match against all row keys
        const lowerKeys = keys.map((k) => k.toLowerCase());
        for (const rowKey of Object.keys(row)) {
          if (lowerKeys.includes(rowKey.toLowerCase())) return row[rowKey];
        }
        return null;
      }

      const normalizedRevenue = (data || []).map((row) => {
        const branch = get(row, 'cinemabranch', 'CinemaBranch', 'cinema_branch');
        const date = get(row, 'revenuedate', 'RevenueDate', 'revenue_date');
        return {
          revenueid: `${date}-${branch}`,
          cinemabranch: branch,
          date: date,
          totalrevenue: Number(get(row, 'totalrevenue', 'TotalRevenue', 'total_revenue') ?? 0),
          totalbookings: Number(get(row, 'totalbookings', 'TotalBookings', 'total_bookings') ?? 0),
          totaltickets: Number(get(row, 'totaltickets', 'TotalTickets', 'total_tickets') ?? 0),
        };
      });

      // Sort newest first
      normalizedRevenue.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

      setRevenue(normalizedRevenue);
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
