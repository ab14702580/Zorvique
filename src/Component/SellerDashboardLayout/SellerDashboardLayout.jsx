import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Star,
  Store, LogOut, Menu, X, ChevronRight,
  BadgeCheck, Paintbrush,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import DashboardShellContext from '../DashboardShellContext';
import PageLoadingContext from '../PageLoadingContext';
import PageLoadingOverlay from '../PageLoadingOverlay/PageLoadingOverlay';

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',           icon: LayoutDashboard, path: '/seller' },
  { id: 'products',  label: 'My Products',         icon: Package,         path: '/seller/products' },
  { id: 'orders',    label: 'Orders',              icon: ShoppingBag,     path: '/seller/orders' },
  { id: 'reviews',   label: 'Reviews',             icon: Star,            path: '/seller/reviews' },
  { id: 'store',     label: 'Store Profile',       icon: Store,           path: '/seller/store' },
  { id: 'decorate',  label: 'Store Decoration',    icon: Paintbrush,      path: '/seller/decorate' },
];

function NavLink({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150
        ${active
          ? 'bg-indigo-600 text-white shadow-[0_4px_14px_rgba(99,102,241,0.4)]'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      <Icon size={16} strokeWidth={1.8} className="flex-shrink-0" />
      <span className="text-[13px] font-medium leading-none">{item.label}</span>
      {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
    </button>
  );
}

export default function SellerDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { currentUser, dbUser, logout } = useAuth();
  const parentShell = useContext(DashboardShellContext);
  const isPageLoading = useContext(PageLoadingContext);

  const activeId = NAV_ITEMS.find(n => n.path === location.pathname)?.id || 'overview';

  const handleNav = (item) => { navigate(item.path); setSidebarOpen(false); };
  const handleLogout = async () => { await logout(); navigate('/login'); };

  const displayName = dbUser?.displayName || currentUser?.displayName || 'Seller';
  const photoURL    = dbUser?.photoURL    || currentUser?.photoURL    || null;
  const shopName    = dbUser?.sellerInfo?.shopName || 'My Store';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-1 pt-1 pb-7 cursor-pointer group"
        onClick={() => navigate('/')} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate('/')}>
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:bg-indigo-500 transition-colors">
          <Store size={18} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[14px] font-bold text-white leading-tight group-hover:text-indigo-300 transition-colors">Multiventor</p>
          <p className="text-[10px] text-slate-500 leading-none tracking-widest uppercase mt-0.5">Seller Panel</p>
        </div>
      </div>

      {/* Section label */}
      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">Seller Menu</p>

      {/* Nav links */}
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.id} item={item} active={activeId === item.id} onClick={() => handleNav(item)} />
        ))}
      </nav>

      {/* Profile + logout */}
      <div className="border-t border-white/8 pt-4 mt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {photoURL
              ? <img src={photoURL} alt="seller" className="w-full h-full object-cover" />
              : <span className="text-sm font-bold text-indigo-400">{displayName[0]?.toUpperCase()}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-[12px] font-semibold text-white truncate leading-tight">{displayName}</p>
              <BadgeCheck size={12} className="text-indigo-400 flex-shrink-0" />
            </div>
            <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">{shopName}</p>
          </div>
          <span className="px-1.5 py-0.5 rounded-md bg-indigo-600/30 text-[9px] font-bold text-indigo-400 uppercase tracking-wide flex-shrink-0">
            Seller
          </span>
        </div>
        <button type="button" onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 group">
          <LogOut size={15} strokeWidth={1.8} className="group-hover:translate-x-0.5 transition-transform" />
          <span className="text-[13px] font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  if (parentShell === 'seller') return children;

  return (
    <DashboardShellContext.Provider value="seller">
    <div className="h-dvh bg-[#F1F5F9] flex overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 w-[240px] h-full bg-[#0F1629]
        flex flex-col p-4
        transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <button type="button"
          className="lg:hidden self-end mb-3 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setSidebarOpen(false)}>
          <X size={16} />
        </button>
        {SidebarContent()}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          <button type="button" onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Store size={15} className="text-indigo-600" />
            <span className="text-sm font-bold text-slate-800">Seller Panel</span>
          </div>
          <div className="w-8" />
        </header>

        {/* Page content */}
        <main className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-5 lg:p-8">
          {children}
          {isPageLoading && <PageLoadingOverlay className="absolute inset-0 z-10" />}
        </main>
      </div>
    </div>
    </DashboardShellContext.Provider>
  );
}
