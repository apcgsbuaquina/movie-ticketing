import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Film,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, userRole, signOut, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 bg-cinema-dark/95 backdrop-blur-sm border-b border-cinema-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Film
              size={28}
              className="text-cinema-gold group-hover:animate-flicker"
            />
              <span className="font-heading text-2xl font-bold text-cinema-gold text-shadow-glow hidden sm:block">
                Cinema
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-cinema-cream/70 hover:text-cinema-gold font-body text-sm tracking-wider uppercase transition-colors"
            >
              Now Showing
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className="text-cinema-cream/70 hover:text-cinema-gold font-body text-sm tracking-wider uppercase transition-colors"
              >
                My Tickets
              </Link>
            )}

            {(isAdmin || isStaff) && (
              <Link
                to="/admin"
                className="text-cinema-cream/70 hover:text-cinema-gold font-body text-sm tracking-wider uppercase transition-colors flex items-center gap-1"
              >
                <Settings size={14} />
                Admin
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3 ml-2">
                <div className="flex items-center gap-2 text-cinema-cream/50 text-xs font-accent">
                  <User size={14} />
                  <span className="hidden lg:inline">
                    {user.email}
                  </span>
                  {userRole && (
                    <span className="bg-cinema-gold/20 text-cinema-gold px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
                      {userRole}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-cinema-cream/50 hover:text-cinema-red transition-colors"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-cinema-gold text-cinema-dark px-4 py-1.5 font-heading text-sm font-semibold tracking-wider uppercase hover:bg-cinema-sepia transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-cinema-cream/70 hover:text-cinema-gold"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-cinema-gold/10 pt-3 animate-slide-up space-y-2">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-cinema-cream/70 hover:text-cinema-gold font-body text-sm tracking-wider uppercase"
            >
              Now Showing
            </Link>

            {user && (
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-cinema-cream/70 hover:text-cinema-gold font-body text-sm tracking-wider uppercase"
              >
                My Tickets
              </Link>
            )}

            {(isAdmin || isStaff) && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-cinema-cream/70 hover:text-cinema-gold font-body text-sm tracking-wider uppercase"
              >
                Admin Panel
              </Link>
            )}

            {user ? (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
                className="block py-2 text-cinema-red/80 hover:text-cinema-red font-body text-sm tracking-wider uppercase"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-cinema-gold font-body text-sm tracking-wider uppercase"
              >
                Sign In
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
