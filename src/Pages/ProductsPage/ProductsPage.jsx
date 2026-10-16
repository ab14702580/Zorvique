import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, List, SlidersHorizontal, X, ChevronDown, SearchX } from "lucide-react";
import FilterSidebar from "../../Component/ProductsLayout/FilterSidebar";
import ProductGrid from "../../Component/ProductsLayout/ProductGrid";
import api from "../../api/axios";

const DEFAULT_FILTERS = {
  price:      { min: 0, max: 0 },   // max set হবে products load এর পর
  sort:       "",
  digital:    false,
  preorder:   false,
  categories: [],
  brands:     [],
  colors:     [],
  sizes:      [],
};

const PAGE_SIZES = [10, 20, 40];

export default function ProductsPage() {
  const [searchParams]                = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [priceMax, setPriceMax]       = useState(0);
  const [filters, setFilters]         = useState(DEFAULT_FILTERS);
  const [viewMode, setViewMode]       = useState("grid");
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(20);
  const [sidebarOpen, setSidebar]     = useState(false);

  const urlCategory = searchParams.get("category") || "";
  const urlBrand    = searchParams.get("brand")    || "";
  const urlTag      = searchParams.get("tag")      || "";
  const urlSearch   = searchParams.get("q")         || "";

  // ── Fetch ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    api.get("/products")
      .then((res) => {
        const data = res.data;
        setAllProducts(data);

        // dynamic price max — সব product এর সর্বোচ্চ price
        const max = data.reduce((acc, p) => Math.max(acc, p.price || 0), 0);
        const roundedMax = Math.ceil(max / 100) * 100 || 1000; // nearest 100 round up
        setPriceMax(roundedMax);

        // pre-set filters from URL
        setFilters((f) => ({
          ...f,
          price:      { min: 0, max: roundedMax },
          categories: urlCategory ? [urlCategory] : [],
          brands:     urlBrand    ? [urlBrand]    : [],
        }));
      })
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory, urlBrand, urlTag]);

  const searchMatchedProducts = useMemo(() => {
    if (!urlSearch) return allProducts;
    const query = urlSearch.toLowerCase();
    return allProducts.filter((product) =>
      [product.title, product.name, product.description, product.category, product.brand]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [allProducts, urlSearch]);

  // ── Apply filters ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...searchMatchedProducts];

    // URL tag pre-filter (flash, popular, etc.)
    if (urlTag) list = list.filter((p) => (p.tags || []).includes(urlTag));

    // price
    list = list.filter((p) => p.price >= filters.price.min && p.price <= filters.price.max);

    // digital / preorder
    if (filters.digital)  list = list.filter((p) => p.digitalProduct || p.digital);
    if (filters.preorder) list = list.filter((p) => p.preorder);

    // categories
    if (filters.categories.length)
      list = list.filter((p) => filters.categories.includes(p.category));

    // brands
    if (filters.brands.length)
      list = list.filter((p) => filters.brands.includes(p.brands || p.brand));

    // sizes — product.color[].sizes[].size
    if (filters.sizes.length)
      list = list.filter((p) =>
        (p.color || []).some((c) =>
          (c.sizes || []).some((s) => filters.sizes.includes(s.size))
        )
      );

    // sort
    const r = (p) => p.review ?? p.rating ?? 0;
    if (filters.sort === "price_asc")  list.sort((a, b) => a.price - b.price);
    if (filters.sort === "price_desc") list.sort((a, b) => b.price - a.price);
    if (filters.sort === "rating")     list.sort((a, b) => r(b) - r(a));
    if (filters.sort === "newest")     list.sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return list;
  }, [searchMatchedProducts, filters, urlTag]);

  // ── Pagination ────────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const goPage = (n) => {
    setPage(Math.max(1, Math.min(n, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const pageNums = () => {
    const nums = [], start = Math.max(1, safePage - 2), end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };

  const handleClear = () => setFilters({
    ...DEFAULT_FILTERS,
    price: { min: 0, max: priceMax },
  });

  const pageTitle = urlSearch ? `Search: ${urlSearch}` : urlCategory || (urlTag ? `${urlTag.charAt(0).toUpperCase() + urlTag.slice(1)} Sale` : "All Products");

  // ── Skeleton ──────────────────────────────────────────────────────────────────
  const Skeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white border border-[#F3F4F6] rounded-lg p-3 animate-pulse">
          <div className="h-44 bg-slate-200 rounded-md mb-3" />
          <div className="h-3 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  );

  const sidebarProps = {
    filters,
    setFilters: (v) => { setFilters(v); setPage(1); },
    onClear: handleClear,
    products: searchMatchedProducts,
    priceMax,
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">

        {/* Mobile filter toggle */}
        <div className="flex lg:hidden items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-[#111827]">{pageTitle}</h1>
          <button onClick={() => setSidebar(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-lg bg-white hover:border-[#E11D48] transition-colors">
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40" onClick={() => setSidebar(false)} />
            <div className="w-72 bg-white h-full overflow-y-auto p-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-[#1F2937]">Filters</span>
                <button onClick={() => setSidebar(false)}><X size={20} className="text-[#6B7280]" /></button>
              </div>
              <FilterSidebar {...sidebarProps} />
            </div>
          </div>
        )}

        <div className="flex gap-6 items-start">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-[260px] shrink-0 sticky top-[84px]">
            <FilterSidebar {...sidebarProps} />
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Top bar */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F6]">
              <h1 className="hidden lg:block text-[20px] font-bold text-[#111827]">{pageTitle}</h1>
              <p className="text-[12px] text-[#6B7280]">
                {loading ? "Loading..." : <><span className="font-semibold text-[#374151]">{filtered.length}</span> results</>}
              </p>
              <div className="flex items-center gap-2">
                {["grid","list"].map((mode) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className="w-7 h-7 flex items-center justify-center rounded border transition-colors"
                    style={{ border: viewMode===mode?"1px solid #E11D48":"1px solid #E5E7EB", color: viewMode===mode?"#E11D48":"#9CA3AF" }}
                    aria-label={`${mode} view`}>
                    {mode==="grid" ? <LayoutGrid size={14}/> : <List size={14}/>}
                  </button>
                ))}
              </div>
            </div>

            {/* Active chips */}
            {(filters.categories.length>0||filters.brands.length>0||filters.sizes.length>0||filters.digital||filters.preorder) && (
              <div className="flex flex-wrap gap-2">
                {filters.categories.map((c) => (
                  <Chip key={c} label={c} onRemove={() => setFilters((f) => ({...f, categories: f.categories.filter((x)=>x!==c)}))} />
                ))}
                {filters.brands.map((b) => (
                  <Chip key={b} label={b} onRemove={() => setFilters((f) => ({...f, brands: f.brands.filter((x)=>x!==b)}))} />
                ))}
                {filters.sizes.map((s) => (
                  <Chip key={s} label={s} onRemove={() => setFilters((f) => ({...f, sizes: f.sizes.filter((x)=>x!==s)}))} />
                ))}
                {filters.digital && <Chip label="Digital" onRemove={() => setFilters((f) => ({...f, digital: false}))} />}
                {filters.preorder && <Chip label="Preorder" onRemove={() => setFilters((f) => ({...f, preorder: false}))} />}
              </div>
            )}

            {loading ? <Skeleton /> : filtered.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white px-6 py-12 text-center shadow-sm">
                <SearchX size={48} className="text-[#E11D48]" strokeWidth={1.5} />
                <h2 className="mt-4 text-xl font-bold text-[#0F172A]">No products found</h2>
                <p className="mt-2 max-w-md text-sm text-[#64748B]">
                  We couldn’t find anything matching “{urlSearch || pageTitle}”. Try a different keyword or clear the active filters.
                </p>
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#BE185D] cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ProductGrid products={paginated} viewMode={viewMode} />
            )}

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6] flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#4B5563]">Show</span>
                  <PageSizeDropdown value={pageSize} onChange={(v) => { setPageSize(v); setPage(1); }} />
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => goPage(safePage-1)} disabled={safePage===1}
                    className="w-7 h-7 cursor-pointer flex items-center justify-center rounded border border-[#E5E7EB] text-[#374151] disabled:opacity-40 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors">‹</button>
                  {pageNums().map((n) => (
                    <button key={n} onClick={() => goPage(n)}
                      className="w-7 h-7 flex items-center justify-center rounded text-[12px] font-semibold transition-colors"
                      style={n===safePage?{background:"#E11D48",color:"#fff"}:{border:"1px solid #E5E7EB",color:"#374151"}}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => goPage(safePage+1)} disabled={safePage===totalPages}
                    className="w-7 h-7 flex cursor-pointer items-center justify-center rounded border border-[#E5E7EB] text-[#374151] disabled:opacity-40 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors">›</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-[#FFF1F3] text-[#E11D48] text-[11px] font-medium rounded-full border border-[#FECDD3] cursor-pointer">
      {label}
      <button className="cursor-pointer" onClick={onRemove}><X size={10}/></button>
    </span>
  );
}

function PageSizeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] text-[#374151] border border-[#D1D5DB] rounded bg-white hover:border-[#E11D48] transition-colors cursor-pointer min-w-[56px] justify-between">
        <span>{value}</span>
        <ChevronDown size={12} className={`text-[#9CA3AF] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 left-0 bg-white border border-[#E5E7EB] rounded-md shadow-lg z-50 overflow-hidden min-w-[56px]">
          {PAGE_SIZES.map((s) => (
            <button key={s} onClick={() => { onChange(s); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[12px] transition-colors cursor-pointer"
              style={{
                background: value === s ? "#FFF1F3" : "white",
                color:      value === s ? "#E11D48" : "#374151",
                fontWeight: value === s ? "600" : "400",
              }}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
