import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { hasSupabaseConfig } from './lib/supabase';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import Landing from './pages/Landing';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMovies from './pages/admin/ManageMovies';
import ManageSessions from './pages/admin/ManageSessions';
import ManageScreens from './pages/admin/ManageScreens';
import ManageSeats from './pages/admin/ManageSeats';
import ManageBookings from './pages/admin/ManageBookings';
import ViewRevenue from './pages/admin/ViewRevenue';

export default function App() {
  const { loading } = useAuth();

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-cinema-dark flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-3">
          <div className="text-cinema-gold font-heading text-3xl animate-flicker">
            Cinema
          </div>
          <p className="text-cinema-cream/70 font-body text-sm">
            Supabase environment variables are missing. Create a .env file from .env.example
            and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-dark flex items-center justify-center">
        <div className="text-cinema-gold font-heading text-3xl animate-flicker">
          Cinema
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#f5e6c8',
            border: '1px solid #c4a35a',
            fontFamily: '"Source Serif 4", Georgia, serif',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/movie/:id" element={<MovieDetails />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/session/:sessionId/seats" element={<SeatSelection />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
            <Route path="/dashboard" element={<UserDashboard />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/movies" element={<ManageMovies />} />
            <Route path="/admin/sessions" element={<ManageSessions />} />
            <Route path="/admin/screens" element={<ManageScreens />} />
            <Route path="/admin/seats" element={<ManageSeats />} />
            <Route path="/admin/bookings" element={<ManageBookings />} />
            <Route path="/admin/revenue" element={<ViewRevenue />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
