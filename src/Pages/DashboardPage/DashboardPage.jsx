import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Package, Heart, MapPin, Eye,
  Loader2, Store, ChevronRight,
} from 'lucide-react';
import Swal from 'sweetalert2';
import DashboardLayout from '../../Component/DashboardLayout/DashboardLayout';
import { useAuth }     from '../../context/useAuth';
import { useCart, getProductImage, getProductName } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../api/axios';

// ─── Empty Cart SVG ───────────────────────────────────────────────────────────
const EmptyCartIllustration = () => (
  <svg width="112" height="96" viewBox="0 0 112 96" fill="none" className="mx-auto">
    <circle cx="58" cy="10" r="3" fill="#94A3B8" opacity="0.6" />
    <circle cx="72" cy="8" r="2.5" fill="#94A3B8" opacity="0.6" />
    <circle cx="50" cy="7.5" r="2" fill="#94A3B8" opacity="0.6" />
    <path d="M18 24h70l-8 30H26L18 24z" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
    <path d="M10 16H22l8 38" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <line x1="38" y1="34" x2="38" y2="46" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="50" y1="34" x2="50" y2="46" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="62" y1="34" x2="62" y2="46" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2" />
    <line x1="28" y1="42" x2="52" y2="42" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2" />
    <circle cx="74" cy="56" r="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
    <line x1="74" y1="50" x2="74" y2="59" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="74" cy="62" r="1.2" fill="#D97706" />
    <circle cx="34" cy="61" r="5" fill="white" stroke="#475569" strokeWidth="2.5" />
    <circle cx="36" cy="61" r="2" fill="#475569" />
    <circle cx="66" cy="61" r="5" fill="white" stroke="#475569" strokeWidth="2.5" />
    <circle cx="68" cy="61" r="2" fill="#475569" />
  </svg>
);

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ value, label, icon, borderColor, iconColor, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex-1 flex flex-row justify-between items-center p-4 bg-white rounded-lg border ${borderColor} min-w-0 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex flex-col gap-2">
        <span className="text-2xl font-bold text-gray-800 leading-none">{value}</span>
        <span className="text-xs text-gray-500 font-normal leading-4">{label}</span>
      </div>
      <div className={`flex items-center justify-center ${iconColor}`}>{icon}</div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { isAdmin, loading, dbUser, currentUser } = useAuth();
  const { items: cartItems, totalItems }           = useCart();
  const { items: wishlistItems, totalWishlist }    = useWishlist();
  const navigate = useNavigate();

  const [orders,           setOrders]           = useState([]);
  const [addresses,        setAddresses]        = useState([]);
  const [loadingData,      setLoadingData]      = useState(true);
  const [applyingForSeller,setApplyingForSeller]= useState(false);

  const email = dbUser?.email || currentUser?.email || '';

  // Admin redirect
  useEffect(() => {
    if (!loading && isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, loading, navigate]);

  // Fetch orders + addresses
  useEffect(() => {
    if (!email) { setLoadingData(false); return; }
    Promise.all([
      api.get(`/orders?buyerEmail=${encodeURIComponent(email)}`).then(r => setOrders(r.data)).catch(() => {}),
      api.get(`/addresses?email=${encodeURIComponent(email)}`).then(r => setAddresses(r.data)).catch(() => {}),
    ]).finally(() => setLoadingData(false));
  }, [email]);

  // Seller apply
  const handleSellerApply = async () => {
    if (!email) return;
    const sellerReq = dbUser?.sellerRequest;
    if (sellerReq === 'pending') {
      Swal.fire({ icon: 'info', title: 'Already applied', text: 'Your application is under review.', confirmButtonColor: '#e11d48' });
      return;
    }
    if (sellerReq === 'approved' || dbUser?.role === 'seller') {
      Swal.fire({ icon: 'success', title: 'You are already a seller!', confirmButtonColor: '#e11d48' });
      return;
    }
    const result = await Swal.fire({
      title: 'Apply to Become a Seller?',
      text: 'Your request will be reviewed by an admin.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, apply',
    });
    if (!result.isConfirmed) return;
    setApplyingForSeller(true);
    try {
      await api.put(`/users/${encodeURIComponent(email)}/request-seller`);
      Swal.fire({ icon: 'success', title: 'Application Sent!', text: 'Wait for admin approval.', timer: 2500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed', confirmButtonColor: '#e11d48' });
    } finally {
      setApplyingForSeller(false);
    }
  };

  const ongoingOrders  = orders.filter(o => !['delivered','cancelled'].includes(o.status)).length;
  const totalOrders    = orders.length;
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  const metrics = [
    {
      value: ongoingOrders,
      label: 'On Going Orders',
      icon: <ShoppingCart size={28} strokeWidth={1.8} />,
      borderColor: 'border-green-200',
      iconColor: 'text-green-500',
      onClick: () => navigate('/dashboard/orders'),
    },
    {
      value: totalItems,
      label: 'Products in Cart',
      icon: <ShoppingCart size={24} strokeWidth={1.8} />,
      borderColor: 'border-rose-200',
      iconColor: 'text-rose-400',
    },
    {
      value: totalWishlist,
      label: 'In Wishlist',
      icon: <Heart size={24} strokeWidth={1.8} />,
      borderColor: 'border-rose-200',
      iconColor: 'text-red-400',
      onClick: () => navigate('/dashboard/wishlist'),
    },
    {
      value: totalOrders,
      label: 'Total Ordered',
      icon: <Package size={24} strokeWidth={1.8} />,
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-400',
      onClick: () => navigate('/dashboard/orders'),
    },
  ];

  return (
    <DashboardLayout activeId="dashboard">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-bold text-gray-900 tracking-[-0.45px] leading-7"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Dashboard
        </h1>

        {/* Become a seller */}
        {dbUser?.role === 'user' && (
          <button
            type="button"
            onClick={handleSellerApply}
            disabled={applyingForSeller || dbUser?.sellerRequest === 'pending'}
            className={`flex items-center gap-1.5 px-4 h-9 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed
              ${dbUser?.sellerRequest === 'pending'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {applyingForSeller
              ? <><Loader2 size={13} className="animate-spin" /> Applying…</>
              : dbUser?.sellerRequest === 'pending'
                ? '⏳ Application Pending'
                : <><Store size={13} /> Become a Seller</>
            }
          </button>
        )}
      </div>

      {/* Metric cards */}
      {loadingData ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-white border border-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((m, i) => <MetricCard key={i} {...m} />)}
        </div>
      )}

      {/* Recent orders */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
            Recent Orders
          </h2>
          <button type="button" onClick={() => navigate('/dashboard/orders')}
            className="flex items-center gap-0.5 text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}>
            View all <ChevronRight size={11} />
          </button>
        </div>
        {loadingData ? (
          <div className="flex flex-col gap-2">
            {[1, 2].map((i) => <div key={i} className="h-14 animate-pulse bg-gray-50 rounded-lg" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-4 gap-2">
            <Eye size={20} strokeWidth={1.5} className="text-gray-200" />
            <p className="text-xs text-gray-400 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
              No orders yet
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {orders.slice(0, 3).map((order) => (
              <li key={order._id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex -space-x-2 shrink-0">
                    {(order.items || []).slice(0, 3).map((item, index) => (
                      item.image ? (
                        <img key={`${order._id}-${index}`} src={item.image} alt=""
                          className="h-9 w-9 rounded-full border-2 border-white object-cover" />
                      ) : (
                        <span key={`${order._id}-${index}`} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-100">
                          <Package size={14} className="text-gray-400" />
                        </span>
                      )
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] text-gray-400">#{order._id?.slice(-6).toUpperCase()}</p>
                    <p className="text-xs font-semibold text-gray-700 truncate">
                      {(order.items || []).slice(0, 2).map((item) => item.name).filter(Boolean).join(', ') || 'Order items'}
                      {(order.items || []).length > 2 ? ` +${order.items.length - 2} more` : ''}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {(order.items || []).reduce((count, item) => count + (Number(item.qty) || 0), 0)} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border
                    ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {order.status}
                  </span>
                  <span className="text-xs font-bold text-gray-700">${(order.subtotal || 0).toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Lower grid */}
      <div className="flex flex-col xl:flex-row gap-5">

        {/* Cart preview */}
        <div className="flex-1 flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden min-h-[350px]">
          <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
              My Cart
            </h3>
            <span className="text-xs font-semibold text-rose-600" style={{ fontFamily: "'Inter', sans-serif" }}>
              {totalItems > 0 ? `${totalItems} item${totalItems > 1 ? 's' : ''}` : 'No Items'}
            </span>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
              <EmptyCartIllustration />
              <p className="text-sm font-medium text-gray-400 text-center leading-5 mt-4"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                Your cart is empty
              </p>
              <button type="button" onClick={() => navigate('/products')}
                className="mt-3 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                Browse Products →
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 flex-1 overflow-y-auto">
              {cartItems.slice(0,5).map((item, i) => {
                const img  = getProductImage(item.product);
                const name = getProductName(item.product);
                return (
                  <li key={i} className="flex items-center gap-3 px-5 py-3">
                    {img
                      ? <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" onError={e => { e.target.style.display='none'; }} />
                      : <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {name}
                      </p>
                      <p className="text-[11px] text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Qty: {item.qty}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-rose-600 flex-shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>
                      ${((item.product?.price || 0) * item.qty).toFixed(2)}
                    </p>
                  </li>
                );
              })}
              {cartItems.length > 5 && (
                <li className="px-5 py-2 text-xs text-gray-400 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                  +{cartItems.length - 5} more items
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5 xl:w-[304px] w-full">

          {/* Default address */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-800 pb-3 border-b border-gray-100"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              Default Shipping Address
            </h3>
            {loadingData ? (
              <div className="h-16 animate-pulse bg-gray-50 rounded-lg" />
            ) : defaultAddress ? (
              <div className="flex items-start gap-2">
                <MapPin size={15} strokeWidth={1.5} className="text-rose-400 mt-0.5 flex-shrink-0" />
                <div>
                  {defaultAddress.label && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full mb-1 inline-block"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      {defaultAddress.label}
                    </span>
                  )}
                  <p className="text-xs text-gray-600 leading-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {defaultAddress.address}
                    {defaultAddress.city ? `, ${defaultAddress.city}` : ''}
                    {defaultAddress.country ? `, ${defaultAddress.country}` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-5 border border-dashed border-red-200 rounded-lg">
                <MapPin size={18} strokeWidth={1.5} className="text-gray-300" />
                <p className="text-xs text-gray-400 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                  No address yet
                </p>
                <button type="button" onClick={() => navigate('/dashboard/address')}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
                  Add address →
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-center pt-4 pb-2">
        <p className="text-xs text-gray-400 text-center leading-4" style={{ fontFamily: "'Inter', sans-serif" }}>
          © {new Date().getFullYear()} All rights reserved by Multiventor
        </p>
      </div>

    </DashboardLayout>
  );
}
