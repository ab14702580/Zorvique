import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ChevronRight, Star, ArrowRight } from "lucide-react";
import api from "../../api/axios";

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-[3px]">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={10}
          className={i <= Math.round(rating) ? "text-[#FBBF24] fill-[#FBBF24]" : "text-[#CBD5E1] fill-[#CBD5E1]"} />
      ))}
    </div>
  );
}

function ShopCard({ shop }) {
  const navigate = useNavigate();
  const id = shop._id || shop.id;

  return (
    <article className="relative flex flex-col bg-white border border-[rgba(226,232,240,0.9)] rounded-xl overflow-visible hover:shadow-lg transition-shadow duration-200">

      {/* Banner */}
      <div className="relative h-[128px] rounded-t-xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${shop.avatarBg || "#F8FAFC"} 0%, #F1F5F9 100%)` }}>
        {shop.bannerImg && (
          <img src={shop.bannerImg} alt={shop.name} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <span className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 text-[10px] font-bold text-white rounded"
          style={{ background: "#10B981" }}>Online</span>
        {/* shop name on banner — only if no banner image */}
        {!shop.bannerImg && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[13px] font-bold tracking-wide uppercase opacity-40 text-[#334155]">
              {shop.name}
            </span>
          </div>
        )}
      </div>

      {/* Avatar — straddles banner */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[96px] z-20">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
          style={{ border: `2px solid ${shop.avatarBorder || "#E2E8F0"}`, boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.1)" }}>
          <div className="w-[54px] h-[54px] rounded-full overflow-hidden flex items-center justify-center"
            style={{ background: shop.avatarBg || "#F8FAFC" }}>
            {shop.img
              ? <img src={shop.img} alt={shop.name} className="w-full h-full object-cover" />
              : <span className="font-extrabold text-[14px]" style={{ color: shop.textColor || "#334155" }}>
                  {shop.name?.charAt(0)}
                </span>
            }
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col items-center pt-10 pb-4 px-4 gap-1 mt-[1px]">
        <h3 className="text-[16px] font-bold text-[#1E293B] text-center leading-6 mt-1">{shop.name}</h3>
        {shop.subText && (
          <p className="text-[11px] font-medium" style={{ color: shop.subTextColor || "#64748B" }}>{shop.subText}</p>
        )}
        <p className="text-[12px] text-[#94A3B8] text-center leading-4">{shop.products}+ items</p>
        <div className="flex items-center justify-center gap-1 pt-1">
          <StarRow rating={shop.rating} />
          <span className="text-[12px] font-bold text-[#334155]">{Number(shop.rating).toFixed(1)}</span>
          <span className="text-[12px] text-[#94A3B8]">({shop.reviews})</span>
        </div>
        <div className="w-full pt-4">
          <button
            onClick={() => navigate(`/shop/${id}`)}
            className="w-full flex items-center justify-center gap-1 py-[6px] px-4 border border-[#F43F5E] rounded-md text-[12px] font-semibold text-[#E11D48] hover:bg-[#FFF1F3] transition-colors cursor-pointer">
            Visit Store <ArrowRight size={12} strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  );
}

const PAGE_SIZE = 8;

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/shops")
      .then((res) => setShops(res.data))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(shops.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = shops.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pageNums = () => {
    const nums = [], start = Math.max(1, safePage - 2), end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };
  const goPage = (n) => { setPage(Math.max(1, Math.min(n, totalPages))); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-7">

        <nav className="flex items-center gap-1 mb-5" aria-label="Breadcrumb">
          <Link to="/" className="flex items-center gap-1 text-[12px] text-[#64748B] hover:text-[#E11D48] transition-colors">
            <Home size={14} className="text-[#94A3B8]" /><span>Home</span>
          </Link>
          <ChevronRight size={12} className="text-[#94A3B8]" />
          <span className="text-[12px] font-medium text-[#475569]">All Shops</span>
        </nav>

        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-[-0.6px]">All Shops</h1>
          <p className="text-[14px] text-[#64748B]">Explore our all shops and shop the products you love</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({length: 4}).map((_,i) => (
              <div key={i} className="bg-white rounded-xl border border-[#F1F5F9] animate-pulse">
                <div className="h-32 bg-slate-200 rounded-t-xl" />
                <div className="p-4 flex flex-col items-center gap-2 pt-10">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginated.map((shop) => <ShopCard key={shop._id} shop={shop} />)}
          </div>
        )}

        {/* Pagination */}
        {shops.length > PAGE_SIZE && (
          <div className="flex items-center justify-between pt-6 mt-2 border-t border-[#F1F5F9] flex-wrap gap-3">
            <p className="text-[12px] font-medium text-[#64748B]">
              Showing <span className="text-[#0F172A] font-semibold">{(safePage-1)*PAGE_SIZE+1} to {Math.min(safePage*PAGE_SIZE, shops.length)}</span> of <span className="text-[#0F172A] font-semibold">{shops.length}</span> results
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => goPage(safePage-1)} disabled={safePage===1}
                className="w-8 h-8 flex items-center justify-center rounded border border-[#E2E8F0] disabled:opacity-40 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors">‹</button>
              {pageNums().map((n) => (
                <button key={n} onClick={() => goPage(n)}
                  className="w-8 h-8 flex items-center justify-center rounded text-[12px] font-semibold transition-colors"
                  style={n===safePage?{background:"#E11D48",color:"#fff"}:{border:"1px solid #E2E8F0",color:"#374151"}}>
                  {n}
                </button>
              ))}
              <button onClick={() => goPage(safePage+1)} disabled={safePage===totalPages}
                className="w-8 h-8 flex items-center justify-center rounded border border-[#E2E8F0] disabled:opacity-40 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors">›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
