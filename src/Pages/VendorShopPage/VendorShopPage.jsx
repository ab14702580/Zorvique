import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Star, Heart, ShoppingCart, Search, MessageCircle,
  ChevronRight, Home, ShoppingBag,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import api from "../../api/axios";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => `$${Number(n).toFixed(2)}`;

function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size}
          className={i <= Math.round(rating) ? "text-[#FBBF24] fill-[#FBBF24]" : "text-[#E2E8F0] fill-[#E2E8F0]"} />
      ))}
    </div>
  );
}

const PAGE_SIZE = 12;

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }) {
  const { addToCart, inCart }       = useCart();
  const { toggleWishlist, inWishlist } = useWishlist();
  const id           = product._id || product.id;
  const isInCart     = inCart(id);
  const isWishlisted = inWishlist(id);
  const navigate     = useNavigate();

  // discount % from discount string or original field
  const getOriginal = (price, discount) => {
    if (!discount || discount === "0%") return price;
    const pct = parseFloat(discount);
    return pct ? Math.round(price / (1 - pct / 100)) : price;
  };
  const original = product.original || getOriginal(product.price, product.discount);

  return (
    <article
      onClick={() => navigate(`/product/${id}`)}
      className="relative cursor-pointer flex flex-col justify-between bg-white border border-[rgba(226,232,240,0.8)] rounded-xl p-[14px] hover:shadow-md transition-shadow duration-200">

      {/* discount badge */}
      {product.discount && product.discount !== "0%" && (
        <span className="absolute top-2.5 left-2.5 z-10 px-1.5 py-0.5 rounded text-[9px] font-bold text-white bg-[#E11D48]">
          {product.discount}
        </span>
      )}

      {/* Wishlist */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist({ ...product, id }); }}
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-[#FFF1F3] transition-colors cursor-pointer"
        style={{ border: "1px solid #E2E8F0" }} aria-label="Add to wishlist">
        <Heart size={13} strokeWidth={1.2}
          className={isWishlisted ? "fill-[#F43F5E] text-[#F43F5E]" : "text-[#94A3B8]"} />
      </button>

      {/* Image */}
      <div className="flex items-center justify-center w-full h-[140px] bg-[#F8FAFC] rounded-md mb-3 overflow-hidden">
        {product.productImg || product.img
          ? <img src={product.productImg || product.img} alt={product.title || product.name}
              className="w-full h-full object-cover" />
          : <span className="text-5xl">📦</span>
        }
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <h3 className="text-[12px] font-bold text-[#0F172A] leading-4 line-clamp-2">
          {product.title || product.name}
        </h3>
        <div className="flex items-center gap-1">
          <StarRating rating={product.review || product.rating || 0} size={10} />
          <span className="text-[10px] font-bold text-[#F59E0B]">
            {Number(product.review || product.rating || 0).toFixed(1)}
          </span>
          <span className="text-[10px] text-[#64748B]">
            ({product.reviewPeopleQuantity || product.reviews || 0})
          </span>
          <span className="text-[10px] text-[#CBD5E1]">·</span>
          <span className="text-[10px] text-[#64748B]">{product.sold} Sold</span>
        </div>
        <div className="flex items-baseline gap-1.5 pt-1">
          <span className="text-[12px] font-extrabold text-[#E11D48]">{fmt(product.price)}</span>
          {original > product.price && (
            <span className="text-[10px] text-[#94A3B8] line-through">{fmt(original)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 pt-2">
          <button
            onClick={(e) => { e.stopPropagation(); addToCart({ ...product, id }); }}
            className="w-7 h-7 flex items-center justify-center rounded border border-[#E2E8F0] hover:border-[#E11D48] transition-colors shrink-0 cursor-pointer"
            aria-label="Add to cart">
            <ShoppingCart size={14} strokeWidth={1.5}
              className={isInCart ? "text-[#E11D48]" : "text-[#475569]"} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${id}`); }}
            className="flex-1 flex items-center justify-center py-[5px] bg-[#E11D48] text-white text-[11px] font-semibold rounded hover:bg-[#BE185D] transition-colors cursor-pointer">
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────

function StarRatingDisplay({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size}
          className={i <= Math.round(rating) ? "text-[#FBBF24] fill-[#FBBF24]" : "text-[#E2E8F0] fill-[#E2E8F0]"} />
      ))}
    </div>
  );
}

function ReviewsTab({ sellerEmail, preloadedReviews }) {
  const [reviews, setReviews]   = useState(preloadedReviews || []);
  const [loading, setLoading]   = useState(!preloadedReviews);

  useEffect(() => {
    // If reviews were already fetched by parent, use them
    if (preloadedReviews) {
      setReviews(preloadedReviews);
      setLoading(false);
      return;
    }
    if (!sellerEmail) return;
    setLoading(true);
    api.get(`/reviews?sellerEmail=${encodeURIComponent(sellerEmail)}`)
      .then(r => setReviews(r.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [sellerEmail, preloadedReviews]);

  const avgRating    = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const totalReviews = reviews.length;

  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* Summary card */}
      <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 flex flex-col items-center gap-2">
        <span className="text-4xl font-extrabold text-[#0F172A]">{avgRating}</span>
        <StarRatingDisplay rating={parseFloat(avgRating)} size={18} />
        <span className="text-[13px] text-[#64748B]">{totalReviews} reviews</span>

        {/* Rating breakdown */}
        {reviews.length > 0 && (
          <div className="w-full max-w-[280px] mt-3 flex flex-col gap-1.5">
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              const pct   = Math.round((count / reviews.length) * 100);
              return (
                <div key={star} className="flex items-center gap-2 text-[11px] text-[#64748B]">
                  <span className="w-2 text-right">{star}</span>
                  <Star size={10} className="text-[#FBBF24] fill-[#FBBF24] flex-shrink-0" />
                  <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FBBF24] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-7 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Individual reviews */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-[12px] text-[#94A3B8] text-center italic py-4">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map(r => (
            <div key={r._id} className="bg-white border border-[#F1F5F9] rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <StarRatingDisplay rating={r.rating} size={12} />
                  <span className="text-[11px] font-bold text-[#0F172A]">{r.title || ''}</span>
                </div>
                <span className="text-[10px] text-[#94A3B8]">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
              <p className="text-[12px] text-[#475569] mt-1">{r.body}</p>
              <p className="text-[10px] text-[#94A3B8] mt-1.5">{r.buyerEmail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ShopSkeleton() {
  return (
    <div className="bg-white border border-[#F1F5F9] rounded-2xl mb-4 overflow-hidden animate-pulse">
      <div className="flex items-center gap-4 px-8 pt-8 pb-6">
        <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const BANNERS = [
  { id: 1, label: "Summer Sale — Up to 50% Off",  bg: "linear-gradient(135deg,#FFF1F2 0%,#FFE4E6 100%)" },
  { id: 2, label: "New Arrivals This Week",         bg: "linear-gradient(135deg,#FFF1F2 0%,#FFE4E6 100%)" },
  { id: 3, label: "Free Shipping on Orders $50+",  bg: "linear-gradient(135deg,#FFF1F2 0%,#FFE4E6 100%)" },
];

export default function VendorShopPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [shop,        setShop]        = useState(null);
  const [products,    setProducts]    = useState([]);
  const [reviews,     setReviews]     = useState([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [activeTab,   setActiveTab]   = useState("products");
  const [query,       setQuery]       = useState("");
  const [page,        setPage]        = useState(1);

  // Computed avg rating from all actual reviews
  const liveAvgRating = reviews.length
    ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
    : 0;
  const liveReviewCount = reviews.length;

  // ── Fetch shop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoadingShop(true);
    api.get(`/shops/${id}`)
      .then((res) => {
        setShop(res.data);
        // Support both email and ownerEmail field names
        const sellerEmail = res.data?.ownerEmail || res.data?.email;
        if (sellerEmail) {
          // Fetch products
          api.get(`/products?sellerEmail=${encodeURIComponent(sellerEmail)}`)
            .then((r) => setProducts(r.data))
            .catch(() => setProducts([]));
          // Fetch all reviews for this seller to compute live rating
          api.get(`/reviews?sellerEmail=${encodeURIComponent(sellerEmail)}`)
            .then((r) => setReviews(r.data))
            .catch(() => setReviews([]));
        }
      })
      .catch(() => setShop(null))
      .finally(() => setLoadingShop(false));
  }, [id]);

  // ── Filter + paginate ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? products.filter((p) => (p.title || p.name || '').toLowerCase().includes(q))
      : products;
  }, [query, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goPage = (n) => {
    setPage(Math.max(1, Math.min(n, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNums = () => {
    const nums  = [];
    const start = Math.max(1, safePage - 1);
    const end   = Math.min(totalPages, start + 2);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loadingShop) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <ShopSkeleton />
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center flex flex-col gap-3">
          <p className="text-slate-500 text-sm">Shop not found.</p>
          <button onClick={() => navigate('/shops')} className="text-rose-500 text-sm font-semibold hover:underline">
            ← Back to Shops
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: shop.bgColor || '#F8FAFC' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Announcement Bar ── */}
        {shop.showAnnouncement && shop.announcementText && (
          <div className="rounded-xl mb-3 px-5 py-2.5 text-center text-xs font-semibold text-white"
            style={{ backgroundColor: shop.announcementBgColor || '#E11D48' }}>
            📢 {shop.announcementText}
          </div>
        )}

        {/* ── Hero Banner ── */}
        {shop.bannerImg && (
          <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-4">
            <img src={shop.bannerImg} alt="store banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center px-8">
              <div className="flex flex-col gap-2">
                {shop.bannerTitle && (
                  <h2 className="text-white font-extrabold text-2xl leading-tight drop-shadow-md">
                    {shop.bannerTitle}
                  </h2>
                )}
                {shop.bannerSubtitle && (
                  <p className="text-white/80 text-sm drop-shadow">{shop.bannerSubtitle}</p>
                )}
                {shop.bannerBtnText && (
                  <a href={shop.bannerBtnLink || '#'}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg w-fit shadow transition-opacity hover:opacity-90"
                    style={{ backgroundColor: shop.accentColor || '#E11D48' }}>
                    {shop.bannerBtnText}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1 py-4" aria-label="Breadcrumb">
          <Link to="/" className="flex items-center gap-1 text-[12px] text-[#64748B] hover:text-[#E11D48] transition-colors">
            <Home size={13} className="text-[#94A3B8]" /><span>Home</span>
          </Link>
          <ChevronRight size={12} className="text-[#94A3B8]" />
          <Link to="/shops" className="text-[12px] text-[#64748B] hover:text-[#E11D48] transition-colors">Shops</Link>
          <ChevronRight size={12} className="text-[#94A3B8]" />
          <span className="text-[12px] font-medium text-[#475569]">{shop.name}</span>
        </nav>

        {/* ── Shop Header ── */}
        <div className="bg-white border border-[#F1F5F9] rounded-2xl mb-4 overflow-hidden">
          <div className="flex items-center justify-between px-6 sm:px-8 pt-8 pb-6 flex-wrap gap-4">

            {/* Left: Avatar + info */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div
                  className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ border: `2px solid ${shop.avatarBorder || "#E2E8F0"}`, background: shop.avatarBg || "#F8FAFC" }}>
                  {shop.img
                    ? <img src={shop.img} alt={shop.name} className="w-full h-full object-cover" />
                    : <span className="text-2xl font-bold" style={{ color: shop.textColor }}>{shop.name?.charAt(0)}</span>
                  }
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] rounded-full bg-[#22C55E] block"
                  style={{ boxShadow: "0 0 0 2px #FFFFFF" }} />
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-[20px] font-bold text-[#0F172A] leading-7 tracking-[-0.5px]">{shop.name}</h1>
                  <span className="px-2 py-0.5 bg-[#10B981] text-white text-[11px] font-semibold rounded-full leading-[14px]">Online</span>
                </div>
                {shop.subText && (
                  <p className="text-[12px] font-medium" style={{ color: shop.subTextColor || "#64748B" }}>{shop.subText}</p>
                )}
                <p className="text-[12px] text-[#94A3B8]">{products.length} Products · {shop.ownerEmail || shop.email}</p>
              </div>
            </div>

            {/* Right: Rating + message */}
            <div className="flex items-center gap-0 shrink-0">
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-[14px] font-semibold text-[#334155]">
                    {liveAvgRating > 0 ? liveAvgRating.toFixed(1) : '—'}
                  </span>
                  <span className="text-[12px] text-[#94A3B8]">/ 5</span>
                </div>
                <StarRating rating={liveAvgRating} size={14} />
                <p className="text-[11px] text-[#94A3B8]">({liveReviewCount} reviews)</p>
              </div>
              <div className="w-px h-8 bg-[#E2E8F0] mx-6 shrink-0" />
              <button className="w-[38px] h-[38px] flex items-center justify-center rounded-full border border-[#FECDD3] hover:bg-[#FFF1F3] transition-colors cursor-pointer" aria-label="Chat">
                <MessageCircle size={20} strokeWidth={1.67} className="text-[#F43F5E]" />
              </button>
            </div>
          </div>

          <div className="mx-6 sm:mx-8 border-t border-[#F1F5F9]" />

          {/* Tabs + Search */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-3 flex-wrap gap-3">
            <div className="flex items-center gap-0">
              {["products", "reviews"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-5 py-[7px] rounded-lg text-[12px] font-medium tracking-[0.3px] transition-colors cursor-pointer first:mr-4"
                  style={activeTab === tab
                    ? { background: "#E11D48", color: "#FFFFFF", boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }
                    : { color: "#475569" }}>
                  {tab === "products" ? "All Products" : "Reviews"}
                </button>
              ))}
            </div>
            {activeTab === "products" && (
              <div className="relative w-full sm:w-[320px]">
                <input type="text" value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Search products..."
                  className="w-full h-[34px] pl-3 pr-9 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-[12px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#E11D48] transition-colors" />
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        {activeTab === "products" ? (
          <>
            {/* Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-5">
              {BANNERS.map((b) => (
                <div key={b.id}
                  className="flex items-center justify-center h-[128px] rounded-xl border border-[#FFF1F2] cursor-pointer hover:shadow-sm transition-shadow"
                  style={{ background: b.bg, boxShadow: "inset 0px 2px 4px 1px rgba(0,0,0,0.05)" }}>
                  <div className="flex flex-col items-center gap-2 opacity-60">
                    <ShoppingBag size={40} className="text-[#94A3B8]" />
                    <span className="text-[11px] font-semibold text-[#94A3B8] text-center px-4">{b.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Grid */}
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-[#9CA3AF]">
                <span className="text-5xl mb-3">🔍</span>
                <p className="text-[15px] font-semibold text-[#374151]">
                  {query ? "No products found" : "No products in this shop yet"}
                </p>
                {query && <p className="text-[12px] mt-1">Try a different keyword</p>}
              </div>
            ) : (
              <div className={`gap-[16px] ${
                shop.productLayout === 'grid-2' ? 'grid grid-cols-1 sm:grid-cols-2' :
                shop.productLayout === 'grid-3' ? 'grid grid-cols-2 sm:grid-cols-3' :
                shop.productLayout === 'list'   ? 'flex flex-col' :
                'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
              }`}>
                {paginated.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-between pt-7 mt-4 flex-wrap gap-3">
                <p className="text-[12px] text-[#64748B]">
                  Showing <span className="font-semibold text-[#0F172A]">
                    {(safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filtered.length)}
                  </span> of <span className="font-semibold text-[#0F172A]">{filtered.length}</span> results
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => goPage(safePage - 1)} disabled={safePage === 1}
                    className="w-7 h-7 flex items-center justify-center rounded border border-[#E2E8F0] text-[#374151] text-[13px] disabled:opacity-40 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors">‹</button>
                  {pageNums().map((n) => (
                    <button key={n} onClick={() => goPage(n)}
                      className="w-7 h-7 flex items-center justify-center rounded text-[12px] font-semibold transition-colors"
                      style={n === safePage
                        ? { background: "#E11D48", color: "#fff" }
                        : { border: "1px solid #E2E8F0", color: "#475569" }}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => goPage(safePage + 1)} disabled={safePage === totalPages}
                    className="w-7 h-7 flex items-center justify-center rounded border border-[#E2E8F0] text-[#374151] text-[13px] disabled:opacity-40 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors">›</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="pb-10">
            <ReviewsTab
              sellerEmail={shop.ownerEmail || shop.email}
              preloadedReviews={reviews}
            />
          </div>
        )}

        <div className="pb-12" />
      </div>
    </div>
  );
}
