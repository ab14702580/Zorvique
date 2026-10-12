import { Store, Phone, Mail, Apple, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const socials = [
  { label: "f",  bg: "#1877F2", title: "Facebook" },
  { label: "in", bg: "#0A66C2", title: "LinkedIn" },
  { label: "ig", bg: "linear-gradient(45deg,#FBBF24 0%,#F43F5E 50%,#9333EA 100%)", title: "Instagram" },
  { label: "▶", bg: "#FF0000", title: "YouTube" },
  { label: "w",  bg: "#25D366", title: "WhatsApp" },
  { label: "𝕏",  bg: "#000000", title: "X (Twitter)" },
  { label: "✈",  bg: "#229ED9", title: "Telegram" },
  { label: "G+", bg: "#EA4335", title: "Google+" },
];

const shopLinks      = ["All Products", "Digital Products", "Top Rated Products", "Best Deals"];
const serviceLinks   = ["Help Center", "Easy Returns", "Shipping Policy", "Payment Methods", "FAQ", "Contact Us"];
const companyLinks   = ["About Us", "Blog", "Terms & Conditions", "Privacy Policy", "Return & Refund Policy", "Become a Seller"];

const payments = [
  { name: "stripe",      color: "#4F46E5", italic: true },
  { name: "PayPal",      color: "#2563EB" },
  { name: "Razorpay",    color: "#0284C7" },
  { name: "paystack",    color: "#0891B2" },
  { name: "aamarPay",    color: "#D97706" },
  { name: "bKash",       color: "#DB2777" },
  { name: "PayTabs",     color: "#3B82F6" },
  { name: "Flutterwave", color: "#F59E0B" },
  { name: "PayUbiz",     color: "#0E7490" },
  { name: "instamojo",   color: "#0D9488" },
  { name: "JazzCash",    color: "#DC2626" },
  { name: "|||",         color: "#EA580C" },
  { name: "upay",        color: "#7E22CE" },
  { name: "VISA/MC",     color: "#1D4ED8" },
];

function Dot() {
  return <span className="inline-block w-[7px] h-[7px] rounded-full bg-[#F43F5E] shrink-0 mt-[4.5px]" />;
}

function FooterLinkList({ title, links }) {
  const navigate = useNavigate();

  const handleClick = (link) => {
    if (link === 'Privacy Policy') navigate('/privacy-policy');
    else if (link === 'Contact Us') navigate('/contact');
    else if (link === 'About Us') navigate('/about');
    else if (link === 'Blog') navigate('/blog');
  };

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-[13px] md:text-[14px] font-bold text-[#1E293B] tracking-[-0.35px]">{title}</h4>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link}>
            <button
              type="button"
              onClick={() => handleClick(link)}
              className="flex items-start gap-1.5 text-[11px] md:text-[12px] text-[#475569] hover:text-[#F43F5E] transition-colors cursor-pointer text-left"
            >
              <Dot /><span className="leading-4">{link}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full" style={{ background: "#FDF2F4", borderTop: "1px solid rgba(255,228,230,0.8)" }}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-10 md:pt-12 pb-6 flex flex-col gap-8">

        {/* 5-column grid — stacks on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-8 md:gap-10">

          {/* Col 1: Brand — full width on mobile */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 w-fit cursor-pointer">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(45deg,#E11D48 0%,#F43F5E 100%)", boxShadow: "0px 4px 6px -1px rgba(244,63,94,0.2)" }}>
                <Store size={20} strokeWidth={2} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl md:text-2xl text-[#1E293B] leading-8"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}>Ready</span>
                <span className="text-[11px] font-semibold text-[#64748B] tracking-[0.3px]">eCommerce</span>
              </div>
            </Link>
            <p className="text-[11px] md:text-[12px] text-[#475569] leading-5 max-w-[280px]">
              The ultimate all-in-one solution for your eCommerce business worldwide.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#FFE4E6] flex items-center justify-center shrink-0">
                  <Phone size={13} strokeWidth={1.5} className="text-[#F43F5E]" />
                </div>
                <span className="text-[12px] text-[#475569]">+880123456789</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#FFE4E6] flex items-center justify-center shrink-0">
                  <Mail size={13} strokeWidth={1.5} className="text-[#F43F5E]" />
                </div>
                <span className="text-[12px] text-[#475569]">admin@example.com</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {socials.map((s) => (
                <button key={s.title} aria-label={s.title}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ background: s.bg }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Col 2: Shop */}
          <FooterLinkList title="Shop" links={shopLinks} />

          {/* Col 3: Customer Service */}
          <FooterLinkList title="Customer Service" links={serviceLinks} />

          {/* Col 4: Company */}
          <FooterLinkList title="Company" links={companyLinks} />

          {/* Col 5: Download App */}
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-3">
            <h4 className="text-[13px] md:text-[14px] font-bold text-[#1E293B] tracking-[-0.35px]">Download Our App</h4>
            <div className="flex flex-col gap-2.5">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                style={{ border: "1px solid #000" }}>
                <Apple size={18} strokeWidth={1.5} className="text-white shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[8px] text-[#CBD5E1] leading-none">Available on the</span>
                  <span className="text-[11px] md:text-[12px] font-semibold text-white leading-4">App Store</span>
                </div>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                style={{ border: "1px solid #000" }}>
                <Play size={18} strokeWidth={1.5} className="text-white shrink-0 fill-white" />
                <div className="flex flex-col">
                  <span className="text-[8px] text-[#CBD5E1] leading-none uppercase tracking-wide">GET IT ON</span>
                  <span className="text-[11px] md:text-[12px] font-semibold text-white leading-4">Google Play</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col gap-3 pt-6" style={{ borderTop: "1px solid rgba(254,205,211,0.6)" }}>
          <h5 className="text-[12px] font-bold text-[#1E293B]">Accepted Payment Methods</h5>
          <div className="flex flex-wrap items-center gap-2">
            {payments.map((p) => (
              <span key={p.name} className="px-2 py-[3px] rounded text-[10px] md:text-[11px] font-bold bg-white"
                style={{ border: "1px solid #E2E8F0", color: p.color, fontStyle: p.italic ? "italic" : "normal" }}>
                {p.name}
              </span>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="flex items-center justify-center pt-4" style={{ borderTop: "1px solid rgba(254,205,211,0.5)" }}>
          <p className="text-[11px] md:text-[12px] text-[#64748B] text-center">
            © {year} All right reserved by company
          </p>
        </div>
      </div>
    </footer>
  );
}
