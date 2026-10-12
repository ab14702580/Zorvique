import { useAuth } from '../../context/useAuth';

export default function AuthLoadingGate({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white gap-4">
        {/* Animated logo mark */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-rose-600 flex items-center justify-center shadow-xl">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          {/* Spinning ring */}
          <div className="absolute -inset-2 rounded-[22px] border-[3px] border-rose-200 border-t-rose-600 animate-spin" />
        </div>

        <div className="text-center">
          <p className="text-[15px] font-bold text-slate-800 tracking-tight">Multiventor</p>
          <p className="text-[12px] text-slate-400 mt-0.5">Loading your session…</p>
        </div>
      </div>
    );
  }

  return children;
}
