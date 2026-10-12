import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import DashboardLayout from '../../../Component/DashboardLayout/DashboardLayout';
import { useWishlist } from '../../../context/WishlistContext';
import { useCart, getProductImage, getProductName } from '../../../context/CartContext';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { items, removeFromWishlist, loaded } = useWishlist();
  const { addToCart, inCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id || product.id);
  };

  return (
    <DashboardLayout activeId="wishlist">

      <div className="flex items-center justify-between">
        <h1 className="text-[14px] font-semibold text-gray-800 tracking-[-0.35px] leading-5"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          Wishlist
        </h1>
        <span className="text-xs text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Loading */}
      {!loaded ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 size={22} className="animate-spin text-rose-400" />
        </div>
      ) : items.length === 0 ? (
        /* Empty state */
        <div className="w-full bg-white border border-gray-100 rounded-xl flex flex-col items-center justify-center px-8 py-16 gap-3">
          <Heart size={36} strokeWidth={1.2} className="text-gray-200" />
          <p className="text-sm font-medium text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
            Your wishlist is empty
          </p>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="mt-1 px-5 h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Browse Products
          </button>
        </div>
      ) : (
        /* Product grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => {
            const product = item.product || item;
            const pid     = product._id || product.id;
            const image   = getProductImage(product);
            const name    = getProductName(product);
            const alreadyInCart = inCart(pid);

            return (
              <div key={item._id || pid}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col group">

                {/* Image */}
                <div
                  className="relative aspect-[4/3] bg-gray-50 overflow-hidden cursor-pointer"
                  onClick={() => pid && navigate(`/product/${pid}`)}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart size={32} strokeWidth={1.2} className="text-gray-200" />
                    </div>
                  )}

                  {/* Remove btn overlay */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFromWishlist(pid); }}
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/90 rounded-full shadow-sm text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <p
                    className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 cursor-pointer hover:text-rose-600 transition-colors"
                    onClick={() => pid && navigate(`/product/${pid}`)}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {name}
                  </p>

                  <div className="flex items-center justify-between mt-auto gap-2">
                    <p className="text-sm font-bold text-rose-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {product.price != null ? `$${Number(product.price).toFixed(2)}` : '—'}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleMoveToCart(product)}
                      disabled={alreadyInCart}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed
                        ${alreadyInCart
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <ShoppingCart size={12} />
                      {alreadyInCart ? 'In Cart' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
