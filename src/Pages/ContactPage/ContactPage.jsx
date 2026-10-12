import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Mail, Phone, MessageSquare, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "../../context/useAuth";
import api from "../../api/axios";

/* ─────────────────────────────────────────────
   Social icon buttons
───────────────────────────────────────────── */
const SOCIALS = [
  {
    label: "Facebook",
    bg: "#1877F2",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
        <path d="M9 2.33H7.67C7.1 2.33 7 2.6 7 3v1H9L8.73 6H7V12H4.67V6H3V4h1.67V2.9C4.67 1.27 5.63.33 7.1.33 7.8.33 8.6.4 9 .47V2.33z" fill="white"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    bg: "#0A66C2",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
        <path d="M1.5 4.5H3.5V12.5H1.5V4.5ZM2.5 3.5C1.95 3.5 1.5 3.05 1.5 2.5C1.5 1.95 1.95 1.5 2.5 1.5C3.05 1.5 3.5 1.95 3.5 2.5C3.5 3.05 3.05 3.5 2.5 3.5ZM5 4.5H7V5.5C7.4 4.8 8.2 4.3 9.2 4.3C11 4.3 12 5.4 12 7.3V12.5H10V7.7C10 6.6 9.5 6 8.5 6C7.5 6 7 6.7 7 7.8V12.5H5V4.5Z" fill="white"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    bg: "linear-gradient(45deg,#F59E0B 0%,#F43F5E 50%,#9333EA 100%)",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
        <rect x="1" y="1" width="12" height="12" rx="3" stroke="white" strokeWidth="1.2" fill="none"/>
        <circle cx="7" cy="7" r="2.5" stroke="white" strokeWidth="1.2" fill="none"/>
        <circle cx="10.5" cy="3.5" r="0.75" fill="white"/>
      </svg>
    ),
  },
  {
    label: "Pinterest",
    bg: "#E60023",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
        <path d="M7 1C3.69 1 1 3.69 1 7c0 2.55 1.56 4.74 3.8 5.66-.05-.47-.1-1.19.02-1.7l.73-3.09s-.19-.37-.19-.92c0-.86.5-1.51 1.12-1.51.53 0 .79.4.79.87 0 .53-.34 1.33-.51 2.07-.15.62.3 1.12.9 1.12 1.07 0 1.79-1.37 1.79-3.01 0-1.24-.84-2.11-2.04-2.11-1.39 0-2.2 1.04-2.2 2.12 0 .42.16.87.36 1.11a.14.14 0 01.03.14l-.13.54c-.02.09-.07.11-.16.07C4.3 9.1 3.8 7.88 3.8 6.88c0-1.7 1.24-3.26 3.57-3.26 1.88 0 3.34 1.34 3.34 3.12 0 1.86-1.17 3.36-2.8 3.36-.55 0-1.06-.28-1.24-.62l-.34 1.26c-.12.47-.45 1.06-.67 1.41.5.16 1.04.24 1.6.24 3.31 0 6-2.69 6-6S10.31 1 7 1z" fill="white"/>
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    bg: "#25D366",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
        <path d="M7 1C3.69 1 1 3.69 1 7c0 1.07.27 2.08.75 2.95L1 13l3.14-.73A5.97 5.97 0 007 13c3.31 0 6-2.69 6-6S10.31 1 7 1zm2.97 8.19c-.13.36-.74.69-1.02.73-.28.04-.64.06-.97-.06-.21-.08-.49-.18-.84-.35-1.47-.72-2.43-2.21-2.5-2.32-.07-.1-.57-.76-.57-1.45s.36-1.03.49-1.17c.13-.14.28-.17.37-.17l.27.01c.09 0 .21-.03.33.25l.46 1.11c.04.09.02.19-.03.27l-.19.24c-.06.07-.12.15-.05.29.28.49.71.99 1.23 1.35.52.36 1.05.52 1.29.57.14.03.26-.01.34-.1l.28-.33c.08-.1.18-.12.28-.07l.87.41c.19.09.31.14.35.21.04.08 0 .41-.14.77z" fill="white"/>
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    bg: "#000000",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
        <path d="M10.94 1.5H12.8L8.85 6.03 13.5 12.5H9.88L7.1 8.8 3.93 12.5H2.07L6.28 7.65 1.5 1.5H5.22L7.74 4.9 10.94 1.5ZM10.3 11.4H11.26L4.74 2.47H3.71L10.3 11.4Z" fill="white"/>
      </svg>
    ),
  },
  {
    label: "Telegram",
    bg: "#229ED9",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
        <path d="M1.5 6.7L12.5 2.3C12.9 2.13 13.3 2.5 13.1 2.9L10.9 11.8C10.73 12.4 10.03 12.6 9.6 12.2L6.9 9.7L5.5 11.1C5.2 11.4 4.7 11.2 4.7 10.8L4.7 8.2L1.4 7.4C1 7.3 1 6.85 1.5 6.7Z" fill="white"/>
      </svg>
    ),
  },
  {
    label: "Gmail",
    bg: "#EA4335",
    icon: (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
        <path d="M1 3.5V10.5C1 11.05 1.45 11.5 2 11.5H3.5V6L7 8.5L10.5 6V11.5H12C12.55 11.5 13 11.05 13 10.5V3.5C13 3.5 11 5 7 7.5C3 5 1 3.5 1 3.5Z" fill="white"/>
        <path d="M1 3.5C1 2.95 1.45 2.5 2 2.5H12C12.55 2.5 13 2.95 13 3.5L7 7.5L1 3.5Z" fill="white"/>
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────────
   Contact channel item
───────────────────────────────────────────── */
function ContactChannel({ icon, title, primary, secondary }) {
  return (
    <div className="flex items-start gap-3.5">
      {/* Icon circle */}
      <div className="pt-0.5 shrink-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,228,230,0.6)" }}>
          <div className="text-[#E11D48]">{icon}</div>
        </div>
      </div>
      {/* Text */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[12px] font-bold text-[#1E293B] leading-4">{title}</span>
        {primary && (
          <span className="text-[12px] font-semibold text-[#475569] leading-4">{primary}</span>
        )}
        {secondary && (
          <span className="text-[11px] font-normal text-[#94A3B8] leading-4">{secondary}</span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Form field
───────────────────────────────────────────── */
function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-[#334155]">
        {label}{required && <span className="text-[#E11D48] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 text-[14px] text-[#1E293B] placeholder-[#94A3B8] bg-white border border-[#CBD5E1] rounded-lg outline-none focus:border-[#E11D48] transition-colors";

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function ContactPage() {
  const { currentUser, dbUser } = useAuth();
  const [form, setForm]       = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  // Pre-fill name + email if logged in
  useState(() => {
    if (dbUser || currentUser) {
      setForm(f => ({
        ...f,
        name:  dbUser?.displayName || currentUser?.displayName || "",
        email: dbUser?.email       || currentUser?.email       || "",
      }));
    }
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSending(true);
    try {
      await api.post('/contact-messages', {
        name:    form.name.trim(),
        email:   form.email.trim() || null,
        phone:   form.phone.trim() || null,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSent(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to send', text: 'Please try again.', confirmButtonColor: '#e11d48' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-16 py-8">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 mb-8" aria-label="Breadcrumb">
          <Link to="/" className="flex items-center gap-1 text-[12px] font-medium text-[#64748B] hover:text-[#E11D48] transition-colors cursor-pointer">
            <Home size={14} className="text-[#64748B]" />
            <span>Home</span>
          </Link>
          <span className="text-[12px] font-medium text-[#94A3B8]">›</span>
          <span className="text-[12px] font-semibold text-[#1E293B]">Contact Us</span>
        </nav>

        {/* ── Page header ── */}
        <div className="flex flex-col items-center gap-2 mb-10">
          <h1 className="text-[30px] font-extrabold text-[#0F172A] tracking-[-0.75px] text-center leading-9">
            Contact Us
          </h1>
          <p className="text-[14px] text-[#64748B] text-center leading-5 max-w-lg">
            We'd love to hear from you! Whether you have a question about our products, orders, or
            anything else, our team is here to help.
          </p>
          {/* Red accent line */}
          <div className="w-10 h-0.5 bg-[#E11D48] rounded-full mt-2" />
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT: Get In Touch ── */}
          <div
            className="w-full lg:w-[362px] shrink-0 flex flex-col gap-6 rounded-2xl p-7"
            style={{ background: "rgba(255,241,242,0.7)", border: "1px solid #FFE4E6" }}
          >
            {/* Title */}
            <div className="flex flex-col gap-0.5">
              <h2 className="text-[18px] font-bold text-[#0F172A] leading-7">Get In Touch</h2>
              <p className="text-[12px] text-[#64748B] leading-4">Choose the way that works best for you.</p>
            </div>

            {/* Channels */}
            <div className="flex flex-col gap-6">
              <ContactChannel
                icon={<Mail size={16} />}
                title="Email Us"
                primary="support@readyecommerce.com"
                secondary="We'll respond within 24 hours"
              />
              <ContactChannel
                icon={<Phone size={16} />}
                title="Call Us"
                primary="+8801700000000"
                secondary="Mon – Fri, 9:00 AM – 6:00 PM"
              />
              <ContactChannel
                icon={<MessageSquare size={16} />}
                title="Live Chat"
                primary="Chat with our support team"
                secondary="Available on website"
              />
              <ContactChannel
                icon={<MapPin size={16} />}
                title="Visit Us"
                primary="Dhaka, Bangladesh"
              />
            </div>

            {/* Follow Us */}
            <div
              className="flex flex-col gap-3 pt-8"
              style={{ borderTop: "1px solid rgba(254,205,211,0.5)" }}
            >
              <h4 className="text-[12px] font-bold text-[#1E293B]">Follow Us</h4>
              <div className="flex flex-wrap gap-2">
                {SOCIALS.map((s) => (
                  <button
                    key={s.label}
                    aria-label={s.label}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-85 transition-opacity shrink-0"
                    style={{ background: s.bg }}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Contact Form ── */}
          <div className="flex-1 min-w-0 bg-white border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-2xl p-8">
            {/* Title */}
            <div className="flex flex-col gap-0.5 mb-6">
              <h2 className="text-[18px] font-bold text-[#0F172A] leading-7">Send Us a Message</h2>
              <p className="text-[12px] text-[#64748B] leading-4">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Row: Full Name + Email */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Field label="Full Name" required>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                    className={inputCls}
                  />
                </Field>
                <Field label="Email Address">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com (optional)"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Row: Phone + Subject */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Field label="Phone Number">
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className={inputCls}
                  />
                </Field>
                <Field label="Subject" required>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Enter subject line"
                    required
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Message */}
              <Field label="Message" required>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message..."
                  required
                  rows={5}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {/* Success message */}
              {sent && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
                  <p className="text-sm text-emerald-700 font-medium">
                    Message sent! We'll get back to you soon.
                  </p>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#E11D48] text-white text-[12px] font-medium rounded-lg hover:bg-[#BE185D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{ boxShadow: "0px 1px 2px rgba(244,63,94,0.3)" }}
                >
                  {sending
                    ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
                    : <><Send size={14} /> Send Message</>
                  }
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
