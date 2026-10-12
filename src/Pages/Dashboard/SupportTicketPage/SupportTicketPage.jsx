import { useState, useEffect } from 'react';
import { Ticket, Plus, Loader2, X, RefreshCw, MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2';
import DashboardLayout from '../../../Component/DashboardLayout/DashboardLayout';
import { useAuth } from '../../../context/useAuth';
import api from '../../../api/axios';

const inputCls =
  'w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 ' +
  'focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors';

const statusCfg = {
  open:        { cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'Open' },
  'in-progress':{ cls: 'text-blue-700 bg-blue-50 border-blue-200',         label: 'In Progress' },
  resolved:    { cls: 'text-violet-700 bg-violet-50 border-violet-200',    label: 'Resolved' },
  closed:      { cls: 'text-gray-500 bg-gray-100 border-gray-200',         label: 'Closed' },
};

function StatusBadge({ status }) {
  const cfg = statusCfg[status] || statusCfg.open;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function SupportTicketPage() {
  const { currentUser } = useAuth();
  const email = currentUser?.email || '';

  const [tickets,   setTickets]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [submitting,setSubmitting]= useState(false);
  const [showForm,  setShowForm]  = useState(false);
  const [form, setForm] = useState({ subject: '', category: '', message: '' });

  const fetchTickets = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.get(`/tickets?email=${encodeURIComponent(email)}`);
      setTickets(res.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to load tickets', confirmButtonColor: '#e11d48' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [email]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      Swal.fire({ icon: 'warning', title: 'Subject & message are required', confirmButtonColor: '#e11d48' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/tickets', {
        email,
        subject:  form.subject.trim(),
        category: form.category,
        message:  form.message.trim(),
      });
      setForm({ subject: '', category: '', message: '' });
      setShowForm(false);
      await fetchTickets();
      Swal.fire({ icon: 'success', title: 'Ticket submitted!', text: 'Our team will respond shortly.', timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Submission failed', text: 'Please try again.', confirmButtonColor: '#e11d48' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout activeId="support">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[14px] font-semibold text-gray-800 tracking-[-0.35px] leading-5"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          Support Tickets
        </h1>
        <div className="flex items-center gap-2">
          <button type="button" onClick={fetchTickets}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
            title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button
            type="button"
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-4 h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancel' : 'New Ticket'}
          </button>
        </div>
      </div>

      {/* New ticket form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
            Submit a New Ticket
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>Subject *</label>
            <input name="subject" value={form.subject} onChange={handleChange}
              placeholder="Brief description of your issue"
              className={inputCls} style={{ fontFamily: "'Inter', sans-serif" }} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className={`${inputCls} bg-white cursor-pointer`} style={{ fontFamily: "'Inter', sans-serif" }}>
              <option value="">Select category</option>
              <option value="order">Order Issue</option>
              <option value="payment">Payment</option>
              <option value="delivery">Delivery</option>
              <option value="return">Return / Refund</option>
              <option value="account">Account</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>Message *</label>
            <textarea name="message" value={form.message} onChange={handleChange}
              rows={4} placeholder="Describe your issue in detail…" required
              className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }} />
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 h-9 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 px-5 h-9 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              {submitting ? <><Loader2 size={13} className="animate-spin" /> Submitting…</> : 'Submit Ticket'}
            </button>
          </div>
        </form>
      )}

      {/* Tickets list */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 size={22} className="animate-spin text-rose-400" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="w-full bg-white border border-gray-100 rounded-xl flex items-center px-8 py-14 min-h-[140px]">
          <div className="flex items-center gap-3">
            <Ticket size={20} strokeWidth={1.5} className="text-gray-300" />
            <span className="text-[12px] font-medium text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
              No support tickets yet. Click "New Ticket" to create one.
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map(t => (
            <div key={t._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {t.subject}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {t.category && <span className="capitalize">{t.category} · </span>}
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </div>
              <p className="text-xs text-gray-600 leading-5 line-clamp-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                {t.message}
              </p>
              {/* Admin reply */}
              {t.adminReply && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <MessageSquare size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Admin Reply
                    </p>
                    <p className="text-xs text-blue-800" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {t.adminReply}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
