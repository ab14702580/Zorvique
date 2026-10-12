import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function ShopByCategories() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // nav_categories থেকে শুধু parent categories আনব (parentCategory === null)
    api.get("/nav-categories")
      .then((res) => {
        const parents = res.data.filter((c) => c.parentCategory === null);
        setCategories(parents);
      })
      .catch((err) => console.error("Shop categories fetch error:", err));
  }, []);

  return (
    <section className="w-full">
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-[-0.6px]">Shop By Categories</h2>
            <button
              onClick={() => navigate('/categories')}
              className="flex items-center gap-1 text-sm font-medium text-[#475569] hover:text-[#F43F5E] transition-colors cursor-pointer">
              <span>View All</span><ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat._id}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                className="flex flex-col items-center gap-2 md:gap-3 group cursor-pointer">
                <div
                  className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center transition-all duration-200 group-hover:shadow-md group-hover:scale-105"
                  style={{
                    background: "linear-gradient(180deg, rgba(240,249,255,0.6) 0%, #F8FAFC 100%)",
                    border: "1px solid #F1F5F9",
                    boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                  }}>
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    />
                  ) : (
                    <span className="text-2xl md:text-4xl leading-none text-center">📦</span>
                  )}
                </div>
                <span className="text-[11px] md:text-[13px] font-semibold text-[#1E293B] text-center leading-4 group-hover:text-[#F43F5E] transition-colors">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
