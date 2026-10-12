import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Clock,
  RotateCcw,
  Heart,
  MessageSquare,
  User,
  MapPin,
  Ticket,
  KeyRound,
  FileText,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Store,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import MainHeader from '../HomePageLayout/MainHeader';

// ─── Nav items config ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',        label: 'Dashboard',          icon: LayoutDashboard, path: '/dashboard' },
  { id: 'orders',           label: 'Order History',      icon: ClipboardList,   path: '/dashboard/orders' },
  { id: 'digital',          label: 'My Digital Products',icon: Package,         path: '/dashboard/digital' },
  { id: 'preorders',        label: 'Pre-orders',         icon: Clock,           path: '/dashboard/preorders' },
  { id: 'returns',          label: 'Return Orders',      icon: RotateCcw,       path: '/dashboard/returns' },
  { id: 'wishlist',         label: 'Wishlist',           icon: Heart,           path: '/dashboard/wishlist' },
  { id: 'message',          label: 'Message',            icon: MessageSquare,   path: '/dashboard/message' },
  { id: 'profile',          label: 'My Profile',         icon: User,            path: '/dashboard/profile' },
  { id: 'address',          label: 'Manage Address',     icon: MapPin,          path: '/dashboard/address' },
  { id: 'support',          label: 'Support Ticket',     icon: Ticket,          path: '/dashboard/support' },
  { id: 'password',         label: 'Change Password',    icon: KeyRound,        path: '/dashboard/password' },
  { id: 'reviews',          label: 'My Reviews',         icon: Star,            path: '/dashboard/reviews' },
  { id: 'terms',            label: 'Terms & Conditions', icon: FileText,        path: '/dashboard/terms' },
  { id: 'privacy',          label: 'Privacy Policy',     icon: ShieldCheck,     path: '/dashboard/privacy' },
  { id: 'become-seller',    label: 'Become a Seller',    icon: Store,           path: '/dashboard/become-seller' },
];

// ─── Single nav link ──────────────────────────────────────────────────────────
function NavLink({ item, active, onClick, highlight = false }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer w-full flex flex-row items-center gap-[14px] px-3 py-2 rounded-lg transition-colors text-left
        ${active
          ? 'bg-rose-50/70 border border-rose-100 text-rose-600'
          : highlight
            ? 'text-rose-600 bg-rose-50/50 hover:bg-rose-50 border border-rose-100/60'
            : 'text-gray-600 hover:bg-gray-50 border border-transparent'
        }`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Icon
        size={16}
        strokeWidth={1.5}
        className={`flex-shrink-0 ${active || highlight ? 'text-rose-500' : 'text-gray-400'}`}
      />
      <span className={`text-[12px] leading-4 ${active ? 'font-semibold text-rose-600' : highlight ? 'font-semibold text-rose-600' : 'font-medium text-gray-600'}`}>
        {item.label}
      </span>
    </button>
  );
}

// ─── DashboardLayout ──────────────────────────────────────────────────────────
export default function DashboardLayout({ children, activeId }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, dbUser, logout } = useAuth();

  // derive active from prop or current path
  const currentActive = activeId
    || NAV_ITEMS.find((n) => n.path === location.pathname)?.id
    || 'dashboard';

  const handleNav = (item) => {
    navigate(item.path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ── user display info ─────────────────────────────────────────────────────
  const displayName = dbUser?.displayName || currentUser?.displayName || 'User';
  const photoURL    = dbUser?.photoURL    || currentUser?.photoURL    || null;
  const roleBadge   = dbUser?.role
    ? dbUser.role.charAt(0).toUpperCase() + dbUser.role.slice(1)
    : 'User';

  const SidebarContent = () => (
    <div
      className="flex flex-col w-full h-full"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── User Profile Brief ── */}
      <div className="flex flex-col items-center pb-4 mb-0 border-b border-gray-100 w-full">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full border-2 border-emerald-400 p-0.5 overflow-hidden flex items-center justify-center mb-3 bg-rose-50">
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-rose-600">
              {displayName[0].toUpperCase()}
            </span>
          )}
        </div>

        {/* Name */}
        <h2
          className="text-[15px] font-semibold text-gray-800 text-center leading-6"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {displayName}
        </h2>

        {/* Email */}
        <p
          className="text-[11px] font-normal text-gray-400 text-center tracking-[0.2px] mt-0.5 truncate max-w-[200px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {dbUser?.email || currentUser?.email || ''}
        </p>

        {/* Role badge */}
        <span className="mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
          {roleBadge}
        </span>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex flex-col gap-1 pt-4 w-full flex-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          item.id === 'become-seller' ? (
            <div key={item.id} className="mt-2 pt-2 border-t border-gray-100">
              <NavLink
                item={item}
                active={currentActive === item.id}
                onClick={() => handleNav(item)}
                highlight
              />
            </div>
          ) : (
            <NavLink
              key={item.id}
              item={item}
              active={currentActive === item.id}
              onClick={() => handleNav(item)}
            />
          )
        ))}
      </nav>

      {/* ── Logout ── */}
      <div className="pt-3 mt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={15} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top Navbar (MainHeader) ── */}
      <MainHeader />

      {/* ── Mobile sidebar toggle bar ── */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-800">My Account</span>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Main layout wrapper ── */}
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex flex-row items-start gap-6 lg:gap-8">

          {/* ══ SIDEBAR — mobile overlay ══ */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={`
              fixed top-0 left-0 h-full z-30 overflow-y-auto
              flex flex-col items-start p-5
              w-[280px] bg-white border-r border-gray-100
              transition-transform duration-300 ease-in-out
              lg:static lg:translate-x-0 lg:h-auto lg:z-auto lg:border-r-0
              lg:rounded-xl lg:min-h-[685px] lg:flex-shrink-0 lg:w-[260px]
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            {/* Mobile close */}
            <button
              className="lg:hidden self-end mb-3 p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>

            <SidebarContent />
          </aside>

          {/* ══ MAIN CONTENT ══ */}
          <main className="flex-1 flex flex-col gap-4 min-w-0 w-full">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
