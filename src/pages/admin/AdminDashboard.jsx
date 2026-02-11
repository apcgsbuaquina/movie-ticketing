import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Film,
  Monitor,
  Armchair,
  CalendarClock,
  Ticket,
  DollarSign,
  Settings,
} from 'lucide-react';

const adminLinks = [
  {
    to: '/admin/movies',
    icon: <Film size={24} />,
    title: 'Movies',
    desc: 'Add, edit, and remove movies',
  },
  {
    to: '/admin/sessions',
    icon: <CalendarClock size={24} />,
    title: 'Sessions',
    desc: 'Manage showtimes and schedules',
  },
  {
    to: '/admin/screens',
    icon: <Monitor size={24} />,
    title: 'Screens',
    desc: 'Configure cinema screens',
  },
  {
    to: '/admin/seats',
    icon: <Armchair size={24} />,
    title: 'Seats',
    desc: 'Manage seating layouts',
  },
  {
    to: '/admin/bookings',
    icon: <Ticket size={24} />,
    title: 'Bookings',
    desc: 'View and manage all bookings',
  },
  {
    to: '/admin/revenue',
    icon: <DollarSign size={24} />,
    title: 'Revenue',
    desc: 'Revenue reports and analytics',
  },
];

export default function AdminDashboard() {
  const { profile, userRole } = useAuth();

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings size={24} className="text-cinema-gold" />
        <div>
          <h1 className="font-heading text-3xl font-bold text-cinema-cream">
            Admin Panel
          </h1>
          <p className="text-cinema-cream/50 font-accent text-sm">
            Logged in as {userRole} — {profile?.users?.username || 'Unknown'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="bg-cinema-navy/60 border border-cinema-gold/15 p-6
              hover:border-cinema-gold/50 hover:bg-cinema-navy/80
              transition-all duration-300 retro-glow group"
          >
            <div className="text-cinema-gold/70 group-hover:text-cinema-gold transition-colors mb-3">
              {link.icon}
            </div>
            <h2 className="font-heading font-bold text-cinema-cream text-lg group-hover:text-cinema-gold transition-colors">
              {link.title}
            </h2>
            <p className="text-cinema-cream/40 text-sm font-body mt-1">
              {link.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
