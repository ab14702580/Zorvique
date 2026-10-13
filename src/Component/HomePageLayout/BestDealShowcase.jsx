import { useNavigate } from "react-router-dom";
import { ShoppingCart, ChevronRight, Star, Heart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useState, useEffect } from "react";
import api from "../../api/axios";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={9} className={i <= Math.round(rating) ? "text-[#FBBF24] fill-[#FBBF24]" : "text-[#E2E8F0] fill-[#E2E8F0]"} />
      ))}
    </div>
  );
}

const fmt = (n) => `$${Number(n).toFixed(2)}`;

function BestDealCard({ product }) {
  const { addToCart, inCart } = useCart();
  const { toggleWishlist, inWishlist } = useWishlist();
  const id = product._id || product.id;
  const isInCart = inCart(id);
  const isWishlisted = inWishlist(id);
  const navigate = useNavigate();

  // discount badge — original থেকে % বের করব
  const discountPct = product.original > product.price
    ? Math.round((1 - product.price / product.original) * 100)
    : null;

  return (
    <div
      onClick={() => navigate(`/product/${id}`)}
      className="relative cursor-pointer flex flex-col justify-between bg-white rounded-xl p-3"
      style={{ border: "1px solid rgba(226,232,240,0.9)" }}>

      {discountPct && (
        <span className="absolute top-2.5 left-2.5 z-10 px-1.5 py-0.5 rounded text-[9px] font-bold text-white bg-[#F43F5E]">
          -{discountPct}%
        </span>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist({ ...product, id }); }}
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-[#FFF1F3] transition-colors"
        style={{ border: "1px solid #E2E8F0" }}
        aria-label="Add to wishlist"
      >
        <Heart size={13} strokeWidth={1.2} className={isWishlisted ? "fill-[#F43F5E] text-[#F43F5E]" : "text-[#94A3B8]"} />
      </button>

      {/* Product image */}
      <div className="flex items-center justify-center h-32 md:h-36 mb-2 rounded-lg bg-[#F8FAFC] overflow-hidden">
        {product.img
          ? <img src={product.img} alt={product.name} className="h-full w-full object-cover" />
          : <span className="text-4xl">📦</span>
        }
      </div>

      <div className="flex flex-col gap-1">
        <h4 className="text-[11px] md:text-[12px] font-medium text-[#1E293B] leading-[18px] line-clamp-2">
          {product.name}
        </h4>
        <div className="flex items-center gap-1">
          <StarRating rating={product.rating} />
          <span className="text-[10px] md:text-[11px] font-bold text-[#334155]">
            {Number(product.rating).toFixed(1)}
          </span>
          <span className="text-[10px] md:text-[11px] text-[#94A3B8]">({product.reviews})</span>
          <span className="text-[10px] text-[#CBD5E1]">·</span>
          <span className="text-[10px] md:text-[11px] text-[#64748B]">{product.sold} Sold</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] md:text-[12px] font-bold text-[#F43F5E]">{fmt(product.price)}</span>
          {product.original > product.price && (
            <span className="text-[10px] text-[#94A3B8] line-through">{fmt(product.original)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={(e) => { e.stopPropagation(); addToCart({ ...product, id }); }}
            className="w-8 h-8 flex items-center justify-center rounded-md shrink-0 transition-colors cursor-pointer"
            style={isInCart ? { background: "#E11D48" } : { background: "#F1F5F9" }}>
            <ShoppingCart size={15} strokeWidth={1.2} className={isInCart ? "text-white" : "text-[#475569]"} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${id}`); }}
            className="flex-1 flex items-center justify-center py-[7px] rounded-md text-[11px] md:text-[12px] font-medium text-white bg-[#F43F5E] hover:bg-[#E11D48] transition-colors cursor-pointer">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BestDealShowcase() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get("/best-deal-products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Best deal products fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="w-full">
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:pt-10 pb-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-[-0.6px]">Best Deal</h2>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-1 text-sm font-medium text-[#475569] hover:text-[#F43F5E] transition-colors cursor-pointer">
              <span>View All</span><ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-3.5">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl p-3 border border-slate-100">
                    <div className="h-32 md:h-36 bg-slate-100 rounded-lg mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-3/4 mb-1.5" />
                    <div className="h-3 bg-slate-100 rounded w-1/2 mb-1.5" />
                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
                    <div className="h-8 bg-slate-100 rounded-md" />
                  </div>
                ))
              : products.map((p) => <BestDealCard key={p._id} product={p} />)
            }
          </div>
        </div>
      </div>
    </section>
  );
}
