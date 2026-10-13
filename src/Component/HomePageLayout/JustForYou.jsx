import { useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useState, useEffect } from "react";
import api from "../../api/axios";

const PAGE_SIZE = 12;

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={9} className={i <= Math.round(rating) ? "text-[#FBBF24] fill-[#FBBF24]" : "text-[#E2E8F0] fill-[#E2E8F0]"} />
      ))}
    </div>
  );
}

const fmt = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function getOriginal(price, discount) {
  if (!discount || discount === "0%") return price;
  const pct = parseFloat(discount);
  if (!pct) return price;
  return Math.round(price / (1 - pct / 100));
}

function JustForYouCard({ product }) {
  const { addToCart, inCart } = useCart();
  const { toggleWishlist, inWishlist } = useWishlist();
  const id = product._id || product.id;
  const isInCart = inCart(id);
  const isWishlisted = inWishlist(id);
  const navigate = useNavigate();
  const original = getOriginal(product.price, product.discount);

  return (
    <div
      onClick={() => navigate(`/product/${id}`)}
      className="relative cursor-pointer flex flex-col justify-between bg-white rounded-xl p-3"
      style={{ border: "1px solid rgba(226,232,240,0.9)" }}>

      {product.discount && product.discount !== "0%" && (
        <span className="absolute top-2.5 left-2.5 z-10 px-1.5 py-0.5 rounded text-[9px] font-bold text-white bg-[#F43F5E]">
          {product.discount}
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

      <div className="flex items-center justify-center h-32 md:h-36 mb-2 rounded-lg bg-[#F8FAFC] overflow-hidden">
        {product.productImg
          ? <img src={product.productImg} alt={product.title} className="h-full w-full object-cover" />
          : <span className="text-4xl">📦</span>
        }
      </div>

      <div className="flex flex-col gap-1">
        <h4 className="text-[11px] md:text-[12px] font-medium text-[#1E293B] leading-[18px] line-clamp-2">{product.title}</h4>
        <div className="flex items-center gap-1">
          <StarRating rating={product.review} />
          <span className="text-[10px] md:text-[11px] font-bold text-[#334155]">{Number(product.review).toFixed(1)}</span>
          <span className="text-[10px] text-[#94A3B8]">({product.reviewPeopleQuantity})</span>
          <span className="text-[10px] text-[#CBD5E1]">·</span>
          <span className="text-[10px] text-[#64748B]">{product.sold} Sold</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] md:text-[12px] font-bold text-[#F43F5E]">{fmt(product.price)}</span>
          {original > product.price && (
            <span className="text-[10px] text-[#94A3B8] line-through">{fmt(original)}</span>
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

export default function JustForYou() {
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setLoading(true);
    api.get("/just-for-you")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Just for you fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const visible = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <section className="w-full">
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:pt-10 pb-8 md:pb-10">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-[-0.6px]">Just For You</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-3.5">
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl p-3 border border-slate-100">
                    <div className="h-32 md:h-36 bg-slate-100 rounded-lg mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-3/4 mb-1.5" />
                    <div className="h-3 bg-slate-100 rounded w-1/2 mb-1.5" />
                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
                    <div className="h-8 bg-slate-100 rounded-md" />
                  </div>
                ))
              : visible.map((p) => <JustForYouCard key={p._id} product={p} />)
            }
          </div>
          {!loading && hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="px-6 py-2.5 rounded-lg text-[12px] font-semibold text-[#F43F5E] hover:bg-[#FFF1F3] transition-colors cursor-pointer"
                style={{ border: "1px solid #F43F5E" }}>
                Load More Products
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
