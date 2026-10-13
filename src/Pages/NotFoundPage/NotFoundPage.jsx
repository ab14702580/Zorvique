import { Link } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="min-h-[65vh] flex items-center justify-center px-4 py-16 bg-[#F8FAFC]">
      <section className="max-w-lg text-center">
        <SearchX size={44} strokeWidth={1.4} className="mx-auto text-[#E11D48]" />
        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-[#64748B]">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold text-[#172033]">This page could not be found</h1>
        <p className="mt-3 text-sm text-[#64748B]">The link may be incorrect or the page may have moved.</p>
        <div className="flex justify-center gap-3 mt-7">
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E11D48] text-sm font-semibold text-white"><ArrowLeft size={15} /> Home</Link>
          <Link to="/products" className="px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-sm font-semibold text-[#334155]">Browse products</Link>
        </div>
      </section>
    </main>
  );
}
