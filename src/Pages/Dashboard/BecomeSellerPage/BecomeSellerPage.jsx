import { useState, useEffect } from 'react';
import {
  Store,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  User,
} from 'lucide-react';
import Swal from 'sweetalert2';
import DashboardLayout from '../../../Component/DashboardLayout/DashboardLayout';
import { useAuth } from '../../../context/useAuth';
import api from '../../../api/axios';

const inputCls =
  'w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 ' +
  'focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors';

const textareaCls =
  'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 resize-none ' +
  'focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors';

// ── Status banner config ──────────────────────────────────────────────────────
const STATUS_CFG = {
  pending: {
    icon: Clock,
    bg: 'bg-amber-50 border-amber-200',
    iconCls: 'text-amber-500',
    title: 'Application Under Review',
    desc: "Your seller application has been submitted and is currently under review by our team. We'll notify you once a decision is made.",
    badge: 'text-amber-700 bg-amber-100 border-amber-200',
    label: 'Pending Review',
  },
  approved: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 border-emerald-200',
    iconCls: 'text-emerald-500',
    title: "Congratulations! You're a Seller",
    desc: 'Your seller application has been approved. You can now access the Seller Dashboard and start listing your products.',
    badge: 'text-emerald-700 bg-emerald-100 border-emerald-200',
    label: 'Approved',
  },
  rejected: {
    icon: XCircle,
    bg: 'bg-red-50 border-red-200',
    iconCls: 'text-red-500',
    title: 'Application Rejected',
    desc: 'Unfortunately your seller application was not approved at this time.',
    badge: 'text-red-700 bg-red-100 border-red-200',
    label: 'Rejected',
  },
};

// ── Form field config ─────────────────────────────────────────────────────────
const INITIAL_FORM = {
  shopName: '',
  phone: '',
  nidOrPassport: '',
  businessType: '',
  shopCategory: '',
  address: '',
  city: '',
  postCode: '',
  website: '',
  description: '',
};

const BUSINESS_TYPES = [
  'Individual / Freelancer',
  'Small Business',
  'Medium Enterprise',
  'Large Enterprise',
  'Manufacturer',
  'Wholesaler',
  'Retailer',
  'Importer / Exporter',
];

const SHOP_CATEGORIES = [
  'Electronics',
  'Fashion & Clothing',
  'Health & Beauty',
  'Home & Living',
  'Sports & Outdoors',
  'Books & Stationery',
  'Food & Grocery',
  'Toys & Kids',
  'Automotive',
  'Agriculture',
  'Handicrafts',
  'Other',
];

export default function BecomeSellerPage() {
  const { currentUser, dbUser, fetchDbUser } = useAuth();
  const email = currentUser?.email || '';

  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected'
  const [rejectReason, setRejectReason] = useState('');

  // ── Derive status from dbUser ─────────────────────────────────────────────
  useEffect(() => {
    if (dbUser?.sellerRequest) {
      setRequestStatus(dbUser.sellerRequest);
      setRejectReason(dbUser.sellerRejectReason || '');
    } else if (dbUser?.role === 'seller') {
      setRequestStatus('approved');
    } else {
      setRequestStatus(null);
    }
  }, [dbUser]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.shopName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Shop name is required', confirmButtonColor: '#e11d48' });
      return;
    }
    if (!form.phone.trim()) {
      Swal.fire({ icon: 'warning', title: 'Phone number is required', confirmButtonColor: '#e11d48' });
      return;
    }
    if (!form.businessType) {
      Swal.fire({ icon: 'warning', title: 'Please select a business type', confirmButtonColor: '#e11d48' });
      return;
    }
    if (!form.description.trim()) {
      Swal.fire({ icon: 'warning', title: 'Business description is required', confirmButtonColor: '#e11d48' });
      return;
    }

    setSubmitting(true);
    try {
      // Save extra seller info + set sellerRequest: 'pending'
      await api.put(`/users/${encodeURIComponent(email)}/request-seller`, {
        sellerInfo: {
          shopName:      form.shopName.trim(),
          phone:         form.phone.trim(),
          nidOrPassport: form.nidOrPassport.trim(),
          businessType:  form.businessType,
          shopCategory:  form.shopCategory,
          address:       form.address.trim(),
          city:          form.city.trim(),
          postCode:      form.postCode.trim(),
          website:       form.website.trim(),
          description:   form.description.trim(),
        },
      });

      await fetchDbUser(email);
      setRequestStatus('pending');

      Swal.fire({
        icon: 'success',
        title: 'Application Submitted!',
        text: 'We will review your application and get back to you shortly.',
        timer: 2500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Something went wrong. Please try again.',
        confirmButtonColor: '#e11d48',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── If request already exists, show status banner ─────────────────────────
  if (requestStatus) {
    const cfg = STATUS_CFG[requestStatus] || STATUS_CFG.pending;
    const Icon = cfg.icon;

    return (
      <DashboardLayout activeId="become-seller">
        {/* Page title */}
        <h1
          className="text-[14px] font-semibold text-gray-800 tracking-[-0.35px] leading-5"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Become a Seller
        </h1>

        {/* Status card */}
        <div className={`rounded-xl border p-6 flex flex-col gap-4 ${cfg.bg}`}>
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex-shrink-0">
              <Icon size={32} strokeWidth={1.5} className={cfg.iconCls} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p
                  className="text-sm font-semibold text-gray-800"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {cfg.title}
                </p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}
                >
                  {cfg.label}
                </span>
              </div>
              <p
                className="text-xs text-gray-600 leading-5 max-w-xl"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {cfg.desc}
              </p>
              {requestStatus === 'rejected' && rejectReason && (
                <div className="mt-2 p-3 bg-white border border-red-200 rounded-lg">
                  <p
                    className="text-[11px] font-semibold text-red-600 mb-0.5"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Reason:
                  </p>
                  <p
                    className="text-xs text-red-700"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {rejectReason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Re-apply button for rejected */}
          {requestStatus === 'rejected' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setRequestStatus(null)}
                className="flex items-center gap-1.5 px-4 h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Re-apply
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Submitted info summary */}
        {dbUser?.sellerInfo && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Submitted Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Shop Name',     value: dbUser.sellerInfo.shopName },
                { label: 'Phone',         value: dbUser.sellerInfo.phone },
                { label: 'Business Type', value: dbUser.sellerInfo.businessType },
                { label: 'Category',      value: dbUser.sellerInfo.shopCategory },
                { label: 'City',          value: dbUser.sellerInfo.city },
                { label: 'Website',       value: dbUser.sellerInfo.website },
              ]
                .filter((f) => f.value)
                .map((f) => (
                  <div key={f.label}>
                    <p
                      className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {f.label}
                    </p>
                    <p
                      className="text-xs font-medium text-gray-700 mt-0.5"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {f.value}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }

  // ── Application form ──────────────────────────────────────────────────────
  return (
    <DashboardLayout activeId="become-seller">

      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1
          className="text-[14px] font-semibold text-gray-800 tracking-[-0.35px] leading-5"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Become a Seller
        </h1>
        <p
          className="text-[12px] text-gray-500"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Fill in your business details below to apply for a seller account. Our team will review your request within 2–3 business days.
        </p>
      </div>

      {/* Perks banner */}
      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-wrap gap-4">
        {[
          { icon: Store,     text: 'Your own seller storefront' },
          { icon: Briefcase, text: 'Sell unlimited products' },
          { icon: ChevronRight, text: 'Fast payouts & analytics' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2">
            <Icon size={14} className="text-rose-500 flex-shrink-0" />
            <span
              className="text-[11px] font-medium text-rose-700"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {text}
            </span>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* ── Section: Personal / Contact ── */}
        <SectionCard icon={User} title="Personal & Contact Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input
                name="fullName"
                value={dbUser?.displayName || currentUser?.displayName || ''}
                disabled
                className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </Field>
            <Field label="Email Address" required>
              <input
                name="email"
                value={email}
                disabled
                className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </Field>
            <Field label="Phone Number" required>
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+880 1XXX-XXXXXX"
                  className={`${inputCls} pl-8`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  required
                />
              </div>
            </Field>
            <Field label="NID / Passport Number">
              <input
                name="nidOrPassport"
                value={form.nidOrPassport}
                onChange={handleChange}
                placeholder="National ID or Passport"
                className={inputCls}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ── Section: Shop Info ── */}
        <SectionCard icon={Store} title="Shop Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Shop / Business Name" required>
              <input
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                placeholder="e.g. Tech Galaxy Store"
                className={inputCls}
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              />
            </Field>
            <Field label="Business Type" required>
              <select
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
                className={`${inputCls} bg-white cursor-pointer`}
                style={{ fontFamily: "'Inter', sans-serif" }}
                required
              >
                <option value="">Select type</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Primary Shop Category">
              <select
                name="shopCategory"
                value={form.shopCategory}
                onChange={handleChange}
                className={`${inputCls} bg-white cursor-pointer`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <option value="">Select category</option>
                {SHOP_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Website / Social Link">
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://yourstore.com"
                className={inputCls}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ── Section: Address ── */}
        <SectionCard icon={MapPin} title="Business Address">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Address" className="sm:col-span-2">
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street, area, district"
                className={inputCls}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </Field>
            <Field label="City / Town">
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Dhaka"
                className={inputCls}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </Field>
            <Field label="Post Code">
              <input
                name="postCode"
                value={form.postCode}
                onChange={handleChange}
                placeholder="e.g. 1207"
                className={inputCls}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ── Section: About Business ── */}
        <SectionCard icon={FileText} title="About Your Business">
          <Field label="Business Description" required>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us what you sell, your experience, why you want to join as a seller…"
              className={textareaCls}
              style={{ fontFamily: "'Inter', sans-serif" }}
              required
            />
          </Field>
        </SectionCard>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 h-10 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Store size={14} />
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
        <Icon size={14} strokeWidth={1.5} className="text-rose-500 flex-shrink-0" />
        <p
          className="text-[12px] font-semibold text-gray-700"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        className="text-xs font-medium text-gray-600"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
