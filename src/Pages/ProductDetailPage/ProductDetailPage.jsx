import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Heart, Share2, Star, Home, ShieldCheck,
  ChevronRight, ShoppingCart, Check,
} from 'lucide-react';
import { useCart }     from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth }     from '../../context/useAuth';
import api from '../../api/axios';

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating, max = 5, size = 'sm' }) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${starSize} ${
            i < Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : i < rating
              ? 'fill-amber-200 text-amber-400'
              : 'fill-slate-200 text-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Related Product Card ─────────────────────────────────────────────────────
function RelatedProductCard({ product }) {
  const { addToCart, inCart } = useCart();
  const navigate = useNavigate();
  const pid      = product._id || product.id;
  const isInCart = inCart(pid);

  return (
    <article
      onClick={() => navigate(`/product/${pid}`)}
      className="cursor-pointer flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden flex-1 min-w-0 hover:shadow-md transition-shadow"
    >
      <div className="relative p-2 bg-slate-50">
        <div className="bg-slate-50 rounded aspect-square flex items-center justify-center overflow-hidden">
          <img
            src={product.productImg || product.img || 'https://placehold.co/300x300?text=No+Image'}
            alt={product.title || product.name}
            className="w-full h-full object-cover rounded"
          />
        </div>
      </div>
      <div className="flex flex-col flex-1 p-2.5 gap-1">
        <h3 className="text-xs font-semibold text-slate-800 leading-4 line-clamp-2">
          {product.title || product.name}
        </h3>
        <div className="flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          <span className="text-[11px] text-slate-400">
            {product.review || product.rating || 0} ({product.reviewPeopleQuantity || product.reviews || 0}) • {product.sold} Sold
          </span>
        </div>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-xs font-bold text-rose-500">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>
      </div>
      <div className="px-2.5 pb-2.5">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart({ ...product, id: pid, _id: pid }, 1);
            }}
            className={`flex items-center justify-center w-6 h-6 border rounded transition-colors cursor-pointer ${
              isInCart ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
            }`}
            aria-label="Add to cart"
          >
            <ShoppingCart className={`w-3 h-3 ${isInCart ? 'text-rose-500' : 'text-slate-500'}`} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${pid}`); }}
            className="flex-1 py-1 bg-rose-500 text-white text-[11px] font-semibold rounded text-center hover:bg-rose-600 transition-colors cursor-pointer"
          >
            View
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 sm:p-8 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[42%] bg-slate-200 rounded-xl aspect-[4/3]" />
        <div className="flex-1 flex flex-col gap-4">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-8 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-10 bg-slate-200 rounded w-1/3 mt-4" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { addToCart, inCart, setDrawerOpen } = useCart();
  const { toggleWishlist, inWishlist }  = useWishlist();
  const { isAuthenticated }             = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const [activeImage,   setActiveImage]   = useState(0);
  const [selectedColorIdx, setColorIdx]   = useState(0);
  const [selectedSize,  setSelectedSize]  = useState('');
  const [quantity,      setQuantity]      = useState(1);
  const [activeTab,     setActiveTab]     = useState('description');
  const [addedToCart,   setAddedToCart]   = useState(false);
  const [shopId,        setShopId]        = useState(null);
  const [shopImg,       setShopImg]       = useState(null);  // seller's shop logo
  const [shopRating,    setShopRating]    = useState(null);  // seller's live avg rating
  const [reviews,       setReviews]       = useState([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  // ── Fetch product ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setActiveImage(0);
    setColorIdx(0);
    setQuantity(1);
    setAddedToCart(false);
    setShopId(null);
    setShopImg(null);
    setShopRating(null);
    setReviews([]);
    setReviewsLoaded(false);

    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data);
        const firstSize = res.data?.color?.[0]?.sizes?.[0]?.size || '';
        setSelectedSize(firstSize);
        if (res.data?.category) {
          api.get(`/products?category=${encodeURIComponent(res.data.category)}`)
            .then(r => setRelated(r.data.filter(p => p._id.toString() !== id).slice(0, 6)))
            .catch(() => {});
        }
        // Lookup seller's shop for Visit Store link + shop logo + live rating
        if (res.data?.sellerEmail) {
          const sellerEmail = res.data.sellerEmail;
          // Try both email and ownerEmail fields
          api.get(`/shops?email=${encodeURIComponent(sellerEmail)}`)
            .then(r => {
              const shop = r.data?.[0];
              if (shop?._id) setShopId(shop._id);
              if (shop?.img)  setShopImg(shop.img);
              // If not found by email, try ownerEmail
              if (!shop) {
                return api.get(`/shops?ownerEmail=${encodeURIComponent(sellerEmail)}`);
              }
            })
            .then(r2 => {
              if (r2?.data?.[0]) {
                const shop2 = r2.data[0];
                if (shop2._id) setShopId(shop2._id);
                if (shop2.img)  setShopImg(shop2.img);
              }
            })
            .catch(() => {});
          // Fetch reviews to compute live avg rating
          api.get(`/reviews?sellerEmail=${encodeURIComponent(sellerEmail)}`)
            .then(r => {
              if (r.data?.length) {
                const avg = r.data.reduce((s, rv) => s + rv.rating, 0) / r.data.length;
                setShopRating(parseFloat(avg.toFixed(1)));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center flex flex-col gap-3">
          <p className="text-slate-500 text-sm">{error || 'Product not found.'}</p>
          <button type="button" onClick={() => navigate('/products')}
            className="text-rose-500 text-sm font-semibold hover:underline cursor-pointer">
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────────
  const pid          = product._id || product.id;
  const images       = product.detailspageImg?.length ? product.detailspageImg : [product.productImg].filter(Boolean);
  const colors       = product.color || [];
  const activeColor  = colors[selectedColorIdx] || {};
  const sizes        = activeColor.sizes || [];
  const currentPrice = activeColor.price || product.price;
  const isWishlisted = inWishlist(pid);
  const isInCart     = inCart(pid);

  let discountPct  = 0;
  if (product.discount && product.discount !== '0%') discountPct = parseFloat(product.discount);
  const originalPrice = discountPct > 0 ? Math.round(currentPrice / (1 - discountPct / 100)) : null;

  // ── Normalized product for cart/wishlist ─────────────────────────────────────
  const normalizedProduct = {
    ...product,
    _id:   pid,
    id:    pid,
    price: currentPrice,
    image: images[0] || product.productImg || '',
    name:  product.title || product.name || '',
    selectedColor: activeColor.name || '',
    selectedSize,
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (isInCart) {
      // Already in cart — just open the drawer
      setDrawerOpen(true);
      return;
    }
    addToCart(normalizedProduct, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    // Only add if not already in cart — avoid duplicate
    if (!isInCart) {
      addToCart(normalizedProduct, quantity);
    }
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    toggleWishlist(normalizedProduct);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 flex-wrap">
            <li>
              <button type="button" onClick={() => navigate('/')}
                className="flex items-center gap-1 text-slate-500 hover:text-rose-500 transition-colors text-xs font-medium cursor-pointer">
                <Home className="w-3.5 h-3.5" /><span>Home</span>
              </button>
            </li>
            <li className="text-slate-300 text-xs">/</li>
            <li>
              <button type="button"
                onClick={() => navigate(`/products?category=${encodeURIComponent(product.category || '')}`)}
                className="text-xs font-medium text-slate-500 hover:text-rose-500 transition-colors cursor-pointer">
                {product.category || 'Products'}
              </button>
            </li>
            <li className="text-slate-300 text-xs">/</li>
            <li><span className="text-xs font-semibold text-slate-700 line-clamp-1">{product.title}</span></li>
          </ol>
        </nav>

        {/* Main card */}
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col gap-8">
          <section className="flex flex-col lg:flex-row gap-8">

            {/* Gallery */}
            <div className="flex flex-col gap-4 w-full lg:w-[42%] xl:w-[38%] shrink-0">
              <div className="flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-4 aspect-[4/3] overflow-hidden">
                {images[activeImage]
                  ? <img src={images[activeImage]} alt={product.title} className="w-full h-full object-cover rounded-lg" />
                  : <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-sm">No image</div>
                }
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} type="button" onClick={() => setActiveImage(i)}
                      className={`cursor-pointer shrink-0 w-20 h-20 rounded-lg p-1 border-2 transition-all overflow-hidden ${
                        activeImage === i ? 'border-rose-500 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                      }`}>
                      <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover rounded" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-0 flex-1 min-w-0">

              {/* Brand + actions */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-widest text-rose-500 uppercase">
                  {product.brands || product.category}
                </span>
                <div className="flex items-center gap-2">
                  {/* Wishlist toggle — uses WishlistContext */}
                  <button type="button"
                    onClick={handleToggleWishlist}
                    className="cursor-pointer w-8 h-8 flex items-center justify-center border border-slate-200 rounded-full hover:border-rose-300 transition-colors"
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                  </button>
                  <button type="button" className="cursor-pointer w-8 h-8 flex items-center justify-center border border-slate-200 rounded-full hover:border-slate-300 transition-colors">
                    <Share2 className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="mt-1 text-3xl font-bold text-slate-900 leading-tight">{product.title}</h1>

              {/* Description */}
              <p className="mt-1.5 text-sm text-slate-500 leading-5">{product.description}</p>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <StarRating rating={product.review} />
                <span className="text-xs font-medium text-slate-500">
                  {product.review} ({product.reviewPeopleQuantity} reviews)
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs font-medium text-emerald-600">{product.sold}+ sold</span>
              </div>

              {/* Price */}
              <div className="mt-4 py-4 border-y border-slate-100 flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  ${Number(currentPrice).toFixed(2)}
                </span>
                {originalPrice && (
                  <>
                    <span className="text-base text-slate-400 line-through">${Number(originalPrice).toFixed(2)}</span>
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs font-semibold rounded">
                      Save {discountPct}%
                    </span>
                  </>
                )}
              </div>

              {/* Options */}
              <div className="mt-4 flex flex-col gap-4">

                {/* Color */}
                {colors.length > 0 && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="w-16 text-xs font-medium text-slate-500 shrink-0">Color:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {colors.map((color, i) => (
                        <button key={i} type="button"
                          onClick={() => { setColorIdx(i); setSelectedSize(color.sizes?.[0]?.size || ''); }}
                          className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-all text-xs font-medium cursor-pointer ${
                            selectedColorIdx === i
                              ? 'border-rose-500 text-rose-600 bg-rose-50'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}>
                          <span className="w-3.5 h-3.5 rounded-full border border-white shadow-sm shrink-0"
                            style={{ background: color.code }} />
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size */}
                {sizes.length > 0 && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="w-16 text-xs font-medium text-slate-500 shrink-0">Size:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {sizes.map(s => (
                        <button key={s.size} type="button"
                          onClick={() => setSelectedSize(s.size)}
                          disabled={s.quantity === 0}
                          className={`px-3 py-1 text-xs font-medium rounded border transition-all cursor-pointer ${
                            selectedSize === s.size
                              ? 'border-2 border-rose-500 text-rose-600 font-semibold bg-white'
                              : s.quantity === 0
                              ? 'border border-slate-100 text-slate-300 cursor-not-allowed'
                              : 'border border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                          }`}>
                          {s.size}
                          {s.quantity === 0 && <span className="ml-1 text-[9px]">(Out)</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="w-16 text-xs font-medium text-slate-500 shrink-0">Quantity:</span>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                    <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 text-sm transition-colors cursor-pointer">−</button>
                    <span className="w-10 text-center text-xs font-semibold text-slate-800 border-x border-slate-200 py-1.5">
                      {quantity}
                    </span>
                    <button type="button" onClick={() => setQuantity(q => q + 1)}
                      className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 text-sm transition-colors cursor-pointer">+</button>
                  </div>
                  <span className={`text-xs font-semibold ${product.quantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex gap-3 flex-col sm:flex-row">
                <button type="button" onClick={handleAddToCart}
                  className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-white text-sm font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all cursor-pointer
                    ${addedToCart ? 'bg-emerald-500 hover:bg-emerald-600' : isInCart ? 'bg-slate-700 hover:bg-slate-800' : 'bg-rose-500 hover:bg-rose-600'}`}>
                  {addedToCart
                    ? <><Check className="w-4 h-4" /> Added!</>
                    : isInCart
                    ? <><ShoppingCart className="w-4 h-4" /> View in Cart</>
                    : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                  }
                </button>
                <button type="button" onClick={handleBuyNow}
                  className="flex-1 py-2.5 border border-rose-500 text-rose-500 text-sm font-semibold rounded-lg hover:bg-rose-50 active:scale-[0.98] transition-all cursor-pointer">
                  Buy Now
                </button>
              </div>

              {/* Seller card */}
              <div className="mt-6 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                  <div className="flex items-center gap-3">
                    {shopImg
                      ? <img src={shopImg} alt={product.sellerShopeName}
                          className="w-9 h-9 rounded-full object-cover border border-amber-300 flex-shrink-0" />
                      : (
                        <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-amber-700">
                            {product.sellerShopeName?.charAt(0)?.toUpperCase() || 'S'}
                          </span>
                        </div>
                      )
                    }
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{product.sellerShopeName || 'Seller'}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <span className="text-[11px] text-slate-400">{product.sellerEmail}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-700">
                      {shopRating !== null ? shopRating.toFixed(1) : '—'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2.5">
                  <button type="button"
                    onClick={() => shopId ? navigate(`/shop/${shopId}`) : navigate('/shops')}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer">
                    Visit Store →
                  </button>
                  <span className="text-[11px] text-slate-400">
                    {product.digitalProduct ? '⚡ Instant delivery' : '🚚 Est. delivery: 3–5 days'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <section className="border-t border-slate-200 pt-6 flex flex-col gap-6">
            <div className="flex border-b border-slate-200 gap-6">
              {['description', 'reviews'].map(tab => (
                <button key={tab} type="button" onClick={() => {
                    setActiveTab(tab);
                    // Lazy-load reviews on first click
                    if (tab === 'reviews' && !reviewsLoaded && pid) {
                      setReviewsLoaded(true);
                      api.get(`/reviews?productId=${pid}`)
                        .then(r => setReviews(r.data))
                        .catch(() => {});
                    }
                  }}
                  className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px cursor-pointer ${
                    activeTab === tab
                      ? 'border-rose-500 text-rose-500 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}>
                  {tab === 'reviews' ? `Reviews (${product.reviewPeopleQuantity || 0})` : 'Description'}
                </button>
              ))}
            </div>
            {activeTab === 'description' && (
              <p className="text-xs text-slate-600 leading-5 max-w-3xl">{product.description}</p>
            )}
            {activeTab === 'reviews' && (
              reviews.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="flex flex-col gap-4 max-w-2xl">
                  {/* Avg rating summary */}
                  <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <span className="text-3xl font-extrabold text-slate-800">{product.review?.toFixed(1)}</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <span key={n} className={`text-base ${n <= Math.round(product.review || 0) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">{reviews.length} reviews</span>
                    </div>
                  </div>
                  {/* Individual reviews */}
                  {reviews.map(r => (
                    <div key={r._id} className="border border-slate-100 rounded-xl p-4 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-700">{r.buyerEmail}</span>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(n => (
                            <span key={n} className={`text-[11px] ${n <= r.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : ''}
                        </span>
                      </div>
                      {r.title && <p className="text-xs font-semibold text-slate-800">{r.title}</p>}
                      {r.body  && <p className="text-xs text-slate-600 leading-5">{r.body}</p>}
                    </div>
                  ))}
                </div>
              )
            )}
          </section>

          {/* Related products */}
          {related.length > 0 && (
            <section className="border-t border-slate-200 pt-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">You May Also Like</h2>
                <button type="button" onClick={() => navigate('/products')}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {related.map(rp => <RelatedProductCard key={rp._id} product={rp} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
