import { Truck, RefreshCw, Shield, Award, Headphones } from "lucide-react";

const trustBadges = [
  { icon: <Shield size={20} strokeWidth={1.67} className="text-[#9333EA]" />, bg: "#FAF5FF", title: "Secure Payments", desc: "100% safe & trusted", border: false },
  { icon: <Truck size={20} strokeWidth={1.67} className="text-[#059669]" />, bg: "#ECFDF5", title: "Free Delivery", desc: "On orders over 999", border: true },
  { icon: <Award size={20} strokeWidth={1.67} className="text-[#EA580C]" />, bg: "#FFF7ED", title: "100% Authentic", desc: "Genuine products only", border: true },
  { icon: <Headphones size={20} strokeWidth={1.67} className="text-[#65A30D]" />, bg: "#F7FEE7", title: "24/7 Support", desc: "We are always here", border: true },
  { icon: <RefreshCw size={20} strokeWidth={1.67} className="text-[#2563EB]" />, bg: "#EFF6FF", title: "Easy Returns", desc: "Hassle free returns", border: true },
];

export default function TrustBadgesBar() {
  return (
    <div className="w-full pb-4 md:pb-6">
      <div className="max-w-[1400px] mx-auto px-4">
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 md:p-5 rounded-2xl bg-white"
          style={{ border: "1px solid #F1F5F9", boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
        >
          {trustBadges.map((badge) => (
            <div
              key={badge.title}
              className={`flex items-center gap-3 px-2 ${badge.border ? "sm:border-l sm:border-[#F1F5F9]" : ""}`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: badge.bg }}>
                {badge.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#1E293B] truncate">{badge.title}</span>
                <span className="text-[11px] text-[#64748B] truncate">{badge.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
