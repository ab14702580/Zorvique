import { useState, useEffect } from 'react';
import {
  Mail, Loader2, RefreshCw, Search,
  CheckCircle, Trash2, MessageSquare,
  X, ChevronDown, User, Phone,
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminDashboardLayout from '../../Component/AdminDashboardLayout/AdminDashboardLayout';
import api from '../../api/axios';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  new:     { cls: 'bg-rose-100 text-rose-700 border-rose-200',         label: 'New',     dot: 'bg-rose-500' },
  read:    { cls: 'bg-amber-100 text-amber-700 border-amber-200',      label: 'Read',    dot: 'bg-amber-400' },
  replied: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200',label: 'Replied', dot: 'bg-emerald-500' },
};

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.new;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

const FILTER_TABS = ['all', 'new', 'read', 'replied'];

// ─── Reply Modal ──────────────────────────────────────────────────────────────
function ReplyModal({ item, onClose, onSave }) {
  const [status, setStatus] = useState(item.status || 'new');
  const [reply,  setReply]  = useState(item.adminReply || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(item._id, status, reply);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Reply to Contact Message</h3>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
            <X size={15} className="text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Sender info */}
          <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-800">
              {item.subject || `Message from ${item.name || 'Visitor'}`}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
              {item.name  && <span className="flex items-center gap-1"><User size={10} />{item.name}</span>}
              {item.email && <span className="flex items-center gap-1"><Mail size={10} />{item.email}</span>}
              {item.phone && <span className="flex items-center gap-1"><Phone size={10} />{item.phone}</span>}
              {item.createdAt && (
                <span>{new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-5 mt-1 bg-white rounded-lg p-3 border border-slate-100">
              {item.message}
            </p>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Update Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer">
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          {/* Reply note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Internal Note / Reply</label>
            <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
              placeholder="Add a note or reply for this message…"
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 transition" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex-1 h-9 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><CheckCircle size={13} /> Save</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Message Row ──────────────────────────────────────────────────────────────
function MessageRow({ item, onReply, onDelete, expanded, onExpand }) {
  return (
    <li className={item.status === 'new' ? 'bg-rose-50/30' : ''}>
      <div className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50/70 transition-colors group">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User size={15} className="text-slate-400" />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-sm font-semibold text-slate-700 truncate">
              {item.subject || `Message from ${item.name || 'Visitor'}`}
            </p>
            <StatusBadge status={item.status} />
            {item.adminReply && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                <MessageSquare size={9} /> Note added
              </span>
            )}
          </div>

          {/* Meta */}
          <p className="text-[11px] text-slate-400 flex flex-wrap gap-x-3">
            {item.name  && <span className="flex items-center gap-1"><User size={9} />{item.name}</span>}
            {item.email && <span className="flex items-center gap-1"><Mail size={9} />{item.email}</span>}
            {item.phone && <span className="flex items-center gap-1"><Phone size={9} />{item.phone}</span>}
            {item.createdAt && (
              <span>{new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            )}
          </p>

          {/* Expand */}
          <button type="button" onClick={onExpand}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 mt-1.5 cursor-pointer transition-colors">
            <ChevronDown size={11} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Hide message' : 'Show message'}
          </button>

          {expanded && (
            <p className="text-xs text-slate-600 mt-2 leading-5 bg-white px-3 py-2.5 rounded-xl border border-slate-100 shadow-sm">
              {item.message}
            </p>
          )}

          {/* Admin reply preview */}
          {item.adminReply && (
            <div className="mt-2 flex items-start gap-1.5 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
              <MessageSquare size={11} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-blue-700 leading-4">{item.adminReply}</p>
            </div>
          )}
        </div>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={() => onReply(item)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-[11px] font-semibold transition-colors cursor-pointer">
            <MessageSquare size={11} /> Reply
          </button>
          <button type="button" onClick={() => onDelete(item._id, item.subject || item.name)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </li>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminContactPage() {
  const [messages, setMessages]     = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [filter,   setFilter]       = useState('all');
  const [query,    setQuery]        = useState('');
  const [selected, setSelected]     = useState(null);
  const [expanded, setExpanded]     = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/contact-messages');
      setMessages(res.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to load messages', confirmButtonColor: '#e11d48' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  // ── Mark as read when expanded ───────────────────────────────────────────────
  const handleExpand = async (id) => {
    setExpanded(prev => (prev === id ? null : id));
    const msg = messages.find(m => m._id === id);
    if (msg && msg.status === 'new') {
      try {
        await api.put(`/admin/contact-messages/${id}/read`);
        setMessages(prev => prev.map(m => m._id === id ? { ...m, status: 'read' } : m));
      } catch { /* silent */ }
    }
  };

  // ── Save reply ───────────────────────────────────────────────────────────────
  const handleSave = async (id, status, adminReply) => {
    try {
      await api.put(`/admin/contact-messages/${id}/reply`, { adminReply });
      // also mark status update locally
      setMessages(prev => prev.map(m =>
        m._id === id ? { ...m, status: status === 'new' ? 'read' : status, adminReply } : m
      ));
      setSelected(null);
      Swal.fire({ icon: 'success', title: 'Saved!', timer: 1400, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to save', confirmButtonColor: '#e11d48' });
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id, label) => {
    const result = await Swal.fire({
      title: 'Delete this message?',
      text: label,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/admin/contact-messages/${id}`);
      setMessages(prev => prev.filter(m => m._id !== id));
      Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Delete failed', confirmButtonColor: '#e11d48' });
    }
  };

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const filtered = messages.filter(m =>
    (filter === 'all' || m.status === filter) &&
    (
      m.name?.toLowerCase().includes(query.toLowerCase()) ||
      m.email?.toLowerCase().includes(query.toLowerCase()) ||
      m.subject?.toLowerCase().includes(query.toLowerCase()) ||
      m.message?.toLowerCase().includes(query.toLowerCase())
    )
  );

  // Counts per status
  const counts = FILTER_TABS.reduce((acc, t) => ({
    ...acc,
    [t]: t === 'all' ? messages.length : messages.filter(m => m.status === t).length,
  }), {});

  const newCount = counts.new || 0;

  return (
    <AdminDashboardLayout>

      {/* Reply modal */}
      {selected && (
        <ReplyModal
          item={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
        />
      )}

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">Contact Messages</h1>
            {newCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-600 border border-rose-200">
                {newCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Messages submitted via the contact form
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-52">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search name, email, subject…"
              value={query} onChange={e => setQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition" />
          </div>
          <button type="button" onClick={fetchMessages}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 transition-all cursor-pointer shadow-sm">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ── Status filter tabs ── */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {FILTER_TABS.map(t => (
          <button key={t} type="button" onClick={() => setFilter(t)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-colors cursor-pointer
              ${filter === t
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600'
              }`}>
            {t === 'new' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold
              ${filter === t ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Messages list ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* List header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-slate-400" />
            <p className="text-sm font-bold text-slate-700">
              Messages
              <span className="ml-2 text-xs font-normal text-slate-400">({filtered.length})</span>
            </p>
          </div>
          {newCount > 0 && (
            <span className="text-[11px] text-slate-400">
              {newCount} unread — click a message to mark as read
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={24} className="animate-spin text-rose-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
            <Mail size={36} strokeWidth={1.2} />
            <p className="text-sm">No contact messages found</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {filtered.map(m => (
              <MessageRow
                key={m._id}
                item={m}
                onReply={setSelected}
                onDelete={handleDelete}
                expanded={expanded === m._id}
                onExpand={() => handleExpand(m._id)}
              />
            ))}
          </ul>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
