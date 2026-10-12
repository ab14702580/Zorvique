import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
  Package, ShoppingBag, DollarSign, Star,
  Clock, RefreshCw, TrendingUp,
} from 'lucide-react';
import Swal from 'sweetalert2';
import SellerDashboardLayout from '../../Component/SellerDashboardLayout/SellerDashboardLayout';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} className="text-white" strokeWidth={2} />
      </div>
      <div>
        <p className="text-[13px] text-slate-500 font-medium leading-none mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label, prefix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-600 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

const fmtMonth = (str) => {
  if (!str) return '';
  const [y, m] = str.split('-');
  return new Date(+y, +m - 1).toLocaleString('default', { month: 'short' });
};

const fmt = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SellerOverviewPage() {
  const { currentUser } = useAuth();
  const email = currentUser?.email || '';

  const [stats,   setStats]   = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get(`/seller/stats?sellerEmail=${encodeURIComponent(email)}`),
        api.get(`/orders?sellerEmail=${encodeURIComponent(email)}`),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data.slice(0, 5)); // latest 5
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to load stats', confirmButtonColor: '#6366f1' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [email]);

  const monthlyData = (stats?.monthlySales || []).map(d => ({
    month:   fmtMonth(d._id),
    Revenue: d.sales,
    Orders:  d.count,
  }));

  const statusCfg = {
    pending:    'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped:    'bg-violet-100 text-violet-700',
    delivered:  'bg-emerald-100 text-emerald-700',
    cancelled:  'bg-red-100 text-red-600',
  };

  if (loading) {
    return (
      <SellerDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading stats…</p>
          </div>
        </div>
      </SellerDashboardLayout>
    );
  }

  return (
    <SellerDashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Overview</h1>
          <p className="text-sm text-slate-400 mt-0.5">Your store performance at a glance</p>
        </div>
        <button type="button" onClick={fetchAll}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm cursor-pointer">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 mb-8">
        <StatCard label="Products"       value={stats?.totalProducts ?? 0}             icon={Package}     color="bg-indigo-500"   sub="Listed" />
        <StatCard label="Total Orders"   value={stats?.totalOrders ?? 0}               icon={ShoppingBag} color="bg-amber-500"    sub="All time" />
        <StatCard label="Pending Orders" value={stats?.pendingOrders ?? 0}             icon={Clock}       color="bg-rose-500"     sub="Need action" />
        <StatCard label="Revenue"        value={fmt(stats?.totalRevenue)}              icon={DollarSign}  color="bg-emerald-500"  sub="After 10% fee" />
        <StatCard label="Total Sales"    value={fmt(stats?.totalSales)}                icon={TrendingUp}  color="bg-cyan-500"     sub="Delivered orders" />
        <StatCard label="Avg Rating"     value={`${stats?.avgRating ?? '—'} ★`}       icon={Star}        color="bg-violet-500"   sub={`${stats?.totalReviews ?? 0} reviews`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-700 mb-4">Monthly Revenue &amp; Orders</p>
          {monthlyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip content={<CustomTooltip prefix="$" />} />
                <Bar dataKey="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Orders"  fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue area chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-700 mb-4">Revenue Trend</p>
          {monthlyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="sellerRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip content={<CustomTooltip prefix="$" />} />
                <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2}
                  fill="url(#sellerRevGrad)" dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-700">Recent Orders</p>
          <button type="button" onClick={() => window.location.href = '/seller/orders'}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">
            View all →
          </button>
        </div>
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-slate-400">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {['Order ID', 'Buyer', 'Items', 'Amount', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map(o => (
                  <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">#{o._id?.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{o.buyerEmail}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{(o.items || []).length} item(s)</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">{fmt(o.sellerAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusCfg[o.status] || 'bg-slate-100 text-slate-500'}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SellerDashboardLayout>
  );
}
