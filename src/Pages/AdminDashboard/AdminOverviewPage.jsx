import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, ShoppingBag, DollarSign,
  TrendingUp, Eye, Store, RefreshCw,
} from 'lucide-react';
import AdminDashboardLayout from '../../Component/AdminDashboardLayout/AdminDashboardLayout';
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

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-600 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Format month string "2025-01" → "Jan" ───────────────────────────────────
const fmtMonth = (str) => {
  if (!str) return '';
  const [y, m] = str.split('-');
  return new Date(+y, +m - 1).toLocaleString('default', { month: 'short' });
};

// ─── Format date obj → "DD MMM" ──────────────────────────────────────────────
const fmtDay = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  return d.toLocaleDateString('default', { day: '2-digit', month: 'short' });
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminOverviewPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      setError('Failed to load stats. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // ── prepare chart data ──────────────────────────────────────────────────
  const monthlySalesData = (stats?.monthlySales || []).map(d => ({
    month: fmtMonth(d._id),
    Sales: d.sales,
    Orders: d.count,
  }));

  const visitorData = (stats?.visitorStats || []).slice(-14).map(d => ({
    day:      fmtDay(d.date),
    Visitors: d.count,
  }));

  // ── loading skeleton ────────────────────────────────────────────────────
  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-rose-200 border-t-rose-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading stats…</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Overview</h1>
          <p className="text-sm text-slate-400 mt-0.5">Platform-wide stats at a glance</p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors px-3 py-2 rounded-lg hover:bg-white border border-slate-200 bg-white shadow-sm"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers?.toLocaleString() ?? '—'}
          icon={Users}
          color="bg-blue-500"
          sub="Registered buyers"
        />
        <StatCard
          label="Sellers"
          value={stats?.totalSellers?.toLocaleString() ?? '—'}
          icon={Store}
          color="bg-violet-500"
          sub="Active sellers"
        />
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders?.toLocaleString() ?? '—'}
          icon={ShoppingBag}
          color="bg-amber-500"
          sub="All time"
        />
        <StatCard
          label="Total Sales"
          value={`$${(stats?.totalSales ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="bg-emerald-500"
          sub="Delivered orders"
        />
        <StatCard
          label="Admin Revenue"
          value={`$${(stats?.adminProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="bg-rose-600"
          sub="10% of sales"
        />
        <StatCard
          label="Today's Visitors"
          value={stats?.todayVisitors?.toLocaleString() ?? '—'}
          icon={Eye}
          color="bg-cyan-500"
          sub={`${stats?.pendingShopRequests ?? 0} shop reqs pending`}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* Monthly Sales & Orders chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-700 mb-4">Monthly Sales &amp; Orders</p>
          {monthlySalesData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlySalesData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip content={<CustomTooltip prefix="$" />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Sales" fill="#e11d48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Visitor chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-slate-700 mb-4">Unique Visitors — Last 14 Days</p>
          {visitorData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-slate-400">No visitor data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={visitorData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Visitors"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#visGrad)"
                  dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Revenue area chart (full width) ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-slate-700">Admin Revenue (10% per order)</p>
          <span className="text-xs text-slate-400">Last 6 months</span>
        </div>
        {monthlySalesData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-slate-400">No revenue data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={monthlySalesData.map(d => ({ ...d, Revenue: +(d.Sales * 0.1).toFixed(2) }))}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e11d48" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={52} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip prefix="$" />} />
              <Area
                type="monotone"
                dataKey="Revenue"
                stroke="#e11d48"
                strokeWidth={2.5}
                fill="url(#revGrad)"
                dot={{ r: 4, fill: '#e11d48', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
