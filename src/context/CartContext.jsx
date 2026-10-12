import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import api from "../api/axios";

const CartContext = createContext(null);

// ── Normalize product image field from any source ────────────────────────────
export const getProductImage = (product) =>
  product?.productImg || product?.image || product?.img || product?.thumbnail || null;

// ── Normalize product name field ─────────────────────────────────────────────
export const getProductName = (product) =>
  product?.title || product?.name || 'Product';

export function CartProvider({ children }) {
  const { isAuthenticated, currentUser } = useAuth();
  const [items, setItems]           = useState([]); // [{ product, qty }]
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loaded, setLoaded]         = useState(false);
  const saveTimerRef                = useRef(null);

  const email = currentUser?.email || null;

  // ── Load cart from MongoDB on login ───────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !email) {
      setItems([]);
      setLoaded(false);
      return;
    }
    api.get(`/cart?email=${encodeURIComponent(email)}`)
      .then(res => { setItems(res.data || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [isAuthenticated, email]);

  // ── Debounced save to MongoDB whenever items change ────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !email || !loaded) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      api.put('/cart', { email, items }).catch(() => {});
    }, 600);
    return () => clearTimeout(saveTimerRef.current);
  }, [items, email, isAuthenticated, loaded]);

  // ── Add product ────────────────────────────────────────────────────────────
  // NOTE: login guard is handled at the component level (caller checks
  // isAuthenticated and navigates to /login before calling addToCart).
  const addToCart = useCallback((product, qty = 1) => {
    setItems(prev => {
      const pid = product._id || product.id;
      const idx = prev.findIndex(i => (i.product._id || i.product.id) === pid);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + qty };
        return updated;
      }
      return [...prev, { product, qty }];
    });
  }, []);

  // ── Remove product ────────────────────────────────────────────────────────
  const removeFromCart = useCallback((productId) => {
    setItems(prev => prev.filter(i => (i.product._id || i.product.id) !== productId));
  }, []);

  // ── Update qty ────────────────────────────────────────────────────────────
  const updateQty = useCallback((productId, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => (i.product._id || i.product.id) !== productId));
    } else {
      setItems(prev =>
        prev.map(i => (i.product._id || i.product.id) === productId ? { ...i, qty } : i)
      );
    }
  }, []);

  // ── Clear cart (after order placed) ──────────────────────────────────────
  const clearCart = useCallback(() => {
    setItems([]);
    if (email) api.delete(`/cart/${encodeURIComponent(email)}`).catch(() => {});
  }, [email]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + (i.product?.price || 0) * i.qty, 0);

  // ── In cart check ─────────────────────────────────────────────────────────
  const inCart = useCallback(
    (productId) => items.some(i => (i.product._id || i.product.id) === productId),
    [items]
  );

  return (
    <CartContext.Provider value={{
      items, drawerOpen, setDrawerOpen,
      addToCart, removeFromCart, updateQty, clearCart,
      totalItems, totalPrice, inCart, loaded,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
