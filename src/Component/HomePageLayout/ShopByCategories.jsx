import { ChevronRight, Package } from "lucide-react";
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
          <div className="overflow-hidden" aria-label="Shop by category">
            <div className="flex w-max animate-category-marquee hover:[animation-play-state:paused]">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 gap-4 md:gap-6 pr-4 md:pr-6" aria-hidden={copy === 1}>
                  {categories.map((cat, index) => (
                    <button
                      key={`${copy}-${cat._id}`}
                      tabIndex={copy === 1 ? -1 : 0}
                      onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                      className="flex w-20 md:w-28 shrink-0 flex-col items-center gap-2 md:gap-3 group cursor-pointer">
                      <div
                        className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center transition-all duration-200 group-hover:shadow-md group-hover:scale-105"
                        style={{ background: index % 2 ? "#F1F5F9" : "#FFF1F3", border: "1px solid #E2E8F0" }}>
                        {cat.image ? (
                          <img src={cat.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" />
                        ) : (
                          <Package size={28} className="text-[#94A3B8]" />
                        )}
                      </div>
                      <span className="text-[11px] md:text-[13px] font-semibold text-[#1E293B] text-center leading-4 group-hover:text-[#F43F5E] transition-colors">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

