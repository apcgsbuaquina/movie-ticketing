import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RetroInput from '../components/ui/RetroInput';
import RetroButton from '../components/ui/RetroButton';
import FilmGrain from '../components/ui/FilmGrain';
import toast from 'react-hot-toast';
import { Film, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleChange(field) {
    return (e) => {
      let value = e.target.value;
      // Phone: only allow digits, max 11 characters
      if (field === 'phone') {
        value = value.replace(/\D/g, '').slice(0, 11);
      }
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!/^\d{11}$/.test(form.phone)) {
      toast.error('Phone number must be exactly 11 digits');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        suffix: form.suffix,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
      });

      toast.success('Account created! Please check your email to confirm, then sign in.');
      navigate('/login');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('phonenumber') || msg.includes('duplicate key') || msg.includes('unique constraint') || msg.includes('already registered')) {
        toast.error('This phone number is already registered. Please use a different number.');
      } else if (msg.includes('already been registered') || msg.includes('already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error(msg || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cinema-dark halftone-bg flex items-center justify-center px-4 py-8">
      <FilmGrain />

      <div className="w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-6">
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
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <RetroInput
                label="First Name"
                placeholder="Juan"
                value={form.firstName}
                onChange={handleChange('firstName')}
                required
              />
              <RetroInput
                label="Last Name"
                placeholder="Dela Cruz"
                value={form.lastName}
                onChange={handleChange('lastName')}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <RetroInput
                label="Middle Name"
                placeholder="(optional)"
                value={form.middleName}
                onChange={handleChange('middleName')}
              />
              <RetroInput
                label="Suffix"
                placeholder="Jr., Sr., III"
                value={form.suffix}
                onChange={handleChange('suffix')}
              />
            </div>

            <RetroInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <RetroInput
                  label="Phone Number"
                  type="tel"
                  placeholder="09xxxxxxxxx"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  maxLength={11}
                  required
                />
                {form.phone.length > 0 && form.phone.length < 11 && (
                  <p className="text-red-400 text-xs mt-1 font-body">
                    {11 - form.phone.length} more digit{11 - form.phone.length !== 1 ? 's' : ''} needed
                  </p>
                )}
              </div>
              <RetroInput
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-accent text-cinema-gold/80 tracking-wider uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange('password')}
                    required
                    className="
                      w-full px-4 py-2.5 pr-12
                      bg-cinema-dark/80 border-2 border-cinema-gold/30
                      text-cinema-cream font-body
                      placeholder:text-cinema-cream/30
                      focus:outline-none focus:border-cinema-gold focus:shadow-[0_0_10px_rgba(196,163,90,0.2)]
                      transition-all duration-300
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center
                      text-cinema-gold hover:text-cinema-sepia transition-all duration-300
                    "
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-accent text-cinema-gold/80 tracking-wider uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    required
                    className="
                      w-full px-4 py-2.5 pr-12
                      bg-cinema-dark/80 border-2 border-cinema-gold/30
                      text-cinema-cream font-body
                      placeholder:text-cinema-cream/30
                      focus:outline-none focus:border-cinema-gold focus:shadow-[0_0_10px_rgba(196,163,90,0.2)]
                      transition-all duration-300
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="
                      absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center
                      text-cinema-gold hover:text-cinema-sepia transition-all duration-300
                    "
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <RetroButton
              type="submit"
              disabled={loading}
              className="w-full mt-2"
              size="lg"
            >
              {loading ? 'Creating Account...' : (
                <>
                  <UserPlus size={16} />
                  Register
                </>
              )}
            </RetroButton>
          </form>

          <div className="vintage-divider mt-6">
            <span className="text-cinema-cream/30 font-accent text-xs px-2">or</span>
          </div>

          <p className="text-center text-cinema-cream/50 font-body text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-cinema-gold hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
