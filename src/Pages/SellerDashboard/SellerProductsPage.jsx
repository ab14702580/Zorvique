import { useState, useEffect } from 'react';
import {
  Package, Plus, Loader2, Trash2, X, Search,
  RefreshCw, ImagePlus, Tag, ToggleLeft, ToggleRight,
  Pencil, Minus, CheckCircle2, DollarSign,
} from 'lucide-react';
import Swal from 'sweetalert2';
import SellerDashboardLayout from '../../Component/SellerDashboardLayout/SellerDashboardLayout';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';

const IMGBB_KEY = '97f73f7011f85454774ead4305c4d1fa';

const inputCls = 'w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors bg-white';
const labelCls = 'text-xs font-semibold text-slate-600 mb-1 block';

const INITIAL_FORM = {
  title: '', category: '', price: '', discount: '0%',
  description: '', quantity: '', tags: '',
  sellerShopeName: '', productImg: '',
  buyingPrice: '', commission: '',
};

const TAG_OPTIONS = ['flash', 'justforyou', 'popular', 'bestdeal'];

// Compute total selling price = buyingPrice + commission
function calcTotal(buyingPrice, commission) {
  const bp = parseFloat(buyingPrice) || 0;
  const cm = parseFloat(commission) || 0;
  return bp + cm;
}

export default function SellerProductsPage() {
  const { currentUser, dbUser } = useAuth();
  const email    = currentUser?.email || '';
  const isAdmin  = dbUser?.role === 'admin';

  const [products,      setProducts]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showForm,      setShowForm]      = useState(false);
  const [form,          setForm]          = useState(INITIAL_FORM);
  const [submitting,    setSubmitting]    = useState(false);
  const [imgUploading,  setImgUploading]  = useState(false);
  const [query,         setQuery]         = useState('');

  // ── Edit state ───────────────────────────────────────────────────────────────
  const [editProduct,   setEditProduct]   = useState(null);   // product being edited
  const [editForm,      setEditForm]      = useState({});
  const [editSaving,    setEditSaving]    = useState(false);
  const [editImgUpl,    setEditImgUpl]    = useState(false);

  const fetchProducts = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.get(`/products?sellerEmail=${encodeURIComponent(email)}`);
      setProducts(res.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to load products', confirmButtonColor: '#6366f1' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [email]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleEditChange = (e) => setEditForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // ── Open edit modal ──────────────────────────────────────────────────────────
  const openEdit = (product) => {
    setEditProduct(product);
    setEditForm({
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
  };

  const closeEdit = () => { setEditProduct(null); setEditForm({}); };

  // Quantity stepper helpers for the edit modal
  const stepQty = (delta) => {
    setEditForm(p => ({
      ...p,
      quantity: Math.max(0, (parseInt(p.quantity) || 0) + delta),
    }));
  };

  // ── Image upload (add form) ──────────────────────────────────────────────────
  const uploadImage = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'Image must be under 5MB', confirmButtonColor: '#6366f1' });
      return;
    }
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res  = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) setForm(p => ({ ...p, productImg: data.data.url }));
    } catch {
      Swal.fire({ icon: 'error', title: 'Image upload failed', confirmButtonColor: '#6366f1' });
    } finally { setImgUploading(false); }
  };

  // ── Image upload (edit modal) ────────────────────────────────────────────────
  const uploadEditImage = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'Image must be under 5MB', confirmButtonColor: '#6366f1' });
      return;
    }
    setEditImgUpl(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res  = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) setEditForm(p => ({ ...p, productImg: data.data.url }));
    } catch {
      Swal.fire({ icon: 'error', title: 'Image upload failed', confirmButtonColor: '#6366f1' });
    } finally { setEditImgUpl(false); }
  };

  // ── Submit new product ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price || !form.category.trim()) {
      Swal.fire({ icon: 'warning', title: 'Title, category and price are required', confirmButtonColor: '#6366f1' });
      return;
    }
    const bp    = parseFloat(form.buyingPrice) || 0;
    const cm    = parseFloat(form.commission)  || 0;
    const total = calcTotal(bp, cm);

    setSubmitting(true);
    try {
      await api.post('/products', {
        ...form,
        price:           parseFloat(form.price),
        quantity:        parseInt(form.quantity) || 0,
        buyingPrice:     bp,
        commission:      cm,
        totalPrice:      total || parseFloat(form.price),
        sellerEmail:     email,
        sellerShopeName: form.sellerShopeName || dbUser?.sellerInfo?.shopName || '',
        sold:            0,
        review:          0,
        reviewPeopleQuantity: 0,
        soldOut:         false,
        createdAt:       new Date(),
      });
      setForm(INITIAL_FORM);
      setShowForm(false);
      await fetchProducts();
      Swal.fire({ icon: 'success', title: 'Product added!', timer: 1800, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to add product', confirmButtonColor: '#6366f1' });
    } finally { setSubmitting(false); }
  };

  // ── Save edited product ───────────────────────────────────────────────────────
  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm.title?.trim() || !editForm.price || !editForm.category?.trim()) {
      Swal.fire({ icon: 'warning', title: 'Title, category and price are required', confirmButtonColor: '#6366f1' });
      return;
    }
    const bp    = parseFloat(editForm.buyingPrice) || 0;
    const cm    = parseFloat(editForm.commission)  || 0;
    const total = calcTotal(bp, cm);

    const id = editProduct._id || editProduct.id;
    setEditSaving(true);
    try {
      await api.put(`/products/${id}`, {
        title:       editForm.title.trim(),
        category:    editForm.category.trim(),
        price:       parseFloat(editForm.price),
        discount:    editForm.discount,
        description: editForm.description,
        quantity:    parseInt(editForm.quantity) || 0,
        tags:        editForm.tags,
        sellerShopeName: editForm.sellerShopeName,
        productImg:  editForm.productImg,
        buyingPrice: bp,
        commission:  cm,
        totalPrice:  total || parseFloat(editForm.price),
        soldOut:     parseInt(editForm.quantity) === 0,
      });
      closeEdit();
      await fetchProducts();
      Swal.fire({ icon: 'success', title: 'Product updated!', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Update failed', confirmButtonColor: '#6366f1' });
    } finally { setEditSaving(false); }
  };

  // ── Delete product ────────────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete this product?',
      text: name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
      Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Delete failed', confirmButtonColor: '#6366f1' });
    }
  };

  // ── Toggle sold-out ───────────────────────────────────────────────────────────
  const toggleSoldOut = async (product) => {
    const id     = product._id || product.id;
    const newVal = !product.soldOut;
    try {
      await api.put(`/products/${id}`, { soldOut: newVal, quantity: newVal ? 0 : product.quantity });
      setProducts(prev => prev.map(p =>
        (p._id || p.id) === id ? { ...p, soldOut: newVal, quantity: newVal ? 0 : p.quantity } : p
      ));
    } catch {
      Swal.fire({ icon: 'error', title: 'Update failed', confirmButtonColor: '#6366f1' });
    }
  };

  const filtered = products.filter(p =>
    (p.title || p.name || '').toLowerCase().includes(query.toLowerCase())
  );

  // Computed total for the live preview in the edit modal
  const editTotal = calcTotal(editForm.buyingPrice, editForm.commission);
  // Computed total for add form
  const addTotal  = calcTotal(form.buyingPrice, form.commission);

  return (
    <SellerDashboardLayout>
      {/* ── Edit Modal ─────────────────────────────────────────────────────────── */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-10 pb-6 px-3 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Pencil size={14} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Edit Product</p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[260px]">
                    {editProduct.title || editProduct.name}
                  </p>
                </div>
              </div>
              <button type="button" onClick={closeEdit}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className={labelCls}>Product Title *</label>
                  <input name="title" value={editForm.title} onChange={handleEditChange}
                    placeholder="e.g. Wireless Bluetooth Headphones" className={inputCls} required />
                </div>

                {/* Category */}
                <div>
                  <label className={labelCls}>Category *</label>
                  <input name="category" value={editForm.category} onChange={handleEditChange}
                    placeholder="e.g. Electronics" className={inputCls} required />
                </div>

                {/* Shop name */}
                <div>
                  <label className={labelCls}>Shop Name</label>
                  <input name="sellerShopeName" value={editForm.sellerShopeName} onChange={handleEditChange}
                    placeholder={dbUser?.sellerInfo?.shopName || 'Your shop name'} className={inputCls} />
                </div>

                {/* ── Pricing section ─────────────────────────────────── */}
                {/* Buying Price */}
                <div>
                  <label className={labelCls}>Buying Price ($)</label>
                  <div className="relative">
                    <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="buyingPrice" type="number" min="0" step="0.01"
                      value={editForm.buyingPrice} onChange={handleEditChange}
                      placeholder="0.00"
                      className={`${inputCls} pl-8`} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Your cost to acquire this product</p>
                </div>

                {/* Commission */}
                <div>
                  <label className={labelCls}>Your Profit / Commission ($)</label>
                  <div className="relative">
                    <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="commission" type="number" min="0" step="0.01"
                      value={editForm.commission} onChange={handleEditChange}
                      placeholder="0.00"
                      className={`${inputCls} pl-8`} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Added on top of buying price</p>
                </div>

                {/* Total price display */}
                <div className="sm:col-span-2">
                  <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${
                    editTotal > 0 ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50 border border-slate-100'
                  }`}>
                    <div>
                      <p className="text-xs font-semibold text-slate-600">Total Selling Price (auto)</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Buying Price ${parseFloat(editForm.buyingPrice) || 0} + Commission ${parseFloat(editForm.commission) || 0}
                        {isAdmin && editTotal > 0 && (
                          <span className="ml-2 text-rose-500 font-semibold">
                            · Admin 10%: ${(editTotal * 0.10).toFixed(2)}
                            · Seller 90%: ${(editTotal * 0.90).toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-indigo-600">
                        ${editTotal > 0 ? editTotal.toFixed(2) : (parseFloat(editForm.price) || 0).toFixed(2)}
                      </p>
                      {editTotal > 0 && <p className="text-[10px] text-slate-400">selling price</p>}
                    </div>
                  </div>
                </div>

                {/* Selling price override */}
                <div>
                  <label className={labelCls}>Listed Price ($) *</label>
                  <input name="price" type="number" min="0" step="0.01"
                    value={editTotal > 0 ? editTotal.toFixed(2) : editForm.price}
                    onChange={handleEditChange}
                    placeholder="0.00"
                    className={`${inputCls} ${editTotal > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold' : ''}`}
                    readOnly={editTotal > 0}
                    required />
                  {editTotal > 0 && (
                    <p className="text-[10px] text-indigo-500 mt-1">Auto-set from buying price + commission</p>
                  )}
                </div>

                {/* Discount */}
                <div>
                  <label className={labelCls}>Discount</label>
                  <select name="discount" value={editForm.discount} onChange={handleEditChange}
                    className={`${inputCls} cursor-pointer`}>
                    {['0%','5%','10%','15%','20%','25%','30%','40%','50%'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity stepper */}
                <div className="sm:col-span-2">
                  <label className={labelCls}>Stock Quantity</label>
                  <div className="flex items-center gap-2 max-w-[240px]">
                    <button type="button" onClick={() => stepQty(-1)}
                      className="w-9 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer transition-colors flex-shrink-0">
                      <Minus size={14} />
                    </button>
                    <input name="quantity" type="number" min="0"
                      value={editForm.quantity} onChange={handleEditChange}
                      className={`${inputCls} text-center font-semibold`} />
                    <button type="button" onClick={() => stepQty(1)}
                      className="w-9 h-10 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-600 cursor-pointer transition-colors flex-shrink-0">
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Product tags (flash, popular, etc.) are set by admin based on sales &amp; ratings.</p>
                </div>

                {/* Product image */}
                <div className="sm:col-span-2">
                  <label className={labelCls}>Product Image</label>
                  <div className="flex items-center gap-3">
                    {editForm.productImg ? (
                      <div className="relative flex-shrink-0">
                        <img src={editForm.productImg} alt="preview"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                        <button type="button"
                          onClick={() => setEditForm(p => ({ ...p, productImg: '' }))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer">
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer transition-colors flex-shrink-0">
                        {editImgUpl ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                        {editImgUpl ? 'Uploading…' : 'Upload Image'}
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => uploadEditImage(e.target.files?.[0])} disabled={editImgUpl} />
                      </label>
                    )}
                    <p className="text-[11px] text-slate-400">or paste URL:</p>
                    <input name="productImg" value={editForm.productImg} onChange={handleEditChange}
                      placeholder="https://…"
                      className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className={labelCls}>Description</label>
                  <textarea name="description" value={editForm.description} onChange={handleEditChange}
                    rows={3} placeholder="Describe your product…"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button type="button" onClick={closeEdit}
                  className="px-5 h-9 border border-slate-200 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={editSaving || editImgUpl}
                  className="flex items-center gap-2 px-5 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed">
                  {editSaving
                    ? <><Loader2 size={13} className="animate-spin" />Saving…</>
                    : <><CheckCircle2 size={13} />Save Changes</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Products</h1>
          <p className="text-sm text-slate-400 mt-0.5">{products.length} products listed</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search products…" value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" />
          </div>
          <button type="button" onClick={fetchProducts}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer shadow-sm">
            <RefreshCw size={15} />
          </button>
          <button type="button" onClick={() => { setShowForm(v => !v); setForm(INITIAL_FORM); }}
            className="flex items-center gap-1.5 px-4 h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm">
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>
      </div>

      {/* ── Add product form ─────────────────────────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6">
          <p className="text-sm font-bold text-slate-800 mb-5">New Product</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Title */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Product Title *</label>
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Wireless Bluetooth Headphones" className={inputCls} required />
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>Category *</label>
              <input name="category" value={form.category} onChange={handleChange}
                placeholder="e.g. Electronics" className={inputCls} required />
            </div>

            {/* Shop name */}
            <div>
              <label className={labelCls}>Shop Name</label>
              <input name="sellerShopeName" value={form.sellerShopeName} onChange={handleChange}
                placeholder={dbUser?.sellerInfo?.shopName || 'Your shop name'} className={inputCls} />
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
              <p className="text-[10px] text-slate-400 mt-1">Your cost to acquire this product</p>
            </div>

            {/* Commission */}
            <div>
              <label className={labelCls}>Your Profit / Commission ($)</label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="commission" type="number" min="0" step="0.01"
                  value={form.commission} onChange={handleChange}
                  placeholder="0.00" className={`${inputCls} pl-8`} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Added on top of buying price</p>
            </div>

            {/* Total price display */}
            <div className="sm:col-span-2">
              <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${
                addTotal > 0 ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50 border border-slate-100'
              }`}>
                <div>
                  <p className="text-xs font-semibold text-slate-600">Total Selling Price (auto)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Buying Price ${parseFloat(form.buyingPrice) || 0} + Commission ${parseFloat(form.commission) || 0}
                    {isAdmin && addTotal > 0 && (
                      <span className="ml-2 text-rose-500 font-semibold">
                        · Admin 10%: ${(addTotal * 0.10).toFixed(2)}
                        · Seller 90%: ${(addTotal * 0.90).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-indigo-600">
                    ${addTotal > 0 ? addTotal.toFixed(2) : (parseFloat(form.price) || 0).toFixed(2)}
                  </p>
                  {addTotal > 0 && <p className="text-[10px] text-slate-400">selling price</p>}
                </div>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className={labelCls}>Listed Price ($) *</label>
              <input name="price" type="number" min="0" step="0.01"
                value={addTotal > 0 ? addTotal.toFixed(2) : form.price}
                onChange={handleChange}
                placeholder="0.00"
                className={`${inputCls} ${addTotal > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold' : ''}`}
                readOnly={addTotal > 0}
                required />
              {addTotal > 0 && (
                <p className="text-[10px] text-indigo-500 mt-1">Auto-set from buying price + commission</p>
              )}
            </div>

            {/* Discount */}
            <div>
              <label className={labelCls}>Discount</label>
              <select name="discount" value={form.discount} onChange={handleChange}
                className={`${inputCls} cursor-pointer`}>
                {['0%','5%','10%','15%','20%','25%','30%','40%','50%'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Stock Quantity</label>
              <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange}
                placeholder="0" className={inputCls} />
              <p className="text-[10px] text-slate-400 mt-1">Product tags (flash, popular, etc.) are managed by the admin.</p>
            </div>

            {/* Product image */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Product Image</label>
              <div className="flex items-center gap-3">
                {form.productImg ? (
                  <div className="relative">
                    <img src={form.productImg} alt="preview"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                    <button type="button" onClick={() => setForm(p => ({ ...p, productImg: '' }))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer">
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer transition-colors">
                    {imgUploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                    {imgUploading ? 'Uploading…' : 'Upload Image'}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => uploadImage(e.target.files?.[0])} disabled={imgUploading} />
                  </label>
                )}
                <p className="text-[11px] text-slate-400">or paste URL:</p>
                <input name="productImg" value={form.productImg} onChange={handleChange}
                  placeholder="https://…" className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3} placeholder="Describe your product…"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button type="button" onClick={() => { setShowForm(false); setForm(INITIAL_FORM); }}
              className="px-5 h-9 border border-slate-200 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={submitting || imgUploading}
              className="flex items-center gap-2 px-5 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed">
              {submitting ? <><Loader2 size={13} className="animate-spin" />Adding…</> : <><Tag size={13} />Add Product</>}
            </button>
          </div>
        </form>
      )}

      {/* ── Products table ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <Package size={14} className="text-slate-400" />
          <p className="text-sm font-bold text-slate-700">
            Products <span className="ml-1 text-xs font-normal text-slate-400">({filtered.length})</span>
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={24} className="animate-spin text-indigo-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
            <Package size={36} strokeWidth={1.2} />
            <p className="text-sm">No products found. Add your first product!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {[
                    'Product', 'Price',
                    ...(isAdmin ? ['Buying', 'Commission', 'Admin 10%'] : []),
                    'Stock', 'Sold', 'Rating', 'Status', 'Actions',
                  ].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide ${
                      ['Buying','Commission','Admin 10%'].includes(h) ? 'text-rose-500' : 'text-slate-500'
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(product => {
                  const id         = product._id || product.id;
                  const adminFee   = product.totalPrice ? (product.totalPrice * 0.10).toFixed(2) : '—';
                  return (
                    <tr key={id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.productImg ? (
                            <img src={product.productImg} alt={product.title || product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <Package size={16} className="text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-slate-700 truncate max-w-[160px]">
                              {product.title || product.name}
                            </p>
                            <p className="text-[10px] text-slate-400 capitalize">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      {/* Price */}
                      <td className="px-4 py-3 text-sm font-bold text-slate-800">
                        ${product.totalPrice ? product.totalPrice.toFixed(2) : product.price}
                      </td>

                      {/* Admin-only columns */}
                      {isAdmin && (
                        <>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {product.buyingPrice ? `$${Number(product.buyingPrice).toFixed(2)}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-xs text-emerald-600 font-semibold">
                            {product.commission ? `$${Number(product.commission).toFixed(2)}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-xs text-rose-600 font-semibold">
                            {product.totalPrice ? `$${adminFee}` : '—'}
                          </td>
                        </>
                      )}

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${product.quantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {product.quantity > 0 ? product.quantity : 'Out'}
                        </span>
                      </td>
                      {/* Sold */}
                      <td className="px-4 py-3 text-xs text-slate-600">{product.sold || 0}</td>
                      {/* Rating */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-amber-600">
                          ★ {Number(product.review || 0).toFixed(1)}
                          <span className="text-slate-400 font-normal ml-1">({product.reviewPeopleQuantity || 0})</span>
                        </span>
                      </td>
                      {/* Sold-out toggle */}
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => toggleSoldOut(product)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer transition-colors"
                          title={product.soldOut ? 'Mark as Available' : 'Mark as Sold Out'}>
                          {product.soldOut
                            ? <><ToggleRight size={18} className="text-red-500" /><span className="text-red-500">Sold Out</span></>
                            : <><ToggleLeft  size={18} className="text-emerald-500" /><span className="text-emerald-600">Active</span></>
                          }
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => openEdit(product)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit product">
                            <Pencil size={14} />
                          </button>
                          <button type="button" onClick={() => handleDelete(id, product.title || product.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete product">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SellerDashboardLayout>
  );
}
