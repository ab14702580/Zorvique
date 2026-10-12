import { X, ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart, getProductImage, getProductName } from "../../context/CartContext";
import { Link } from "react-router-dom";

export default function CartDrawer() {
  const {
    items,
    drawerOpen,
    setDrawerOpen,
    removeFromCart,
    updateQty,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

  // Consistent product id extraction
  const pid = (product) => product?._id || product?.id || '';

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className="fixed top-0 left-0 h-full z-[70] flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out w-full sm:w-[380px]"
        style={{ transform: drawerOpen ? "translateX(0)" : "translateX(-100%)" }}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9] shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-[#E11D48]" />
            <span className="text-[16px] font-bold text-[#0F172A]">My Cart</span>
            {totalItems > 0 && (
              <span className="px-2 py-0.5 bg-[#FFF1F3] text-[#E11D48] text-[11px] font-bold rounded-full border border-[#FECDD3]">
                {totalItems}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E2E8F0] text-[#64748B] hover:border-[#E11D48] hover:text-[#E11D48] transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X size={16} />
          </button>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="w-20 h-20 rounded-full bg-[#FFF1F3] flex items-center justify-center">
                <ShoppingBag size={36} className="text-[#FECDD3]" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#1E293B]">Your cart is empty</p>
                <p className="text-[13px] text-[#94A3B8] mt-1">Add products to see them here</p>
              </div>
              <button type="button"
                onClick={() => setDrawerOpen(false)}
                className="px-5 py-2 bg-[#E11D48] text-white text-[13px] font-semibold rounded-lg hover:bg-[#BE185D] transition-colors cursor-pointer">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(({ product, qty }) => {
              const productId = pid(product);
              const image     = getProductImage(product);
              const name      = getProductName(product);
              const price     = product.price || 0;

              return (
                <div key={productId}
                  className="flex items-start gap-3 bg-[#F9FAFB] rounded-xl p-3 border border-[#F1F5F9]">

                  {/* Image */}
                  <div className="w-14 h-14 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-center shrink-0 overflow-hidden">
                    {image
                      ? <img src={image} alt={name} className="w-full h-full object-cover" />
                      : <ShoppingBag size={22} className="text-[#FECDD3]" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#1E293B] leading-4 line-clamp-2">{name}</p>
                    {/* Color / size variant */}
                    {(product.selectedColor || product.selectedSize) && (
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">
                        {product.selectedColor}{product.selectedSize ? ` · ${product.selectedSize}` : ''}
                      </p>
                    )}
                    <p className="text-[13px] font-bold text-[#E11D48] mt-1">{fmt(price)}</p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button type="button"
                        onClick={() => updateQty(productId, qty - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-[#E2E8F0] text-[#64748B] hover:border-[#E11D48] hover:text-[#E11D48] transition-colors cursor-pointer"
                        aria-label="Decrease">
                        <Minus size={11} />
                      </button>
                      <span className="text-[13px] font-semibold text-[#1E293B] w-5 text-center">{qty}</span>
                      <button type="button"
                        onClick={() => updateQty(productId, qty + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-[#E2E8F0] text-[#64748B] hover:border-[#E11D48] hover:text-[#E11D48] transition-colors cursor-pointer"
                        aria-label="Increase">
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal + remove */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[12px] font-bold text-[#334155]">{fmt(price * qty)}</span>
                    <button type="button"
                      onClick={() => removeFromCart(productId)}
                      className="w-6 h-6 flex items-center justify-center rounded text-[#94A3B8] hover:text-[#E11D48] transition-colors cursor-pointer"
                      aria-label="Remove item">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-[#F1F5F9] px-5 py-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[12px] text-[#64748B]">
                <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                <span className="font-semibold text-[#1E293B]">{fmt(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-[12px] text-[#64748B]">
                <span>Shipping</span>
                <span className="font-semibold text-[#10B981]">Free</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-2 mt-1">
                <span className="text-[14px] font-bold text-[#0F172A]">Total</span>
                <span className="text-[16px] font-extrabold text-[#E11D48]">{fmt(totalPrice)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={() => setDrawerOpen(false)}
              className="block w-full py-3 bg-[#E11D48] text-white text-[13px] font-bold rounded-xl text-center hover:bg-[#BE185D] transition-colors shadow-[0_2px_8px_rgba(225,29,72,0.25)]"
            >
              Proceed to Checkout
            </Link>
            <button type="button"
              onClick={clearCart}
              className="w-full py-2 text-[12px] font-semibold text-[#64748B] border border-[#E2E8F0] rounded-xl hover:border-[#E11D48] hover:text-[#E11D48] transition-colors cursor-pointer">
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
