import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Tag, Users, Store,
  ShoppingBag, LogOut, Menu, X, ShieldCheck,
  ChevronRight, UserCog, LifeBuoy, Mail, Package,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';


// dashboard are sob page are 20 ta data are besi hole backend theke pagination create korba . and skip kore data gula anba jate load kom hoi .

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'overview',      label: 'Overview',        icon: LayoutDashboard, path: '/admin' },
  { id: 'users',         label: 'User Management', icon: UserCog,         path: '/admin/users' },
  { id: 'categories',    label: 'Categories',      icon: Tag,             path: '/admin/categories' },
  { id: 'products',      label: 'All Products',    icon: Package,         path: '/admin/products' },
  { id: 'sellers',       label: 'Sellers',         icon: Users,           path: '/admin/sellers' },
  { id: 'shop-requests', label: 'Shop Requests',   icon: Store,           path: '/admin/shop-requests' },
  { id: 'orders',        label: 'Orders',          icon: ShoppingBag,     path: '/admin/orders' },
  { id: 'support',       label: 'Support Tickets', icon: LifeBuoy,        path: '/admin/support' },
  { id: 'contact',       label: 'Contact Messages',icon: Mail,            path: '/admin/contact' },
];

// ─── Single nav link ──────────────────────────────────────────────────────────
function NavLink({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150
        ${active
          ? 'bg-rose-600 text-white shadow-[0_4px_14px_rgba(225,29,72,0.4)]'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      <Icon size={16} strokeWidth={1.8} className="flex-shrink-0" />
      <span className="text-[13px] font-medium leading-none">{item.label}</span>
      {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
    </button>
  );
}

// ─── AdminDashboardLayout ─────────────────────────────────────────────────────
export default function AdminDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { currentUser, dbUser, logout } = useAuth();

  const activeId = NAV_ITEMS.find(n => n.path === location.pathname)?.id || 'overview';

  const handleNav = (item) => {
    navigate(item.path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ── Sidebar inner content ────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* ── Brand ── */}
      <div
        className="flex items-center gap-3 px-1 pt-1 pb-7 cursor-pointer group"
        onClick={() => navigate('/')}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate('/')}
      >
        <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:bg-rose-500 transition-colors">
          <ShieldCheck size={18} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[14px] font-bold text-white leading-tight group-hover:text-rose-300 transition-colors">Multiventor</p>
          <p className="text-[10px] text-slate-500 leading-none tracking-widest uppercase mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* ── Nav section label ── */}
      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
        Main Menu
      </p>

      {/* ── Nav links ── */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.id}
            item={item}
            active={activeId === item.id}
            onClick={() => handleNav(item)}
          />
        ))}
      </nav>

      {/* ── Admin profile + logout ── */}
      <div className="border-t border-white/8 pt-4 mt-4">
        {/* Profile row */}
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {dbUser?.photoURL
              ? <img src={dbUser.photoURL} alt="admin" className="w-full h-full object-cover" />
              : <span className="text-sm font-bold text-rose-400">
                  {(dbUser?.displayName || currentUser?.email || 'A')[0].toUpperCase()}
                </span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white truncate leading-tight">
              {dbUser?.displayName || 'Admin'}
            </p>
            <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
              {currentUser?.email || ''}
            </p>
          </div>
          <span className="px-1.5 py-0.5 rounded-md bg-rose-600/30 text-[9px] font-bold text-rose-400 uppercase tracking-wide flex-shrink-0">
            Admin
          </span>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 group"
        >
          <LogOut size={15} strokeWidth={1.8} className="group-hover:translate-x-0.5 transition-transform" />
          <span className="text-[13px] font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    /* Full viewport height, no scroll on outer wrapper */
    <div className="h-screen bg-[#F1F5F9] flex overflow-hidden">

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══ SIDEBAR — always full height ══ */}
      <aside
        className={`
          fixed top-0 left-0 z-30
          w-[240px] h-full
          bg-[#0B1120]
          flex flex-col
          p-4
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile close btn */}
        <button
          type="button"
          className="lg:hidden self-end mb-3 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={16} />
        </button>

        <SidebarContent />
      </aside>

      {/* ══ MAIN CONTENT AREA ══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Mobile top bar ── */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-rose-600" />
            <span className="text-sm font-bold text-slate-800">Admin Panel</span>
          </div>
          <div className="w-8" />
        </header>

        {/* ── Scrollable page content ── */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
