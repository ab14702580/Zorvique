import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  ArrowLeft, ShieldCheck, ShoppingBag, Zap,
  ChevronDown, AlertCircle, Camera, X, ImagePlus,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';

const IMGBB_KEY = '97f73f7011f85454774ead4305c4d1fa';

// ─── Google SVG ───────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.79h5.4a4.62 4.62 0 01-2 3.04v2.52h3.24C18.34 15.95 19.6 13.3 19.6 10.23z" fill="#4285F4"/>
    <path d="M10 20c2.7 0 4.97-.9 6.62-2.42l-3.24-2.52a6.02 6.02 0 01-3.38.94c-2.6 0-4.8-1.75-5.59-4.12H1.07v2.6A10 10 0 0010 20z" fill="#34A853"/>
    <path d="M4.41 11.88A6.01 6.01 0 014.1 10c0-.65.11-1.29.31-1.88V5.52H1.07A10 10 0 000 10c0 1.61.38 3.14 1.07 4.48l3.34-2.6z" fill="#FBBC05"/>
    <path d="M10 3.96c1.47 0 2.79.51 3.83 1.5l2.87-2.87C14.97.9 12.7 0 10 0A10 10 0 001.07 5.52l3.34 2.6C5.2 5.71 7.4 3.96 10 3.96z" fill="#EA4335"/>
  </svg>
);

// ─── Reusable field wrapper ────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#0B1C30]">{label}</span>
        {hint && <span className="text-[11px] text-[#565E74]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Input base class ─────────────────────────────────────────────────────────
const inputCls =
  'w-full h-9 bg-[#EFF4FF] rounded-xl text-sm text-[#0B1C30] placeholder-[#565E74]/60 ' +
  'border border-transparent focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition';

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { register, googleSignIn } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Go back to the page user came from (set by ProtectedRoute), or home
  const from = location.state?.from?.pathname || '/';
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // ── Photo upload helpers ──────────────────────────────────────────────────
  const applyPhoto = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Photo must be smaller than 2 MB.');
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const handlePhotoInput = (e) => applyPhoto(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    applyPhoto(e.dataTransfer.files?.[0]);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUpperOrSymbol = /[A-Z]|[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasMinLength && hasNumber && hasUpperOrSymbol;
  };

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
        setError('Popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Upload photo to imgbb → return hosted URL
  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    if (!data.success) throw new Error('imgbb upload failed');
    return data.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be at least 8 characters with 1 number and 1 uppercase or symbol');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!terms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      // Upload photo first if one was selected
      let photoURL = '';
      if (photoFile) {
        photoURL = await uploadPhoto(photoFile);
      }

      // Create Firebase user + set displayName & photoURL
      await register({ ...formData, photoURL });

      navigate(from, { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex flex-col overflow-hidden">

      {/* ── Decorative blobs ── */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full"
        style={{ background: 'rgba(184,0,53,0.05)', filter: 'blur(32px)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-48 w-[450px] h-[450px] rounded-full"
        style={{ background: 'rgba(218,226,253,0.3)', filter: 'blur(32px)' }}
      />

      {/* ── Top Utility Bar ── */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#565E74] hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <p className="text-sm text-[#565E74]">
          Have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-bold text-[#B80035] hover:text-rose-700"
          >
            Sign In
          </button>
        </p>
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-4 py-6 pb-16">
        <div className="w-full max-w-[620px] flex flex-col gap-4">

          {/* Card */}
          <div className="w-full bg-white rounded-xl shadow-[0_20px_50px_rgba(11,28,48,0.06)] px-6 sm:px-10 py-10 sm:py-12 flex flex-col gap-6">

            {/* ── Header ── */}
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF4FF] rounded-full">
                <ShoppingBag className="w-3.5 h-3.5 text-[#B80035]" />
                <span className="text-[11px] font-bold tracking-[0.55px] uppercase text-[#B80035]">
                  Customer Registration
                </span>
              </div>

              <h1
                className="text-[32px] font-extrabold tracking-[-0.8px] text-[#0B1C30] leading-10 mt-1"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Start Shopping Today
              </h1>

              <p className="text-base text-[#565E74] leading-6 max-w-md">
                Create your account to unlock exclusive deals, track orders, and enjoy a seamless shopping experience.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            {/* ── Social Buttons ── */}
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 h-9 bg-[#EFF4FF] hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                <GoogleIcon />
                <span className="text-sm font-semibold text-[#0B1C30]">Continue with Google</span>
              </button>
            </div>

            {/* ── Divider ── */}
            <div className="relative flex items-center justify-center">
              <div className="w-full h-px bg-[#E5EEFF]" />
              <span className="absolute bg-white px-4 text-xs font-medium tracking-[0.3px] text-[#565E74]">
                or register with credentials
              </span>
            </div>

            {/* ── Registration Form ── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First name">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    className={`${inputCls} px-4`}
                    required
                  />
                </Field>
                <Field label="Last name">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    className={`${inputCls} px-4`}
                    required
                  />
                </Field>
              </div>

              {/* ── Profile Photo (optional) ── */}
              <Field label="Profile photo" hint="Optional · JPG, PNG, WEBP · max 2 MB">
                {photoPreview ? (
                  /* Preview state */
                  <div className="flex items-center gap-4 p-3 bg-[#EFF4FF] rounded-xl">
                    <div className="relative shrink-0">
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#E11D48] rounded-full flex items-center justify-center shadow">
                        <Camera className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#0B1C30] truncate">{photoFile?.name}</p>
                      <p className="text-[11px] text-[#565E74]">
                        {photoFile ? `${(photoFile.size / 1024).toFixed(0)} KB` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Change photo */}
                      <label className="cursor-pointer text-xs font-semibold text-[#B80035] hover:text-rose-700 transition-colors">
                        Change
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoInput} />
                      </label>
                      {/* Remove photo */}
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-white hover:bg-rose-50 transition-colors"
                        aria-label="Remove photo"
                      >
                        <X className="w-3 h-3 text-[#565E74]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drop zone state */
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload profile photo"
                    className={`flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed cursor-pointer transition-colors
                      ${dragOver
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-[#D1DBF0] bg-[#EFF4FF] hover:border-rose-300 hover:bg-rose-50/40'
                      }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById('photo-input').click();
                      }
                    }}
                    onClick={() => document.getElementById('photo-input').click()}
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm pointer-events-none">
                      <ImagePlus className="w-4 h-4 text-[#B80035]" />
                    </div>
                    <div className="text-center pointer-events-none">
                      <span className="text-xs font-semibold text-[#B80035]">Click to upload</span>
                      <span className="text-xs text-[#565E74]"> or drag &amp; drop</span>
                    </div>
                    <input
                      id="photo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoInput}
                    />
                  </div>
                )}
              </Field>

              {/* Email */}
              <Field label="Email address">
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
              </Field>

              {/* Phone */}
              <Field label="Phone number (optional)">
                <div className="flex gap-1">
                  <div className="relative flex-shrink-0">
                    <select
                      className="h-9 pl-2 pr-6 bg-[#EFF4FF] rounded-xl text-xs font-semibold text-[#0B1C30]
                        border border-transparent focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none"
                    >
                      <option value="+880">🇧🇩 +880</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+91">🇮🇳 +91</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#565E74] pointer-events-none" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="1XXX-XXXXXX"
                    className={`${inputCls} flex-1 px-4`}
                  />
                </div>
              </Field>

              {/* Password */}
              <Field label="Password" hint="Minimum 8 characters">
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-4 text-[#565E74]" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className={`${inputCls} pl-10 pr-11`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#565E74] hover:text-slate-700"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-3.5" /> : <Eye className="w-4 h-3.5" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
                  {['8+ characters', 'At least 1 number', '1 uppercase or symbol'].map((req) => (
                    <span key={req} className="flex items-center gap-1 text-[11px] text-[#565E74]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#565E74] shrink-0" />
                      {req}
                    </span>
                  ))}
                </div>
              </Field>

              {/* Confirm Password */}
              <Field label="Confirm password">
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-4 text-[#565E74]" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className={`${inputCls} pl-10 pr-11`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#565E74] hover:text-slate-700"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-3.5" /> : <Eye className="w-4 h-3.5" />}
                  </button>
                </div>
              </Field>

              {/* Terms */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  id="terms-checkbox"
                  type="checkbox"
                  checked={terms}
                  onChange={() => setTerms((v) => !v)}
                  className="mt-0.5 w-3.5 h-3.5 shrink-0 accent-rose-600 border border-slate-400 rounded cursor-pointer"
                />
                <label htmlFor="terms-checkbox" className="text-sm text-[#565E74] leading-5 cursor-pointer">
                  I agree to the Multiventor{' '}
                  <span className="font-semibold text-[#0B1C30] underline hover:text-rose-700 cursor-pointer">
                    Terms of Service
                  </span>{' '}
                  and acknowledge the{' '}
                  <span
                    onClick={() => window.open('/privacy-policy', '_blank')}
                    className="font-semibold text-[#0B1C30] underline hover:text-rose-700 cursor-pointer"
                  >
                    Privacy Policy
                  </span>
                  .
                </label>
              </div>

              {/* Newsletter opt-in */}
              <div className="flex items-start gap-2">
                <input
                  id="newsletter-checkbox"
                  type="checkbox"
                  checked={newsletter}
                  onChange={() => setNewsletter((v) => !v)}
                  className="mt-0.5 w-3.5 h-3.5 shrink-0 accent-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="newsletter-checkbox" className="text-sm text-[#565E74] leading-5 cursor-pointer">
                  Send me exclusive deals, discount codes, and new arrival notifications.
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-1.5
                  bg-[#E11D48] hover:bg-rose-700 active:scale-[0.99]
                  disabled:bg-slate-300 disabled:cursor-not-allowed
                  text-white rounded-xl shadow-[0_4px_16px_rgba(225,29,72,0.25)]
                  transition-all cursor-pointer"
              >
                {loading ? (
                  <span
                    className="text-xl font-semibold"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Creating Account...
                  </span>
                ) : (
                  <>
                    <span
                      className="text-xl font-semibold"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Create Account
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* ── Trust badges ── */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 border-t border-[#E5EEFF]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A36700]" />
                <span className="text-xs font-medium text-[#565E74]">256-bit SSL encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-2.5 h-3.5 text-[#B80035]" />
                <span className="text-xs font-medium text-[#565E74]">Spam-free guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3 text-[#565E74]" />
                <span className="text-xs font-medium text-[#565E74]">Instant activation</span>
              </div>
            </div>

          </div>

          {/* ── Footer Help Line ── */}
          <p className="text-center text-sm text-[#565E74] pb-4">
            Trouble creating your account?{' '}
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="font-bold text-[#0B1C30] hover:text-rose-700 cursor-pointer"
            >
              Contact Support
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
