import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronRight, ArrowRight, Star, ShoppingCart } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import api from "../../api/axios";

function useCountdown(targetHours = 6) {
  const [time, setTime] = useState({ h: targetHours, m: 0, s: 0 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        const { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");
  return { h: pad(time.h), m: pad(time.m), s: pad(time.s) };
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={10} className={i <= Math.round(rating) ? "text-[#FBBF24] fill-[#FBBF24]" : "text-[#E2E8F0] fill-[#E2E8F0]"} />
      ))}
    </div>
  );
}

const fmt = (n) => `$${Number(n).toFixed(2)}`;

function FlashProductCard({ product }) {
  const { toggleWishlist, inWishlist } = useWishlist();
  const { addToCart, inCart } = useCart();
  const id = product._id || product.id;
  const isWishlisted = inWishlist(id);
  const isInCart = inCart(id);
  const navigate = useNavigate();

  // discount থেকে original price
  const getOriginal = (price, discount) => {
    if (!discount || discount === "0%") return price;
    const pct = parseFloat(discount);
    if (!pct) return price;
    return Math.round(price / (1 - pct / 100));
  };
  const original = getOriginal(product.price, product.discount);

  return (
    <div
      onClick={() => navigate(`/product/${id}`)}
      className="relative cursor-pointer flex flex-col justify-between bg-white rounded-2xl p-4 flex-1 min-w-0"
      style={{ border: "1px solid #F1F5F9" }}>

      {product.discount && product.discount !== "0%" && (
        <span className="absolute top-3 left-3 z-10 px-1.5 py-0.5 rounded text-[9px] font-bold text-white bg-[#F43F5E]">
          {product.discount}
        </span>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist({ ...product, id }); }}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center z-10 cursor-pointer hover:bg-[#FFF1F3] transition-colors"
        style={{ border: "1px solid #E2E8F0" }}
        aria-label="Add to wishlist">
        <Heart size={16} strokeWidth={1.2} className={isWishlisted ? "fill-[#F43F5E] text-[#F43F5E]" : "text-[#94A3B8]"} />
      </button>

      <div className="flex items-center justify-center h-36 md:h-40 mb-3 rounded-xl bg-[#F8FAFC] overflow-hidden">
        {product.productImg
          ? <img src={product.productImg} alt={product.title} className="h-full w-full object-cover" />
          : <span className="text-6xl">📦</span>
        }
      </div>

      <div className="flex flex-col gap-1.5">
        <h4 className="text-[13px] md:text-[14px] font-bold text-[#0F172A] leading-5 tracking-[-0.35px] line-clamp-2">{product.title}</h4>
        <div className="flex items-center gap-2">
          <span className="text-[13px] md:text-[14px] font-bold text-[#F43F5E]">{fmt(product.price)}</span>
          {original > product.price && (
            <span className="text-[11px] md:text-[12px] text-[#94A3B8] line-through">{fmt(original)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 pb-2">
          <StarRating rating={product.review} />
          <span className="text-[11px] font-bold text-[#1E293B]">{Number(product.review).toFixed(1)}</span>
          <span className="text-[11px] text-[#64748B]">({product.reviewPeopleQuantity})</span>
          <span className="text-[11px] text-[#CBD5E1]">·</span>
          <span className="text-[11px] text-[#64748B]">{product.sold} Sold</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); addToCart({ ...product, id }); }}
            className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0 transition-colors hover:bg-[#E2E8F0] cursor-pointer"
            style={{ background: "#F1F5F9" }}
            aria-label="Add to cart">
            <ShoppingCart size={15} strokeWidth={1.2} className={isInCart ? "text-[#F43F5E]" : "text-[#475569]"} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${id}`); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] font-semibold text-white bg-[#F43F5E] hover:bg-[#E11D48] transition-colors cursor-pointer">
            Buy Now <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FlashSalePromoCard({ h, m, s }) {
  const navigate = useNavigate();
  return (
    <div className="relative flex flex-col justify-between rounded-2xl md:rounded-3xl p-6 md:p-7 overflow-hidden w-full md:w-[280px] md:shrink-0"
      style={{ background: "linear-gradient(173.9deg,#6C5457 0%,#5D4649 45%,#4B3639 100%)", boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.1)", minHeight: "300px" }}>
      <span className="absolute right-8 top-14 text-[50px] font-black leading-none opacity-10 select-none text-white">⚡</span>
      <div className="absolute bottom-20 -right-4 w-36 h-36 rounded-full opacity-35"
        style={{ border: "8px solid rgba(251,207,232,0.4)" }} />

      {/* Top */}
      <div className="relative z-10 flex flex-col gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-[11px] font-bold text-[#1E293B] w-fit shadow-sm">
          <span className="text-[#F43F5E]">⚡</span> Limited Time Only
        </span>
        <h3 className="text-3xl md:text-[48px] font-extrabold uppercase text-white leading-tight tracking-[-1px]">
          FLASH<br />SALE
        </h3>
        <p className="text-[11px] leading-5 max-w-[280px]" style={{ color: "rgba(255,228,230,0.8)" }}>
          Don't miss our Mega Flash Sale! Save up to 70% on thousands of products.
        </p>
      </div>

      {/* Bottom */}
      <div className="relative z-10 flex flex-col gap-2 pt-6">
        <span className="text-[11px] font-medium" style={{ color: "rgba(254,205,211,0.9)" }}>Sale ends in</span>
        <div className="flex items-center gap-2 pb-3">
          {[{ val: h, lbl: "Hours" }, { val: m, lbl: "Minutes" }].map((t, i) => (
            <div key={t.lbl} className="contents">
              <div className="flex flex-col items-center gap-1 px-3 py-2 bg-white rounded-xl min-w-[58px] shadow-sm">
                <span className="text-[18px] font-extrabold leading-5 text-[#F43F5E] text-center">{t.val}</span>
                <span className="text-[9px] font-medium text-[#94A3B8] text-center">{t.lbl}</span>
              </div>
              <span key={`sep${i}`} className="text-[16px] font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>:</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[58px]"
            style={{ background: "#1B2533", border: "1px solid rgba(51,65,85,0.5)" }}>
            <span className="text-[18px] font-extrabold leading-5 text-white text-center">{s}</span>
            <span className="text-[9px] font-medium text-[#94A3B8] text-center">Seconds</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/products?tag=flash')}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-bold text-white bg-[#F43F5E] hover:bg-[#E11D48] transition-colors cursor-pointer">
          Shop Now <ArrowRight size={15} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export default function FlashSaleProductShowcase() {
  const { h, m, s } = useCountdown(6);
  const navigate = useNavigate();
  const [flashProducts, setFlashProducts] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/flash-products")
      .then((res) => setFlashProducts(res.data))
      .catch((err) => console.error("Flash products fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const row1 = flashProducts.slice(0, 3);
  const row2 = flashProducts.slice(3, 5);

  // Skeleton card
  const CardSkeleton = () => (
    <div className="animate-pulse bg-white rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
      <div className="h-36 bg-slate-100 rounded-xl" />
      <div className="h-3 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="h-8 bg-slate-100 rounded-xl" />
    </div>
  );

  if (!loading && flashProducts.length === 0) return null;

  return (
    <section className="w-full">
      <div className="max-w-[1400px] mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-[-0.6px]">Flash Sale</h2>
            <button onClick={() => navigate('/products')} className="flex items-center gap-1 text-sm font-medium text-[#475569] hover:text-[#F43F5E] transition-colors cursor-pointer">
              <span>View All</span><ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Layout */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-5">
            <FlashSalePromoCard h={h} m={m} s={s} />
            <div className="flex flex-col gap-4 md:gap-5 flex-1 min-w-0">
              {loading ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                    {Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {row1.map((p) => <FlashProductCard key={p._id} product={p} />)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                    {row2.map((p) => <FlashProductCard key={p._id} product={p} />)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
