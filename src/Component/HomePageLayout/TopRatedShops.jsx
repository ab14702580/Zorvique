import { ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/axios";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={9}
          className={
            i <= Math.round(rating)
              ? "text-[#FBBF24] fill-[#FBBF24]"
              : "text-[#E2E8F0] fill-[#E2E8F0]"
          }
        />
      ))}
    </div>
  );
}

// ── Skeleton card ──────────────────────────────────────────────────────────────
function ShopSkeleton() {
  return (
    <div className="flex flex-col items-center p-4 md:p-5 bg-white rounded-xl border border-slate-100 animate-pulse">
      <div className="mb-3 w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-200" />
      <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
      <div className="h-3 w-20 bg-slate-200 rounded mb-1" />
      <div className="h-3 w-12 bg-slate-200 rounded mb-4" />
      <div className="h-7 w-full bg-slate-100 rounded-lg" />
    </div>
  );
}

function ShopCard({ shop }) {
  const navigate = useNavigate();
  const id = shop._id || shop.id;

  return (
    <div
      className="flex flex-col items-center p-4 md:p-5 bg-white rounded-xl"
      style={{ border: "1px solid rgba(226,232,240,0.9)", boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
    >
      {/* Avatar */}
      <div
        className="mb-3 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "#FFFFFF", border: `2px solid ${shop.avatarBorder || "#E2E8F0"}`, padding: "3px" }}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden flex flex-col items-center justify-center"
          style={{ background: shop.avatarBg || "#F8FAFC" }}
        >
          {shop.img ? (
            <img src={shop.img} alt={shop.name} className="w-full h-full object-cover" />
          ) : (
            <>
              <span className="font-extrabold leading-none text-sm" style={{ color: shop.textColor || "#475569" }}>
                {shop.name?.charAt(0)}
              </span>
              {shop.subText && (
                <span
                  className="font-semibold leading-none mt-0.5"
                  style={{ color: shop.subTextColor, fontSize: "6px" }}
                >
                  {shop.subText}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-1">
        <StarRating rating={shop.rating || 0} />
        <span className="text-[11px] font-bold text-[#1E293B]">{Number(shop.rating || 0).toFixed(1)}</span>
        <span className="text-[11px] text-[#94A3B8]">({shop.reviews || 0})</span>
      </div>

      <h4 className="text-[13px] md:text-[14px] font-bold text-[#0F172A] tracking-[-0.35px] text-center mb-0.5">
        {shop.name}
      </h4>

      {shop.subText && (
        <span className="text-[10px] font-medium mb-0.5" style={{ color: shop.subTextColor || "#64748B" }}>
          {shop.subText}
        </span>
      )}

      <span className="text-[11px] md:text-[12px] text-[#94A3B8] text-center mb-3 md:mb-4">
        {shop.products || 0} Products
      </span>

      <button
        onClick={() => navigate(`/shop/${id}`)}
        className="w-full flex items-center justify-center py-1.5 rounded-lg text-[11px] md:text-[12px] font-medium text-[#F43F5E] hover:bg-[#FFF1F3] transition-colors cursor-pointer"
        style={{ border: "1px solid #F43F5E" }}
      >
        Visit Shop
      </button>
    </div>
  );
}

export default function TopRatedShops() {
  const [shops,   setShops]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get("/shops")
      .then((res) => {
        // Sort by rating descending, take top 6
        const top6 = [...res.data]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6);
        setShops(top6);
      })
      .catch((err) => console.error("Shops fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Don't render the section at all if no shops exist
  if (!loading && shops.length === 0) return null;

  return (
    <section className="w-full">
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:pt-10 pb-8 md:pb-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-[-0.6px]">Top Rated Shops</h2>
            <button
              onClick={() => navigate('/shops')}
              className="flex items-center gap-1 text-sm font-medium text-[#475569] hover:text-[#F43F5E] transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-3.5">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ShopSkeleton key={i} />)
              : shops.map((shop) => <ShopCard key={shop._id} shop={shop} />)
            }
          </div>
        </div>
      </div>
    </section>
  );
}
