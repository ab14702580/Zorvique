import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from 'firebase/auth';
import Swal from 'sweetalert2';
import DashboardLayout from '../../../Component/DashboardLayout/DashboardLayout';
import { useAuth } from '../../../context/useAuth';
import { auth } from '../../../../firebase.init';

function PasswordField({ label, name, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-600"
        style={{ fontFamily: "'Inter', sans-serif" }}>
        {label}
      </label>
      <div className="relative">
        <KeyRound size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className="w-full h-10 pl-9 pr-10 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300
            focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
        <button type="button" onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

// Password strength checker
function strengthLevel(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)   s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500'];

export default function ChangePasswordPage() {
  const { currentUser } = useAuth();
  const [form,    setForm]    = useState({ current: '', newPass: '', confirm: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError('');
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const strength = strengthLevel(form.newPass);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.current || !form.newPass || !form.confirm) {
      setError('All fields are required.'); return;
    }
    if (form.newPass.length < 8) {
      setError('New password must be at least 8 characters.'); return;
    }
    if (form.newPass !== form.confirm) {
      setError('New password and confirm password do not match.'); return;
    }
    if (form.current === form.newPass) {
      setError('New password must be different from the current password.'); return;
    }

    // Check if user signed in with Google (no password)
    const providerData = currentUser?.providerData || [];
    const isPasswordUser = providerData.some(p => p.providerId === 'password');
    if (!isPasswordUser) {
      Swal.fire({
        icon: 'info',
        title: 'Google account',
        text: 'Your account uses Google Sign-In. Password change is not available.',
        confirmButtonColor: '#e11d48',
      });
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(currentUser.email, form.current);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, form.newPass);

      setForm({ current: '', newPass: '', confirm: '' });
      Swal.fire({
        icon: 'success',
        title: 'Password changed!',
        text: 'Your password has been updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Current password is incorrect.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('Session expired. Please log out and log in again.');
      } else {
        setError('Password change failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeId="password">

      <h1 className="text-[14px] font-semibold text-gray-800 tracking-[-0.35px] leading-5"
        style={{ fontFamily: "'Inter', sans-serif" }}>
        Change Password
      </h1>

      <div className="w-full bg-white border border-gray-100 rounded-xl p-6 max-w-lg shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <PasswordField
            label="Current Password"
            name="current"
            value={form.current}
            onChange={handleChange}
            autoComplete="current-password"
          />
          <PasswordField
            label="New Password"
            name="newPass"
            value={form.newPass}
            onChange={handleChange}
            autoComplete="new-password"
          />

          {/* Password strength bar */}
          {form.newPass && (
            <div className="flex flex-col gap-1 -mt-2">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-gray-200'}`} />
                ))}
              </div>
              <p className="text-[11px] text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                Strength: <span className={`font-semibold ${strength >= 3 ? 'text-emerald-600' : strength === 2 ? 'text-amber-600' : 'text-red-500'}`}>
                  {strengthLabel[strength]}
                </span>
              </p>
            </div>
          )}

          <PasswordField
            label="Confirm New Password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            autoComplete="new-password"
          />

          {/* Match indicator */}
          {form.confirm && form.newPass && (
            <div className={`flex items-center gap-1.5 text-xs -mt-2 ${form.newPass === form.confirm ? 'text-emerald-600' : 'text-rose-500'}`}
              style={{ fontFamily: "'Inter', sans-serif" }}>
              {form.newPass === form.confirm
                ? <><CheckCircle size={13} /> Passwords match</>
                : <><AlertCircle size={13} /> Passwords do not match</>
              }
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              <AlertCircle size={13} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 h-10 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Updating…</>
                : 'Update Password'
              }
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
