import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  ArrowLeft, ShieldCheck, BadgeCheck, Truck, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';

// ─── Google SVG ───────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.79h5.4a4.62 4.62 0 01-2 3.04v2.52h3.24C18.34 15.95 19.6 13.3 19.6 10.23z" fill="#4285F4"/>
    <path d="M10 20c2.7 0 4.97-.9 6.62-2.42l-3.24-2.52a6.02 6.02 0 01-3.38.94c-2.6 0-4.8-1.75-5.59-4.12H1.07v2.6A10 10 0 0010 20z" fill="#34A853"/>
    <path d="M4.41 11.88A6.01 6.01 0 014.1 10c0-.65.11-1.29.31-1.88V5.52H1.07A10 10 0 000 10c0 1.61.38 3.14 1.07 4.48l3.34-2.6z" fill="#FBBC05"/>
    <path d="M10 3.96c1.47 0 2.79.51 3.83 1.5l2.87-2.87C14.97.9 12.7 0 10 0A10 10 0 001.07 5.52l3.34 2.6C5.2 5.71 7.4 3.96 10 3.96z" fill="#EA4335"/>
  </svg>
);

const inputCls =
  'w-full h-9 bg-[#EFF4FF] rounded-xl text-sm text-[#0B1C30] placeholder-[#565E74]/60 ' +
  'border border-transparent focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition';

export default function LoginPage() {
  const { login, googleSignIn } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // If ProtectedRoute redirected here, go back to that page after login
  const from = location.state?.from?.pathname || '/';

  const [showPassword, setShowPassword] = useState(false);
  const [remember,     setRemember]     = useState(true);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [formData,     setFormData]     = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  // ── Email / password sign-in ──────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      if (
        err.code === 'auth/user-not-found'  ||
        err.code === 'auth/wrong-password'  ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google sign-in ────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await googleSignIn();
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full"
        style={{ background: 'rgba(184,0,53,0.05)', filter: 'blur(32px)' }} />
      <div className="pointer-events-none absolute -bottom-32 -right-48 w-[450px] h-[450px] rounded-full"
        style={{ background: 'rgba(218,226,253,0.3)', filter: 'blur(32px)' }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm font-medium text-[#565E74] hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <p className="text-sm text-[#565E74]">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-[#B80035] hover:text-rose-700">
            Sign Up
          </Link>
        </p>
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-4 py-6 pb-20">
        <div className="w-full max-w-[520px] flex flex-col gap-4">
          <div className="w-full bg-white rounded-xl shadow-[0_20px_50px_rgba(11,28,48,0.06)] px-6 sm:px-10 py-10 sm:py-12 flex flex-col gap-6">

            {/* Header */}
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF4FF] rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B80035]" />
                <span className="text-[11px] font-semibold tracking-[0.55px] uppercase text-[#B80035]">
                  Secure Customer Login
                </span>
              </div>
              <h1 className="text-2xl font-semibold text-[#0B1C30] leading-8 mt-1">Welcome Back!</h1>
              <p className="text-sm text-[#565E74] leading-5 max-w-sm">
                Sign in to continue shopping, track your orders, and manage your account.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-9 bg-[#EFF4FF] hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer"
            >
              <GoogleIcon />
              <span className="text-sm font-medium text-[#0B1C30]">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full h-px bg-[#E5EEFF]" />
              <span className="absolute bg-white px-4 text-xs font-medium tracking-[0.3px] text-[#565E74]">
                or sign in with credentials
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#0B1C30]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-3.5 text-[#565E74]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className={`${inputCls} pl-10 pr-4`}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#0B1C30]">Password</label>
                  <button type="button" className="text-xs font-medium text-[#B80035] hover:text-rose-700 cursor-pointer">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-4 text-[#565E74]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className={`${inputCls} pl-10 pr-11`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#565E74] hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-3.5" /> : <Eye className="w-4 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(v => !v)}
                  className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-[#565E74] cursor-pointer">
                  Remember me on this browser
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 flex items-center justify-center gap-2
                  bg-[#E11D48] hover:bg-rose-700 active:scale-[0.99]
                  disabled:bg-slate-300 disabled:cursor-not-allowed
                  text-white rounded-xl shadow-[0_4px_16px_rgba(225,29,72,0.25)]
                  transition-all cursor-pointer"
              >
                {loading
                  ? <span className="text-sm font-semibold">Signing In…</span>
                  : <><span className="text-sm font-semibold">Sign In</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            {/* Sign up link */}
            <p className="text-center text-sm text-[#565E74]">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-[#B80035] hover:text-rose-700">
                Sign Up for Free
              </Link>
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 border-t border-[#E5EEFF]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A36700]" />
                <span className="text-xs font-medium text-[#565E74]">256-bit SSL encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-[#B80035]" />
                <span className="text-xs font-medium text-[#565E74]">Official Authorized Store</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#565E74]" />
                <span className="text-xs font-medium text-[#565E74]">Express Global Delivery</span>
              </div>
            </div>

            {/* Legal */}
            <div className="px-2 py-2 bg-[#EFF4FF] rounded-lg text-center">
              <p className="text-[11px] font-medium text-[#565E74] leading-5">
                Protected by reCAPTCHA. Bound by Multiventor{' '}
                <button type="button" onClick={() => window.open('/privacy-policy', '_blank')} className="underline hover:text-rose-700">Privacy Policy</button>
                {' '}and{' '}
                <button type="button" className="underline hover:text-rose-700">Terms of Service</button>.
              </p>
            </div>

          </div>

          {/* Footer */}
          <p className="text-center text-sm text-[#565E74] pb-4">
            Need assistance?{' '}
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="font-semibold text-[#B80035] hover:text-rose-700 cursor-pointer"
            >
              Contact Customer Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
