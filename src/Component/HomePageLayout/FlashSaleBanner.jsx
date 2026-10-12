import { useState, useEffect, Fragment } from "react";
import { ChevronRight } from "lucide-react";

function useCountdown(targetHours = 8) {
  const [time, setTime] = useState({ h: targetHours, m: 0, s: 0 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        const { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");
  return { h: pad(time.h), m: pad(time.m), s: pad(time.s) };
}

export default function FlashSaleBanner() {
  const { h, m, s } = useCountdown(8);

  return (
    <section className="w-full">
      <div className="max-w-[1400px] mx-auto px-4 pb-6 md:pb-8">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden px-6 md:px-10 py-8 md:py-10"
          style={{
            background: "linear-gradient(93.2deg, #C73757 0%, #A21A3A 32%, #5E0D1F 75%, #440713 100%)",
            boxShadow: "0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)",
          }}>
          {/* Decorative */}
          <span className="absolute left-8 top-5 text-xl font-black opacity-30 select-none text-white">✦</span>
          <div className="absolute left-16 top-10 w-1.5 h-1.5 bg-white/40 rounded-full" />
          <div className="absolute left-10 bottom-6 opacity-20 grid grid-cols-8 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-white rounded-full" />
            ))}
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">

            {/* Coming Soon card — hidden on mobile */}
            <div className="hidden md:flex items-center justify-center shrink-0">
              <div className="relative w-40 flex flex-col items-center gap-0.5 px-5 pt-8 pb-5 rounded-2xl"
                style={{ background: "linear-gradient(180deg,#FFFFFF 0%,#FFF1F2 50%,rgba(252,231,243,0.9) 100%)", border: "4px solid rgba(255,255,255,0.6)", boxShadow: "0px 25px 50px -12px rgba(0,0,0,0.25)" }}>
                <div className="absolute -top-2.5 left-0 right-0 flex justify-center gap-2.5">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="w-2 h-1 rounded-full" style={{ background: "#FB7185", border: "2px solid #FFFFFF" }} />
                  ))}
                </div>
                <span className="text-[11px] font-extrabold tracking-[1.2px] text-[#F43F5E] text-center">COMING</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.55px] text-[#64748B] text-center">SOON</span>
                <span className="text-[28px] font-extrabold leading-9 tracking-[-0.75px] text-[#F43F5E] text-center">SOON</span>
              </div>
            </div>

            {/* Center */}
            <div className="flex-1 flex flex-col items-center gap-4 md:gap-6 text-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-[2px] md:tracking-[2.4px] uppercase text-white leading-tight">
                  FLASH SALE
                </h2>
                <p className="text-xs md:text-sm text-[#FFE4E6] max-w-md mt-1">
                  The biggest deals are almost here! Get ready to shop &amp; save big.
                </p>
              </div>
              {/* Countdown */}
              <div className="flex items-center gap-2 md:gap-3">
                {[{ val: h, label: "Hours" }, { val: m, label: "Minutes" }, { val: s, label: "Seconds" }].map((item, i) => (
                  <Fragment key={item.label}>
                    <div
                      className="flex flex-col items-center gap-1 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl bg-white min-w-[64px] md:min-w-[80px]"
                      style={{ boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)" }}>
                      <span className="text-2xl md:text-[30px] font-extrabold leading-8 md:leading-9 text-[#F43F5E] text-center">{item.val}</span>
                      <span className="text-[10px] md:text-xs font-medium text-[#94A3B8] text-center">{item.label}</span>
                    </div>
                    {i < 2 && <span className="text-xl md:text-2xl font-extrabold text-[#FDA4AF] pb-3 md:pb-4">:</span>}
                  </Fragment>
                ))}
              </div>
            </div>

            {/* Right: Exclusive offers */}
            <div className="flex flex-col items-center md:items-end gap-4 md:gap-5 shrink-0 w-full md:w-auto">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full max-w-[280px] md:max-w-[240px]"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px dashed rgba(253,164,175,0.4)", backdropFilter: "blur(6px)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "#F43F5E" }}>
                  <span className="text-white text-base">🔔</span>
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.3px] text-white">EXCLUSIVE OFFERS</span>
                  <span className="text-[10px] font-bold text-[#FCD34D] leading-3">Big Deals Are Waiting For You</span>
                </div>
                <ChevronRight size={20} strokeWidth={1.5} className="text-white/50 shrink-0" />
              </div>

              {/* Glow lock — hidden on mobile */}
              <div className="relative hidden md:flex items-center justify-center w-16 h-[72px]">
                <div className="absolute -left-4 bottom-0 w-24 h-16 rounded-t-full"
                  style={{ background: "linear-gradient(0deg,rgba(0,0,0,0.4) 0%,rgba(76,5,25,0.6) 50%,rgba(76,5,25,0) 100%)", filter: "blur(2px)" }} />
                <div className="absolute top-0 left-[14px] w-9 h-7 rounded-t-full"
                  style={{ border: "4px solid rgba(254,205,211,0.9)" }} />
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center z-10"
                  style={{ background: "linear-gradient(135deg,#F43F5E 0%,#DB2777 100%)", border: "2px solid rgba(253,164,175,0.7)", boxShadow: "0px 10px 15px -3px rgba(136,19,55,0.6)", marginTop: "8px" }}>
                  <span className="text-2xl">⚡</span>
                </div>
                <span className="absolute -top-2 -right-2 text-sm font-black text-[#FCD34D]/70">✦</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
