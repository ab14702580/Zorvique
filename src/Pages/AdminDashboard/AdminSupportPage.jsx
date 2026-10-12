import { useState, useEffect } from 'react';
import {
  Ticket, Loader2, RefreshCw, Search,
  CheckCircle, Clock, Trash2, MessageSquare,
  X, ChevronDown, Mail, Phone, User,
  AlertCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminDashboardLayout from '../../Component/AdminDashboardLayout/AdminDashboardLayout';
import api from '../../api/axios';

// ─── Status configs ───────────────────────────────────────────────────────────
const ticketStatusCfg = {
  open:          { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Open' },
  'in-progress': { cls: 'bg-blue-100 text-blue-700 border-blue-200',          label: 'In Progress' },
  resolved:      { cls: 'bg-violet-100 text-violet-700 border-violet-200',    label: 'Resolved' },
  closed:        { cls: 'bg-slate-100 text-slate-500 border-slate-200',       label: 'Closed' },
};

const contactStatusCfg = {
  new:     { cls: 'bg-rose-100 text-rose-700 border-rose-200',         label: 'New' },
  read:    { cls: 'bg-amber-100 text-amber-700 border-amber-200',      label: 'Read' },
  replied: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200',label: 'Replied' },
};

function StatusBadge({ status, cfg }) {
  const c = cfg[status] || Object.values(cfg)[0];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.cls}`}>
      {c.label}
    </span>
  );
}

// ─── Reply Modal (shared) ─────────────────────────────────────────────────────
function ReplyModal({ item, type, onClose, onSave }) {
  const [status, setStatus] = useState(item.status || (type === 'ticket' ? 'open' : 'new'));
  const [reply,  setReply]  = useState(item.adminReply || '');
  const [saving, setSaving] = useState(false);

  const statusOptions = type === 'ticket'
    ? ['open', 'in-progress', 'resolved', 'closed']
    : ['new', 'read', 'replied'];

  const handleSave = async () => {
    setSaving(true);
    await onSave(item._id, status, reply);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">
            {type === 'ticket' ? 'Manage Ticket' : 'Reply to Contact'}
          </h3>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
            <X size={15} className="text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Info card */}
          <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {type === 'ticket' ? (
                <p className="text-sm font-semibold text-slate-800">{item.subject}</p>
              ) : (
                <p className="text-sm font-semibold text-slate-800">{item.subject || item.name}</p>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
              {item.email && (
                <span className="flex items-center gap-1"><Mail size={10} />{item.email}</span>
              )}
              {item.phone && (
                <span className="flex items-center gap-1"><Phone size={10} />{item.phone}</span>
              )}
              {(item.name && type === 'contact') && (
                <span className="flex items-center gap-1"><User size={10} />{item.name}</span>
              )}
              {item.createdAt && (
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-5 mt-1 bg-white rounded-lg p-2.5 border border-slate-100">
              {item.message}
            </p>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Update Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer">
              {statusOptions.map(s => (
                <option key={s} value={s} className="capitalize">{s.replace('-', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Reply */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Reply {type === 'ticket' ? '(visible to user in their ticket)' : '(internal note)'}
            </label>
            <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
              placeholder="Write your reply here…"
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

// ─── Shared list row ──────────────────────────────────────────────────────────
function MessageRow({ item, type, onReply, onDelete, expanded, onExpand }) {
  const cfg = type === 'ticket' ? ticketStatusCfg : contactStatusCfg;
  const title = type === 'ticket' ? item.subject : (item.subject || `Message from ${item.name || 'Visitor'}`);

  return (
    <li>
      <div className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50/60 transition-colors group">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-sm font-semibold text-slate-700 truncate">{title}</p>
            <StatusBadge status={item.status} cfg={cfg} />
            {item.adminReply && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                <MessageSquare size={9} /> Replied
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 flex flex-wrap gap-x-3">
            {item.email  && <span className="flex items-center gap-1"><Mail size={9} />{item.email}</span>}
            {item.name   && type === 'contact' && <span className="flex items-center gap-1"><User size={9} />{item.name}</span>}
            {item.category && <span className="capitalize">{item.category}</span>}
            {item.createdAt && <span>{new Date(item.createdAt).toLocaleDateString()}</span>}
          </p>

          {/* Expand message */}
          <button type="button" onClick={onExpand}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 mt-1 cursor-pointer">
            <ChevronDown size={11} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Hide' : 'Show'} message
          </button>
          {expanded && (
            <p className="text-xs text-slate-600 mt-2 leading-5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              {item.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={() => onReply(item)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-[11px] font-semibold transition-colors cursor-pointer">
            <MessageSquare size={11} /> Reply
          </button>
          <button type="button" onClick={() => onDelete(item._id, title)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </li>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminSupportPage() {
  // Active tab: 'tickets' | 'contacts'
  const [tab,      setTab]      = useState('tickets');

  // Tickets state
  const [tickets,     setTickets]     = useState([]);
  const [ticketsLoad, setTicketsLoad] = useState(true);
  const [ticketFilter,setTicketFilter]= useState('all');

  // Contact messages state
  const [contacts,      setContacts]      = useState([]);
  const [contactsLoad,  setContactsLoad]  = useState(true);
  const [contactFilter, setContactFilter] = useState('all');

  // Shared
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState(null);   // { item, type }
  const [expanded, setExpanded] = useState(null);

  // ── Fetch both ──────────────────────────────────────────────────────────────
  const fetchTickets = async () => {
    setTicketsLoad(true);
    try {
      const res = await api.get('/admin/tickets');
      setTickets(res.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to load tickets', confirmButtonColor: '#e11d48' });
    } finally { setTicketsLoad(false); }
  };

  const fetchContacts = async () => {
    setContactsLoad(true);
    try {
      const res = await api.get('/admin/contact-messages');
      setContacts(res.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to load messages', confirmButtonColor: '#e11d48' });
    } finally { setContactsLoad(false); }
  };

  useEffect(() => { fetchTickets(); fetchContacts(); }, []);

  // ── Save reply ──────────────────────────────────────────────────────────────
  const handleSave = async (id, status, adminReply) => {
    const type = selected?.type;
    try {
      if (type === 'ticket') {
        await api.put(`/admin/tickets/${id}/status`, { status, adminReply });
        setTickets(prev => prev.map(t => t._id === id ? { ...t, status, adminReply } : t));
      } else {
        await api.put(`/admin/contact-messages/${id}/reply`, { adminReply });
        setContacts(prev => prev.map(c => c._id === id ? { ...c, status: 'replied', adminReply } : c));
      }
      setSelected(null);
      Swal.fire({ icon: 'success', title: 'Saved!', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to save', confirmButtonColor: '#e11d48' });
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id, title, type) => {
    const result = await Swal.fire({
      title: 'Delete this item?',
      text: title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Delete',
    });
    if (!result.isConfirmed) return;
    try {
      if (type === 'ticket') {
        await api.delete(`/admin/tickets/${id}`);
        setTickets(prev => prev.filter(t => t._id !== id));
      } else {
        await api.delete(`/admin/contact-messages/${id}`);
        setContacts(prev => prev.filter(c => c._id !== id));
      }
      Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Delete failed', confirmButtonColor: '#e11d48' });
    }
  };

  // ── Filter helpers ──────────────────────────────────────────────────────────
  const TICKET_TABS  = ['all', 'open', 'in-progress', 'resolved', 'closed'];
  const CONTACT_TABS = ['all', 'new', 'read', 'replied'];

  const filteredTickets = tickets.filter(t =>
    (ticketFilter === 'all' || t.status === ticketFilter) &&
    (t.subject?.toLowerCase().includes(query.toLowerCase()) ||
     t.email?.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredContacts = contacts.filter(c =>
    (contactFilter === 'all' || c.status === contactFilter) &&
    (c.name?.toLowerCase().includes(query.toLowerCase()) ||
     c.email?.toLowerCase().includes(query.toLowerCase()) ||
     c.subject?.toLowerCase().includes(query.toLowerCase()))
  );

  // Unread counts for badge
  const newContactsCount = contacts.filter(c => c.status === 'new').length;
  const openTicketsCount = tickets.filter(t => t.status === 'open').length;

  return (
    <AdminDashboardLayout>

      {/* Reply Modal */}
      {selected && (
        <ReplyModal
          item={selected.item}
          type={selected.type}
          onClose={() => setSelected(null)}
          onSave={handleSave}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Support &amp; Contact</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage support tickets and contact form messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative w-52">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search…" value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition" />
          </div>
          {/* Refresh */}
          <button type="button"
            onClick={() => { fetchTickets(); fetchContacts(); }}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 transition-all cursor-pointer shadow-sm">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Main tabs */}
      <div className="flex gap-2 mb-5">
        <button type="button" onClick={() => setTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer
            ${tab === 'tickets' ? 'bg-rose-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'}`}>
          <Ticket size={14} />
          Support Tickets
          {openTicketsCount > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === 'tickets' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}>
              {openTicketsCount}
            </span>
          )}
        </button>
        <button type="button" onClick={() => setTab('contacts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer
            ${tab === 'contacts' ? 'bg-rose-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'}`}>
          <Mail size={14} />
          Contact Messages
          {newContactsCount > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === 'contacts' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}>
              {newContactsCount}
            </span>
          )}
        </button>
      </div>

      {/* ── TICKETS TAB ── */}
      {tab === 'tickets' && (
        <>
          {/* Status filter */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {TICKET_TABS.map(t => (
              <button key={t} type="button" onClick={() => setTicketFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors cursor-pointer
                  ${ticketFilter === t ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600'}`}>
                {t.replace('-', ' ')} ({t === 'all' ? tickets.length : tickets.filter(x => x.status === t).length})
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <Ticket size={14} className="text-slate-400" />
              <p className="text-sm font-bold text-slate-700">
                Tickets
                <span className="ml-2 text-xs font-normal text-slate-400">({filteredTickets.length})</span>
              </p>
            </div>

            {ticketsLoad ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={22} className="animate-spin text-rose-400" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                <Ticket size={32} strokeWidth={1.2} />
                <p className="text-sm">No tickets found</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {filteredTickets.map(t => (
                  <MessageRow
                    key={t._id}
                    item={t}
                    type="ticket"
                    onReply={item => setSelected({ item, type: 'ticket' })}
                    onDelete={(id, title) => handleDelete(id, title, 'ticket')}
                    expanded={expanded === t._id}
                    onExpand={() => setExpanded(expanded === t._id ? null : t._id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* ── CONTACTS TAB ── */}
      {tab === 'contacts' && (
        <>
          {/* Status filter */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {CONTACT_TABS.map(t => (
              <button key={t} type="button" onClick={() => setContactFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors cursor-pointer
                  ${contactFilter === t ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600'}`}>
                {t} ({t === 'all' ? contacts.length : contacts.filter(x => x.status === t).length})
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <Mail size={14} className="text-slate-400" />
              <p className="text-sm font-bold text-slate-700">
                Contact Messages
                <span className="ml-2 text-xs font-normal text-slate-400">({filteredContacts.length})</span>
              </p>
            </div>

            {contactsLoad ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={22} className="animate-spin text-rose-400" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                <Mail size={32} strokeWidth={1.2} />
                <p className="text-sm">No contact messages yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {filteredContacts.map(c => (
                  <MessageRow
                    key={c._id}
                    item={c}
                    type="contact"
                    onReply={item => setSelected({ item, type: 'contact' })}
                    onDelete={(id, title) => handleDelete(id, title, 'contact')}
                    expanded={expanded === c._id}
                    onExpand={() => setExpanded(expanded === c._id ? null : c._id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </AdminDashboardLayout>
  );
}
