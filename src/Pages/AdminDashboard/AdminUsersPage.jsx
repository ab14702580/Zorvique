import { useEffect, useState, useCallback } from 'react';
import {
  Search, RefreshCw, AlertCircle, Loader2,
  Ban, ShieldOff, TrendingUp, Crown,
  ChevronUp, ChevronDown, Users,
  Filter, X, UserCheck, UserX,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminDashboardLayout from '../../Component/AdminDashboardLayout/AdminDashboardLayout';
import api from '../../api/axios';

// ─── constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const ROLES     = ['all', 'user', 'seller', 'admin'];
const STATUSES  = ['all', 'active', 'banned'];

// ─── helpers ──────────────────────────────────────────────────────────────────
const roleCfg = {
  admin:  { cls: 'bg-violet-100 text-violet-700 border-violet-200', label: 'Admin' },
  seller: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Seller' },
  user:   { cls: 'bg-slate-100 text-slate-500 border-slate-200', label: 'User' },
};

function RoleBadge({ role }) {
  const cfg = roleCfg[role] || roleCfg.user;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function StatusBadge({ banned }) {
  return banned
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 border border-red-200"><Ban size={9} />Banned</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200"><UserCheck size={9} />Active</span>;
}

function SortIcon({ field, sort }) {
  if (sort.field !== field) return <ChevronUp size={12} className="text-slate-300" />;
  return sort.dir === 'asc'
    ? <ChevronUp size={12} className="text-rose-500" />
    : <ChevronDown size={12} className="text-rose-500" />;
}

function MiniStat({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50">
        <Icon size={17} className="text-slate-500" />
      </div>
      <div>
        <p className="text-[11px] text-slate-400 font-medium leading-none">{label}</p>
        <p className="text-xl font-bold text-slate-800 leading-tight mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ─── Role change modal ─────────────────────────────────────────────────────────
function RoleModal({ target, onClose, onConfirm }) {
  if (!target) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">Change Role</h3>
          <button type="button" onClick={onClose} className="cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4 truncate">
          <span className="font-semibold text-slate-700">{target.email}</span>
        </p>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Select new role</p>
        <div className="flex flex-col gap-2">
          {['user', 'seller', 'admin'].map(r => (
            <button
              key={r}
              type="button"
              onClick={() => r !== target.role && onConfirm(target.email, r)}
              disabled={r === target.role}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer
                ${r === target.role
                  ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-white border-slate-200 hover:border-rose-400 hover:bg-rose-50 text-slate-700 hover:text-rose-700'
                }`}
            >
              <span className="capitalize">{r}</span>
              {r === target.role && <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Current</span>}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users,      setUsers]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [acting,     setActing]     = useState(null);
  const [toast,      setToast]      = useState('');
  const [roleModal,  setRoleModal]  = useState(null);

  // ── filters (server-side) ──────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('all');
  const [statusFilter,setStatusFilter]= useState('all');
  const [page,        setPage]        = useState(1);
  const [sort,        setSort]        = useState({ field: 'displayName', dir: 'asc' });

  // ── local stats (from total counts) ──────────────────────────────────────
  const [stats, setStats] = useState({ total: 0, sellers: 0, admins: 0, banned: 0 });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── fetch (server-side) ────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: PAGE_SIZE });
      if (search)                        params.set('search', search);
      if (roleFilter !== 'all')          params.set('role', roleFilter);
      if (statusFilter === 'banned')     params.set('banned', 'true');
      if (statusFilter === 'active')     params.set('banned', 'false');

      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);

      // fetch global stats (all users, no filter) for stat cards
      const statsRes = await api.get('/admin/users?limit=1');
      // We use admin/stats for counts
      const statsApi = await api.get('/admin/stats');
      setStats({
        total:   statsApi.data.totalUsers,
        sellers: statsApi.data.totalSellers,
        admins:  0, // not in stats endpoint, approximate
        banned:  0,
      });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load users.', confirmButtonColor: '#e11d48' });
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(page); }, [page, search, roleFilter, statusFilter]);

  // reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  // ── search debounce ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── actions ────────────────────────────────────────────────────────────────
  const handleBan = async (email, currentBanned) => {
    const result = await Swal.fire({
      title: currentBanned ? 'Unban this user?' : 'Ban this user?',
      text: email,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentBanned ? '#10b981' : '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: currentBanned ? 'Yes, unban' : 'Yes, ban',
    });
    if (!result.isConfirmed) return;
    setActing(email);
    try {
      await api.put(`/admin/users/${encodeURIComponent(email)}/ban`, { banned: !currentBanned });
      setUsers(prev => prev.map(u => u.email === email ? { ...u, banned: !currentBanned } : u));
      showToast(currentBanned ? `${email} unbanned.` : `${email} banned.`);
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed', confirmButtonColor: '#e11d48' });
    } finally {
      setActing(null);
    }
  };

  const handleRoleChange = async (email, newRole) => {
    setActing(email);
    setRoleModal(null);
    try {
      await api.put(`/admin/users/${encodeURIComponent(email)}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
      showToast(`Role updated to "${newRole}".`);
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed', confirmButtonColor: '#e11d48' });
    } finally {
      setActing(null);
    }
  };

  // ── client-side sort (current page only) ──────────────────────────────────
  const toggleSort = (field) =>
    setSort(prev => prev.field === field
      ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { field, dir: 'asc' }
    );

  const sorted = [...users].sort((a, b) => {
    const av = (a[sort.field] || '').toString().toLowerCase();
    const bv = (b[sort.field] || '').toString().toLowerCase();
    return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  // ── pagination helpers ─────────────────────────────────────────────────────
  const pageNumbers = () => {
    const pages = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) pages.push(i);
    return pages;
  };

  return (
    <AdminDashboardLayout>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* ── Role modal ── */}
      <RoleModal
        target={roleModal}
        onClose={() => setRoleModal(null)}
        onConfirm={handleRoleChange}
      />

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">User Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage roles, ban users, monitor platform members</p>
        </div>
        <button
          type="button"
          onClick={() => fetchUsers(page)}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-rose-300 transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MiniStat label="Total Users"  value={stats.total}   icon={Users}      />
        <MiniStat label="Sellers"      value={stats.sellers} icon={TrendingUp}  />
        <MiniStat label="Total (page)" value={total}         icon={UserCheck}   />
        <MiniStat label="Showing"      value={users.length}  icon={ShieldOff}   />
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or email…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full h-9 pl-8 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setSearch(''); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer">
                <X size={13} className="text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Role filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={13} className="text-slate-400 flex-shrink-0" />
            {ROLES.map(r => (
              <button key={r} type="button" onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors cursor-pointer
                  ${roleFilter === r ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {r}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-1">
            {STATUSES.map(s => (
              <button key={s} type="button" onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors cursor-pointer
                  ${statusFilter === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-700">
            Members
            <span className="ml-2 text-xs font-normal text-slate-400">
              ({total} total · page {page} of {totalPages})
            </span>
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-52 gap-3">
            <Loader2 size={24} className="animate-spin text-rose-400" />
            <p className="text-sm text-slate-400">Loading users…</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 gap-3 text-slate-400">
            <Users size={36} strokeWidth={1.2} />
            <p className="text-sm">No users match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-5 py-3 text-left">
                    <button type="button" onClick={() => toggleSort('displayName')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hover:text-rose-600 cursor-pointer transition-colors">
                      User <SortIcon field="displayName" sort={sort} />
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left">
                    <button type="button" onClick={() => toggleSort('email')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hover:text-rose-600 cursor-pointer transition-colors">
                      Email <SortIcon field="email" sort={sort} />
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left">
                    <button type="button" onClick={() => toggleSort('role')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide hover:text-rose-600 cursor-pointer transition-colors">
                      Role <SortIcon field="role" sort={sort} />
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-3 py-3 pr-5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.map(u => {
                  const isActing = acting === u.email;
                  return (
                    <tr key={u.email} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-rose-100 to-violet-100 flex items-center justify-center border border-slate-100">
                            {u.photoURL
                              ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                              : <span className="text-sm font-bold text-rose-600">{(u.displayName || u.email || '?')[0].toUpperCase()}</span>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate leading-tight">{u.displayName || '—'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">#{u._id?.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs text-slate-600 truncate max-w-[180px]">{u.email}</p>
                      </td>
                      <td className="px-3 py-3"><RoleBadge role={u.role || 'user'} /></td>
                      <td className="px-3 py-3"><StatusBadge banned={u.banned} /></td>
                      <td className="px-3 py-3 pr-5">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" disabled={isActing}
                            onClick={() => setRoleModal({ email: u.email, role: u.role || 'user' })}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700 transition-colors disabled:opacity-40 cursor-pointer">
                            {isActing ? <Loader2 size={11} className="animate-spin" /> : <Crown size={11} />}
                            Role
                          </button>
                          <button type="button" disabled={isActing || u.role === 'admin'}
                            onClick={() => handleBan(u.email, u.banned)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40 cursor-pointer
                              ${u.banned ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                            {isActing ? <Loader2 size={11} className="animate-spin" /> : u.banned ? <UserX size={11} /> : <Ban size={11} />}
                            {u.banned ? 'Unban' : 'Ban'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400">
                  Showing <span className="font-semibold text-slate-600">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}</span> of <span className="font-semibold text-slate-600">{total}</span> users
                </p>

                <div className="flex items-center gap-1">
                  {/* Prev */}
                  <button type="button" disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                    <ChevronLeft size={14} />
                  </button>

                  {/* Page 1 if not in range */}
                  {pageNumbers()[0] > 1 && (
                    <>
                      <button type="button" onClick={() => setPage(1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-600 transition-colors cursor-pointer">
                        1
                      </button>
                      {pageNumbers()[0] > 2 && <span className="text-slate-400 text-xs px-1">…</span>}
                    </>
                  )}

                  {/* Page numbers */}
                  {pageNumbers().map(p => (
                    <button key={p} type="button" onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition-colors cursor-pointer
                        ${p === page ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'}`}>
                      {p}
                    </button>
                  ))}

                  {/* Last page if not in range */}
                  {pageNumbers()[pageNumbers().length - 1] < totalPages && (
                    <>
                      {pageNumbers()[pageNumbers().length - 1] < totalPages - 1 && <span className="text-slate-400 text-xs px-1">…</span>}
                      <button type="button" onClick={() => setPage(totalPages)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-600 transition-colors cursor-pointer">
                        {totalPages}
                      </button>
                    </>
                  )}

                  {/* Next */}
                  <button type="button" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
