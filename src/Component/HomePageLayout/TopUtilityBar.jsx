import { Truck, Zap, RefreshCw, HelpCircle, ChevronDown, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopUtilityBar() {
  const navigate = useNavigate();
  return (
    <div className="w-full bg-white md:block hidden border-b border-[#F1F5F9]">
      <div className="max-w-[1400px] mx-auto px-4 h-8 flex items-center justify-between">

        {/* Left: Free Delivery */}
        <div className="flex items-center gap-1.5">
          <Truck size={16} strokeWidth={1.5} className="text-[#F43F5E] shrink-0" />
          <span className="text-[12.5px] font-medium text-[#475569] leading-none whitespace-nowrap">
            Free Delivery on orders over $999.00
          </span>
        </div>

        {/* Right — hidden on mobile, visible md+ */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">

          {/* Utility links — hidden below lg */}
          <div className="hidden lg:flex items-center gap-4 pr-4 border-r border-[#E2E8F0]">
            <button onClick={() => navigate('/products')} className="flex items-center gap-1.5 text-[#64748B] hover:text-[#F43F5E] transition-colors cursor-pointer">
              <Zap size={14} strokeWidth={1.5} className="text-[#F43F5E] shrink-0" />
              <span className="text-[12.5px] font-normal whitespace-nowrap">Daily Deals</span>
            </button>
            <button onClick={() => navigate('/products')} className="flex items-center gap-1.5 text-[#64748B] hover:text-[#F43F5E] transition-colors cursor-pointer">
              <RefreshCw size={14} strokeWidth={1.5} className="text-[#F43F5E] shrink-0" />
              <span className="text-[12.5px] font-normal whitespace-nowrap">Easy Returns</span>
            </button>
          </div>

          {/* Language & Currency */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 text-[#475569] hover:text-[#1E293B] transition-colors cursor-pointer">
              <span className="text-[12.5px] font-normal">English</span>
              <ChevronDown size={14} strokeWidth={1.5} className="text-[#94A3B8]" />
            </button>
            <button className="flex items-center gap-1 text-[#475569] hover:text-[#1E293B] transition-colors cursor-pointer">
              <span className="text-[12.5px] font-normal">$ USD</span>
              <ChevronDown size={14} strokeWidth={1.5} className="text-[#94A3B8]" />
            </button>
            <button className="flex items-center justify-center text-[#94A3B8] hover:text-[#475569] transition-colors cursor-pointer">
              <Moon size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Mobile: just the dark mode toggle */}
        <button className="flex md:hidden items-center justify-center text-[#94A3B8] hover:text-[#475569] transition-colors cursor-pointer">
          <Moon size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
