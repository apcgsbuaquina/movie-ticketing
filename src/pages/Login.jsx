import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RetroInput from '../components/ui/RetroInput';
import RetroButton from '../components/ui/RetroButton';
import FilmGrain from '../components/ui/FilmGrain';
import toast from 'react-hot-toast';
import { Film, LogIn } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn({ email, password });
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cinema-dark halftone-bg flex items-center justify-center px-4">
      <FilmGrain />

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <Film size={32} className="text-cinema-gold group-hover:animate-flicker" />
            <span className="font-heading text-3xl font-bold text-cinema-gold text-shadow-glow">
              Cinema
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-cinema-navy/80 border border-cinema-gold/30 p-8">
          <h1 className="font-heading text-2xl font-bold text-cinema-cream text-center mb-6">
            Sign In
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <RetroInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <RetroInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <RetroButton
              type="submit"
              disabled={loading}
              className="w-full mt-2"
              size="lg"
            >
              {loading ? 'Signing In...' : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </RetroButton>
          </form>

          <div className="vintage-divider mt-6">
            <span className="text-cinema-cream/30 font-accent text-xs px-2">or</span>
          </div>

          <p className="text-center text-cinema-cream/50 font-body text-sm mt-4">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-cinema-gold hover:underline font-semibold">
              Register
            </Link>
          </p>
        </div>

        <p className="text-center text-cinema-cream/20 font-accent text-xs mt-4">
          &copy; {new Date().getFullYear()} Cinema
        </p>
      </div>
    </div>
  );
}
