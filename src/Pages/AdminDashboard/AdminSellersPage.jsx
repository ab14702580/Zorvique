import { useEffect, useState } from 'react';
import {
  Users, Loader2, Search, RefreshCw,
  CheckCircle, XCircle, Clock, Store,
  ChevronDown, AlertCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminDashboardLayout from '../../Component/AdminDashboardLayout/AdminDashboardLayout';
import api from '../../api/axios';

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  { cls: 'bg-amber-100 text-amber-700 border-amber-200',   icon: Clock,        label: 'Pending' },
    approved: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Approved' },
    rejected: { cls: 'bg-red-100 text-red-600 border-red-200',          icon: XCircle,     label: 'Rejected' },
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.cls}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

const TABS = ['pending', 'approved', 'rejected', 'all'];

export default function AdminSellersPage() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(null);
  const [tab,      setTab]      = useState('pending');
  const [query,    setQuery]    = useState('');
  const [expanded, setExpanded] = useState(null);

  const fetchRequests = async (status = tab) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/seller-requests?status=${status}`);
      setRequests(res.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load seller requests.', confirmButtonColor: '#e11d48' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(tab); }, [tab]);

  const handleApprove = async (email, name) => {
    const result = await Swal.fire({
      title: 'Approve Seller?',
      html: `<span class="text-sm text-slate-600">Approve <b>${name || email}</b> as a seller?<br/>Their role will be updated to <b>seller</b>.</span>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, approve',
    });
    if (!result.isConfirmed) return;
    setActing(email);
    try {
      await api.put(`/admin/seller-requests/${encodeURIComponent(email)}/approve`);
      setRequests(prev => prev.map(r => r.email === email ? { ...r, sellerRequest: 'approved', role: 'seller' } : r));
      Swal.fire({ icon: 'success', title: 'Approved!', text: `${name || email} is now a seller.`, timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed', confirmButtonColor: '#e11d48' });
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (email, name) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Reject Request?',
      input: 'textarea',
      inputLabel: 'Reason (optional)',
      inputPlaceholder: 'Why is this request being rejected?',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Reject',
    });
    if (!isConfirmed) return;
    setActing(email);
    try {
      await api.put(`/admin/seller-requests/${encodeURIComponent(email)}/reject`, { reason: reason || '' });
      setRequests(prev => prev.map(r => r.email === email ? { ...r, sellerRequest: 'rejected', sellerRejectReason: reason } : r));
      Swal.fire({ icon: 'info', title: 'Rejected', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed', confirmButtonColor: '#e11d48' });
    } finally {
      setActing(null);
    }
  };

  const filtered = requests.filter(r =>
    r.displayName?.toLowerCase().includes(query.toLowerCase()) ||
    r.email?.toLowerCase().includes(query.toLowerCase())
  );

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'all' ? requests.length : requests.filter(r => r.sellerRequest === t).length;
    return acc;
  }, {});

  return (
    <AdminDashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Seller Requests</h1>
          <p className="text-sm text-slate-400 mt-0.5">Review and approve users applying to become sellers</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or email…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
            />
          </div>
          <button type="button" onClick={() => fetchRequests(tab)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 transition-all cursor-pointer shadow-sm">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer
              ${tab === t ? 'bg-rose-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600'}`}>
            {t === 'pending'  && <Clock size={11} />}
            {t === 'approved' && <CheckCircle size={11} />}
            {t === 'rejected' && <XCircle size={11} />}
            {t === 'all'      && <Users size={11} />}
            {t} ({counts[t] ?? 0})
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 size={24} className="animate-spin text-rose-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border border-slate-100 shadow-sm gap-3 text-slate-400">
          <Store size={36} strokeWidth={1.2} />
          <p className="text-sm">No {tab} seller requests</p>
          {tab === 'pending' && (
            <p className="text-xs text-slate-400 max-w-xs text-center">
              When users apply to become sellers from their dashboard, their requests will appear here.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(r => {
            const isActing = acting === r.email;
            const isExpanded = expanded === r.email;
            return (
              <div key={r.email} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="p-4 flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-rose-100 to-violet-100 flex items-center justify-center border border-slate-100">
                    {r.photoURL
                      ? <img src={r.photoURL} alt="" className="w-full h-full object-cover" />
                      : <span className="text-base font-bold text-rose-600">{(r.displayName || r.email || '?')[0].toUpperCase()}</span>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-800 truncate">{r.displayName || '—'}</p>
                      <StatusBadge status={r.sellerRequest} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{r.email}</p>
                    {r.sellerRequestedAt && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Applied: {new Date(r.sellerRequestedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Expand details */}
                <button type="button" onClick={() => setExpanded(isExpanded ? null : r.email)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
                  <span>Details</span>
                  <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between"><span className="text-slate-400">Role</span><span className="font-semibold capitalize">{r.role || 'user'}</span></div>
                    {r.sellerRejectReason && (
                      <div className="flex gap-2 mt-1 p-2 bg-red-50 rounded-lg">
                        <AlertCircle size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-red-600">{r.sellerRejectReason}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions — only for pending */}
                {r.sellerRequest === 'pending' && (
                  <div className="flex gap-2 p-3 border-t border-slate-100">
                    <button type="button" onClick={() => handleApprove(r.email, r.displayName)} disabled={isActing}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-40 cursor-pointer">
                      {isActing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                      Approve
                    </button>
                    <button type="button" onClick={() => handleReject(r.email, r.displayName)} disabled={isActing}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-colors disabled:opacity-40 cursor-pointer">
                      {isActing ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminDashboardLayout>
  );
}
