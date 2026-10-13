import { Link } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { getProductImage, getProductName, useCart } from "../../context/CartContext";

const fmt = (amount) => `$${Number(amount || 0).toFixed(2)}`;

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQty, removeFromCart, clearCart } = useCart();

  return (
    <main className="min-h-[60vh] bg-[#F8FAFC]">
      <div className="max-w-[1100px] mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between gap-4 mb-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#E11D48]">Your selection</p>
            <h1 className="text-2xl font-bold text-[#172033] mt-1">Shopping cart</h1>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-[#475569] hover:text-[#E11D48]">
            <ArrowLeft size={16} /> Continue shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 bg-white border border-[#E2E8F0] rounded-xl text-center">
            <ShoppingBag size={36} className="text-[#94A3B8]" />
            <div>
              <h2 className="font-semibold text-[#172033]">Your cart is empty</h2>
              <p className="text-sm text-[#64748B] mt-1">Products you add will appear here.</p>
            </div>
            <Link to="/products" className="px-4 py-2 rounded-lg bg-[#E11D48] text-white text-sm font-semibold">Browse products</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
            <section className="bg-white border border-[#E2E8F0] rounded-xl divide-y divide-[#E2E8F0]">
              {items.map(({ product, qty }) => {
                const id = product._id || product.id;
                const image = getProductImage(product);
                const name = getProductName(product);
                const price = Number(product.price || 0);
                return (
                  <article key={id} className="flex gap-4 p-4 sm:p-5">
                    <Link to={`/product/${id}`} className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg bg-[#F1F5F9] overflow-hidden flex items-center justify-center">
                      {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : <ShoppingBag size={24} className="text-[#94A3B8]" />}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${id}`} className="font-semibold text-sm text-[#172033] hover:text-[#E11D48] line-clamp-2">{name}</Link>
                      {(product.selectedColor || product.selectedSize) && <p className="text-xs text-[#64748B] mt-1">{product.selectedColor}{product.selectedSize ? ` · ${product.selectedSize}` : ""}</p>}
                      <p className="font-bold text-[#E11D48] mt-2">{fmt(price)}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <button type="button" onClick={() => updateQty(id, qty - 1)} aria-label={`Decrease quantity of ${name}`} className="w-8 h-8 grid place-items-center border border-[#CBD5E1] rounded-md hover:border-[#E11D48]"><Minus size={14} /></button>
                        <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{qty}</span>
                        <button type="button" onClick={() => updateQty(id, qty + 1)} aria-label={`Increase quantity of ${name}`} className="w-8 h-8 grid place-items-center border border-[#CBD5E1] rounded-md hover:border-[#E11D48]"><Plus size={14} /></button>
                        <button type="button" onClick={() => removeFromCart(id)} className="inline-flex items-center gap-1.5 ml-2 text-xs font-medium text-[#64748B] hover:text-[#E11D48]" aria-label={`Remove ${name}`}><Trash2 size={14} /> Remove</button>
                      </div>
                    </div>
                    <p className="hidden sm:block text-sm font-bold text-[#172033] shrink-0">{fmt(price * qty)}</p>
                  </article>
                );
              })}
              <div className="flex justify-end p-4">
                <button type="button" onClick={clearCart} className="text-xs font-semibold text-[#64748B] hover:text-[#E11D48]">Clear cart</button>
              </div>
            </section>

            <aside className="bg-white border border-[#E2E8F0] rounded-xl p-5 sticky top-24">
              <h2 className="font-bold text-[#172033]">Order summary</h2>
              <div className="flex justify-between mt-5 text-sm text-[#64748B]"><span>Items ({totalItems})</span><span>{fmt(totalPrice)}</span></div>
              <div className="flex justify-between mt-3 text-sm text-[#64748B]"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="border-t border-[#E2E8F0] mt-4 pt-4 flex justify-between font-bold text-[#172033]"><span>Subtotal</span><span>{fmt(totalPrice)}</span></div>
              <Link to="/checkout" className="mt-5 h-11 w-full flex items-center justify-center rounded-lg bg-[#E11D48] hover:bg-[#BE185D] text-white text-sm font-bold">Proceed to checkout</Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
