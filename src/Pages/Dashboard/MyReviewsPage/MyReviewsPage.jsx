import { useState, useEffect } from 'react';
import {
  Star, Loader2, RefreshCw, Package,
  CheckCircle, X, ChevronDown,
} from 'lucide-react';
import Swal from 'sweetalert2';
import DashboardLayout from '../../../Component/DashboardLayout/DashboardLayout';
import { useAuth } from '../../../context/useAuth';
import api from '../../../api/axios';

const inputCls =
  'w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 ' +
  'focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors';

// ─── Star picker ──────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="cursor-pointer transition-transform hover:scale-110"
          aria-label={`Rate ${n} star`}
        >
          <Star
            size={24}
            strokeWidth={1.5}
            className={
              n <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 text-slate-200'
            }
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-semibold text-amber-600">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
}

// ─── Review form for a single item ───────────────────────────────────────────
function ReviewForm({ item, orderId, sellerEmail, buyerEmail, onSuccess, onClose }) {
  const [rating,     setRating]     = useState(0);
  const [title,      setTitle]      = useState('');
  const [body,       setBody]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      Swal.fire({ icon: 'warning', title: 'Please select a rating', confirmButtonColor: '#e11d48' });
      return;
    }
    if (!body.trim()) {
      Swal.fire({ icon: 'warning', title: 'Please write a review', confirmButtonColor: '#e11d48' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/reviews', {
        productId:   item.productId || item._id || '',
        orderId,
        buyerEmail,
        sellerEmail: sellerEmail || '',
        rating,
        title:       title.trim(),
        body:        body.trim(),
      });
      onSuccess(item.productId || item._id || '');
      Swal.fire({ icon: 'success', title: 'Review submitted!', text: 'Thank you for your feedback.', timer: 2000, showConfirmButton: false });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review.';
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#e11d48' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-col gap-3 mt-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
          Review: {item.name}
        </p>
        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-rose-100 cursor-pointer">
          <X size={13} className="text-gray-400" />
        </button>
      </div>

      {/* Star rating */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>
          Rating *
        </label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>
          Review Title
        </label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Summarize your experience…" className={inputCls}
          style={{ fontFamily: "'Inter', sans-serif" }} />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>
          Your Review *
        </label>
        <textarea value={body} onChange={e => setBody(e.target.value)}
          rows={3} required
          placeholder="What did you like or dislike about this product?"
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }} />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose}
          className="px-4 h-8 border border-gray-200 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          Cancel
        </button>
        <button type="submit" disabled={submitting}
          className="flex items-center gap-1.5 px-4 h-8 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          {submitting ? <><Loader2 size={12} className="animate-spin" />Submitting…</> : <><CheckCircle size={12} />Submit Review</>}
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyReviewsPage() {
  const { currentUser } = useAuth();
  const email = currentUser?.email || '';

  const [orders,       setOrders]       = useState([]);
  const [myReviews,    setMyReviews]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [expanded,     setExpanded]     = useState(null);
  const [activeReview, setActiveReview] = useState(null); // { orderId, item, sellerEmail }

  const fetchData = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const [ordersRes, reviewsRes] = await Promise.all([
        api.get(`/orders?buyerEmail=${encodeURIComponent(email)}`),
        api.get(`/reviews?buyerEmail=${encodeURIComponent(email)}`),
      ]);
      // Only delivered orders can be reviewed
      setOrders(ordersRes.data.filter(o => o.status === 'delivered'));
      setMyReviews(reviewsRes.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to load data', confirmButtonColor: '#e11d48' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [email]);

  // Check if buyer has already reviewed a productId
  const hasReviewed = (productId) =>
    myReviews.some(r => r.productId === productId);

  const handleReviewSuccess = (productId) => {
    // Locally add to reviewed set
    setMyReviews(prev => [...prev, { productId }]);
    setActiveReview(null);
  };

  const fmt = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <DashboardLayout activeId="reviews">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[14px] font-semibold text-gray-800 tracking-[-0.35px] leading-5"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          My Reviews
        </h1>
        <button type="button" onClick={fetchData}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
          title="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      <p className="text-[12px] text-gray-500 -mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
        Review products from your delivered orders
      </p>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 size={22} className="animate-spin text-rose-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="w-full bg-white border border-gray-100 rounded-xl flex items-center px-8 py-14 min-h-[140px] shadow-sm">
          <div className="flex items-center gap-3">
            <Star size={20} strokeWidth={1.5} className="text-gray-300" />
            <span className="text-[12px] font-medium text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
              No delivered orders yet. You can review products after they are delivered.
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => {
            const isExpanded = expanded === order._id;
            return (
              <div key={order._id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                {/* Order header */}
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : order._id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] font-mono text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                      #{order._id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      &nbsp;·&nbsp;{(order.items || []).length} item(s)&nbsp;·&nbsp;
                      <span className="font-semibold text-gray-600">{fmt(order.subtotal)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      Delivered
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Items */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-3">
                    {(order.items || []).map((item, idx) => {
                      const pid       = item.productId || item._id || '';
                      const reviewed  = hasReviewed(pid);
                      const isActive  = activeReview?.orderId === order._id && activeReview?.itemIdx === idx;

                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {item.image
                                ? <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                                : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <Package size={14} className="text-gray-400" />
                                  </div>
                              }
                              <div>
                                <p className="text-xs font-semibold text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                                  {item.name}
                                </p>
                                <p className="text-[11px] text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                                  {item.qty} × ${item.price}
                                </p>
                              </div>
                            </div>

                            {reviewed ? (
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600"
                                style={{ fontFamily: "'Inter', sans-serif" }}>
                                <CheckCircle size={13} /> Reviewed
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setActiveReview(
                                  isActive ? null : { orderId: order._id, itemIdx: idx, item, sellerEmail: order.sellerEmail }
                                )}
                                className="flex items-center gap-1.5 px-3 h-7 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer border border-rose-100"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                              >
                                <Star size={11} fill="currentColor" />
                                {isActive ? 'Cancel' : 'Write Review'}
                              </button>
                            )}
                          </div>

                          {/* Review form */}
                          {isActive && (
                            <ReviewForm
                              item={item}
                              orderId={order._id}
                              sellerEmail={order.sellerEmail}
                              buyerEmail={email}
                              onSuccess={handleReviewSuccess}
                              onClose={() => setActiveReview(null)}
                            />
                          )}
                        </div>
                      );
                    })}
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
