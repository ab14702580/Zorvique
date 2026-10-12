import { useState, useEffect } from 'react';
import {
  Star, Loader2, RefreshCw, User, Search,
  BarChart2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Swal from 'sweetalert2';
import SellerDashboardLayout from '../../Component/SellerDashboardLayout/SellerDashboardLayout';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';

function StarRow({ rating, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold text-slate-500 w-6 text-right">{rating}★</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-slate-400 w-8">{count}</span>
    </div>
  );
}

function StarDisplay({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} strokeWidth={0}
          className={i <= Math.round(rating) ? 'fill-amber-400' : 'fill-slate-200'} />
      ))}
    </div>
  );
}

export default function SellerReviewsPage() {
  const { currentUser } = useAuth();
  const email = currentUser?.email || '';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState('');
  const [filter,  setFilter]  = useState('all'); // 'all' | '5' | '4' | '3' | '2' | '1'

  const fetchReviews = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.get(`/reviews?sellerEmail=${encodeURIComponent(email)}`);
      setReviews(res.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to load reviews', confirmButtonColor: '#6366f1' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [email]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total   = reviews.length;
  const avgRaw  = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const avg     = parseFloat(avgRaw.toFixed(1));

  const countByRating = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: reviews.filter(r => r.rating === n).length,
  }));

  const chartData = [5, 4, 3, 2, 1].map(n => ({
    star:  `${n}★`,
    Count: reviews.filter(r => r.rating === n).length,
  })).reverse();

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = reviews.filter(r => {
    const matchRating = filter === 'all' || r.rating === parseInt(filter);
    const matchQuery  = !query ||
      r.buyerEmail?.toLowerCase().includes(query.toLowerCase()) ||
      r.title?.toLowerCase().includes(query.toLowerCase()) ||
      r.body?.toLowerCase().includes(query.toLowerCase());
    return matchRating && matchQuery;
  });

  return (
    <SellerDashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reviews</h1>
          <p className="text-sm text-slate-400 mt-0.5">All product reviews from your store</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search reviews…" value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" />
          </div>
          <button type="button" onClick={fetchReviews}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer shadow-sm">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Average rating card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl font-extrabold text-slate-800">{total > 0 ? avg : '—'}</span>
            <StarDisplay rating={avg} size={18} />
            <span className="text-[12px] text-slate-400 mt-1">{total} reviews total</span>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {countByRating.map(({ star, count }) => (
              <StarRow key={star} rating={star} count={count} total={total} />
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} className="text-slate-400" />
            <p className="text-sm font-bold text-slate-700">Rating Distribution</p>
          </div>
          {total === 0 ? (
            <div className="h-36 flex items-center justify-center text-sm text-slate-400">No reviews yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="star" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f1f5f9' }}
                  cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="Count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Star filter tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {['all', '5', '4', '3', '2', '1'].map(f => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer
              ${filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'}`}>
            {f === 'all' ? `All (${total})` : `${f}★ (${reviews.filter(r => r.rating === parseInt(f)).length})`}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <Star size={14} className="text-amber-400 fill-amber-400" />
          <p className="text-sm font-bold text-slate-700">
            Reviews <span className="ml-1 text-xs font-normal text-slate-400">({filtered.length})</span>
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={24} className="animate-spin text-indigo-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
            <Star size={36} strokeWidth={1.2} />
            <p className="text-sm">No reviews yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {filtered.map(r => (
              <li key={r._id} className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={15} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-xs font-semibold text-slate-700 truncate">{r.buyerEmail}</p>
                      <StarDisplay rating={r.rating} size={12} />
                      <span className="text-[10px] font-bold text-amber-600">{r.rating}.0</span>
                      {r.createdAt && (
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {r.title && (
                      <p className="text-xs font-semibold text-slate-800 mb-0.5">{r.title}</p>
                    )}
                    {r.body && (
                      <p className="text-xs text-slate-600 leading-5">{r.body}</p>
                    )}
                    {r.productId && (
                      <p className="text-[10px] text-slate-400 mt-1">Product ID: {r.productId}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SellerDashboardLayout>
  );
}
