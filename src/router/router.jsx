import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../Pages/HomePage/HomePage';
import HomePageDesign from '../Component/HomePageLayout/HomePageDesign';
import ProductsPage from '../Pages/ProductsPage/ProductsPage';
import ShopsPage from '../Pages/ShopsPage/ShopsPage';
import VendorShopPage from '../Pages/VendorShopPage/VendorShopPage';
import BrandsPage from '../Pages/BrandsPage/BrandsPage';
import ContactPage from '../Pages/ContactPage/ContactPage';
import BlogPage from '../Pages/BlogPage/BlogPage';
import ProductDetailPage from '../Pages/ProductDetailPage/ProductDetailPage';
import CategoriesPage from '../Pages/CategoriesPage/CategoriesPage';
import CheckoutPage from '../Pages/CheckoutPage/CheckoutPage';
import LoginPage from '../Pages/LoginPage/LoginPage';
import RegisterPage from '../Pages/RegisterPage/RegisterPage';
import ProtectedRoute, { AdminRoute, SellerRoute } from '../Component/ProtectedRoute/ProtectedRoute';
import PublicPrivacyPolicyPage from '../Pages/PrivacyPolicyPage/PrivacyPolicyPage';
import PageLoadingBoundary from '../Component/PageLoadingBoundary/PageLoadingBoundary';

// ── User Dashboard pages ──────────────────────────────────────────────────────
import DashboardPage              from '../Pages/DashboardPage/DashboardPage';
import OrderHistoryPage           from '../Pages/Dashboard/OrderHistoryPage/OrderHistoryPage';
import MyDigitalProductsPage      from '../Pages/Dashboard/MyDigitalProductsPage/MyDigitalProductsPage';
import PreOrdersPage              from '../Pages/Dashboard/PreOrdersPage/PreOrdersPage';
import ReturnOrdersPage           from '../Pages/Dashboard/ReturnOrdersPage/ReturnOrdersPage';
import WishlistPage               from '../Pages/Dashboard/WishlistPage/WishlistPage';
import MessagePage                from '../Pages/Dashboard/MessagePage/MessagePage';
import MyProfilePage              from '../Pages/Dashboard/MyProfilePage/MyProfilePage';
import ManageAddressPage          from '../Pages/Dashboard/ManageAddressPage/ManageAddressPage';
import SupportTicketPage          from '../Pages/Dashboard/SupportTicketPage/SupportTicketPage';
import ChangePasswordPage         from '../Pages/Dashboard/ChangePasswordPage/ChangePasswordPage';
import TermsConditionsPage        from '../Pages/Dashboard/TermsConditionsPage/TermsConditionsPage';
import PrivacyPolicyPage          from '../Pages/Dashboard/PrivacyPolicyPage/PrivacyPolicyPage';
import BecomeSellerPage           from '../Pages/Dashboard/BecomeSellerPage/BecomeSellerPage';
import MyReviewsPage              from '../Pages/Dashboard/MyReviewsPage/MyReviewsPage';

// ── Seller Dashboard pages ─────────────────────────────────────────────────────
import SellerOverviewPage         from '../Pages/SellerDashboard/SellerOverviewPage';
import SellerProductsPage         from '../Pages/SellerDashboard/SellerProductsPage';
import SellerOrdersPage           from '../Pages/SellerDashboard/SellerOrdersPage';
import SellerReviewsPage          from '../Pages/SellerDashboard/SellerReviewsPage';
import SellerStorePage            from '../Pages/SellerDashboard/SellerStorePage';
import SellerDecoratePage         from '../Pages/SellerDashboard/SellerDecoratePage';

// ── Admin Dashboard pages ─────────────────────────────────────────────────────
import AdminOverviewPage          from '../Pages/AdminDashboard/AdminOverviewPage';
import AdminCategoriesPage        from '../Pages/AdminDashboard/AdminCategoriesPage';
import AdminProductsPage          from '../Pages/AdminDashboard/AdminProductsPage';
import AdminSellersPage           from '../Pages/AdminDashboard/AdminSellersPage';
import AdminShopRequestsPage      from '../Pages/AdminDashboard/AdminShopRequestsPage';
import AdminOrdersPage            from '../Pages/AdminDashboard/AdminOrdersPage';
import AdminUsersPage             from '../Pages/AdminDashboard/AdminUsersPage';
import AdminSupportPage           from '../Pages/AdminDashboard/AdminSupportPage';
import AdminContactPage           from '../Pages/AdminDashboard/AdminContactPage';

// ── Route helpers ─────────────────────────────────────────────────────────────
const protect      = (el) => <ProtectedRoute>{el}</ProtectedRoute>;
const adminProtect = (el) => <AdminRoute>{el}</AdminRoute>;
const sellerProtect= (el) => <SellerRoute>{el}</SellerRoute>;

const router = createBrowserRouter([
  {
    element: <PageLoadingBoundary />,
    children: [
  // ── Public ──────────────────────────────────────────────────────────────────
  { path: '/login',          element: <LoginPage /> },
  { path: '/register',       element: <RegisterPage /> },
  { path: '/privacy-policy', element: <PublicPrivacyPolicyPage /> },

  // ── Admin routes (role: admin only) ─────────────────────────────────────────
  { path: '/admin',               element: adminProtect(<AdminOverviewPage />) },
  { path: '/admin/users',         element: adminProtect(<AdminUsersPage />) },
  { path: '/admin/categories',    element: adminProtect(<AdminCategoriesPage />) },
  { path: '/admin/products',      element: adminProtect(<AdminProductsPage />) },
  { path: '/admin/sellers',       element: adminProtect(<AdminSellersPage />) },
  { path: '/admin/shop-requests', element: adminProtect(<AdminShopRequestsPage />) },
  { path: '/admin/orders',        element: adminProtect(<AdminOrdersPage />) },
  { path: '/admin/support',       element: adminProtect(<AdminSupportPage />) },
  { path: '/admin/contact',       element: adminProtect(<AdminContactPage />) },

  // ── User dashboard routes (any logged-in user) ───────────────────────────────
  { path: '/dashboard',           element: protect(<DashboardPage />) },
  { path: '/dashboard/orders',    element: protect(<OrderHistoryPage />) },
  { path: '/dashboard/digital',   element: protect(<MyDigitalProductsPage />) },
  { path: '/dashboard/preorders', element: protect(<PreOrdersPage />) },
  { path: '/dashboard/returns',   element: protect(<ReturnOrdersPage />) },
  { path: '/dashboard/wishlist',  element: protect(<WishlistPage />) },
  { path: '/dashboard/message',   element: protect(<MessagePage />) },
  { path: '/dashboard/profile',   element: protect(<MyProfilePage />) },
  { path: '/dashboard/address',   element: protect(<ManageAddressPage />) },
  { path: '/dashboard/support',   element: protect(<SupportTicketPage />) },
  { path: '/dashboard/password',  element: protect(<ChangePasswordPage />) },
  { path: '/dashboard/terms',     element: protect(<TermsConditionsPage />) },
  { path: '/dashboard/privacy',          element: protect(<PrivacyPolicyPage />) },
  { path: '/dashboard/become-seller',    element: protect(<BecomeSellerPage />) },
  { path: '/dashboard/reviews',          element: protect(<MyReviewsPage />) },

  // ── Seller Dashboard routes (role: seller only) ───────────────────────────────
  { path: '/seller',          element: sellerProtect(<SellerOverviewPage />) },
  { path: '/seller/products', element: sellerProtect(<SellerProductsPage />) },
  { path: '/seller/orders',   element: sellerProtect(<SellerOrdersPage />) },
  { path: '/seller/reviews',  element: sellerProtect(<SellerReviewsPage />) },
  { path: '/seller/store',    element: sellerProtect(<SellerStorePage />) },
  { path: '/seller/decorate', element: sellerProtect(<SellerDecoratePage />) },

  // ── Main site ────────────────────────────────────────────────────────────────
  {
    path: '/',
    element: <HomePage />,
    children: [
      { index: true,         element: <HomePageDesign /> },
      { path: 'products',    element: <ProductsPage /> },
      { path: 'product/:id', element: <ProductDetailPage /> },
      { path: 'shops',       element: <ShopsPage /> },
      { path: 'shop/:id',    element: <VendorShopPage /> },
      { path: 'brands',      element: <BrandsPage /> },
      { path: 'contact',     element: <ContactPage /> },
      { path: 'blog',        element: <BlogPage /> },
      { path: 'categories',  element: <CategoriesPage /> },
      { path: 'checkout',    element: <CheckoutPage /> },
    ],
  },
    ],
  },
]);

export default router;
