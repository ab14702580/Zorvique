import { useState, useEffect } from 'react';
import {
  Paintbrush, Loader2, ImagePlus, Save, X,
  RefreshCw, Eye, Megaphone, Palette, Layout,
  Type, Image as ImageIcon, ChevronDown, ChevronUp,
  ExternalLink,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import SellerDashboardLayout from '../../Component/SellerDashboardLayout/SellerDashboardLayout';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';

const IMGBB_KEY = '97f73f7011f85454774ead4305c4d1fa';

const inputCls =
  'w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors bg-white';
const labelCls = 'text-xs font-semibold text-slate-600 mb-1.5 block';

// ─── Section card wrapper ─────────────────────────────────────────────────────
function Section({ icon: Icon, title, open, onToggle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon size={15} className="text-indigo-500 flex-shrink-0" />
          <p className="text-sm font-bold text-slate-700">{title}</p>
        </div>
        {open ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
      </button>
      {open && <div className="border-t border-slate-100 px-5 py-5">{children}</div>}
    </div>
  );
}

// ─── Image upload helper ──────────────────────────────────────────────────────
function ImageUpload({ label, value, fieldKey, uploading, onUpload, onChange }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex items-start gap-3 flex-wrap">
        {value && (
          <div className="relative flex-shrink-0">
            <img src={value} alt="preview"
              className="w-20 h-14 rounded-xl object-cover border border-slate-200" />
            <button type="button" onClick={() => onChange(fieldKey, '')}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600">
              <X size={10} />
            </button>
          </div>
        )}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <label className={`flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 
            text-xs font-semibold rounded-xl cursor-pointer transition-colors w-fit`}>
            {uploading === fieldKey
              ? <><Loader2 size={13} className="animate-spin" />Uploading…</>
              : <><ImagePlus size={13} />Upload Image</>
            }
            <input type="file" accept="image/*" className="hidden"
              onChange={e => onUpload(e.target.files?.[0], fieldKey)} disabled={!!uploading} />
          </label>
          <input value={value} onChange={e => onChange(fieldKey, e.target.value)}
            placeholder="or paste image URL here…"
            className="h-9 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors" />
        </div>
      </div>
    </div>
  );
}

const ACCENT_COLORS = [
  '#E11D48', '#6366F1', '#0EA5E9', '#10B981',
  '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6',
  '#F97316', '#64748B',
];

const LAYOUT_OPTIONS = [
  { value: 'grid-2', label: '2 Columns' },
  { value: 'grid-3', label: '3 Columns' },
  { value: 'grid-4', label: '4 Columns' },
  { value: 'list',   label: 'List View' },
];

export default function SellerDecoratePage() {
  const { currentUser } = useAuth();
  const navigate        = useNavigate();
  const email           = currentUser?.email || '';

  const [shop,     setShop]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [uploading,setUploading]= useState('');

  // Open/closed section state
  const [open, setOpen] = useState({
    branding: true, hero: true, announcement: false,
    colors: false, layout: false,
  });

  // Decoration form state
  const [form, setForm] = useState({
    // Branding
    name:           '',
    subText:        '',
    description:    '',
    img:            '',
    // Hero / Banner
    bannerImg:      '',
    bannerTitle:    '',
    bannerSubtitle: '',
    bannerBtnText:  '',
    bannerBtnLink:  '',
    // Announcement bar
    announcementText:    '',
    announcementBgColor: '#E11D48',
    showAnnouncement:    false,
    // Colors
    accentColor:    '#E11D48',
    bgColor:        '#F8FAFC',
    // Layout
    productLayout:  'grid-4',
  });

  const toggleSection = (key) =>
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  const setField = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Fetch store ───────────────────────────────────────────────────────────
  const fetchStore = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.get(`/seller/store?email=${encodeURIComponent(email)}`);
      if (res.data) {
        setShop(res.data);
        // Merge saved decor settings into form
        setForm(prev => ({
          ...prev,
          name:                res.data.name            || '',
          subText:             res.data.subText          || '',
          description:         res.data.description      || '',
          img:                 res.data.img               || '',
          bannerImg:           res.data.bannerImg         || '',
          bannerTitle:         res.data.bannerTitle       || '',
          bannerSubtitle:      res.data.bannerSubtitle    || '',
          bannerBtnText:       res.data.bannerBtnText     || '',
          bannerBtnLink:       res.data.bannerBtnLink     || '',
          announcementText:    res.data.announcementText  || '',
          announcementBgColor: res.data.announcementBgColor || '#E11D48',
          showAnnouncement:    res.data.showAnnouncement  || false,
          accentColor:         res.data.accentColor       || '#E11D48',
          bgColor:             res.data.bgColor           || '#F8FAFC',
          productLayout:       res.data.productLayout     || 'grid-4',
        }));
      }
    } catch { /* no store yet */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStore(); }, [email]);

  // ── Image upload ──────────────────────────────────────────────────────────
  const uploadImage = async (file, fieldKey) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'Image must be under 5MB', confirmButtonColor: '#6366f1' });
      return;
    }
    setUploading(fieldKey);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) setField(fieldKey, data.data.url);
    } catch {
      Swal.fire({ icon: 'error', title: 'Upload failed', confirmButtonColor: '#6366f1' });
    } finally { setUploading(''); }
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!shop?._id) {
      Swal.fire({ icon: 'info', title: 'No store found',
        text: 'Store is created once admin approves your seller application.',
        confirmButtonColor: '#6366f1' });
      return;
    }
    setSaving(true);
    try {
      await api.put(`/seller/store/${shop._id}`, {
        name:                form.name,
        subText:             form.subText,
        description:         form.description,
        img:                 form.img,
        bannerImg:           form.bannerImg,
        bannerTitle:         form.bannerTitle,
        bannerSubtitle:      form.bannerSubtitle,
        bannerBtnText:       form.bannerBtnText,
        bannerBtnLink:       form.bannerBtnLink,
        announcementText:    form.announcementText,
        announcementBgColor: form.announcementBgColor,
        showAnnouncement:    form.showAnnouncement,
        accentColor:         form.accentColor,
        bgColor:             form.bgColor,
        productLayout:       form.productLayout,
      });
      await fetchStore();
      Swal.fire({ icon: 'success', title: 'Store decoration saved!', timer: 1800, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Save failed', confirmButtonColor: '#6366f1' });
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <SellerDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </SellerDashboardLayout>
    );
  }

  if (!shop) {
    return (
      <SellerDashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
          <Paintbrush size={40} strokeWidth={1.2} />
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600">No Store Found</p>
            <p className="text-xs mt-1">Your store will be available once admin approves your seller application.</p>
          </div>
        </div>
      </SellerDashboardLayout>
    );
  }

  return (
    <SellerDashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Store Decoration</h1>
          <p className="text-sm text-slate-400 mt-0.5">Design your store's homepage and visual identity</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={fetchStore}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm cursor-pointer transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
          {shop._id && (
            <button type="button"
              onClick={() => navigate(`/shop/${shop._id}`)}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm cursor-pointer transition-colors">
              <Eye size={13} /> Preview Store
              <ExternalLink size={11} />
            </button>
          )}
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-5 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
            {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save All</>}
          </button>
        </div>
      </div>

      {/* Live mini preview bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        {/* Announcement preview */}
        {form.showAnnouncement && form.announcementText && (
          <div className="px-4 py-2 text-center text-xs font-semibold text-white"
            style={{ backgroundColor: form.announcementBgColor || '#E11D48' }}>
            📢 {form.announcementText}
          </div>
        )}
        {/* Banner preview */}
        <div className="relative h-40 overflow-hidden"
          style={{ backgroundColor: form.bgColor || '#F8FAFC' }}>
          {form.bannerImg && (
            <img src={form.bannerImg} alt="banner" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center px-8">
            <div className="flex flex-col gap-1">
              <p className="text-white font-bold text-lg leading-tight drop-shadow">
                {form.bannerTitle || form.name || 'Your Store Name'}
              </p>
              {form.bannerSubtitle && (
                <p className="text-white/80 text-xs drop-shadow">{form.bannerSubtitle}</p>
              )}
              {form.bannerBtnText && (
                <span className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-white rounded-lg w-fit"
                  style={{ backgroundColor: form.accentColor || '#E11D48' }}>
                  {form.bannerBtnText}
                </span>
              )}
            </div>
          </div>
          {/* Logo overlay */}
          <div className="absolute bottom-3 right-4">
            <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white/20 flex items-center justify-center">
              {form.img
                ? <img src={form.img} alt="logo" className="w-full h-full object-cover" />
                : <span className="text-white font-bold text-lg">{form.name?.[0] || '?'}</span>
              }
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Live Preview</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-600 font-semibold">Changes save instantly</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">

        {/* ── Branding ── */}
        <Section icon={Type} title="Branding & Identity" open={open.branding} onToggle={() => toggleSection('branding')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Store Name</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Tech Galaxy Store" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tagline</label>
              <input name="subText" value={form.subText} onChange={handleChange}
                placeholder="e.g. Best deals in electronics" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Store Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3} placeholder="Tell buyers about your store…"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors" />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload label="Store Logo" value={form.img} fieldKey="img"
                uploading={uploading} onUpload={uploadImage} onChange={setField} />
            </div>
          </div>
        </Section>

        {/* ── Hero Banner ── */}
        <Section icon={ImageIcon} title="Hero Banner" open={open.hero} onToggle={() => toggleSection('hero')}>
          <div className="flex flex-col gap-4">
            <ImageUpload label="Banner Image (recommended: 1400×400px)" value={form.bannerImg}
              fieldKey="bannerImg" uploading={uploading} onUpload={uploadImage} onChange={setField} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Banner Headline</label>
                <input name="bannerTitle" value={form.bannerTitle} onChange={handleChange}
                  placeholder="e.g. New Season Arrivals" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Banner Subtitle</label>
                <input name="bannerSubtitle" value={form.bannerSubtitle} onChange={handleChange}
                  placeholder="e.g. Up to 50% off this week only" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Button Text</label>
                <input name="bannerBtnText" value={form.bannerBtnText} onChange={handleChange}
                  placeholder="e.g. Shop Now" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Button Link</label>
                <input name="bannerBtnLink" value={form.bannerBtnLink} onChange={handleChange}
                  placeholder="e.g. /products" className={inputCls} />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Announcement Bar ── */}
        <Section icon={Megaphone} title="Announcement Bar" open={open.announcement} onToggle={() => toggleSection('announcement')}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <button type="button"
                onClick={() => setField('showAnnouncement', !form.showAnnouncement)}
                className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
                  form.showAnnouncement ? 'bg-indigo-600' : 'bg-slate-200'
                }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                  form.showAnnouncement ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
              <span className="text-sm font-medium text-slate-700">
                {form.showAnnouncement ? 'Announcement bar visible' : 'Announcement bar hidden'}
              </span>
            </div>
            <div>
              <label className={labelCls}>Announcement Text</label>
              <input name="announcementText" value={form.announcementText} onChange={handleChange}
                placeholder="e.g. Free shipping on orders over $50!" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Bar Background Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.announcementBgColor}
                  onChange={e => setField('announcementBgColor', e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer" />
                <input value={form.announcementBgColor}
                  onChange={e => setField('announcementBgColor', e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Color Theme ── */}
        <Section icon={Palette} title="Color Theme" open={open.colors} onToggle={() => toggleSection('colors')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Accent / Button Color</label>
              <div className="flex items-center gap-3 mb-3">
                <input type="color" value={form.accentColor}
                  onChange={e => setField('accentColor', e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer" />
                <input value={form.accentColor}
                  onChange={e => setField('accentColor', e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map(c => (
                  <button key={c} type="button"
                    onClick={() => setField('accentColor', c)}
                    className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${
                      form.accentColor === c ? 'border-slate-700 scale-110' : 'border-white shadow'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Page Background Color</label>
              <div className="flex items-center gap-3 mb-3">
                <input type="color" value={form.bgColor}
                  onChange={e => setField('bgColor', e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer" />
                <input value={form.bgColor}
                  onChange={e => setField('bgColor', e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div className="flex flex-wrap gap-2">
                {['#F8FAFC','#FFFFFF','#FFF1F2','#EFF6FF','#F0FDF4','#FEFCE8','#F5F3FF'].map(c => (
                  <button key={c} type="button"
                    onClick={() => setField('bgColor', c)}
                    className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${
                      form.bgColor === c ? 'border-slate-500 scale-110' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Product Layout ── */}
        <Section icon={Layout} title="Product Grid Layout" open={open.layout} onToggle={() => toggleSection('layout')}>
          <div className="flex flex-wrap gap-3">
            {LAYOUT_OPTIONS.map(opt => (
              <button key={opt.value} type="button"
                onClick={() => setField('productLayout', opt.value)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border-2 ${
                  form.productLayout === opt.value
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </Section>

      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 mt-6 flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-8 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 transition-all cursor-pointer">
          {saving ? <><Loader2 size={16} className="animate-spin" />Saving…</> : <><Save size={16} />Save Decoration</>}
        </button>
      </div>
    </SellerDashboardLayout>
  );
}
