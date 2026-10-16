import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight, Menu, AlignJustify, X, Package,
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
function HeroBanner({ slides, activeIndex, onSlideChange }) {
  return (
    <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-2xl border border-[#E2E8F0]">
      {slides.map((slide, index) => (
        <img
          key={slide.image}
          src={slide.image}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-in-out ${
            index === activeIndex ? "scale-100 opacity-100" : "scale-105 opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => onSlideChange(index)}
            aria-label={`Show slide ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
            className={`h-2.5 rounded-full border border-white/80 transition-all ${
              index === activeIndex ? "w-7 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Right banners
───────────────────────────────────────────── */
function RightBanners() {
  const sideCards = [
    {
      title: "Natural Beauty Care",
      subtitle: "New Product",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
      accent: "#0EA5E9",
    },
    {
      title: "Flash Sale",
      subtitle: "Up to 60% Off",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
      accent: "#10B981",
    },
  ];

  return (
    <div className="flex flex-col gap-3 w-full sm:w-[240px] lg:w-[301px] shrink-0">
      {sideCards.map((card) => (
        <div
          key={card.title}
          className="relative flex items-end rounded-2xl overflow-hidden flex-1 min-h-[160px] px-4 py-4"
          style={{
            background: `linear-gradient(135deg, rgba(15,23,42,0.15), rgba(14,165,233,0.12)), url(${card.image}) center/cover no-repeat`,
            border: "1px solid #E2E8F0",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
          <div className="relative z-10 flex w-full items-end justify-between gap-3 text-white">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-semibold text-white/90">{card.title}</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.5px] text-white/80">{card.subtitle}</span>
            </div>
            <div
              className="rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.5px]"
              style={{ background: card.accent, color: "#fff" }}
            >
              50%+
            </div>
          </div>
        </div>
      ))}
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
  const [activeSlide, setActiveSlide] = useState(0);
  const categories = useNavCategories();

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    },
    {
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
    },
    {
      image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [slides.length]);

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
              <HeroBanner slides={slides} activeIndex={activeSlide} onSlideChange={setActiveSlide} />
              <RightBanners />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
