import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronRight, Home, Package } from "lucide-react";
import api from "../../api/axios";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // tree format: parent + children[]
    api.get("/nav-categories/tree")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="flex items-center gap-1 text-[12px] text-[#64748B] hover:text-[#F43F5E] transition-colors">
            <Home size={13} className="text-[#94A3B8]" /><span>Home</span>
          </Link>
          <ChevronRight size={12} className="text-[#94A3B8]" />
          <span className="text-[12px] font-medium text-[#475569]">All Categories</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-[-0.6px]">All Categories</h1>
          <p className="text-[14px] text-[#64748B] mt-1">Browse all categories and subcategories</p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#F1F5F9] p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-3 bg-slate-200 rounded w-3/4" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat._id} cat={cat} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryCard({ cat, navigate }) {
  const children = cat.children || [];

  return (
    <div className="bg-white rounded-2xl border border-[#F1F5F9] overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Parent header */}
      <button
        onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
        className="w-full flex items-center gap-4 p-5 hover:bg-[#FFF1F3] transition-colors group cursor-pointer">
        {/* Image */}
        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-[#F1F5F9]"
          style={{ border: "1px solid #E2E8F0" }}>
          {cat.image
            ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
            : <Package size={22} className="text-[#94A3B8]" />
          }
        </div>
        {/* Name + count */}
        <div className="flex-1 text-left min-w-0">
          <h3 className="text-[15px] font-bold text-[#0F172A] group-hover:text-[#F43F5E] transition-colors">
            {cat.name}
          </h3>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">{children.length} subcategories</p>
        </div>
        <ChevronRight size={16} className="text-[#CBD5E1] group-hover:text-[#F43F5E] shrink-0 transition-colors" />
      </button>

      {/* Subcategories */}
      {children.length > 0 && (
        <div className="border-t border-[#F8FAFC] px-5 py-3 flex flex-col gap-0">
          {children.map((sub) => (
            <button
              key={sub._id}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}&sub=${encodeURIComponent(sub.name)}`)}
              className="flex items-center gap-3 py-2 hover:text-[#F43F5E] transition-colors group cursor-pointer text-left w-full">
              {/* Sub image */}
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-[#F8FAFC]"
                style={{ border: "1px solid #F1F5F9" }}>
                {sub.image
                  ? <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                  : <Package size={13} className="text-[#CBD5E1]" />
                }
              </div>
              <span className="text-[13px] font-medium text-[#475569] group-hover:text-[#F43F5E] truncate transition-colors">
                {sub.name}
              </span>
              <ChevronRight size={12} className="text-[#E2E8F0] group-hover:text-[#F43F5E] shrink-0 ml-auto transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
