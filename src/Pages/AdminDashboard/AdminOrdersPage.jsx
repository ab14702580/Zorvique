import { useEffect, useState } from 'react';
import {
  ShoppingBag, AlertCircle, Loader2,
  Search, ChevronDown, Truck, DollarSign,
} from 'lucide-react';
import AdminDashboardLayout from '../../Component/AdminDashboardLayout/AdminDashboardLayout';
import api from '../../api/axios';

// ── Status badge ──────────────────────────────────────────────────────────────
function OrderStatus({ status }) {
  const map = {
    pending:    'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped:    'bg-violet-100 text-violet-700',
    delivered:  'bg-emerald-100 text-emerald-700',
    cancelled:  'bg-red-100 text-red-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {(status || 'pending').toUpperCase()}
    </span>
  );
}

function PaymentStatus({ status }) {
  const map = {
    held:     'bg-amber-100 text-amber-700',
    released: 'bg-emerald-100 text-emerald-700',
    refunded: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {(status || 'held').toUpperCase()}
    </span>
  );
}

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [query,   setQuery]   = useState('');
  const [filter,  setFilter]  = useState('all');
  const [acting,  setActing]  = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    setActing(id);
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
    } catch {
      setError('Status update failed.');
    } finally {
      setActing(null);
    }
  };

  const handleDeliver = async (id) => {
    if (!window.confirm('Mark as delivered? Payment will be released to the seller (90%).')) return;
    setActing(id);
    try {
      await api.put(`/orders/${id}/deliver`);
      setOrders(prev => prev.map(o =>
        o._id === id ? { ...o, status: 'delivered', paymentStatus: 'released' } : o
      ));
    } catch {
      setError('Delivery update failed.');
    } finally {
      setActing(null);
    }
  };

  const displayed = orders.filter(o =>
    (filter === 'all' || o.status === filter) &&
    (o.buyerEmail?.toLowerCase().includes(query.toLowerCase()) ||
     o._id?.includes(query))
  );

  const fmt = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <AdminDashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Orders</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage orders and release payments on delivery</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search buyer or order ID…"
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
        {['all', ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 cursor-pointer py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors
              ${filter === s
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600'
              }`}
          >
            {s} ({s === 'all' ? orders.length : orders.filter(o => o.status === s).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={22} className="animate-spin text-rose-400" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm gap-2">
            <ShoppingBag size={30} strokeWidth={1.2} />
            No orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Order</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Buyer</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Payment</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayed.map(o => (
                  <>
                    <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Order ID + date */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                          className="flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-rose-600"
                        >
                          <ChevronDown
                            size={12}
                            className={`transition-transform ${expanded === o._id ? 'rotate-180' : ''}`}
                          />
                          {o._id?.slice(-8)}
                        </button>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                        </p>
                      </td>

                      {/* Buyer */}
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-700 font-medium">{o.buyerEmail || '—'}</p>
                        <p className="text-[11px] text-slate-400">{o.sellerEmail || '—'}</p>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-800">{fmt(o.subtotal)}</p>
                        <p className="text-[11px] text-rose-500">Admin: {fmt(o.adminFee)}</p>
                      </td>

                      {/* Order status */}
                      <td className="px-4 py-3">
                        <OrderStatus status={o.status} />
                      </td>

                      {/* Payment status */}
                      <td className="px-4 py-3">
                        <PaymentStatus status={o.paymentStatus} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {/* Status select */}
                          {o.status !== 'delivered' && o.status !== 'cancelled' && (
                            <div className="relative">
                              <select
                                value={o.status}
                                onChange={e => handleStatusChange(o._id, e.target.value)}
                                disabled={acting === o._id}
                                className="h-7 pl-2 pr-6 rounded-lg bg-slate-100 text-xs text-slate-600 font-medium border-none focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none cursor-pointer disabled:opacity-40"
                              >
                                {STATUS_OPTIONS.filter(s => s !== 'delivered').map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                          )}

                          {/* Deliver + release payment */}
                          {o.status === 'shipped' && o.paymentStatus === 'held' && (
                            <button
                              type="button"
                              onClick={() => handleDeliver(o._id)}
                              disabled={acting === o._id}
                              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                            >
                              {acting === o._id
                                ? <Loader2 size={11} className="animate-spin" />
                                : <Truck size={11} />
                              }
                              Deliver
                            </button>
                          )}

                          {o.status === 'delivered' && (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                              <DollarSign size={11} /> Released
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded items */}
                    {expanded === o._id && (
                      <tr key={`${o._id}-exp`} className="bg-slate-50/80">
                        <td colSpan={6} className="px-6 py-3">
                          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Order Items</p>
                          <div className="flex flex-col gap-1">
                            {(o.items || []).map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-xs text-slate-600">
                                <span>{item.name} × {item.qty}</span>
                                <span className="font-semibold">{fmt(item.price * item.qty)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-2 pt-2 border-t border-slate-200 text-xs">
                            <span className="text-slate-500">Seller gets: <b className="text-slate-700">{fmt(o.sellerAmount)}</b></span>
                            <span className="text-rose-600">Admin fee (10%): <b>{fmt(o.adminFee)}</b></span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
