import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight, Menu, AlignJustify, ArrowRight, X, Package,
} from "lucide-react";
import { useNavCategories } from "../../data/categories";

/* ─────────────────────────────────────────────
   Category sidebar — left panel list
───────────────────────────────────────────── */
function CategoryList({ categories, active, setActive }) {
  return (
    <div className="flex flex-col h-full">
      {categories.map((cat, idx) => (
        <button
          key={cat._id}
          onMouseEnter={() => setActive(idx)}
          className="flex items-center justify-between px-4 transition-colors text-left flex-1 min-h-0 cursor-pointer"
          style={{ background: idx === active ? "#FFF1F3" : "transparent" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* image থাকলে ছোট thumbnail, না থাকলে fallback icon */}
            {cat.image ? (
              <img
                src={cat.image}
                alt={cat.name}
                className="w-5 h-5 rounded object-cover shrink-0"
              />
            ) : (
              <Package size={14} className="shrink-0 text-[#94A3B8]" />
            )}
            <span
              className="text-[13px] font-medium leading-none truncate"
              style={{ color: idx === active ? "#F43F5E" : "#334155" }}
            >
              {cat.name}
            </span>
          </div>
          <ChevronRight
            size={14}
            strokeWidth={1.5}
            className="shrink-0 ml-1"
            style={{ color: idx === active ? "#F43F5E" : "#94A3B8" }}
          />
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Subcategory panel — right panel
───────────────────────────────────────────── */
function SubPanel({ cat, onClose }) {
  const children = cat.children || [];
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F5F9] shrink-0">
        <div
          className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{ background: "#FFF1F3" }}
        >
          {cat.image ? (
            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
          ) : (
            <Package size={18} className="text-[#E11D48]" />
          )}
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-[#0F172A]">{cat.name}</h3>
          <p className="text-[12px] text-[#64748B] leading-4">
            Explore premium {cat.name} products chosen for quality, value, and everyday convenience.
          </p>
        </div>
      </div>

      {/* Sub-grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 p-4 overflow-y-auto">
        {children.length > 0 ? children.map((sub) => (
          <Link
            key={sub._id}
            to={`/products?category=${encodeURIComponent(cat.name)}&sub=${encodeURIComponent(sub.name)}`}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] overflow-hidden flex items-center justify-center shrink-0 group-hover:bg-[#FFE4E6] transition-colors">
              {sub.image ? (
                <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
              ) : (
                <Package size={15} className="text-[#94A3B8] group-hover:text-[#E11D48] transition-colors" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#1E293B] leading-4 truncate group-hover:text-[#E11D48] transition-colors">
                {sub.name}
              </p>
            </div>
          </Link>
        )) : (
          <p className="text-[12px] text-[#94A3B8] col-span-2 py-4 text-center">
            No subcategories found
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Desktop sidebar
───────────────────────────────────────────── */
function DesktopCategorySidebar({ categories }) {
  const [active, setActive] = useState(null);

  return (
    <div className="flex h-full relative" onMouseLeave={() => setActive(null)}>
      <aside
        className="flex flex-col h-full rounded-xl overflow-hidden shrink-0"
        style={{ width: "230px", boxShadow: "0px 1px 2px rgba(0,0,0,0.05)", border: "1px solid #F1F5F9", zIndex: 2 }}
      >
        <div
          className="flex items-center gap-2.5 px-4 py-3 shrink-0"
          style={{ background: "#F43F5E" }}
        >
          <AlignJustify size={18} strokeWidth={2} className="text-white" />
          <span className="text-[13px] font-semibold tracking-[0.3px] text-white flex-1">
            All Categories
          </span>
        </div>
        <div className="flex-1 bg-white overflow-hidden">
          <CategoryList categories={categories} active={active} setActive={setActive} />
        </div>
      </aside>

      {active !== null && categories[active] && (
        <div
          className="absolute top-0 left-full bg-white overflow-hidden flex flex-col h-full"
          style={{
            width: "480px",
            boxShadow: "4px 4px 24px rgba(0,0,0,0.14)",
            border: "1px solid #F1F5F9",
            borderLeft: "none",
            borderRadius: "0 12px 12px 0",
            zIndex: 30,
          }}
        >
          <SubPanel cat={categories[active]} onClose={() => setActive(null)} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Mobile category drawer
───────────────────────────────────────────── */
function MobileCategoryDrawer({ open, onClose, categories }) {
  const [active, setActive] = useState(0);
  const [view, setView] = useState("list");

  useEffect(() => { if (open) { setActive(0); setView("list"); } }, [open]);

  if (!open) return null;

  const activeCat = categories[active];

  return (
    <div className="fixed inset-0 z-[80] flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white flex flex-col h-full shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 bg-[#F43F5E]">
          <div className="flex items-center gap-2">
            {view === "subs" && (
              <button onClick={() => setView("list")} className="text-white mr-1">
                <ChevronRight size={20} className="rotate-180" />
              </button>
            )}
            <AlignJustify size={18} className="text-white" />
            <span className="text-[14px] font-semibold text-white">
              {view === "list" ? "All Categories" : (activeCat ? activeCat.name : "")}
            </span>
          </div>
          <button onClick={onClose} className="text-white"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {view === "list" ? (
            <div className="flex flex-col py-2">
              {categories.map((cat, idx) => (
                <button
                  key={cat._id}
                  onClick={() => { setActive(idx); setView("subs"); }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#FFF1F3] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-6 h-6 rounded object-cover" />
                    ) : (
                      <Package size={16} className="text-[#94A3B8]" />
                    )}
                    <span className="text-[13px] font-medium text-[#334155]">{cat.name}</span>
                  </div>
                  <ChevronRight size={14} className="text-[#94A3B8]" />
                </button>
              ))}
            </div>
          ) : activeCat ? (
            <div className="flex flex-col py-2">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F1F5F9]">
                <div className="w-9 h-9 rounded-full bg-[#FFF1F3] overflow-hidden flex items-center justify-center">
                  {activeCat.image ? (
                    <img src={activeCat.image} alt={activeCat.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={16} className="text-[#E11D48]" />
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#0F172A]">{activeCat.name}</p>
                  <p className="text-[11px] text-[#64748B]">Select a subcategory</p>
                </div>
              </div>
              {(activeCat.children || []).map((sub) => (
                <Link
                  key={sub._id}
                  to={`/products?category=${encodeURIComponent(activeCat.name)}&sub=${encodeURIComponent(sub.name)}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#FFF1F3] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] overflow-hidden flex items-center justify-center shrink-0">
                    {sub.image ? (
                      <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={14} className="text-[#94A3B8]" />
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-[#1E293B]">{sub.name}</p>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Hero banner
───────────────────────────────────────────── */
function HeroBanner() {
  return (
    <div className="relative flex flex-col justify-between rounded-2xl overflow-hidden flex-1 p-5 md:p-8"
      style={{
        background: "linear-gradient(90deg, #D9F0F9 0%, #EDF7FC 50%, #E4F2F9 100%)",
        border: "1px solid #CFFAFE",
        minHeight: "280px",
      }}>
      <div className="absolute right-[-23px] bottom-[-24px] w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.4)", filter: "blur(20px)" }} />
      <div className="absolute right-[100px] top-[41px] w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "rgba(204,251,241,0.3)", filter: "blur(12px)" }} />

      <div className="relative flex items-start justify-between z-10 gap-4">
        <div className="flex flex-col gap-2 max-w-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 px-2 py-[1px] rounded-full text-[11px] font-semibold text-[#164E63]"
              style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(165,243,252,0.5)" }}>
              🌿 Natural Ingredients
            </span>
            <span className="hidden sm:flex items-center gap-1 px-2 py-[1px] rounded-full text-[11px] font-semibold text-[#164E63]"
              style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(165,243,252,0.5)" }}>
              ✓ Safe & Gentle
            </span>
          </div>
          <div className="flex flex-col gap-0.5 py-1">
            <span className="text-2xl md:text-[36px] font-bold italic leading-tight text-[#1E293B]" style={{ fontFamily: "Georgia, serif" }}>
              Natural
            </span>
            <span className="text-2xl md:text-[36px] font-extrabold leading-tight text-[#164E63]">Beauty Care</span>
            <span className="inline-flex items-center px-2 py-[2px] rounded text-[10px] font-bold tracking-[1.1px] uppercase text-[#155E75] w-fit mt-1"
              style={{ background: "rgba(207,250,254,0.8)" }}>New Product</span>
          </div>
          <p className="hidden sm:block text-xs text-[#475569] leading-5 max-w-[280px]">
            Discover the goodness of nature for healthy, radiant &amp; glowing skin.
          </p>
          <div className="hidden sm:flex flex-wrap gap-2 mt-1">
            {["🏆 Premium Quality", "✔ Paraben Free", "🧪 Dermatologically Tested"].map((t) => (
              <span key={t} className="flex items-center px-2 py-[3px] rounded-md text-[10px] font-medium text-[#083344]"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #CFFAFE" }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative hidden md:flex items-end justify-center w-[180px] lg:w-[210px] h-[180px] lg:h-[208px] shrink-0">
          <div className="absolute bottom-0 left-3 w-40 h-10 rounded-full"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(165,243,252,0.6)", boxShadow: "inset 0px 2px 4px 1px rgba(0,0,0,0.05)" }} />
          <div className="relative z-30 flex flex-col items-center w-10 h-[100px] mr-2">
            <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 w-4 h-5 rounded-t-full"
              style={{ background: "#CBD5E1", border: "1px solid #94A3B8" }} />
            <div className="w-11 h-[100px] rounded-lg flex flex-col items-center justify-center gap-2 p-1"
              style={{ background: "linear-gradient(0deg,#CFFAFE 0%,#FFFFFF 50%,#ECFEFF 100%)", border: "1px solid #A5F3FC", boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.1)" }}>
              <span className="text-[6px] font-bold uppercase text-[#155E75] text-center leading-[9px]">NATURAL SKIN</span>
              <div className="w-7 h-7 rounded-full" style={{ background: "rgba(236,254,255,0.8)" }} />
            </div>
          </div>
          <div className="relative z-40 flex flex-col items-center w-14 h-[130px]">
            <div className="absolute top-[-18px] left-1/2 -translate-x-1/2 w-4 h-6 rounded-t-lg"
              style={{ background: "#FBBF24" }} />
            <div className="w-14 h-[130px] rounded-xl flex flex-col items-center justify-center gap-1 px-1"
              style={{ background: "linear-gradient(180deg,#FFFFFF 0%,#ECFEFF 50%,#CFFAFE 100%)", border: "1px solid #A5F3FC", boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)" }}>
              <span className="text-[7px] font-extrabold uppercase text-[#164E63] text-center">NATURAL SKIN CARE</span>
              <div className="w-8 h-2 rounded-full" style={{ background: "rgba(165,243,252,0.5)" }} />
            </div>
          </div>
          <div className="relative z-50 flex flex-col items-center w-14 h-12 ml-1">
            <div className="absolute top-[-7px] left-0 w-14 h-[12px] rounded-t-md" style={{ background: "#164E63" }} />
            <div className="w-14 h-12 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(45deg,#CFFAFE 0%,#FFFFFF 100%)", border: "1px solid #A5F3FC" }}>
              <span className="text-[6px] font-bold uppercase text-[#164E63]">NATURAL CARE</span>
            </div>
          </div>
          <div className="absolute -top-4 right-0 z-50 w-16 h-16 rounded-full flex flex-col items-center justify-center gap-0.5"
            style={{ background: "#0D2A4A", border: "2px solid #FFFFFF", boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)", transform: "rotate(-6deg)" }}>
            <span className="text-[8px] font-semibold uppercase text-white">UP TO</span>
            <span className="text-[16px] font-extrabold leading-none text-[#67E8F9]">50%</span>
            <span className="text-[7px] text-[#E2E8F0]">OFF</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between pt-3 mt-3"
        style={{ borderTop: "1px solid rgba(165,243,252,0.4)" }}>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1.5 bg-[#F43F5E] rounded-full" />
          <span className="w-1.5 h-1.5 bg-[#CBD5E1] rounded-full" />
          <span className="w-1.5 h-1.5 bg-[#CBD5E1] rounded-full" />
        </div>
        <span className="flex items-center gap-1 px-2 py-[1px] rounded-full text-[10px] font-medium text-[#164E63]"
          style={{ background: "rgba(255,255,255,0.7)" }}>
          🚚 Fast &amp; Safe Delivery
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Right banners
───────────────────────────────────────────── */
function RightBanners() {
  return (
    <div className="flex flex-col gap-3 w-full sm:w-[240px] lg:w-[301px] shrink-0">
      <div className="flex items-center justify-between rounded-2xl flex-1 px-4 py-8 sm:py-12"
        style={{ background: "linear-gradient(90deg,#DFF2FA 0%,#EAF7FD 100%)", border: "1px solid #CFFAFE" }}>
        <div className="flex flex-col gap-1 max-w-[120px]">
          <span className="text-[16px] font-bold italic text-[#1E293B]" style={{ fontFamily: "Georgia, serif" }}>Natural</span>
          <span className="text-[16px] font-extrabold text-[#164E63]">Beauty Care</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.45px] text-[#155E75]">New Product</span>
          <p className="text-[9px] text-[#64748B] leading-[11px]">Radiant &amp; fresh herbal items.</p>
        </div>
        <div className="flex flex-col items-center gap-1 w-12">
          <div className="w-11 h-11 rounded-full flex flex-col items-center justify-center" style={{ background: "#164E63" }}>
            <span className="text-[6px] uppercase text-white">UP TO</span>
            <span className="text-[11px] font-bold text-[#67E8F9]">50%</span>
            <span className="text-[5px] text-white">OFF</span>
          </div>
          <div className="flex items-end gap-1">
            <div className="w-3 h-9 rounded-t" style={{ background: "#FFFFFF", border: "1px solid #A5F3FC" }} />
            <div className="w-4 h-11 rounded-t" style={{ background: "#CFFAFE", border: "1px solid #A5F3FC" }} />
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-between rounded-2xl overflow-hidden flex-1 px-4 py-6 sm:py-9"
        style={{ background: "linear-gradient(135deg,#FAFCF9 0%,#F2FAEE 50%,#E4F5DF 100%)", border: "1px solid #D1FAE5" }}>
        <span className="absolute right-2 top-2 text-2xl font-black text-[#FBBF24] opacity-30 select-none">⚡</span>
        <div className="flex flex-col gap-0.5 z-10">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.5px] text-[#D97706]">⚡ LIMITED TIME</span>
          <div className="flex flex-col pb-1">
            <span className="text-[20px] font-extrabold italic text-[#0F172A] leading-6">FLASH</span>
            <span className="text-[20px] font-extrabold italic text-[#0F172A] leading-6">SALE</span>
          </div>
          <span className="inline-flex px-1.5 py-[1px] rounded text-[9px] font-bold text-white bg-[#0F172A] w-fit">UP TO 60% OFF</span>
          <div className="pt-2">
            <button className="inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold text-white bg-[#059669] hover:bg-[#047857] transition-colors cursor-pointer">
              SHOP NOW <ArrowRight size={9} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 z-10">
          <div className="w-11 h-11 rounded-full flex flex-col items-center justify-center"
            style={{ background: "#FBBF24", border: "2px solid #FFFFFF" }}>
            <span className="text-[6px] font-extrabold text-[#020617]">BIGGEST</span>
            <span className="text-[11px] font-extrabold text-[#020617]">60%</span>
            <span className="text-[6px] font-extrabold text-[#020617]">DEALS</span>
          </div>
          <div className="flex items-center gap-1 text-xl"><span>🎒</span><span>👟</span></div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Nav links
───────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Home",     to: "/"         },
  { label: "Products", to: "/products" },
  { label: "Shops",    to: "/shops"    },
  { label: "Brands",   to: "/brands"   },
  { label: "Contact",  to: "/contact"  },
  { label: "Blogs",    to: "/blog"     },
];

/* ─────────────────────────────────────────────
   Main HeroSection
───────────────────────────────────────────── */
export default function HeroSection() {
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const categories = useNavCategories();

  return (
    <div className="w-full">
      <div className="max-w-[1400px] mx-auto px-4 py-4">

        <button
          className="lg:hidden flex items-center gap-2 mb-3 px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ background: "#F43F5E" }}
          onClick={() => setMobileDrawer(true)}
        >
          <Menu size={18} />
          All Categories
        </button>

        <MobileCategoryDrawer
          open={mobileDrawer}
          onClose={() => setMobileDrawer(false)}
          categories={categories}
        />

        <div className="flex gap-4 lg:gap-5 items-stretch relative">
          <div className="hidden lg:flex shrink-0">
            <DesktopCategorySidebar categories={categories} />
          </div>

          <div className="flex flex-col gap-3 flex-1 min-w-0" style={{ zIndex: 0 }}>
            <nav className="flex items-center gap-4 lg:gap-7 py-1 overflow-x-auto">
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`text-[13px] lg:text-[13.5px] font-semibold whitespace-nowrap transition-colors shrink-0 ${
                    i === 0
                      ? "text-[#F43F5E] border-b-2 border-[#F43F5E] pb-[3px]"
                      : "text-[#475569] hover:text-[#F43F5E]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col sm:flex-row gap-3">
              <HeroBanner />
              <RightBanners />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
