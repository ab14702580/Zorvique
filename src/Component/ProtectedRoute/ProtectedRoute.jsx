import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

// ── Full-page spinner shown while Firebase resolves auth state ────────────────
function AuthLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-rose-200 border-t-rose-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    </div>
  );
}

// ── Any logged-in user (user / seller / admin) ────────────────────────────────
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// ── Admin-only ────────────────────────────────────────────────────────────────
export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  // Non-admin users get redirected to their own dashboard
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

// ── Seller-only (admin can also access) ──────────────────────────────────────
export function SellerRoute({ children }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  // role: 'user' → send to user dashboard
  // role: 'seller' or 'admin' → allow through
  if (role !== 'seller' && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// ── User-only (logged in but NOT admin/seller browsing admin/seller panel) ────
// Use this to block sellers/admins from accidentally using user-only pages.
// Currently we allow sellers and admins to also use /dashboard pages since
// they may still shop. If you need hard isolation, swap ProtectedRoute for this.
export function UserRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
