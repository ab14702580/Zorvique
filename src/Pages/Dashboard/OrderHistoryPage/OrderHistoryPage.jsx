import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Loader2, RefreshCw, ChevronDown,
  Package, Truck, CheckCircle, XCircle, Clock,
  MapPin, Ban, BadgeCheck,
} from 'lucide-react';
import Swal from 'sweetalert2';
import DashboardLayout from '../../../Component/DashboardLayout/DashboardLayout';
import { useAuth } from '../../../context/useAuth';
import api from '../../../api/axios';

// ─── Status config ────────────────────────────────────────────────────────────
const statusCfg = {
  pending:    { icon: Clock,       cls: 'bg-amber-100 text-amber-700 border-amber-200',      label: 'Pending',    step: 0 },
  processing: { icon: Package,     cls: 'bg-blue-100 text-blue-700 border-blue-200',         label: 'Processing', step: 1 },
  shipped:    { icon: Truck,       cls: 'bg-violet-100 text-violet-700 border-violet-200',   label: 'Shipped',    step: 2 },
  delivered:  { icon: CheckCircle, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200',label: 'Delivered',  step: 3 },
  cancelled:  { icon: XCircle,     cls: 'bg-red-100 text-red-600 border-red-200',            label: 'Cancelled',  step: -1 },
};

function StatusBadge({ status }) {
  const cfg = statusCfg[status] || statusCfg.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.cls}`}>
      <Icon size={9} />
      {cfg.label}
    </span>
  );
}

// ── Progress stepper ──────────────────────────────────────────────────────────
function OrderProgress({ status }) {
  if (status === 'cancelled') return null;
  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const current = statusCfg[status]?.step ?? 0;
  return (
    <div className="flex items-center gap-0 pt-2">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 transition-all
              ${i <= current ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-[9px] font-medium whitespace-nowrap ${i <= current ? 'text-rose-600' : 'text-slate-400'}`}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mb-3.5 mx-0.5 rounded ${i < current ? 'bg-rose-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

const fmt = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Can cancel? within 24h and status === pending ─────────────────────────────
const canCancel = (order) => {
  if (order.status !== 'pending') return false;
  const hoursSince = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
  return hoursSince <= 24;
};

const hoursLeft = (order) => {
  const h = 24 - (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
  return Math.max(0, h).toFixed(1);
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrderHistoryPage() {
  const { currentUser } = useAuth();
  const email = currentUser?.email || '';

  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [cancelling,setCancelling]= useState(null);
  const [confirming,setConfirming]= useState(null);
  const [expanded,  setExpanded]  = useState(null);
  const [filter,    setFilter]    = useState('all');

  const fetchOrders = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.get(`/orders?buyerEmail=${encodeURIComponent(email)}`);
      setOrders(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Buyer confirms delivery ────────────────────────────────────────────────
  const handleConfirmDelivery = async (order) => {
    const result = await Swal.fire({
      title: 'Confirm Receipt?',
      html: `<p class="text-sm text-gray-500">Order #${order._id?.slice(-8).toUpperCase()}</p>
             <p class="text-sm text-gray-600 mt-1">Confirm that you received this order. Payment will be released to the seller.</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, I received it',
      cancelButtonText: 'Not yet',
    });
    if (!result.isConfirmed) return;
    setConfirming(order._id);
    try {
      await api.put(`/orders/${order._id}/buyer-confirm`);
      setOrders(prev => prev.map(o =>
        o._id === order._id ? { ...o, status: 'delivered', paymentStatus: 'released' } : o
      ));
      Swal.fire({ icon: 'success', title: 'Receipt Confirmed!', text: 'Thank you for confirming your order.', timer: 2000, showConfirmButton: false });
    } catch (err) {
      const msg = err.response?.data?.message || 'Confirmation failed.';
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#e11d48' });
    } finally {
      setConfirming(null);
    }
  };

  // ── Cancel order ──────────────────────────────────────────────────────────
  const handleCancel = async (order) => {
    const result = await Swal.fire({
      title: 'Cancel this order?',
      html: `<p class="text-sm text-gray-500">Order #${order._id?.slice(-8).toUpperCase()}</p>
             <p class="text-sm text-amber-600 mt-1">⏰ ${hoursLeft(order)}h left to cancel</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, cancel order',
      cancelButtonText:  'Keep order',
    });
    if (!result.isConfirmed) return;

    setCancelling(order._id);
    try {
      await api.put(`/orders/${order._id}/cancel`);
      setOrders(prev => prev.map(o =>
        o._id === order._id ? { ...o, status: 'cancelled', paymentStatus: 'refunded' } : o
      ));
      Swal.fire({
        icon: 'success',
        title: 'Order Cancelled',
        text: 'Your order has been cancelled and a refund will be processed.',
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Cancellation failed.';
      Swal.fire({ icon: 'error', title: 'Cannot Cancel', text: msg, confirmButtonColor: '#e11d48' });
    } finally {
      setCancelling(null);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const TABS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'all' ? orders.length : orders.filter(o => o.status === t).length;
    return acc;
  }, {});

  return (
    <DashboardLayout activeId="orders">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[14px] font-semibold text-gray-800 tracking-[-0.35px] leading-5"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          Order History
        </h1>
        <button type="button" onClick={fetchOrders}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
          title="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(t => (
          <button key={t} type="button" onClick={() => setFilter(t)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors cursor-pointer
              ${filter === t ? 'bg-rose-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-600'}`}
            style={{ fontFamily: "'Inter', sans-serif" }}>
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 size={22} className="animate-spin text-rose-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="w-full bg-white border border-gray-100 rounded-xl flex items-center px-8 py-14 min-h-[140px] shadow-sm">
          <div className="flex items-center gap-3">
            <ClipboardList size={20} strokeWidth={1.5} className="text-gray-300" />
            <span className="text-[12px] font-medium text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
              {filter === 'all' ? 'No orders yet. Start shopping to see your orders here.' : `No ${filter} orders.`}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(order => {
            const isExpanded  = expanded === order._id;
            const isCancelling = cancelling === order._id;
            const cancellable  = canCancel(order);
            const addr = order.shippingAddress;

            return (
              <div key={order._id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

                {/* Order header */}
                <div className="flex items-start justify-between px-5 py-4 gap-3 flex-wrap">
                  <div className="flex flex-col gap-1">
                    {/* Order ID + date */}
                    <p className="text-[11px] font-mono text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                      #{order._id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>

                  {/* Status + progress */}
                  <div className="flex flex-col items-center gap-0.5 min-w-[120px]">
                    <StatusBadge status={order.status} />
                    <OrderProgress status={order.status} />
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {fmt(order.subtotal)}
                    </p>
                    <p className="text-[11px] text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Confirm receipt — shipped or processing */}
                    {(order.status === 'shipped' || order.status === 'processing') && (
                      <button type="button"
                        onClick={() => handleConfirmDelivery(order)}
                        disabled={confirming === order._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        {confirming === order._id
                          ? <Loader2 size={11} className="animate-spin" />
                          : <BadgeCheck size={11} />
                        }
                        Confirm Receipt
                      </button>
                    )}

                    {/* Cancel button */}
                    {cancellable && (
                      <button type="button" onClick={() => handleCancel(order)} disabled={isCancelling}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        {isCancelling ? <Loader2 size={11} className="animate-spin" /> : <Ban size={11} />}
                        Cancel ({hoursLeft(order)}h left)
                      </button>
                    )}

                    {/* Expand */}
                    <button type="button" onClick={() => setExpanded(isExpanded ? null : order._id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      Details
                      <ChevronDown size={13} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50 flex flex-col gap-4">

                    {/* Items list */}
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        Items
                      </p>
                      <div className="flex flex-col gap-2">
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            {item.image
                              ? <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                              : <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                  <Package size={14} className="text-gray-300" />
                                </div>
                            }
                            <span className="flex-1 text-xs text-gray-700 leading-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {item.name}
                              <span className="text-gray-400 ml-1">× {item.qty}</span>
                            </span>
                            <span className="text-xs font-semibold text-gray-800 flex-shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {fmt(item.price * item.qty)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping address */}
                    {addr && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1"
                          style={{ fontFamily: "'Inter', sans-serif" }}>
                          Shipping To
                        </p>
                        <div className="flex items-start gap-2">
                          <MapPin size={13} className="text-rose-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-600 leading-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {addr.name && <span className="font-semibold">{addr.name} — </span>}
                            {addr.address}{addr.city ? `, ${addr.city}` : ''}{addr.country ? `, ${addr.country}` : ''}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Price summary */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      <div className="flex flex-col gap-1 text-gray-500">
                        <span>Payment: <span className={`font-semibold ${
                          order.paymentStatus === 'released' ? 'text-emerald-600'
                          : order.paymentStatus === 'refunded' ? 'text-blue-600'
                          : 'text-amber-600'
                        }`}>
                          {order.paymentStatus === 'released' ? 'Paid & Released to Seller'
                           : order.paymentStatus === 'refunded' ? 'Refunded'
                           : 'Held by Platform'}
                        </span></span>
                        {order.deliveryMethod && (
                          <span>Delivery: <span className="font-semibold capitalize text-gray-700">{order.deliveryMethod}</span></span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">Total: {fmt(order.subtotal)}</p>
                        <p className="text-rose-500">Admin fee (10%): {fmt(order.adminFee)}</p>
                      </div>
                    </div>

                    {/* Cancelled notice */}
                    {order.status === 'cancelled' && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                          This order was cancelled.
                          {order.cancelledAt && ` (${new Date(order.cancelledAt).toLocaleDateString()})`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
