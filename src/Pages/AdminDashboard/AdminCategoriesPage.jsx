import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, Tag, Loader2, ChevronRight,
  FolderPlus, X, RefreshCw, Layers,
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminDashboardLayout from '../../Component/AdminDashboardLayout/AdminDashboardLayout';
import api from '../../api/axios';

// ─── Modal backdrop wrapper ───────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const inputCls = 'w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition';

const toSlug = (v) => v.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export default function AdminCategoriesPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);   // parent categories
  const [loading,    setLoading]    = useState(true);

  // ── Add category modal ─────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName,      setNewName]      = useState('');
  const [newSlug,      setNewSlug]      = useState('');
  const [saving,       setSaving]       = useState(false);

  // ── Add sub-category modal ─────────────────────────────────────────────────
  const [subModal,   setSubModal]   = useState(null);  // parent category object
  const [subName,    setSubName]    = useState('');
  const [subSlug,    setSubSlug]    = useState('');
  const [subSaving,  setSubSaving]  = useState(false);

  // ── expanded sub-list per category ─────────────────────────────────────────
  const [expanded, setExpanded] = useState(new Set());

  // ── fetch (tree) ────────────────────────────────────────────────────────────
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/nav-categories/tree');
      setCategories(res.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load categories.', confirmButtonColor: '#e11d48' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // ── add parent ─────────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await api.post('/nav-categories', { name: newName.trim(), slug: newSlug, parentCategory: null });
      setNewName(''); setNewSlug('');
      setShowAddModal(false);
      await fetchCategories();
      Swal.fire({ icon: 'success', title: 'Category added!', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to add category.', confirmButtonColor: '#e11d48' });
    } finally {
      setSaving(false);
    }
  };

  // ── delete parent (+ its children) ────────────────────────────────────────
  const handleDelete = async (cat) => {
    const result = await Swal.fire({
      title: `Delete "${cat.name}"?`,
      text: 'This will also delete all its sub-categories.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete',
    });
    if (!result.isConfirmed) return;

    try {
      // delete children first
      for (const sub of cat.children || []) {
        await api.delete(`/nav-categories/${sub._id}`).catch(() => {});
      }
      await api.delete(`/nav-categories/${cat._id}`);
      await fetchCategories();
      Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete.', confirmButtonColor: '#e11d48' });
    }
  };

  // ── add sub-category ────────────────────────────────────────────────────────
  const handleAddSub = async (e) => {
    e.preventDefault();
    if (!subName.trim() || !subModal) return;
    setSubSaving(true);
    try {
      await api.post('/nav-categories', {
        name:           subName.trim(),
        slug:           subSlug,
        parentCategory: subModal._id,
      });
      setSubName(''); setSubSlug('');
      setSubModal(null);
      setExpanded(prev => new Set([...prev, subModal._id]));
      await fetchCategories();
      Swal.fire({ icon: 'success', title: 'Sub-category added!', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to add sub-category.', confirmButtonColor: '#e11d48' });
    } finally {
      setSubSaving(false);
    }
  };

  // ── delete sub-category ────────────────────────────────────────────────────
  const handleDeleteSub = async (sub) => {
    const result = await Swal.fire({
      title: `Delete "${sub.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/nav-categories/${sub._id}`);
      await fetchCategories();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete.', confirmButtonColor: '#e11d48' });
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  return (
    <AdminDashboardLayout>

      {/* ── Add Category Modal ── */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Category">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Category Name *</label>
            <input
              type="text"
              value={newName}
              onChange={e => { setNewName(e.target.value); setNewSlug(toSlug(e.target.value)); }}
              placeholder="e.g. Electronics"
              className={inputCls}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Slug (auto-generated)</label>
            <input
              type="text"
              value={newSlug}
              onChange={e => setNewSlug(e.target.value)}
              placeholder="electronics"
              className={inputCls}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !newName.trim()}
              className="flex-1 h-10 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add Category
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Add Sub-Category Modal ── */}
      <Modal
        open={!!subModal}
        onClose={() => { setSubModal(null); setSubName(''); setSubSlug(''); }}
        title={`Add Sub-category to "${subModal?.name || ''}"`}
      >
        <form onSubmit={handleAddSub} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Sub-category Name *</label>
            <input
              type="text"
              value={subName}
              onChange={e => { setSubName(e.target.value); setSubSlug(toSlug(e.target.value)); }}
              placeholder="e.g. Smartphones"
              className={inputCls}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Slug (auto-generated)</label>
            <input
              type="text"
              value={subSlug}
              onChange={e => setSubSlug(e.target.value)}
              placeholder="smartphones"
              className={inputCls}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setSubModal(null); setSubName(''); setSubSlug(''); }}
              className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={subSaving || !subName.trim()}
              className="flex-1 h-10 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {subSaving ? <Loader2 size={14} className="animate-spin" /> : <FolderPlus size={14} />}
              Add Sub-category
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Categories</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage navigation categories and sub-categories</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCategories}
            className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-rose-600 hover:border-rose-300 transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            onClick={() => { setNewName(''); setNewSlug(''); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 h-10 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={15} />
            Add Category
          </button>
        </div>
      </div>

      {/* ── Category list ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-slate-400" />
            <p className="text-sm font-bold text-slate-700">
              All Categories
              <span className="ml-2 text-xs font-normal text-slate-400">({categories.length} parent)</span>
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={22} className="animate-spin text-rose-400" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
            <Tag size={36} strokeWidth={1.2} />
            <p className="text-sm">No categories yet</p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="text-xs text-rose-500 hover:underline cursor-pointer"
            >
              Add your first category →
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {categories.map(cat => {
              const isOpen = expanded.has(cat._id);
              const subCount = (cat.children || []).length;
              return (
                <li key={cat._id}>
                  {/* ── Parent row ── */}
                  <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors group">

                    {/* Expand toggle */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(cat._id)}
                      disabled={subCount === 0}
                      className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-colors cursor-pointer"
                    >
                      <ChevronRight
                        size={14}
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                      />
                    </button>

                    {/* Icon */}
                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                      <Tag size={14} className="text-rose-500" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 leading-tight">{cat.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        /{cat.slug || '—'} · {subCount} sub-categor{subCount === 1 ? 'y' : 'ies'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => { setSubModal(cat); setSubName(''); setSubSlug(''); }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-[11px] font-semibold hover:bg-violet-100 transition-colors cursor-pointer"
                        title="Add sub-category"
                      >
                        <FolderPlus size={12} />
                        Sub-category
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* ── Sub-category rows ── */}
                  {isOpen && subCount > 0 && (
                    <ul className="bg-slate-50/50 divide-y divide-slate-100/60">
                      {cat.children.map(sub => (
                        <li
                          key={sub._id}
                          className="flex items-center gap-3 pl-14 pr-5 py-2.5 hover:bg-slate-100/60 transition-colors group/sub"
                        >
                          <div className="w-6 h-6 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                            <Tag size={11} className="text-violet-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-slate-600 leading-tight">{sub.name}</p>
                            <p className="text-[10px] text-slate-400">/{sub.slug || '—'}</p>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                            {/* Filter products link */}
                            <button
                              type="button"
                              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}&sub=${encodeURIComponent(sub.name)}`)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="View filtered products"
                            >
                              View Products
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSub(sub)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete sub-category"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
