import { useState, useMemo } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, ChevronDown, ImageIcon } from "lucide-react";

/* ─────────────────────────────────────────────
   Blog data
───────────────────────────────────────────── */
const POSTS = [
  {
    id: 1,
    category: "Fashion & Clothing",
    title: "Dignissimos adipisci et explicabo at.",
    excerpt: "Est tenetur et alias ut similique magnam. Natus minus illo iste enim voluptates esse…",
    date: "06 Jul, 2026",
    views: 0,
  },
  {
    id: 2,
    category: "Jewelry & Accessories",
    title: "Dolor quisquam minima quam labore.",
    excerpt: "Quidem et est quos nostrum deleniti adipisci numquam. Corporis sunt voluptas…",
    date: "06 Jul, 2026",
    views: 0,
  },
  {
    id: 3,
    category: "Health & Wellness",
    title: "Sed occaecati dolorem non sapiente ut harum.",
    excerpt: "Animi eveniet vitae nihil quia cupiditate. Quidem ut molestiae iste aut quibusdam…",
    date: "06 Jul, 2026",
    views: 0,
  },
  {
    id: 4,
    category: "Health & Wellness",
    title: "Accusamus dignissimos labore dolor.",
    excerpt: "Porro voluptatem rerum voluptates aut laboriosam. Commodi optio tempore…",
    date: "06 Jul, 2026",
    views: 0,
  },
  {
    id: 5,
    category: "Grocery & Essentials",
    title: "Quidem et adipisci debitis in placeat.",
    excerpt: "Corporis amet quod laborum eum aut et. Tenetur placeat assumenda atque at…",
    date: "06 Jul, 2026",
    views: 0,
  },
  {
    id: 6,
    category: "Health & Wellness",
    title: "Voluptates totam totam error quia.",
    excerpt: "Delectus voluptatum autem in. Eum perferendis qui corporis mollitia nisi dolor…",
    date: "06 Jul, 2026",
    views: 0,
  },
  {
    id: 7,
    category: "Grocery & Essentials",
    title: "Rerum autem et aut dolor ullam.",
    excerpt: "Ut perspiciatis sequi explicabo porro occaecati explicabo consectetur magnam.",
    date: "06 Jul, 2026",
    views: 0,
  },
  {
    id: 8,
    category: "Jewelry & Accessories",
    title: "Omnis aut rerum expedita voluptas.",
    excerpt: "Consequatur quia magnam eos facere. Sit ipsam saepe qui dolorem quibusdam…",
    date: "06 Jul, 2026",
    views: 0,
  },
  {
    id: 9,
    category: "Fashion & Clothing",
    title: "Aspernatur velit consequatur porro.",
    excerpt: "Tenetur et occaecati facere iure dignissimos. Eum consequatur omnis sed…",
    date: "06 Jul, 2026",
    views: 0,
  },
];

const CATEGORIES = [
  { name: "Grocery & Essentials", count: 2 },
  { name: "Health & Wellness",    count: 2 },
  { name: "Jewelry & Accessories", count: 1 },
  { name: "Fashion & Clothing",   count: 1 },
];

const POPULAR = [
  { id: 1, title: "Dignissimos adipisci et explicabo at.", date: "06 Jul, 2026" },
  { id: 2, title: "Dolor quisquam minima quam labore.",   date: "06 Jul, 2026" },
  { id: 3, title: "Sed occaecati dolorem non sapiente ut harum...", date: "06 Jul, 2026" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Viewed" },
];

const PAGE_SIZE = 6;

/* ─────────────────────────────────────────────
   Image placeholder (matches Figma design)
───────────────────────────────────────────── */
function ImgPlaceholder() {
  return (
    <div className="w-full h-44 bg-[#F8FAFC] flex items-center justify-center shrink-0">
      <div className="flex flex-col items-center gap-1 opacity-40">
        <ImageIcon size={36} className="text-[#CBD5E1]" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Blog card
───────────────────────────────────────────── */
function BlogCard({ post }) {
  return (
    <article className="flex flex-col bg-white border border-[#F1F5F9] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow overflow-hidden">
      {/* Image */}
      <ImgPlaceholder />

      {/* Body */}
      <div className="flex flex-col justify-between p-4 flex-1 gap-0">
        <div className="flex flex-col gap-2 pt-1">
          {/* Category badge */}
          <span className="self-start px-2 py-0.5 bg-[#F1F5F9] rounded text-[10px] font-bold tracking-[0.5px] uppercase text-[#475569]">
            {post.category}
          </span>

          {/* Title */}
          <h2 className="text-[14px] font-bold text-[#1E293B] leading-[19px] line-clamp-2">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-[12px] text-[#64748B] leading-5 line-clamp-2">
            {post.excerpt}
          </p>
        </div>

        {/* Footer: date + views */}
        <div className="flex items-center gap-3 pt-4 border-t border-[#F1F5F9] mt-4">
          <span className="text-[11px] text-[#94A3B8]">{post.date}</span>
          <div className="flex items-center gap-1">
            <Eye size={14} className="text-[#94A3B8]" />
            <span className="text-[11px] text-[#94A3B8]">{post.views}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────
   Sidebar
───────────────────────────────────────────── */
function Sidebar({ search, setSearch, sort, setSort, activeCategory, setActiveCategory }) {
  return (
    <aside className="flex flex-col gap-6 w-full lg:w-[280px] shrink-0">

      {/* ── Widget 1: Search + Filter ── */}
      <div className="bg-white border border-[#F1F5F9] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] rounded-lg p-5 flex flex-col gap-2">
        {/* Search */}
        <p className="text-[12px] font-bold tracking-[0.6px] uppercase text-[#1E293B] pb-1">Search</p>
        <div className="flex items-center border border-[#E2E8F0] rounded overflow-hidden">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blog..."
            className="flex-1 px-3 py-2 text-[12px] text-[#1E293B] placeholder-[#94A3B8] bg-white outline-none"
          />
          <button className="w-[42px] h-[34px] flex items-center justify-center bg-[#0F172A] hover:bg-[#1e293b] transition-colors shrink-0">
            <Search size={14} className="text-white" />
          </button>
        </div>

        {/* Filter */}
        <p className="text-[12px] font-bold tracking-[0.6px] uppercase text-[#1E293B] pt-4 pb-0">Filter</p>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full appearance-none px-3 py-2 pr-8 text-[12px] font-medium text-[#334155] bg-white border border-[#E2E8F0] rounded outline-none focus:border-[#E11D48] cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
        </div>
      </div>

      {/* ── Widget 2: Categories ── */}
      <div className="bg-white border border-[#F1F5F9] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] rounded-lg p-5 flex flex-col gap-4">
        <p className="text-[12px] font-bold tracking-[0.6px] uppercase text-[#1E293B] pb-2 border-b border-[#F1F5F9]">
          Categories
        </p>
        <div className="flex flex-col gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(activeCategory === cat.name ? "" : cat.name)}
              className="flex items-center justify-between w-full text-left group"
            >
              <span
                className="text-[12px] transition-colors"
                style={{ color: activeCategory === cat.name ? "#E11D48" : "#475569" }}
              >
                {cat.name}
              </span>
              <span className="w-5 h-5 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[10px] font-semibold text-[#64748B]">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Widget 3: Popular Posts ── */}
      <div className="bg-white border border-[#F1F5F9] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] rounded-lg p-5 flex flex-col gap-4">
        <p className="text-[12px] font-bold tracking-[0.6px] uppercase text-[#1E293B] pb-2 border-b border-[#F1F5F9]">
          Popular Posts
        </p>
        <div className="flex flex-col gap-4">
          {POPULAR.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              {/* Thumb placeholder */}
              <div className="w-12 h-12 shrink-0 bg-[#F8FAFC] border border-[#F1F5F9] rounded flex items-center justify-center">
                <ImageIcon size={16} className="text-[#CBD5E1]" />
              </div>
              {/* Text */}
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[12px] font-bold text-[#1E293B] leading-[15px] line-clamp-2">
                  {p.title}
                </span>
                <span className="text-[10px] text-[#94A3B8] leading-[15px]">{p.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function BlogPage() {
  const [search,         setSearch]         = useState("");
  const [sort,           setSort]           = useState("newest");
  const [activeCategory, setActiveCategory] = useState("");
  const [page,           setPage]           = useState(1);

  /* filter + sort */
  const filtered = useMemo(() => {
    let list = [...POSTS];

    if (search.trim())
      list = list.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase())
      );

    if (activeCategory)
      list = list.filter((p) => p.category === activeCategory);

    if (sort === "oldest")  list = list.sort((a, b) => a.id - b.id);
    else if (sort === "newest") list = list.sort((a, b) => b.id - a.id);
    else if (sort === "popular") list = list.sort((a, b) => b.views - a.views);

    return list;
  }, [search, sort, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goPage = (n) => {
    setPage(Math.max(1, Math.min(n, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* page number range */
  const pageNums = () => {
    const nums = [];
    const start = Math.max(1, safePage - 1);
    const end   = Math.min(totalPages, start + 2);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Main posts area ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-10">

            {/* Posts grid */}
            {paginated.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginated.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-[#9CA3AF]">
                <span className="text-5xl mb-3">📝</span>
                <p className="text-[15px] font-semibold text-[#374151]">No posts found</p>
                <p className="text-[13px] mt-1">Try a different search or category</p>
              </div>
            )}

            {/* ── Pagination ── */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-center gap-2">
                {/* Prev */}
                <button
                  onClick={() => goPage(safePage - 1)}
                  disabled={safePage === 1}
                  className="w-9 h-9 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg text-[#94A3B8] disabled:opacity-40 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft size={16} />
                </button>

                {pageNums().map((n) => (
                  <button
                    key={n}
                    onClick={() => goPage(n)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-[14px] font-semibold transition-colors"
                    style={
                      n === safePage
                        ? { background: "#E11D48", color: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }
                        : { background: "#fff", border: "1px solid #E2E8F0", color: "#334155" }
                    }
                  >
                    {n}
                  </button>
                ))}

                {/* Next */}
                <button
                  onClick={() => goPage(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="w-9 h-9 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg text-[#475569] disabled:opacity-40 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <Sidebar
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />

        </div>
      </div>
    </div>
  );
}
