import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./useAuth";
import api from "../api/axios";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, currentUser } = useAuth();
  const [items, setItems] = useState([]); // [{ _id, product }]
  const [loaded, setLoaded] = useState(false);

  // ── Load wishlist from MongoDB when user logs in ───────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.email) {
      setItems([]);
      setLoaded(false);
      return;
    }
    api.get(`/wishlist?email=${encodeURIComponent(currentUser.email)}`)
      .then(res => { setItems(res.data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [isAuthenticated, currentUser?.email]);

  // ── Toggle: add or remove from wishlist ───────────────────────────────────
  // NOTE: login guard is handled at the component level — caller should check
  // isAuthenticated and navigate to /login before calling toggleWishlist.
  const toggleWishlist = useCallback(async (product) => {
    if (!isAuthenticated || !currentUser?.email) {
      window.location.assign('/login');
      return;
    }

    const email    = currentUser.email;
    const pid      = product._id || product.id;
    const existing = items.find(i => i.product?._id === pid || i.product?.id === pid);

    if (existing) {
      // Optimistic remove
      setItems(prev => prev.filter(i => i._id !== existing._id));
      await api.delete(`/wishlist/${existing._id}`).catch(() => {
        // Rollback on error
        setItems(prev => [...prev, existing]);
      });
    } else {
      // Optimistic add
      const tempId   = `temp_${Date.now()}`;
      const tempItem = { _id: tempId, product, email };
      setItems(prev => [...prev, tempItem]);
      try {
        const res = await api.post('/wishlist', { email, product });
        setItems(prev => prev.map(i =>
          i._id === tempId ? { ...i, _id: res.data.insertedId } : i
        ));
      } catch {
        setItems(prev => prev.filter(i => i._id !== tempId));
      }
    }
  }, [isAuthenticated, currentUser, items]);

  const inWishlist = useCallback(
    (productId) => items.some(i => i.product?._id === productId || i.product?.id === productId),
    [items]
  );

  const removeFromWishlist = useCallback(async (productId) => {
    const item = items.find(i => i.product?._id === productId || i.product?.id === productId);
    if (!item) return;
    setItems(prev => prev.filter(i => i._id !== item._id));
    await api.delete(`/wishlist/${item._id}`).catch(() => {});
  }, [items]);

  const totalWishlist = items.length;

  return (
    <WishlistContext.Provider
      value={{ items, toggleWishlist, inWishlist, removeFromWishlist, totalWishlist, loaded }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
