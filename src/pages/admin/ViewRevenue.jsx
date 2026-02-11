import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRevenue } from '../../hooks/useRevenue';
import RetroInput from '../../components/ui/RetroInput';
import RetroButton from '../../components/ui/RetroButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Ticket,
  CalendarRange,
  Search,
} from 'lucide-react';

export default function ViewRevenue() {
  const { revenue, loading, fetchRevenue, getRevenueStats } = useRevenue();
  const [branch, setBranch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchRevenue();
  }, []);

  function handleFilter() {
    fetchRevenue({
      branch: branch || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  }

  function handleReset() {
    setBranch('');
    setStartDate('');
    setEndDate('');
    fetchRevenue();
  }

  const stats = getRevenueStats();

  // Get unique branches from revenue data
  const branches = [...new Set(revenue.map((r) => r.cinemabranch).filter(Boolean))];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-cinema-cream/50 hover:text-cinema-gold text-sm font-accent transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Admin Panel
      </Link>

      <h1 className="font-heading text-2xl font-bold text-cinema-cream flex items-center gap-2 mb-6">
        <DollarSign size={22} className="text-cinema-gold" />
        Revenue Reports
      </h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-cinema-navy/60 border border-cinema-gold/20 p-5 text-center">
          <TrendingUp size={20} className="text-cinema-gold mx-auto mb-2" />
          <div className="text-cinema-gold font-heading font-bold text-2xl">
            ₱{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-cinema-cream/40 font-accent text-xs uppercase tracking-wider mt-1">
            Total Revenue
          </div>
        </div>
        <div className="bg-cinema-navy/60 border border-cinema-gold/20 p-5 text-center">
          <Ticket size={20} className="text-cinema-gold mx-auto mb-2" />
          <div className="text-cinema-gold font-heading font-bold text-2xl">
            {stats.totalBookings}
          </div>
          <div className="text-cinema-cream/40 font-accent text-xs uppercase tracking-wider mt-1">
            Total Bookings
          </div>
        </div>
        <div className="bg-cinema-navy/60 border border-cinema-gold/20 p-5 text-center">
          <CalendarRange size={20} className="text-cinema-gold mx-auto mb-2" />
          <div className="text-cinema-gold font-heading font-bold text-2xl">
            {stats.totalTickets}
          </div>
          <div className="text-cinema-cream/40 font-accent text-xs uppercase tracking-wider mt-1">
            Total Tickets
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-cinema-dark/50 border border-cinema-gold/15 p-4 mb-6">
        <h2 className="font-accent text-cinema-gold/70 text-sm tracking-wider uppercase mb-3">
          Filters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-accent text-cinema-gold/60 mb-1 uppercase tracking-wider">
              Branch
            </label>
            <select
              className="w-full bg-cinema-dark border border-cinema-gold/30 text-cinema-cream px-3 py-2 text-sm font-body"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <RetroInput
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <RetroInput
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div className="flex items-end gap-2">
            <RetroButton onClick={handleFilter} size="sm">
              <Search size={14} />
              Filter
            </RetroButton>
            <RetroButton onClick={handleReset} variant="ghost" size="sm">
              Reset
            </RetroButton>
          </div>
        </div>
      </div>

      {/* Revenue table */}
      {loading ? (
        <LoadingSpinner />
      ) : revenue.length === 0 ? (
        <p className="text-cinema-cream/40 font-accent text-center py-12">
          No revenue data found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cinema-gold/20 text-left text-cinema-gold/70 font-accent text-xs uppercase tracking-wider">
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Branch</th>
                <th className="py-3 px-2 text-right">Revenue</th>
                <th className="py-3 px-2 text-right">Bookings</th>
                <th className="py-3 px-2 text-right">Tickets</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((r) => (
                <tr
                  key={r.revenueid}
                  className="border-b border-cinema-gold/5 hover:bg-cinema-gold/5 transition-colors"
                >
                  <td className="py-2.5 px-2 text-cinema-cream font-semibold">
                    {format(new Date(r.date), 'MMM d, yyyy')}
                  </td>
                  <td className="py-2.5 px-2 text-cinema-cream/60">
                    {r.cinemabranch || '—'}
                  </td>
                  <td className="py-2.5 px-2 text-cinema-gold font-heading font-bold text-right">
                    ₱{Number(r.totalrevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-2 text-cinema-cream/60 text-right">
                    {r.totalbookings}
                  </td>
                  <td className="py-2.5 px-2 text-cinema-cream/60 text-right">
                    {r.totaltickets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
