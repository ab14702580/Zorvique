import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2, CheckCircle, AlertCircle, User } from 'lucide-react';
import Swal from 'sweetalert2';
import DashboardLayout from '../../../Component/DashboardLayout/DashboardLayout';
import { useAuth } from '../../../context/useAuth';
import api from '../../../api/axios';

const IMGBB_KEY = '97f73f7011f85454774ead4305c4d1fa';

const uploadToImgbb = async (file) => {
  const fd = new FormData();
  fd.append('image', file);
  const res  = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!data.success) throw new Error('Image upload failed');
  return data.data.url;
};

const inputCls =
  'h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 ' +
  'focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors';

export default function MyProfilePage() {
  const { currentUser, dbUser, fetchDbUser } = useAuth();

  const [form, setForm]         = useState({ firstName: '', lastName: '', phone: '', gender: '', dob: '' });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile,    setPhotoFile]    = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileRef = useRef(null);

  // ── Load data from dbUser ──────────────────────────────────────────────────
  useEffect(() => {
    if (!dbUser) return;
    const [firstName = '', ...rest] = (dbUser.displayName || '').split(' ');
    const lastName = rest.join(' ');
    setForm({
      firstName,
      lastName,
      phone:  dbUser.phone  || '',
      gender: dbUser.gender || '',
      dob:    dbUser.dob    || '',
    });
    if (dbUser.photoURL) setPhotoPreview(dbUser.photoURL);
  }, [dbUser]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // ── Photo select ───────────────────────────────────────────────────────────
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: 'Invalid file', text: 'Please select an image file.', confirmButtonColor: '#e11d48' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'Too large', text: 'Photo must be under 2 MB.', confirmButtonColor: '#e11d48' });
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Save profile ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim()) {
      Swal.fire({ icon: 'warning', title: 'First name required', confirmButtonColor: '#e11d48' });
      return;
    }
    setSaving(true);
    try {
      let photoURL = dbUser?.photoURL || '';

      // Upload new photo if selected
      if (photoFile) {
        setPhotoLoading(true);
        photoURL = await uploadToImgbb(photoFile);
        setPhotoLoading(false);
        setPhotoFile(null);
      }

      const displayName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      const email       = dbUser?.email || currentUser?.email;

      await api.put(`/users/${encodeURIComponent(email)}`, {
        displayName,
        photoURL,
        phone:  form.phone,
        gender: form.gender,
        dob:    form.dob,
        role:   dbUser?.role || 'user',
      });

      // Refresh context
      await fetchDbUser(email);
      setPhotoPreview(photoURL);

      Swal.fire({ icon: 'success', title: 'Profile updated!', timer: 1800, showConfirmButton: false });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Save failed', text: err.message, confirmButtonColor: '#e11d48' });
    } finally {
      setSaving(false);
      setPhotoLoading(false);
    }
  };

  const email = dbUser?.email || currentUser?.email || '';

  return (
    <DashboardLayout activeId="profile">

      <h1 className="text-[14px] font-semibold text-gray-800 tracking-[-0.35px] leading-5"
        style={{ fontFamily: "'Inter', sans-serif" }}>
        My Profile
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="w-full bg-white border border-gray-100 rounded-xl p-6 flex flex-col gap-6">

          {/* ── Avatar upload ── */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full border-2 border-emerald-400 flex items-center justify-center flex-shrink-0 overflow-hidden bg-rose-50">
              {photoPreview
                ? <img src={photoPreview} alt="avatar" className="w-full h-full object-cover" />
                : <User size={30} strokeWidth={1.5} className="text-gray-300" />
              }
              {/* Camera overlay */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                aria-label="Change photo"
              >
                {photoLoading
                  ? <Loader2 size={18} className="text-white animate-spin" />
                  : <Camera size={18} className="text-white" />
                }
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
                {dbUser?.displayName || 'Your Name'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                {email}
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer transition-colors"
              >
                {photoFile ? '✓ Photo selected' : 'Change photo'}
              </button>
              <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                JPG, PNG · max 2 MB
              </p>
            </div>
          </div>

          {/* ── Form grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>First Name *</label>
              <input name="firstName" value={form.firstName} onChange={handleChange}
                placeholder="First name" className={inputCls} required style={{ fontFamily: "'Inter', sans-serif" }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange}
                placeholder="Last name" className={inputCls} style={{ fontFamily: "'Inter', sans-serif" }} />
            </div>

            {/* Email — read only */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>Email Address</label>
              <input value={email} readOnly
                className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
                style={{ fontFamily: "'Inter', sans-serif" }} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="+880 1XXX-XXXXXX" type="tel" className={inputCls} style={{ fontFamily: "'Inter', sans-serif" }} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className={`${inputCls} bg-white cursor-pointer`} style={{ fontFamily: "'Inter', sans-serif" }}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>Date of Birth</label>
              <input name="dob" value={form.dob} onChange={handleChange}
                type="date" className={`${inputCls} cursor-pointer`} style={{ fontFamily: "'Inter', sans-serif" }} />
            </div>
          </div>

          {/* ── Save button ── */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 h-10 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : <><CheckCircle size={14} /> Save Changes</>
              }
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
