import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";

export default function ShopByCategories() {
  const [categories, setCategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);
  const trackRef = useRef(null);
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

  useEffect(() => {
    if (categories.length < 2) return undefined;
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % categories.length);
    }, 3200);
    return () => window.clearInterval(interval);
  }, [categories.length]);

  useEffect(() => {
    const viewport = carouselRef.current;
    const target = trackRef.current?.children[activeIndex];
    if (!viewport || !target) return;

    const left = target.getBoundingClientRect().left - viewport.getBoundingClientRect().left + viewport.scrollLeft;
    viewport.scrollTo({ left, behavior: "smooth" });
  }, [activeIndex, categories]);

  const moveCategory = (direction) => {
    setActiveIndex((index) => (index + direction + categories.length) % categories.length);
  };

  return (
    <section className="w-full">
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-[-0.6px]">Shop By Categories</h2>
            <div className="flex items-center gap-2">
              {categories.length > 1 && (
                <>
                  <button type="button" onClick={() => moveCategory(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] text-[#475569] hover:border-[#F43F5E] hover:text-[#F43F5E] transition-colors"
                    aria-label="Previous category">
                    <ChevronLeft size={17} />
                  </button>
                  <button type="button" onClick={() => moveCategory(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] text-[#475569] hover:border-[#F43F5E] hover:text-[#F43F5E] transition-colors"
                    aria-label="Next category">
                    <ChevronRight size={17} />
                  </button>
                </>
              )}
              <button
                onClick={() => navigate('/categories')}
                className="flex items-center gap-1 text-sm font-medium text-[#475569] hover:text-[#F43F5E] transition-colors cursor-pointer">
                <span>View All</span><ChevronRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <div ref={carouselRef} className="overflow-hidden" aria-label="Shop by category">
            <div ref={trackRef} className="flex w-max gap-4 pr-4 md:gap-6 md:pr-6">
              {categories.map((cat, index) => (
                <button
                  key={cat._id}
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
          </div>
        </div>
      </div>
    </section>
  );
}

