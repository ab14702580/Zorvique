import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag, Loader2, RefreshCw, ChevronDown,
  Package, Truck, CheckCircle, XCircle, Clock, Search, BadgeCheck,
} from 'lucide-react';
import Swal from 'sweetalert2';
import SellerDashboardLayout from '../../Component/SellerDashboardLayout/SellerDashboardLayout';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';

const statusCfg = {
  pending:    { icon: Clock,       cls: 'bg-amber-100 text-amber-700 border-amber-200',      label: 'Pending' },
  processing: { icon: Package,     cls: 'bg-blue-100 text-blue-700 border-blue-200',         label: 'Processing' },
  shipped:    { icon: Truck,       cls: 'bg-violet-100 text-violet-700 border-violet-200',   label: 'Shipped' },
  delivered:  { icon: CheckCircle, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200',label: 'Delivered' },
  cancelled:  { icon: XCircle,     cls: 'bg-red-100 text-red-600 border-red-200',            label: 'Cancelled' },
};

// Seller can advance these statuses
const SELLER_STATUS_OPTIONS = ['pending', 'processing', 'shipped'];

function StatusBadge({ status }) {
  const cfg = statusCfg[status] || statusCfg.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.cls}`}>
      <Icon size={9} /> {cfg.label}
    </span>
  );
}

function PayBadge({ status }) {
  const cfg = {
    held:     'bg-amber-100 text-amber-700',
    released: 'bg-emerald-100 text-emerald-700',
    refunded: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${cfg[status] || cfg.held}`}>
      {status}
    </span>
  );
}

const fmt = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Progress stepper (Pending → Processing → Shipped → Delivered)
function OrderProgress({ status }) {
  if (status === 'cancelled') return null;
  const steps  = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const stepIdx = { pending: 0, processing: 1, shipped: 2, delivered: 3 };
  const current = stepIdx[status] ?? 0;
  return (
    <div className="flex items-center gap-0 pt-1">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border-2 transition-all
              ${i <= current ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-[8px] font-medium whitespace-nowrap ${i <= current ? 'text-indigo-600' : 'text-slate-400'}`}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mb-3 mx-0.5 rounded ${i < current ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

const TABS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function SellerOrdersPage() {
  const { currentUser } = useAuth();
  const email = currentUser?.email || '';

  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [filter,   setFilter]   = useState('all');
  const [query,    setQuery]    = useState('');

  const fetchOrders = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.get(`/orders?sellerEmail=${encodeURIComponent(email)}`);
      setOrders(res.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to load orders', confirmButtonColor: '#6366f1' });
    } finally { setLoading(false); }
  }, [email]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Update order status (pending → processing → shipped) ────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setActing(id);
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
      Swal.fire({ icon: 'success', title: `Status → ${newStatus}`, timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Update failed', confirmButtonColor: '#6366f1' });
    } finally { setActing(null); }
  };

  // ── Seller marks order as delivered (shipped → delivered) ──────────────────
  const handleDeliver = async (order) => {
    const result = await Swal.fire({
      title: 'Mark as Delivered?',
      text: `Order #${order._id?.slice(-8).toUpperCase()} — payment will be released to you.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Mark Delivered',
    });
    if (!result.isConfirmed) return;
    setActing(order._id);
    try {
      await api.put(`/orders/${order._id}/deliver`);
      setOrders(prev => prev.map(o =>
        o._id === order._id ? { ...o, status: 'delivered', paymentStatus: 'released' } : o
      ));
      Swal.fire({ icon: 'success', title: 'Order Delivered!', text: 'Payment released to your account.', timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed', confirmButtonColor: '#6366f1' });
    } finally { setActing(null); }
  };
  const handleCancel = async (order) => {
    if (order.status !== 'pending') return;
    const result = await Swal.fire({
      title: 'Cancel this order?',
      text: `Order #${order._id?.slice(-8).toUpperCase()}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Cancel Order',
    });
    if (!result.isConfirmed) return;
    setActing(order._id);
    try {
      await api.put(`/orders/${order._id}/cancel`);
      setOrders(prev => prev.map(o =>
        o._id === order._id ? { ...o, status: 'cancelled', paymentStatus: 'refunded' } : o
      ));
      Swal.fire({ icon: 'success', title: 'Order cancelled', timer: 1400, showConfirmButton: false });
    } catch (err) {
      const msg = err.response?.data?.message || 'Cancellation failed.';
      Swal.fire({ icon: 'error', title: 'Cannot Cancel', text: msg, confirmButtonColor: '#6366f1' });
    } finally { setActing(null); }
  };

  const counts = TABS.reduce((acc, t) => ({
    ...acc, [t]: t === 'all' ? orders.length : orders.filter(o => o.status === t).length,
  }), {});

  const displayed = orders.filter(o =>
    (filter === 'all' || o.status === filter) &&
    (o.buyerEmail?.toLowerCase().includes(query.toLowerCase()) ||
     o._id?.includes(query))
  );

  return (
    <SellerDashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Orders</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage and track customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-52">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search buyer or order ID…" value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" />
          </div>
          <button type="button" onClick={fetchOrders}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer shadow-sm">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {TABS.map(t => (
          <button key={t} type="button" onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer
              ${filter === t ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'}`}>
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={22} className="animate-spin text-indigo-400" />
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
                  {['Order', 'Buyer', 'Amount', 'Status', 'Payment', 'Update Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayed.map(o => (
                  <>
                    <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Order ID */}
                      <td className="px-4 py-3">
                        <button type="button"
                          onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                          className="flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-indigo-600 cursor-pointer">
                          <ChevronDown size={12} className={`transition-transform ${expanded === o._id ? 'rotate-180' : ''}`} />
                          #{o._id?.slice(-8).toUpperCase()}
                        </button>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                        </p>
                      </td>
                      {/* Buyer */}
                      <td className="px-4 py-3 text-xs text-slate-700 max-w-[140px] truncate">{o.buyerEmail}</td>
                      {/* Amount */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-800">{fmt(o.sellerAmount)}</p>
                        <p className="text-[10px] text-slate-400">of {fmt(o.subtotal)}</p>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                      {/* Payment */}
                      <td className="px-4 py-3"><PayBadge status={o.paymentStatus} /></td>
                      {/* Status update */}
                      <td className="px-4 py-3">
                        {(o.status !== 'delivered' && o.status !== 'cancelled') ? (
                          <div className="relative w-28">
                            <select value={o.status}
                              onChange={e => handleStatusChange(o._id, e.target.value)}
                              disabled={acting === o._id}
                              className="w-full h-7 pl-2 pr-6 rounded-lg bg-slate-100 text-xs text-slate-600 font-medium border-none focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none cursor-pointer disabled:opacity-40">
                              {SELLER_STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 capitalize">{o.status}</span>
                        )}
                      </td>
                      {/* Cancel / Deliver */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          {/* Deliver button — available when shipped (or processing) */}
                          {(o.status === 'shipped' || o.status === 'processing') && (
                            <button type="button" onClick={() => handleDeliver(o)}
                              disabled={acting === o._id}
                              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-40">
                              {acting === o._id ? <Loader2 size={11} className="animate-spin" /> : <BadgeCheck size={11} />}
                              Deliver
                            </button>
                          )}
                          {/* Cancel — pending only */}
                          {o.status === 'pending' && (
                            <button type="button" onClick={() => handleCancel(o)}
                              disabled={acting === o._id}
                              className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-40">
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded items */}
                    {expanded === o._id && (
                      <tr key={`${o._id}-exp`} className="bg-slate-50/80">
                        <td colSpan={7} className="px-6 py-4">
                          {/* Progress stepper */}
                          <div className="max-w-sm mb-3">
                            <OrderProgress status={o.status} />
                          </div>
                          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Order Items</p>
                          <div className="flex flex-col gap-1.5">
                            {(o.items || []).map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-xs text-slate-600 bg-white rounded-lg px-3 py-2 border border-slate-100">
                                <div className="flex items-center gap-2">
                                  {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover border border-slate-100" />}
                                  <span>{item.name} × {item.qty}</span>
                                </div>
                                <span className="font-semibold">{fmt(item.price * item.qty)}</span>
                              </div>
                            ))}
                          </div>
                          {o.shippingAddress && (
                            <div className="mt-3 p-3 bg-white border border-slate-100 rounded-xl">
                              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Ship To</p>
                              <p className="text-xs text-slate-600">
                                {o.shippingAddress.name}, {o.shippingAddress.address}, {o.shippingAddress.city}
                              </p>
                            </div>
                          )}
                          <div className="flex justify-between mt-3 pt-2 border-t border-slate-200 text-xs">
                            <span className="text-slate-500">You receive: <b className="text-slate-700">{fmt(o.sellerAmount)}</b></span>
                            <span className="text-slate-400">Platform fee (10%): {fmt(o.adminFee)}</span>
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
    </SellerDashboardLayout>
  );
}
