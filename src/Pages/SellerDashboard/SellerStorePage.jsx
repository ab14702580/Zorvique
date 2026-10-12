import { useState, useEffect } from 'react';
import {
  Store, Loader2, ImagePlus, Save, X,
  RefreshCw, PlusCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import SellerDashboardLayout from '../../Component/SellerDashboardLayout/SellerDashboardLayout';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';

const IMGBB_KEY = '97f73f7011f85454774ead4305c4d1fa';

const inputCls  = 'w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors bg-white';
const labelCls  = 'text-xs font-semibold text-slate-600 mb-1.5 block';

const EMPTY_FORM = {
  name: '', subText: '', description: '',
  img: '', bannerImg: '', category: '',
  phone: '', address: '', website: '',
};

export default function SellerStorePage() {
  const { currentUser, dbUser } = useAuth();
  const email = currentUser?.email || '';

  const [shop,         setShop]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [creating,     setCreating]     = useState(false);
  const [uploadingImg, setUploadingImg] = useState(''); // 'logo' | 'bannerImg' | ''
  const [form,         setForm]         = useState(EMPTY_FORM);

  /* ── Fetch the seller's store ─────────────────────────────────────────────── */
  const fetchStore = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.get(`/seller/store?email=${encodeURIComponent(email)}`);
      if (res.data) {
        setShop(res.data);
        setForm({
          name:        res.data.name        || '',
          subText:     res.data.subText     || '',
          description: res.data.description || '',
          img:         res.data.img         || '',
          bannerImg:   res.data.bannerImg   || '',
          category:    res.data.category    || '',
          phone:       res.data.phone       || '',
          address:     res.data.address     || '',
          website:     res.data.website     || '',
        });
      } else {
        setShop(null);
        // Pre-fill from seller application info if available
        setForm({
          ...EMPTY_FORM,
          name: dbUser?.sellerInfo?.shopName || '',
          category: dbUser?.sellerInfo?.businessType || '',
          phone: dbUser?.sellerInfo?.phone || '',
        });
      }
    } catch {
      setShop(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStore(); }, [email]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  /* ── Image upload ─────────────────────────────────────────────────────────── */
  const uploadImage = async (file, field) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'Image must be under 5MB', confirmButtonColor: '#6366f1' });
      return;
    }
    setUploadingImg(field);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res  = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) setForm(p => ({ ...p, [field]: data.data.url }));
    } catch {
      Swal.fire({ icon: 'error', title: 'Upload failed', confirmButtonColor: '#6366f1' });
    } finally {
      setUploadingImg('');
    }
  };

  /* ── Create store (self-service) ──────────────────────────────────────────── */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Store name is required', confirmButtonColor: '#6366f1' });
      return;
    }
    setCreating(true);
    try {
      const res = await api.post('/seller/store', {
        ...form,
        ownerEmail: email,
        email,
        rating:    0,
        reviews:   0,
        products:  0,
        status:    'active',
      });
      Swal.fire({ icon: 'success', title: 'Store created!', text: 'Your store is now live in the shop list.', timer: 2000, showConfirmButton: false });
      await fetchStore();
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to create store', confirmButtonColor: '#6366f1' });
    } finally {
      setCreating(false);
    }
  };

  /* ── Save existing store ──────────────────────────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!shop?._id) return;
    setSaving(true);
    try {
      await api.put(`/seller/store/${shop._id}`, form);

      // Sync product count on the shop document
      try { await api.put(`/seller/store/${shop._id}/sync-products`); } catch { /* non-critical */ }

      Swal.fire({ icon: 'success', title: 'Store updated!', timer: 1800, showConfirmButton: false });
      await fetchStore();
    } catch {
      Swal.fire({ icon: 'error', title: 'Save failed', confirmButtonColor: '#6366f1' });
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading state ────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <SellerDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </SellerDashboardLayout>
    );
  }

  /* ── No store yet — show create form ────────────────────────────────────── */
  if (!shop) {
    return (
      <SellerDashboardLayout>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Store Profile</h1>
            <p className="text-sm text-slate-400 mt-0.5">Create your store to appear in the shop list</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="mb-6 flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
          <Store size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-800">No store found</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              You can create your store directly here. It will automatically appear in the public shop list once created.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-6">
          {/* Banner preview */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="relative h-36 bg-gradient-to-br from-indigo-100 to-indigo-50 overflow-hidden">
              {form.bannerImg && (
                <img src={form.bannerImg} alt="banner" className="w-full h-full object-cover" />
              )}
              <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
                {uploadingImg === 'bannerImg'
                  ? <Loader2 size={22} className="text-white animate-spin" />
                  : <><ImagePlus size={20} className="text-white" /><span className="text-xs font-semibold text-white">Add Banner</span></>
                }
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => uploadImage(e.target.files?.[0], 'bannerImg')} disabled={!!uploadingImg} />
              </label>
              {form.bannerImg && (
                <button type="button" onClick={() => setForm(p => ({ ...p, bannerImg: '' }))}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600">
                  <X size={11} />
                </button>
              )}
            </div>
            <div className="flex items-end gap-4 px-6 pb-4 -mt-8">
              <div className="relative w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-indigo-100 flex-shrink-0">
                {form.img
                  ? <img src={form.img} alt="logo" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <Store size={22} className="text-indigo-400" />
                    </div>
                }
                <label className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer opacity-0 hover:opacity-100">
                  {uploadingImg === 'img'
                    ? <Loader2 size={14} className="text-white animate-spin" />
                    : <ImagePlus size={14} className="text-white" />
                  }
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => uploadImage(e.target.files?.[0], 'img')} disabled={!!uploadingImg} />
                </label>
              </div>
              <div className="pb-1">
                <p className="text-base font-bold text-slate-800">{form.name || 'Your Store Name'}</p>
                <p className="text-xs text-slate-400">{form.subText || 'Store tagline'}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-sm font-bold text-slate-700 mb-5">Store Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Store Name *</label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. Tech Galaxy Store" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Tagline / Subtext</label>
                <input name="subText" value={form.subText} onChange={handleChange}
                  placeholder="e.g. Best electronics at great prices" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <input name="category" value={form.category} onChange={handleChange}
                  placeholder="e.g. Electronics" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  placeholder="+880 1XXX-XXXXXX" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Website / Social</label>
                <input name="website" value={form.website} onChange={handleChange}
                  placeholder="https://yourstore.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <input name="address" value={form.address} onChange={handleChange}
                  placeholder="City, District" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Store Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  rows={3} placeholder="Tell buyers what your store is about…"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors" />
              </div>
              <div>
                <label className={labelCls}>Logo URL (or upload above)</label>
                <input name="img" value={form.img} onChange={handleChange}
                  placeholder="https://…" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Banner URL (or upload above)</label>
                <input name="bannerImg" value={form.bannerImg} onChange={handleChange}
                  placeholder="https://…" className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button type="submit" disabled={creating}
                className="flex items-center gap-2 px-6 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                {creating
                  ? <><Loader2 size={14} className="animate-spin" />Creating…</>
                  : <><PlusCircle size={14} />Create Store</>
                }
              </button>
            </div>
          </div>
        </form>
      </SellerDashboardLayout>
    );
  }

  /* ── Store exists — edit form ─────────────────────────────────────────────── */
  return (
    <SellerDashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Store Profile</h1>
          <p className="text-sm text-slate-400 mt-0.5">Customize how your store appears to buyers</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Live badge */}
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live in Shop List
          </span>
          <button type="button" onClick={fetchStore}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm cursor-pointer">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">

        {/* Banner preview */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="relative h-36 bg-gradient-to-br from-indigo-100 to-indigo-50 overflow-hidden">
            {form.bannerImg && (
              <img src={form.bannerImg} alt="banner" className="w-full h-full object-cover" />
            )}
            <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
              {uploadingImg === 'bannerImg'
                ? <Loader2 size={22} className="text-white animate-spin" />
                : <><ImagePlus size={20} className="text-white" /><span className="text-xs font-semibold text-white">Change Banner</span></>
              }
              <input type="file" accept="image/*" className="hidden"
                onChange={e => uploadImage(e.target.files?.[0], 'bannerImg')} disabled={!!uploadingImg} />
            </label>
            {form.bannerImg && (
              <button type="button" onClick={() => setForm(p => ({ ...p, bannerImg: '' }))}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600">
                <X size={11} />
              </button>
            )}
          </div>

          {/* Logo + name preview */}
          <div className="flex items-end gap-4 px-6 pb-4 -mt-8">
            <div className="relative w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-indigo-100 flex-shrink-0">
              {form.img
                ? <img src={form.img} alt="logo" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <Store size={22} className="text-indigo-400" />
                  </div>
              }
              <label className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer opacity-0 hover:opacity-100">
                {uploadingImg === 'img'
                  ? <Loader2 size={14} className="text-white animate-spin" />
                  : <ImagePlus size={14} className="text-white" />
                }
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => uploadImage(e.target.files?.[0], 'img')} disabled={!!uploadingImg} />
              </label>
            </div>
            <div className="pb-1">
              <p className="text-base font-bold text-slate-800">{form.name || 'Your Store Name'}</p>
              <p className="text-xs text-slate-400">{form.subText || 'Store tagline'}</p>
            </div>
          </div>
        </div>

        {/* Store details form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-sm font-bold text-slate-700 mb-5">Store Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className={labelCls}>Store Name</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Tech Galaxy Store" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Tagline / Subtext</label>
              <input name="subText" value={form.subText} onChange={handleChange}
                placeholder="e.g. Best electronics at great prices" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Category</label>
              <input name="category" value={form.category} onChange={handleChange}
                placeholder="e.g. Electronics" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="+880 1XXX-XXXXXX" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Website / Social</label>
              <input name="website" value={form.website} onChange={handleChange}
                placeholder="https://yourstore.com" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Address</label>
              <input name="address" value={form.address} onChange={handleChange}
                placeholder="City, District" className={inputCls} />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Store Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3} placeholder="Tell buyers what your store is about…"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors" />
            </div>

            <div>
              <label className={labelCls}>Logo URL (or upload above)</label>
              <input name="img" value={form.img} onChange={handleChange}
                placeholder="https://…" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Banner URL (or upload above)</label>
              <input name="bannerImg" value={form.bannerImg} onChange={handleChange}
                placeholder="https://…" className={inputCls} />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
              {saving
                ? <><Loader2 size={14} className="animate-spin" />Saving…</>
                : <><Save size={14} />Save Changes</>
              }
            </button>
          </div>
        </div>
      </form>
    </SellerDashboardLayout>
  );
}
