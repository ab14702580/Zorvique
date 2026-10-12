import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

/* ── Collapsible section ── */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pb-3 border-b border-[#F3F4F6]">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full py-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[#374151]">{title}</span>
        {open ? <ChevronUp size={14} className="text-[#9CA3AF]" /> : <ChevronDown size={14} className="text-[#9CA3AF]" />}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

/* ── Toggle ── */
function Toggle({ checked, onChange }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="relative w-8 h-4 rounded-full transition-colors shrink-0"
      style={{ background: checked ? "#E11D48" : "#E5E7EB" }}>
      <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white border border-[#D1D5DB] transition-transform"
        style={{ transform: checked ? "translateX(2px)" : "translateX(-14px)" }} />
    </button>
  );
}

/* ── Color swatches ── */
const COLORS = ["#EF4444","#3B82F6","#22C55E","#FACC15","#000000","#FFFFFF","#F97316","#9CA3AF","#A855F7","#7F1D1D"];

/* ── Custom sort dropdown ── */
const SORT_OPTIONS = [
  { value: "",           label: "Default Sorting"    },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating",     label: "Top Rated"          },
  { value: "newest",     label: "Newest First"       },
];

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-[12px] text-[#4B5563] border border-[#E5E7EB] rounded-md bg-white hover:border-[#E11D48] transition-colors cursor-pointer"
      >
        <span>{selected.label}</span>
        <ChevronDown size={14} className={`text-[#9CA3AF] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-md shadow-lg z-50 overflow-hidden">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer"
              style={{
                background: value === opt.value ? "#FFF1F3" : "white",
                color:      value === opt.value ? "#E11D48" : "#4B5563",
                fontWeight: value === opt.value ? "600" : "400",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Dual range slider — priceMax prop driven ── */
function DualRangeSlider({ min, max, priceMax, onChange }) {
  if (!priceMax || priceMax === 0) return null;
  const minPct = (min / priceMax) * 100;
  const maxPct = (max / priceMax) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-1.5 rounded-full bg-[#E5E7EB] mt-2">
        <div className="absolute h-1.5 bg-[#E11D48] rounded-full"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }} />
        {/* min thumb */}
        <input type="range" min={0} max={priceMax} value={min}
          onChange={(e) => onChange(Math.min(Number(e.target.value), max - 1), max)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          style={{ pointerEvents: min > priceMax - 100 ? "none" : "auto" }} />
        {/* max thumb */}
        <input type="range" min={0} max={priceMax} value={max}
          onChange={(e) => onChange(min, Math.max(Number(e.target.value), min + 1))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
        {/* visual thumbs */}
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#E11D48] shadow z-10 pointer-events-none"
          style={{ left: `calc(${minPct}% - 8px)` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#E11D48] shadow z-10 pointer-events-none"
          style={{ left: `calc(${maxPct}% - 8px)` }} />
      </div>
      {/* number inputs */}
      <div className="flex items-center gap-2 mt-1">
        {[
          { val: min, change: (v) => onChange(Math.min(v, max - 1), max) },
          { val: max, change: (v) => onChange(min, Math.max(v, min + 1)) },
        ].map((inp, i) => (
          <div key={i} className="contents">
            {i === 1 && <div className="h-px w-3 bg-[#D1D5DB] shrink-0" />}
            <div className="flex items-center border border-[#E5E7EB] rounded overflow-hidden focus-within:border-[#E11D48] transition-colors">
              <span className="px-1.5 text-[11px] text-[#9CA3AF] bg-[#F9FAFB] border-r border-[#E5E7EB] select-none">$</span>
              <input type="number" value={inp.val} min={0} max={priceMax}
                onChange={(e) => inp.change(Number(e.target.value))}
                className="w-20 px-1.5 py-1 text-[12px] text-[#334155] outline-none bg-white" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Category checkboxes — product collection থেকে unique categories ── */
function CategoryList({ filters, setFilters, categories }) {
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? categories : categories.slice(0, 5);
  const toggle = (cat) => setFilters((f) => ({
    ...f,
    categories: f.categories.includes(cat)
      ? f.categories.filter((c) => c !== cat)
      : [...f.categories, cat],
  }));
  return (
    <div className="flex flex-col gap-2">
      {list.map((cat) => (
        <label key={cat} className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" checked={filters.categories.includes(cat)} onChange={() => toggle(cat)}
            className="w-3.5 h-3.5 rounded border border-[#D1D5DB] accent-[#E11D48] cursor-pointer" />
          <span className="text-[12px] text-[#334155] group-hover:text-[#E11D48] transition-colors">{cat}</span>
        </label>
      ))}
      {categories.length > 5 && (
        <button onClick={() => setShowAll(!showAll)}
          className="text-[11px] cursor-pointer font-semibold text-[#E11D48] hover:underline text-left mt-0.5">
          {showAll ? "Show Less" : "View More"}
        </button>
      )}
    </div>
  );
}

/* ── Brand checkboxes — product collection থেকে unique brands ── */
function BrandList({ filters, setFilters, brands }) {
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? brands : brands.slice(0, 5);
  const toggle = (b) => setFilters((f) => ({
    ...f,
    brands: f.brands.includes(b) ? f.brands.filter((x) => x !== b) : [...f.brands, b],
  }));
  return (
    <div className="flex flex-col gap-2">
      {list.map((b) => (
        <label key={b} className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" checked={filters.brands.includes(b)} onChange={() => toggle(b)}
            className="w-3.5 h-3.5 rounded border border-[#D1D5DB] accent-[#E11D48] cursor-pointer" />
          <span className="text-[12px] text-[#334155] group-hover:text-[#E11D48] transition-colors">{b}</span>
        </label>
      ))}
      {brands.length > 5 && (
        <button onClick={() => setShowAll(!showAll)}
          className="text-[11px] cursor-pointer font-semibold text-[#E11D48] hover:underline text-left mt-0.5">
          {showAll ? "Show Less" : "View More"}
        </button>
      )}
    </div>
  );
}

/* ── Size buttons — product collection থেকে unique sizes ── */
function SizeSelector({ filters, setFilters, sizes }) {
  const toggle = (s) => setFilters((f) => ({
    ...f,
    sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s],
  }));
  if (!sizes.length) return <p className="text-[11px] text-[#9CA3AF]">No sizes available</p>;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {sizes.map((s) => {
        const active = filters.sizes.includes(s);
        return (
          <button key={s} onClick={() => toggle(s)}
            className="px-3 py-1 text-[12px] font-medium cursor-pointer rounded border transition-colors"
            style={{
              border:      active ? "1px solid #E11D48" : "1px solid #E5E7EB",
              color:       active ? "#E11D48" : "#334155",
              background:  active ? "#FFF1F3" : "#FFFFFF",
            }}>
            {s}
          </button>
        );
      })}
    </div>
  );
}

/* ── Main FilterSidebar ── */
/* Props:
     filters, setFilters, onClear  — filter state
     products                       — full product list (for dynamic options)
     priceMax                       — max price from products
*/
export default function FilterSidebar({ filters, setFilters, onClear, products = [], priceMax = 0 }) {

  // unique categories from products
  const categories = [...new Set(
    products.map((p) => p.category).filter(Boolean)
  )].sort();

  // unique brands from products
  const brands = [...new Set(
    products.map((p) => p.brands || p.brand).filter(Boolean)
  )].sort();

  // unique sizes — product.color[].sizes[].size
  const sizes = [...new Set(
    products.flatMap((p) =>
      (p.color || []).flatMap((c) =>
        (c.sizes || []).map((s) => s.size)
      )
    ).filter(Boolean)
  )].sort();

  const setPrice = (min, max) => setFilters((f) => ({ ...f, price: { min, max } }));

  return (
    <aside className="w-full flex flex-col gap-3 bg-white border border-[#E5E7EB] rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
        <span className="text-[16px] font-bold text-[#1F2937]">Filter By</span>
        <button onClick={onClear} className="text-[12px] cursor-pointer font-semibold text-[#E11D48] hover:underline">Clear All</button>
      </div>

      {/* Price */}
      <FilterSection title="Product Price">
        <DualRangeSlider
          min={filters.price.min}
          max={filters.price.max}
          priceMax={priceMax}
          onChange={setPrice}
        />
      </FilterSection>

      {/* Sort */}
      <FilterSection title="Sort By">
        <SortDropdown value={filters.sort} onChange={(v) => setFilters((f) => ({ ...f, sort: v }))} />
      </FilterSection>

      {/* Product type */}
      <FilterSection title="Product Type">
        <div className="flex flex-col gap-2.5">
          {[{ key: "digital", label: "Digital Products" }, { key: "preorder", label: "Preorder Products" }].map(({ key, label }) => (
            <div key={key}
              className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2 transition-colors"
              style={{ background: filters[key] ? "#FFF1F3" : "#F9FAFB", border: `1px solid ${filters[key] ? "#FECDD3" : "#F3F4F6"}` }}>
              <span className="text-[12px] font-semibold leading-none" style={{ color: filters[key] ? "#E11D48" : "#374151" }}>{label}</span>
              <Toggle checked={!!filters[key]} onChange={(v) => setFilters((f) => ({ ...f, [key]: v }))} />
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Categories">
        <CategoryList filters={filters} setFilters={setFilters} categories={categories} />
      </FilterSection>

      {/* Brands */}
      <FilterSection title="Brands">
        <BrandList filters={filters} setFilters={setFilters} brands={brands} />
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-1.5 mt-1">
          {COLORS.map((c) => (
            <button key={c}
              onClick={() => setFilters((f) => ({
                ...f,
                colors: f.colors.includes(c) ? f.colors.filter((x) => x !== c) : [...f.colors, c],
              }))}
              className="w-5 h-5 rounded-full transition-transform hover:scale-110"
              style={{
                background: c,
                border: filters.colors.includes(c) ? "2px solid #E11D48" : c === "#FFFFFF" ? "1px solid #D1D5DB" : "none",
              }} />
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <SizeSelector filters={filters} setFilters={setFilters} sizes={sizes} />
      </FilterSection>
    </aside>
  );
}
