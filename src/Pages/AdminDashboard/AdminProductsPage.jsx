import { useState, useEffect, useCallback } from 'react';
import {
  Package, Search, RefreshCw, Loader2, X,
  ChevronLeft, ChevronRight, Flame, Zap, Star, Gift,
  Pencil, Save, DollarSign, ImagePlus, CheckCircle2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminDashboardLayout from '../../Component/AdminDashboardLayout/AdminDashboardLayout';
import api from '../../api/axios';

const IMGBB_KEY = '97f73f7011f85454774ead4305c4d1fa';
const PAGE_SIZE = 10;

const TAG_OPTIONS = [
  { value: '',          label: 'No Tag',      icon: X,     cls: 'text-slate-500 bg-slate-100' },
  { value: 'flash',     label: 'Flash',       icon: Zap,   cls: 'text-orange-600 bg-orange-100' },
  { value: 'justforyou',label: 'Just For You',icon: Star,  cls: 'text-indigo-600 bg-indigo-100' },
  { value: 'popular',   label: 'Popular',     icon: Flame, cls: 'text-rose-600 bg-rose-100' },
  { value: 'bestdeal',  label: 'Best Deal',   icon: Gift,  cls: 'text-emerald-600 bg-emerald-100' },
];

const DISCOUNT_OPTIONS = ['0%','5%','10%','15%','20%','25%','30%','40%','50%'];

const inputCls = 'w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition-colors bg-white';
const labelCls = 'text-xs font-semibold text-slate-600 mb-1 block';

function TagBadge({ tag }) {
  const opt = TAG_OPTIONS.find(t => t.value === tag) || TAG_OPTIONS[0];
  const Icon = opt.icon;
  if (!tag) return <span className="text-[10px] text-slate-400 italic">none</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${opt.cls}`}>
      <Icon size={9} /> {opt.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded w-full" /></td>
      ))}
    </tr>
  );
}

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditProductModal({ product, onClose, onSaved }) {
  const [form,       setForm]       = useState({
    title:           product.title       || product.name || '',
    category:        product.category    || '',
    price:           product.price       ?? '',
    discount:        product.discount    || '0%',
    description:     product.description || '',
    quantity:        product.quantity    ?? '',
    tags:            product.tags        || '',
    sellerShopeName: product.sellerShopeName || '',
    productImg:      product.productImg  || '',
    buyingPrice:     product.buyingPrice ?? '',
    commission:      product.commission  ?? '',
  });
  const [saving,     setSaving]     = useState(false);
  const [imgUpl,     setImgUpl]     = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const uploadImage = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'Image must be under 5MB', confirmButtonColor: '#e11d48' });
      return;
    }
    setImgUpl(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res  = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) setForm(p => ({ ...p, productImg: data.data.url }));
    } catch {
      Swal.fire({ icon: 'error', title: 'Upload failed', confirmButtonColor: '#e11d48' });
    } finally { setImgUpl(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category.trim()) {
      Swal.fire({ icon: 'warning', title: 'Title and category are required', confirmButtonColor: '#e11d48' });
      return;
    }
    const bp    = parseFloat(form.buyingPrice) || 0;
    const cm    = parseFloat(form.commission)  || 0;
    const total = bp + cm;
    setSaving(true);
    try {
      await api.put(`/products/${product._id}`, {
        title:           form.title.trim(),
        category:        form.category.trim(),
        price:           total > 0 ? total : parseFloat(form.price) || 0,
        discount:        form.discount,
        description:     form.description,
        quantity:        parseInt(form.quantity) || 0,
        tags:            form.tags,
        sellerShopeName: form.sellerShopeName,
        productImg:      form.productImg,
        buyingPrice:     bp,
        commission:      cm,
        totalPrice:      total > 0 ? total : parseFloat(form.price) || 0,
        soldOut:         parseInt(form.quantity) === 0,
      });
      Swal.fire({ icon: 'success', title: 'Product updated!', timer: 1500, showConfirmButton: false });
      onSaved({ ...product, ...form, price: total > 0 ? total : parseFloat(form.price) || 0, tags: form.tags });
      onClose();
    } catch {
      Swal.fire({ icon: 'error', title: 'Update failed', confirmButtonColor: '#e11d48' });
    } finally { setSaving(false); }
  };

  const bp    = parseFloat(form.buyingPrice) || 0;
  const cm    = parseFloat(form.commission)  || 0;
  const total = bp + cm;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-8 pb-6 px-3 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
              <Pencil size={14} className="text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Edit Product</p>
              <p className="text-[11px] text-slate-400 truncate max-w-[300px]">{product.title || product.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Title */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Product Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className={inputCls} required />
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>Category *</label>
              <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Electronics" className={inputCls} required />
            </div>

            {/* Shop Name */}
            <div>
              <label className={labelCls}>Shop Name</label>
              <input name="sellerShopeName" value={form.sellerShopeName} onChange={handleChange} placeholder="Shop name" className={inputCls} />
            </div>

            {/* Tag selector */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Product Tag</label>
              <div className="flex items-center gap-2 flex-wrap">
                {TAG_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const active = form.tags === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, tags: opt.value }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        active
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
                      }`}
                    >
                      <Icon size={11} /> {opt.label || 'No Tag'}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Selected: <span className="font-semibold text-rose-600">{TAG_OPTIONS.find(t => t.value === form.tags)?.label || 'No Tag'}</span>
              </p>
            </div>

            {/* Buying Price */}
            <div>
              <label className={labelCls}>Buying Price ($)</label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="buyingPrice" type="number" min="0" step="0.01"
                  value={form.buyingPrice} onChange={handleChange}
                  placeholder="0.00" className={`${inputCls} pl-8`} />
              </div>
            </div>

            {/* Commission */}
            <div>
              <label className={labelCls}>Commission / Profit ($)</label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="commission" type="number" min="0" step="0.01"
                  value={form.commission} onChange={handleChange}
                  placeholder="0.00" className={`${inputCls} pl-8`} />
              </div>
            </div>

            {/* Auto-price display */}
            {total > 0 && (
              <div className="sm:col-span-2">
                <div className="rounded-xl px-4 py-3 bg-rose-50 border border-rose-100 flex items-center justify-between">
                  <p className="text-xs font-semibold text-rose-700">
                    Total Price = ${bp.toFixed(2)} + ${cm.toFixed(2)} commission
                    <span className="ml-2 text-slate-500">· Admin 10%: ${(total * 0.1).toFixed(2)}</span>
                  </p>
                  <p className="text-xl font-bold text-rose-600">${total.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Price (manual override if no bp+cm) */}
            <div>
              <label className={labelCls}>Listed Price ($) *</label>
              <input name="price" type="number" min="0" step="0.01"
                value={total > 0 ? total.toFixed(2) : form.price}
                onChange={handleChange}
                placeholder="0.00"
                readOnly={total > 0}
                className={`${inputCls} ${total > 0 ? 'bg-slate-50 text-slate-400' : ''}`}
                required />
            </div>

            {/* Discount */}
            <div>
              <label className={labelCls}>Discount</label>
              <select name="discount" value={form.discount} onChange={handleChange}
                className={`${inputCls} cursor-pointer`}>
                {DISCOUNT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className={labelCls}>Stock Quantity</label>
              <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange}
                placeholder="0" className={inputCls} />
            </div>

            {/* Product Image */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Product Image</label>
              <div className="flex items-center gap-3 flex-wrap">
                {form.productImg ? (
                  <div className="relative flex-shrink-0">
                    <img src={form.productImg} alt="preview"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                    <button type="button"
                      onClick={() => setForm(p => ({ ...p, productImg: '' }))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer">
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer transition-colors flex-shrink-0">
                    {imgUpl ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                    {imgUpl ? 'Uploading…' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => uploadImage(e.target.files?.[0])} disabled={imgUpl} />
                  </label>
                )}
                <input name="productImg" value={form.productImg} onChange={handleChange}
                  placeholder="or paste image URL…"
                  className="flex-1 min-w-0 h-9 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3} placeholder="Product description…"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 transition-colors" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="px-5 h-9 border border-slate-200 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={saving || imgUpl}
              className="flex items-center gap-2 px-5 h-9 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed">
              {saving ? <><Loader2 size={13} className="animate-spin" />Saving…</> : <><Save size={13} />Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products,    setProducts]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [tagFilter,   setTagFilter]   = useState('');
  const [recalcBusy,  setRecalcBusy]  = useState(false);
  const [editProduct, setEditProduct] = useState(null); // product being edited

  const fetchProducts = useCallback(async (pg = 1, q = search, t = tagFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: PAGE_SIZE });
      if (q) params.set('search', q);
      if (t) params.set('tag', t);
      const res = await api.get(`/admin/products?${params}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages || 1);
      setPage(pg);
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to load products', confirmButtonColor: '#e11d48' });
    } finally {
      setLoading(false);
    }
  }, [search, tagFilter]);

  useEffect(() => { fetchProducts(1, search, tagFilter); }, [search, tagFilter]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); };
  const clearSearch  = () => { setSearchInput(''); setSearch(''); };

  const handleRecalculate = async () => {
    const result = await Swal.fire({
      title: 'Auto-set Popular Tags?',
      html: `<p class="text-sm text-gray-600">Products with <b>10+ sales</b> and <b>4.0+ rating</b> will be tagged <b>popular</b>.</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Recalculate',
    });
    if (!result.isConfirmed) return;
    setRecalcBusy(true);
    try {
      const res = await api.post('/admin/products/recalculate-popular');
      Swal.fire({ icon: 'success', title: 'Done!', text: `${res.data.promoted} products updated.`, timer: 2000, showConfirmButton: false });
      fetchProducts(page, search, tagFilter);
    } catch {
      Swal.fire({ icon: 'error', title: 'Recalculation failed', confirmButtonColor: '#e11d48' });
    } finally {
      setRecalcBusy(false);
    }
  };

  const goPage = (n) => fetchProducts(Math.max(1, Math.min(n, totalPages)), search, tagFilter);

  const pageNums = () => {
    const nums = [];
    const start = Math.max(1, page - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };

  // When a product is saved from the modal, update it in-place
  const handleProductSaved = (updated) => {
    setProducts(prev => prev.map(p => p._id === updated._id ? { ...p, ...updated } : p));
  };

  return (
    <AdminDashboardLayout>
      {/* Edit modal */}
      {editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSaved={handleProductSaved}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">All Products</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} products · edit fields and set tags</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={handleRecalculate} disabled={recalcBusy}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50">
            {recalcBusy ? <Loader2 size={13} className="animate-spin" /> : <Flame size={13} />}
            Auto Popular
          </button>
          <button type="button" onClick={() => fetchProducts(page, search, tagFilter)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 transition-all cursor-pointer shadow-sm">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Search + tag filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by title, category, seller…"
            className="w-full h-9 pl-8 pr-8 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-300 transition" />
          {searchInput && (
            <button type="button" onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={13} />
            </button>
          )}
        </form>
        <div className="flex items-center gap-1.5 flex-wrap">
          {TAG_OPTIONS.map(opt => (
            <button key={opt.value} type="button"
              onClick={() => setTagFilter(prev => prev === opt.value ? '' : opt.value)}
              className={`px-3 h-9 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer border ${
                tagFilter === opt.value
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600'
              }`}>
              {opt.label || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Product', 'Seller', 'Category', 'Price', 'Stock', 'Rating', 'Tag', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
                : products.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Package size={36} strokeWidth={1.2} />
                          <p className="text-sm">No products found</p>
                          {(search || tagFilter) && (
                            <button type="button" onClick={() => { clearSearch(); setTagFilter(''); }}
                              className="text-xs text-rose-500 hover:underline cursor-pointer">
                              Clear filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                  : products.map(product => {
                    const pid = product._id;
                    return (
                      <tr key={pid} className="hover:bg-slate-50/50 transition-colors">
                        {/* Product */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.productImg
                              ? <img src={product.productImg} alt={product.title} className="w-10 h-10 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
                              : <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0"><Package size={16} className="text-slate-300" /></div>
                            }
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-700 truncate max-w-[160px]">{product.title || product.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Sold: {product.sold || 0}</p>
                            </div>
                          </div>
                        </td>
                        {/* Seller */}
                        <td className="px-4 py-3">
                          <p className="text-[11px] text-slate-600 truncate max-w-[130px]">{product.sellerShopeName || '—'}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{product.sellerEmail}</p>
                        </td>
                        {/* Category */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-600 capitalize">{product.category || '—'}</span>
                        </td>
                        {/* Price */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-slate-800">{fmt(product.price)}</p>
                          {product.discount && product.discount !== '0%' && (
                            <p className="text-[10px] text-rose-500">{product.discount} off</p>
                          )}
                        </td>
                        {/* Stock */}
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold ${
                            product.soldOut ? 'text-red-500' : product.quantity > 0 ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            {product.soldOut ? 'Sold Out' : product.quantity > 0 ? product.quantity : 'Out'}
                          </span>
                        </td>
                        {/* Rating */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-amber-600">
                            ★ {Number(product.review || 0).toFixed(1)}
                            <span className="text-slate-400 font-normal ml-1">({product.reviewPeopleQuantity || 0})</span>
                          </span>
                        </td>
                        {/* Tag */}
                        <td className="px-4 py-3">
                          <TagBadge tag={product.tags} />
                        </td>
                        {/* Actions — Edit button */}
                        <td className="px-4 py-3">
                          <button type="button"
                            onClick={() => setEditProduct(product)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-semibold transition-colors cursor-pointer">
                            <Pencil size={11} /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 flex-wrap gap-3">
            <p className="text-[12px] text-slate-500">
              Showing <span className="font-semibold text-slate-700">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}</span> of <span className="font-semibold text-slate-700">{total}</span>
            </p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => goPage(page - 1)} disabled={page <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600 disabled:opacity-30 transition-colors cursor-pointer">
                <ChevronLeft size={13} />
              </button>
              {pageNums().map(n => (
                <button key={n} type="button" onClick={() => goPage(n)}
                  className={`w-7 h-7 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                    n === page ? 'bg-rose-600 text-white shadow-sm' : 'border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600'
                  }`}>
                  {n}
                </button>
              ))}
              <button type="button" onClick={() => goPage(page + 1)} disabled={page >= totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600 disabled:opacity-30 transition-colors cursor-pointer">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
