import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Home, ChevronRight, Award } from "lucide-react";
import api from "../../api/axios";

const ALPHA = ["All","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","#"];
const PAGE_SIZE = 12;

/* ── Brand card ── */
function BrandCard({ brand, onClick }) {
  return (
    <article
      onClick={onClick}
      className="cursor-pointer flex flex-col items-center p-6 bg-white border border-[#F3F4F6] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#E11D48] transition-all duration-200">
      {/* Logo placeholder */}
      <div className="flex items-center justify-center w-full h-[80px] mb-3">
        <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center">
          <span className="text-[22px] font-extrabold text-[#334155]">
            {brand.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      <h3 className="text-[14px] font-bold text-[#1E293B] text-center mb-1">{brand.name}</h3>
      <p className="text-[12px] text-[#94A3B8] mb-3">{brand.count} Products</p>

      <button
        onClick={onClick}
        className="w-full py-1.5 text-[12px] font-medium text-[#0284C7] border rounded-lg transition-colors hover:bg-sky-50"
        style={{ borderColor: "rgba(56,189,248,0.8)" }}>
        View Products
      </button>
    </article>
  );
}

/* ── Sidebar ── */
function Sidebar({ search, setSearch, activeLetter, setActiveLetter }) {
  return (
    <aside className="flex flex-col gap-6 w-full lg:w-[280px] shrink-0">
      <div className="bg-white border border-[#F3F4F6] shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-2xl p-5 flex flex-col gap-3">
        <h3 className="text-[14px] font-bold text-[#0F172A]">Search</h3>
        <div className="flex items-center border border-[#E5E7EB] rounded-lg overflow-hidden">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand..."
            className="flex-1 px-3.5 py-2.5 text-[12px] text-[#1E293B] placeholder-[#94A3B8] outline-none bg-white" />
          <button className="px-3 py-2.5 bg-[#0B1424] flex items-center justify-center shrink-0 hover:bg-[#1e2d45] transition-colors">
            <Search size={14} className="text-white" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#F3F4F6] shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-2xl p-5 flex flex-col gap-3">
        <h3 className="text-[14px] font-bold text-[#0F172A]">Alphabetical</h3>
        <div className="flex flex-wrap gap-2">
          {ALPHA.map((letter) => {
            const active = activeLetter === letter;
            return (
              <button key={letter} onClick={() => setActiveLetter(letter)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[11px] font-semibold transition-colors"
                style={active
                  ? { background: "#0B1424", color: "#fff" }
                  : { border: "1px solid #E5E7EB", color: "#475569", background: "#fff" }}>
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-[#F3F4F6] shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-2xl p-6 flex flex-col items-center gap-0">
        <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
          style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <Award size={20} className="text-[#F59E0B]" />
        </div>
        <h4 className="text-[14px] font-bold text-[#0F172A] text-center">Become a Partner</h4>
        <p className="text-[12px] text-[#64748B] text-center mt-0.5 mb-4">Sell your products with us</p>
        <button className="w-full py-2.5 bg-[#0B1424] text-white text-[12px] font-semibold rounded-lg hover:bg-[#1e2d45] transition-colors">
          Apply Now
        </button>
      </div>
    </aside>
  );
}

/* ── Main page ── */
export default function BrandsPage() {
  const navigate = useNavigate();
  const [brands, setBrands]           = useState([]);   // [{ name, count }]
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [activeLetter, setLetter]     = useState("All");
  const [page, setPage]               = useState(1);

  // fetch products, extract unique brands with product count
  useEffect(() => {
    api.get("/products")
      .then((res) => {
        const countMap = {};
        res.data.forEach((p) => {
          const b = p.brands || p.brand;
          if (b) countMap[b] = (countMap[b] || 0) + 1;
        });
        const list = Object.entries(countMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setBrands(list);
      })
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...brands];
    if (search.trim())
      list = list.filter((b) => b.name.toLowerCase().includes(search.trim().toLowerCase()));
    if (activeLetter !== "All") {
      if (activeLetter === "#") list = list.filter((b) => /^[^a-zA-Z]/.test(b.name));
      else list = list.filter((b) => b.name.toUpperCase().startsWith(activeLetter));
    }
    return list;
  }, [brands, search, activeLetter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pageNums = () => {
    const nums = [], start = Math.max(1, safePage - 2), end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };
  const goPage = (n) => { setPage(Math.max(1, Math.min(n, totalPages))); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleBrandClick = (brandName) => {
    navigate(`/products?brand=${encodeURIComponent(brandName)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <nav className="flex items-center gap-1 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="flex items-center gap-1 text-[12px] text-[#64748B] hover:text-[#0B1424] transition-colors">
            <Home size={14} className="text-[#94A3B8]" /><span>Home</span>
          </Link>
          <ChevronRight size={12} className="text-[#94A3B8]" />
          <span className="text-[12px] font-medium text-[#475569]">All Brands</span>
        </nav>

        <div className="mb-7">
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-[-0.6px]">All Brands</h1>
          <p className="text-[14px] text-[#64748B] mt-1">Browse products from your favourite brands</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <Sidebar search={search} setSearch={(v) => { setSearch(v); setPage(1); }}
            activeLetter={activeLetter} setActiveLetter={(v) => { setLetter(v); setPage(1); }} />

          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <h2 className="text-[16px] font-bold text-[#0F172A] tracking-[-0.4px]">
              {loading ? "Loading..." : `${filtered.length} Brands Found`}
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({length:8}).map((_,i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#F3F4F6] p-6 animate-pulse flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-200" />
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                    <div className="h-8 bg-slate-200 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : paginated.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map((brand) => (
                  <BrandCard key={brand.name} brand={brand} onClick={() => handleBrandClick(brand.name)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-[#9CA3AF]">
                <span className="text-5xl mb-3">🔍</span>
                <p className="text-[15px] font-semibold text-[#374151]">No brands found</p>
                <p className="text-[13px] mt-1">Try a different search or letter</p>
              </div>
            )}

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9] flex-wrap gap-3">
                <p className="text-[12px] text-[#64748B]">
                  Showing <span className="text-[#0F172A] font-semibold">{(safePage-1)*PAGE_SIZE+1} to {Math.min(safePage*PAGE_SIZE, filtered.length)}</span> of <span className="text-[#0F172A] font-semibold">{filtered.length}</span>
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
      </div>
    </div>
  );
}
