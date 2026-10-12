import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Loader2, X, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import DashboardLayout from '../../../Component/DashboardLayout/DashboardLayout';
import { useAuth } from '../../../context/useAuth';
import api from '../../../api/axios';

const inputCls =
  'h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 ' +
  'focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors';

const EMPTY_FORM = { label: '', address: '', city: '', zip: '', country: 'Bangladesh', isDefault: false };

export default function ManageAddressPage() {
  const { currentUser } = useAuth();
  const email = currentUser?.email || '';

  const [addresses,  setAddresses]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAddresses = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.get(`/addresses?email=${encodeURIComponent(email)}`);
      setAddresses(res.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to load addresses', confirmButtonColor: '#e11d48' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, [email]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.address.trim()) return;
    setSaving(true);
    try {
      await api.post('/addresses', { ...form, email });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchAddresses();
      Swal.fire({ icon: 'success', title: 'Address saved!', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to save address', confirmButtonColor: '#e11d48' });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Remove this address?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Remove',
    });
    if (!result.isConfirmed) return;
    setDeleting(id);
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a._id !== id));
    } catch {
      Swal.fire({ icon: 'error', title: 'Delete failed', confirmButtonColor: '#e11d48' });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <DashboardLayout activeId="address">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[14px] font-semibold text-gray-800 tracking-[-0.35px]"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          Manage Address
        </h1>
        <button
          type="button"
          onClick={() => { setForm(EMPTY_FORM); setShowForm(v => !v); }}
          className="flex items-center gap-1.5 px-4 h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Cancel' : 'Add New Address'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
            New Address
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Label (Home / Work)', name: 'label',   placeholder: 'e.g. Home' },
              { label: 'Full Address *',       name: 'address', placeholder: '123 Street, Apt 4' },
              { label: 'City',                 name: 'city',    placeholder: 'Dhaka' },
              { label: 'ZIP / Postal Code',    name: 'zip',     placeholder: '1207' },
              { label: 'Country',              name: 'country', placeholder: 'Bangladesh' },
            ].map(f => (
              <div key={f.name} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>{f.label}</label>
                <input name={f.name} value={form[f.name]} onChange={handleChange}
                  placeholder={f.placeholder}
                  className={inputCls} style={{ fontFamily: "'Inter', sans-serif" }}
                  required={f.name === 'address'} />
              </div>
            ))}
          </div>

          {/* Default checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange}
              className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer" />
            <span className="text-xs text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>Set as default address</span>
          </label>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 h-9 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 h-9 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : 'Save Address'}
            </button>
          </div>
        </form>
      )}

      {/* Address list */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 size={22} className="animate-spin text-rose-400" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="w-full bg-white border border-gray-100 rounded-xl flex items-center px-8 py-14 min-h-[140px]">
          <div className="flex items-center gap-3">
            <MapPin size={20} strokeWidth={1.5} className="text-gray-300" />
            <span className="text-[12px] font-medium text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
              No addresses added yet
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map(addr => (
            <div key={addr._id} className="bg-white border border-gray-100 rounded-xl p-5 flex items-start justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <MapPin size={18} strokeWidth={1.5} className="text-rose-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {addr.label && (
                      <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        {addr.label}
                      </span>
                    )}
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Star size={9} fill="currentColor" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {addr.address}
                    {addr.city    ? `, ${addr.city}`    : ''}
                    {addr.zip     ? ` ${addr.zip}`      : ''}
                    {addr.country ? `, ${addr.country}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(addr._id)}
                disabled={deleting === addr._id}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0 cursor-pointer disabled:opacity-40"
              >
                {deleting === addr._id
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Trash2 size={15} strokeWidth={1.5} />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
