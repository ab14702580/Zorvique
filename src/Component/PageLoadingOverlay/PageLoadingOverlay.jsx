import { ShoppingBag } from 'lucide-react';

export default function PageLoadingOverlay({ className = 'fixed inset-0 z-10000' }) {
  return (
    <div
      className={`${className} flex flex-col items-center justify-center gap-4 bg-white`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg">
          <ShoppingBag size={26} strokeWidth={1.8} />
        </div>
        <div className="absolute -inset-2 animate-spin rounded-[22px] border-[3px] border-rose-200 border-t-rose-600" />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold text-slate-800">Multiventor</p>
        <p className="mt-1 text-xs text-slate-500">Loading page...</p>
      </div>
    </div>
  );
}
