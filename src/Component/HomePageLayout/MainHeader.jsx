import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronRight, Search, Heart, ShoppingCart, User,
  Store, Menu, X, MoreVertical, Home, Package, ShoppingBag,
  Tag, Phone, BookOpen, Settings,
  LogIn, UserPlus, LogOut,
  AlignJustify,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import CartDrawer from "../CartDrawer/CartDrawer";

import { useNavCategories } from '../../data/categories';
import { useAuth } from "../../context/useAuth";

/* ── All page links for the 3-dot menu ── */
const pageLinks = [
  { label: "Home",         to: "/",           icon: <Home size={15} /> },
  { label: "Products",     to: "/products",   icon: <Package size={15} /> },
  { label: "Shops",        to: "/shops",      icon: <ShoppingBag size={15} /> },
  { label: "Brands",       to: "/brands",     icon: <Tag size={15} /> },
  { label: "Contact",      to: "/contact",    icon: <Phone size={15} /> },
  { label: "Blogs",        to: "/blog",       icon: <BookOpen size={15} /> },
  { label: "Settings",     to: "/dashboard/profile",   icon: <Settings size={15} /> },
];

/* ─────────────────────────────────────────────
   Category mega-menu
───────────────────────────────────────────── */
function CategoryMenu({ open, onClose, buttonRef, categories }) {
  const [active, setActive] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => { if (open) setActive(0); }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const outsideMenu = menuRef.current && !menuRef.current.contains(e.target);
      const outsideBtn  = buttonRef?.current && !buttonRef.current.contains(e.target);
      if (outsideMenu && outsideBtn) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, buttonRef]);

  if (!open || categories.length === 0) return null;

  const activeCat = categories[active] || categories[0];

  return (
    <div
      ref={menuRef}
      className="absolute left-0 top-full z-[55] flex rounded-2xl overflow-hidden"
      style={{
        width: "min(820px, 96vw)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
        border: "1px solid #F1F5F9",
        marginTop: "6px",
      }}
    >
      {/* Left: category list */}
      <div className="w-55 shrink-0 bg-white border-r border-[#F1F5F9] py-2 overflow-y-auto max-h-120">
        {categories.map((cat, idx) => (
          <button
            key={cat._id}
            onMouseEnter={() => setActive(idx)}
            onClick={() => setActive(idx)}
            className="flex items-center justify-between w-full px-4 py-2.5 text-left transition-colors gap-3 cursor-pointer"
            style={{
              background: idx === active ? "#FFF1F3" : "transparent",
              color: idx === active ? "#E11D48" : "#334155",
            }}
          >
            <div className="flex items-center gap-3">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-5 h-5 rounded object-cover shrink-0" style={{ color: idx === active ? "#E11D48" : "#94A3B8" }} />
              ) : (
                <Package size={16} style={{ color: idx === active ? "#E11D48" : "#94A3B8" }} />
              )}
              <span className="text-[13px] font-medium leading-none">{cat.name}</span>
            </div>
            <ChevronRight size={14} className="shrink-0 opacity-50" />
          </button>
        ))}
      </div>

      {/* Right: subcategories panel */}
      <div className="flex-1 bg-white p-5 overflow-y-auto max-h-[480px]">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#F1F5F9]">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: "#FFF1F3" }}>
            {activeCat.image ? (
              <img src={activeCat.image} alt={activeCat.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={18} className="text-[#E11D48]" />
            )}
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#0F172A]">{activeCat.name}</h3>
            <p className="text-[12px] text-[#64748B] leading-4">
              Explore premium {activeCat.name} products chosen for quality, value, and everyday convenience.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {(activeCat.children || []).map((sub) => (
            <Link
              key={sub._id}
              to={`/products?category=${encodeURIComponent(activeCat.name)}&sub=${encodeURIComponent(sub.name)}`}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] overflow-hidden flex items-center justify-center shrink-0 group-hover:bg-[#FFE4E6] transition-colors">
                {sub.image ? (
                  <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={16} className="text-[#94A3B8] group-hover:text-[#E11D48] transition-colors" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#1E293B] leading-4 truncate group-hover:text-[#E11D48] transition-colors">
                  {sub.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MainHeader() {
  const { isAuthenticated, currentUser, dbUser, logout } = useAuth();
  const { totalItems, setDrawerOpen } = useCart();
  const { totalWishlist } = useWishlist();
  const categories = useNavCategories();
  const navigate = useNavigate();

  /* ── sticky + shadow on scroll ── */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── mobile drawer ── */
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ── 3-dot dropdown ── */
  const [dotOpen, setDotOpen] = useState(false);
  const dotRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (dotRef.current && !dotRef.current.contains(e.target)) setDotOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Category mega-menu ── */
  const [catOpen, setCatOpen] = useState(false);
  const catBtnRef = useRef(null);

  return (
    <header
      className={`w-full bg-white border-b border-[#F1F5F9] sticky top-0 z-50 transition-shadow duration-200 ${
        scrolled ? "shadow-[0_2px_16px_rgba(0,0,0,0.08)]" : ""
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 h-[64px] md:h-[76px] flex items-center gap-3 md:gap-4">

        {/* ── Brand Logo ── */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(45deg, #E11D48 0%, #F43F5E 100%)",
              boxShadow: "0px 4px 6px -1px rgba(244,63,94,0.2), 0px 2px 4px -2px rgba(244,63,94,0.2)",
            }}
          >
            <Store size={22} strokeWidth={2} className="text-white" />
          </div>
          <div className="hidden sm:flex flex-col justify-center">
            <span
              className="font-extrabold text-xl md:text-2xl text-[#1E293B] leading-7 md:leading-8"
              style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "-0.5px" }}
            >
              Ready
            </span>
            <span className="text-[10px] md:text-[11px] font-semibold text-[#64748B] tracking-[0.3px]">
              eCommerce
            </span>
          </div>
        </Link>

        {/* ── All Categories button + mega menu ── */}
        <div className="relative hidden lg:block shrink-0" ref={catBtnRef}>
          <button
            onClick={() => setCatOpen((v) => !v)}
            className="flex items-center gap-2 px-4 h-10 rounded-lg text-[13px] font-semibold text-white transition-colors cursor-pointer"
            style={{ background: catOpen ? "#BE185D" : "#E11D48" }}
          >
            <AlignJustify size={16} strokeWidth={2} />
            <span>All Categories</span>
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={`transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Mega dropdown */}
          <CategoryMenu open={catOpen} onClose={() => setCatOpen(false)} buttonRef={catBtnRef} categories={categories} />
        </div>

        {/* ── Search Bar ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-stretch h-9 md:h-10 border-2 border-[#E2E8F0] rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 min-w-0 px-3 md:px-4 text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none bg-white"
            />
            <button
              className="flex items-center justify-center w-10 md:w-14 bg-[#F43F5E] hover:bg-[#E11D48] transition-colors shrink-0"
              aria-label="Search"
            >
              <Search size={16} strokeWidth={1.67} className="text-white" />
            </button>
          </div>
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative hidden sm:flex w-[34px] h-[34px] md:w-[38px] md:h-[38px] items-center justify-center border border-[#E2E8F0] rounded-full hover:border-[#F43F5E] transition-colors cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart size={18} strokeWidth={1.5} className="text-[#475569]" />
            <span className="absolute -top-[5px] -right-[3px] w-4 h-4 bg-[#F43F5E] rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-white leading-none">{totalWishlist > 99 ? "99+" : totalWishlist}</span>
            </span>
          </Link>

          {/* Cart */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative flex cursor-pointer w-[34px] h-[34px] md:w-[38px] md:h-[38px] items-center justify-center border border-[#E2E8F0] rounded-full hover:border-[#F43F5E] transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart size={18} strokeWidth={1.5} className="text-[#475569]" />
            <span className="absolute -top-[5px] -right-[3px] w-4 h-4 bg-[#F43F5E] rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-white leading-none">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            </span>
          </button>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              {/* Profile avatar → dashboard or admin */}
              <button
                type="button"
                onClick={() => navigate(dbUser?.role === 'admin' ? '/admin' : '/dashboard')}
                className="flex w-[34px] h-[34px] md:w-[38px] cursor-pointer md:h-[38px] items-center justify-center border border-[#E2E8F0] rounded-full hover:border-[#F43F5E] transition-colors overflow-hidden"
                aria-label="Profile"
              >
                {dbUser?.photoURL || currentUser?.photoURL ? (
                  <img
                    src={dbUser?.photoURL || currentUser?.photoURL}
                    alt="profile"
                    className="w-full cursor-pointer h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-sm font-bold text-[#F43F5E]">
                    {(dbUser?.displayName || currentUser?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
                  </span>
                )}
              </button>
              {/* Sign out */}
              <button
                type="button"
                onClick={async () => { await logout(); navigate('/'); }}
                className="flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#EF4444] hover:bg-red-50 transition-colors border border-red-200"
              >
                <LogOut size={14} strokeWidth={2} />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#F43F5E] hover:bg-[#FFF1F3] transition-colors border border-[#F43F5E]"
              >
                <LogIn size={14} strokeWidth={2} />
                Login
              </Link>
              <Link
                to="/register"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-white bg-[#F43F5E] hover:bg-[#E11D48] transition-colors"
              >
                <UserPlus size={14} strokeWidth={2} />
                Register
              </Link>
            </div>
          )}

          {/* ── 3-dot dropdown ── */}
          <div className="relative hidden sm:block" ref={dotRef}>
            <button
              onClick={() => setDotOpen((v) => !v)}
              className="flex w-[34px] h-[34px] md:w-[38px] md:h-[38px] cursor-pointer items-center justify-center border border-[#E2E8F0] rounded-full hover:border-[#F43F5E] hover:text-[#F43F5E] text-[#475569] transition-colors"
              aria-label="More pages"
            >
              <MoreVertical size={18} strokeWidth={2} />
            </button>

            {dotOpen && (
              <div
                className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-2xl py-2 z-50"
                style={{ boxShadow: "0px 8px 24px rgba(0,0,0,0.12)", border: "1px solid #F1F5F9" }}
              >
                <div className="px-4 py-2 border-b border-[#F1F5F9] mb-1">
                  <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.8px]">All Pages</span>
                </div>
                {pageLinks.map((pg) => (
                  <Link
                    key={pg.to}
                    to={pg.to}
                    onClick={() => setDotOpen(false)}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#475569] hover:bg-[#FFF1F3] hover:text-[#F43F5E] transition-colors"
                  >
                    <span className="text-[#94A3B8]">{pg.icon}</span>
                    {pg.label}
                  </Link>
                ))}
                <div className="border-t border-[#F1F5F9] mt-1 pt-1">
                  {isAuthenticated ? (
                    <>
                      <button
                        type="button"
                        onClick={() => { navigate(dbUser?.role === 'admin' ? '/admin' : '/dashboard'); setDotOpen(false); }}
                        className="flex items-center cursor-pointer gap-3 w-full px-4 py-2.5 text-[13px] font-medium text-[#475569] hover:bg-[#FFF1F3] hover:text-[#F43F5E] transition-colors"
                      >
                        <User size={15} /> My Dashboard
                      </button>
                      {(dbUser?.role === 'seller' || dbUser?.role === 'admin') && (
                        <button
                          type="button"
                          onClick={() => { navigate('/seller'); setDotOpen(false); }}
                          className="flex items-center cursor-pointer gap-3 w-full px-4 py-2.5 text-[13px] font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Store size={15} /> Seller Dashboard
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={async () => { await logout(); setDotOpen(false); navigate('/'); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium text-[#EF4444] hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setDotOpen(false)}
                        className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#475569] hover:bg-[#FFF1F3] hover:text-[#F43F5E] transition-colors">
                        <LogIn size={15} /> Login
                      </Link>
                      <Link to="/register" onClick={() => setDotOpen(false)}
                        className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#475569] hover:bg-[#FFF1F3] hover:text-[#F43F5E] transition-colors">
                        <UserPlus size={15} /> Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Hamburger (mobile) ── */}
          <button
            className="flex sm:hidden w-9 h-9 items-center justify-center text-[#475569] hover:text-[#F43F5E] transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[#F1F5F9] bg-white px-4 py-3 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">

          {/* Mobile: category accordion */}
          <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.8px] px-2 py-1 mt-1">Categories</p>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-2 py-2.5 text-[13px] font-medium text-[#334155] hover:text-[#F43F5E] hover:bg-[#FFF1F3] rounded-lg transition-colors"
            >
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-5 h-5 rounded object-cover" />
              ) : (
                <Package size={15} className="text-[#94A3B8]" />
              )}
              {cat.name}
            </Link>
          ))}

          <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.8px] px-2 py-1 mt-2">Pages</p>
          {pageLinks.map((pg) => (
            <Link
              key={pg.to}
              to={pg.to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-2 py-2.5 text-[13px] font-medium text-[#475569] hover:text-[#F43F5E] hover:bg-[#FFF1F3] rounded-lg transition-colors"
            >
              {pg.icon} {pg.label}
            </Link>
          ))}

          <div className="border-t border-[#F1F5F9] mt-1 pt-2 flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-2 py-2.5 text-[13px] font-medium text-[#475569] hover:text-[#F43F5E] hover:bg-[#FFF1F3] rounded-lg transition-colors">
                  <Heart size={15} /> Wishlist
                </Link>
                <button
                  type="button"
                  onClick={() => { navigate(dbUser?.role === 'admin' ? '/admin' : '/dashboard'); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-2 py-2.5 text-[13px] font-medium text-[#475569] hover:text-[#F43F5E] hover:bg-[#FFF1F3] rounded-lg transition-colors w-full text-left"
                >
                  <User size={15} /> My Dashboard
                </button>
                {(dbUser?.role === 'seller' || dbUser?.role === 'admin') && (
                  <button
                    type="button"
                    onClick={() => { navigate('/seller'); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-2 py-2.5 text-[13px] font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors w-full text-left"
                  >
                    <Store size={15} /> Seller Dashboard
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => { await logout(); setMobileOpen(false); navigate('/'); }}
                  className="flex items-center gap-3 px-2 py-2.5 text-[13px] font-medium text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors w-full">
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-semibold text-[#F43F5E] border border-[#F43F5E] hover:bg-[#FFF1F3] transition-colors">
                  <LogIn size={14} /> Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#F43F5E] hover:bg-[#E11D48] transition-colors">
                  <UserPlus size={14} /> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer />
    </header>
  );
}

