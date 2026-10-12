import { ShoppingCart, Star, Clock, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const fmt = (n) => `$${Number(n).toFixed(2)}`;

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={10}
          className={i <= Math.round(rating) ? "text-[#FBBF24] fill-[#FBBF24]" : "text-[#E5E7EB] fill-[#E5E7EB]"} />
      ))}
    </div>
  );
}

// discount string "30%" বা null → original price বের করব
function getOriginal(price, discount) {
  if (!discount || discount === "0%") return price;
  const pct = parseFloat(discount);
  return pct ? Math.round(price / (1 - pct / 100)) : price;
}

function ProductCard({ product, viewMode }) {
  const { addToCart, inCart }           = useCart();
  const { toggleWishlist, inWishlist }  = useWishlist();
  const navigate                        = useNavigate();

  const id           = product._id || product.id;
  const isInCart     = inCart(id);
  const isWishlisted = inWishlist(id);

  // field normalisation — product collection এর নতুন fields
  const title    = product.title   || product.name  || "—";
  const rating   = product.review  ?? product.rating ?? 0;
  const reviews  = product.reviewPeopleQuantity ?? product.reviews ?? 0;
  const sold     = product.sold    ?? 0;
  const price    = product.price   ?? 0;
  const original = product.original ?? getOriginal(price, product.discount);
  const image    = product.productImg || product.img || null;
  const isDigital  = product.digitalProduct ?? product.digital  ?? false;
  const isPreorder = product.preorder ?? false;
  const badge    = product.discount && product.discount !== "0%" ? product.discount : null;

  if (viewMode === "list") {
    return (
      <article
        onClick={() => navigate(`/product/${id}`)}
        className="relative cursor-pointer flex items-center gap-4 bg-white border border-[#F3F4F6] rounded-lg p-3 hover:shadow-md transition-shadow">

        {badge && (
          <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[10px] font-bold text-white bg-[#E11D48] rounded-full shadow-sm">
            {badge}
          </span>
        )}

        {/* Image */}
        <div className="w-24 h-20 bg-[#F9FAFB] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
          {image
            ? <img src={image} alt={title} className="w-full h-full object-cover" />
            : <span className="text-4xl">📦</span>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-semibold text-[#1F2937] truncate mb-1">{title}</h3>
          <div className="flex items-center gap-1.5 mb-1">
            <StarRating rating={rating} />
            <span className="text-[11px] font-bold text-[#1F2937]">{Number(rating).toFixed(1)}</span>
            <span className="text-[11px] text-[#6B7280]">({reviews})</span>
            <span className="text-[11px] text-[#D1D5DB]">·</span>
            <span className="text-[11px] text-[#6B7280]">{sold} Sold</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-[#E11D48]">{fmt(price)}</span>
            {original > price && (
              <span className="text-[11px] text-[#9CA3AF] line-through">{fmt(original)}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist({ ...product, id }); }}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#E5E7EB] hover:border-[#F43F5E] transition-colors cursor-pointer"
            aria-label="Add to wishlist">
            <Heart size={14} strokeWidth={1.5} className={isWishlisted ? "fill-[#E11D48] text-[#E11D48]" : "text-[#4B5563]"} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); addToCart({ ...product, id }); }}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#E5E7EB] hover:border-[#E11D48] transition-colors cursor-pointer">
            <ShoppingCart size={14} strokeWidth={1.5} className={isInCart ? "text-[#E11D48]" : "text-[#4B5563]"} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${id}`); }}
            className="px-4 py-1.5 bg-[#E11D48] text-white text-[12px] font-semibold rounded hover:bg-[#BE185D] transition-colors whitespace-nowrap cursor-pointer">
            {isPreorder ? "Preorder" : "Buy Now"}
          </button>
        </div>
      </article>
    );
  }

  /* ── Grid card ── */
  return (
    <article
      onClick={() => navigate(`/product/${id}`)}
      className="relative cursor-pointer flex flex-col justify-between bg-white border border-[#F3F4F6] rounded-lg p-3 hover:shadow-md transition-shadow group">

      {/* Badge */}
      {badge && (
        <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[10px] font-bold text-white bg-[#E11D48] rounded-full shadow-sm">
          {badge}
        </span>
      )}

      {/* Digital label */}
      {isDigital && (
        <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[9px] font-bold text-[#4F46E5] bg-[#EEF2FF] rounded-full">
          Digital
        </span>
      )}

      {/* Wishlist */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist({ ...product, id }); }}
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-[#FFF1F3] transition-colors"
        style={{ border: "1px solid #E5E7EB" }}
        aria-label="Add to wishlist">
        <Heart size={13} strokeWidth={1.5} className={isWishlisted ? "fill-[#E11D48] text-[#E11D48]" : "text-[#9CA3AF]"} />
      </button>

      {/* Image */}
      <div className="flex items-center justify-center h-44 bg-[#F9FAFB] rounded-md mb-3 overflow-hidden">
        {image
          ? <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
          : <span className="text-7xl transition-transform duration-200 group-hover:scale-110">📦</span>
        }
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 flex-1">
        <h3 className="text-[12px] font-semibold text-[#1F2937] leading-[16px] line-clamp-2">{title}</h3>
        <div className="flex items-center gap-1">
          <StarRating rating={rating} />
          <span className="text-[11px] font-bold text-[#1F2937]">{Number(rating).toFixed(1)}</span>
          <span className="text-[11px] text-[#6B7280]">({reviews})</span>
          <span className="text-[11px] text-[#D1D5DB]">·</span>
          <span className="text-[11px] text-[#6B7280]">{sold} Sold</span>
        </div>
        <div className="flex items-baseline gap-1.5 pb-1">
          <span className="text-[14px] font-bold text-[#E11D48]">{fmt(price)}</span>
          {original > price && (
            <span className="text-[11px] text-[#9CA3AF] line-through">{fmt(original)}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={(e) => { e.stopPropagation(); addToCart({ ...product, id }); }}
          className="w-8 h-8 flex items-center justify-center rounded border border-[#E5E7EB] hover:border-[#E11D48] transition-colors shrink-0 cursor-pointer">
          <ShoppingCart size={14} strokeWidth={1.5} className={isInCart ? "text-[#E11D48]" : "text-[#4B5563]"} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/product/${id}`); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#E11D48] text-white text-[12px] font-semibold rounded hover:bg-[#BE185D] transition-colors cursor-pointer">
          {isPreorder && <Clock size={12} />}
          {isPreorder ? "Preorder" : "Buy Now"}
        </button>
      </div>
    </article>
  );
}

export default function ProductGrid({ products, viewMode }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#9CA3AF]">
        <span className="text-6xl mb-4">🔍</span>
        <p className="text-[16px] font-semibold text-[#374151]">No products found</p>
        <p className="text-[13px] mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return viewMode === "list" ? (
    <div className="flex flex-col gap-3">
      {products.map((p) => <ProductCard key={p._id || p.id} product={p} viewMode="list" />)}
    </div>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => <ProductCard key={p._id || p.id} product={p} viewMode="grid" />)}
    </div>
  );
}
