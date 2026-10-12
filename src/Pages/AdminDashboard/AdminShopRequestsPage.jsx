import { useEffect, useState } from 'react';
import { Store, CheckCircle, XCircle, Clock, AlertCircle, Loader2, Search } from 'lucide-react';
import AdminDashboardLayout from '../../Component/AdminDashboardLayout/AdminDashboardLayout';
import api from '../../api/axios';

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  { cls: 'bg-amber-100 text-amber-700',   icon: Clock,        label: 'Pending' },
    approved: { cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Approved' },
    rejected: { cls: 'bg-red-100 text-red-600',        icon: XCircle,     label: 'Rejected' },
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.cls}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

export default function AdminShopRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [acting,   setActing]   = useState(null);
  const [filter,   setFilter]   = useState('pending');
  const [query,    setQuery]    = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/shop-requests');
      setRequests(res.data);
    } catch {
      setError('Failed to load shop requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this shop request? The seller will be promoted and a shop will be created.')) return;
    setActing(id);
    try {
      await api.put(`/shop-requests/${id}/approve`);
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'approved' } : r));
    } catch {
      setError('Approval failed.');
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason (optional):') ?? '';
    setActing(id);
    try {
      await api.put(`/shop-requests/${id}/reject`, { reason });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'rejected' } : r));
    } catch {
      setError('Rejection failed.');
    } finally {
      setActing(null);
    }
  };

  const displayed = requests.filter(r =>
    (filter === 'all' || r.status === filter) &&
    (r.shopName?.toLowerCase().includes(query.toLowerCase()) ||
     r.sellerEmail?.toLowerCase().includes(query.toLowerCase()))
  );

  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const tabs = ['pending', 'approved', 'rejected', 'all'];

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Shop Requests</h1>
          <p className="text-sm text-slate-400 mt-0.5">Review and approve seller shop applications</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search shop or email…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 cursor-pointer rounded-xl text-xs font-semibold capitalize transition-colors
              ${filter === t
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600'
              }`}
          >
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={22} className="animate-spin text-rose-400" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm gap-2">
          <Store size={30} strokeWidth={1.2} />
          No requests found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map(r => (
            <div key={r._id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
              {/* Shop info */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {r.logo
                    ? <img src={r.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    : (
                      <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                        <Store size={18} className="text-violet-500" />
                      </div>
                    )
                  }
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">{r.shopName || 'Unnamed Shop'}</p>
                    <p className="text-[11px] text-slate-400">{r.sellerEmail}</p>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>

              {/* Description */}
              {r.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{r.description}</p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                {r.category && <span className="bg-slate-100 px-2 py-0.5 rounded-full">{r.category}</span>}
                {r.createdAt && (
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                )}
              </div>

              {/* Actions — only for pending */}
              {r.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApprove(r._id)}
                    disabled={acting === r._id}
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
                  >
                    {acting === r._id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(r._id)}
                    disabled={acting === r._id}
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
                  >
                    {acting === r._id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminDashboardLayout>
  );
}
