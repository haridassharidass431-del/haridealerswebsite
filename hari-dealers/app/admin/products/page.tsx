'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Plus, Search, Edit3, Trash2, CheckCircle2, XCircle, 
  Sparkles, Star, Tag, X, Image as ImageIcon 
} from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';
import { Product } from '@/types';
import { GIRLS_VARIETIES } from '@/lib/collections';

const DEFAULT_GIRLS_VARIETY: string = GIRLS_VARIETIES[0];

export default function AdminProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useStore();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => () => {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  // Form State
  const [form, setForm] = useState({
    name: '',
    slug: '',
    category_id: '',
    variety: DEFAULT_GIRLS_VARIETY,
    description: '',
    original_price: 1999,
    offer_price: 1499,
    stock: 20,
    sku: '',
    sizes: ['S', 'M', 'L', 'XL'],
    color: 'Burgundy',
    is_featured: true,
    is_new_arrival: true,
    is_offer: true,
    is_active: true,
  });

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCat || p.category_id === selectedCat;
    return p.is_admin_uploaded === true && matchSearch && matchCategory;
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      slug: '',
      category_id: categories.find((category) => category.slug === 'girls-collection')?.id || categories[0]?.id || '',
      variety: DEFAULT_GIRLS_VARIETY,
      description: '',
      original_price: 1999,
      offer_price: 1499,
      stock: 20,
      sku: `HD-${Math.floor(100 + Math.random() * 900)}`,
      sizes: ['S', 'M', 'L', 'XL'],
      color: 'Plum Burgundy',
      is_featured: true,
      is_new_arrival: true,
      is_offer: true,
      is_active: true,
    });
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      category_id: p.category_id,
      variety: p.variety || DEFAULT_GIRLS_VARIETY,
      description: p.description,
      original_price: p.original_price,
      offer_price: p.offer_price,
      stock: p.stock,
      sku: p.sku || '',
      sizes: p.variants?.map((v) => v.size) || ['M', 'L'],
      color: p.variants?.[0]?.color || 'Burgundy',
      is_featured: p.is_featured,
      is_new_arrival: p.is_new_arrival,
      is_offer: p.is_offer,
      is_active: p.is_active,
    });
    setImageFile(null);
    setImagePreview(p.images[0] || '');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category_id) {
      error('Product name and category are required');
      return;
    }
    if (!imageFile && !imagePreview) {
      error('Choose a product image before saving.');
      return;
    }

    const calculatedDiscount = form.original_price > form.offer_price
      ? Math.round(((form.original_price - form.offer_price) / form.original_price) * 100)
      : 0;

    const targetCategory = categories.find((c) => c.id === form.category_id);
    if (!targetCategory) {
      error('Select a valid category.');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        const upload = new FormData();
        upload.set('image', imageFile);
        const uploadResponse = await fetch('/api/admin/products/upload', { method: 'POST', body: upload });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadResult.error || 'Could not upload product image.');
        imageUrl = uploadResult.image_url;
      }

      const baseSlug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const productPayload = {
      name: form.name,
      slug: editingId ? baseSlug : `${baseSlug}-${Date.now().toString(36)}`,
      description: form.description,
      category_id: form.category_id,
      variety: targetCategory.slug === 'girls-collection' ? form.variety : '',
      category_name: targetCategory.name,
      original_price: Number(form.original_price),
      offer_price: Number(form.offer_price),
      discount_percentage: calculatedDiscount,
      stock: Number(form.stock),
      sku: form.sku,
      images: [imageUrl],
      variants: form.sizes.map((sz, idx) => ({
        id: `v-${Date.now()}-${idx}`,
        product_id: editingId || '',
        size: sz as any,
        color: form.color,
        stock: Math.floor(form.stock / Math.max(1, form.sizes.length)),
      })),
      is_featured: form.is_featured,
      is_new_arrival: form.is_new_arrival,
      is_offer: form.is_offer,
      is_active: form.is_active,
      };

      if (editingId) {
        await updateProduct(editingId, productPayload);
        success(`Product "${form.name}" updated successfully!`);
      } else {
        await addProduct(productPayload);
        success(`New product "${form.name}" added to catalogue!`);
      }
      setModalOpen(false);
    } catch (cause) {
      error(cause instanceof Error ? cause.message : 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from store?`)) {
      try {
        await deleteProduct(id);
        success(`Deleted "${name}"`);
      } catch (cause) {
        error(cause instanceof Error ? cause.message : 'Could not delete product.');
      }
    }
  };

  const toggleSizeSelection = (sz: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(sz) ? prev.sizes.filter((s) => s !== sz) : [...prev.sizes, sz],
    }));
  };

  // Auto discount preview
  const previewDiscount = form.original_price > form.offer_price
    ? Math.round(((form.original_price - form.offer_price) / form.original_price) * 100)
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Title & Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
            Catalog Administration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-0.5">
            Products &amp; Inventory Management
          </h1>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gold-400 hover:bg-gold-300 text-burgundy-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-gold-glow flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-charcoal-950 p-4 rounded-2xl border border-charcoal-800">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-charcoal-900 border border-charcoal-700 rounded-xl text-ivory placeholder-charcoal-500 focus:outline-none focus:border-gold-500"
          />
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="text-xs bg-charcoal-900 border border-charcoal-700 rounded-xl px-3 py-2 text-ivory focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="text-xs text-charcoal-400 font-medium">
            Total: <strong className="text-ivory">{filteredProducts.length}</strong>
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-charcoal-950 rounded-2xl border border-charcoal-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-charcoal-900 text-charcoal-400 uppercase tracking-wider font-semibold border-b border-charcoal-800">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Original</th>
                <th className="p-4">Offer Price</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/60 text-charcoal-300">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-charcoal-900/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-charcoal-800 shrink-0 border border-charcoal-700">
                            <Image src={p.images[0] || '/logo.jpg'} alt={p.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <div>
                        <strong className="text-ivory block line-clamp-1">{p.name}</strong>
                        <span className="text-[10px] text-charcoal-500 font-mono">SKU: {p.sku || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{p.category_name}</td>
                  <td className="p-4 text-charcoal-500 line-through">₹{p.original_price}</td>
                  <td className="p-4 font-bold text-gold-300 font-serif text-sm">₹{p.offer_price}</td>
                  <td className="p-4">
                    {p.discount_percentage > 0 ? (
                      <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                        {p.discount_percentage}% OFF
                      </span>
                    ) : (
                      'None'
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`font-mono font-bold ${p.stock <= 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    {p.is_active && p.stock > 0 ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/30">
                        Available
                      </span>
                    ) : !p.is_active ? (
                      <span className="text-[10px] font-bold text-charcoal-500 bg-charcoal-800 px-2 py-0.5 rounded">
                        Hidden
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded border border-rose-800/30">
                        Out of stock
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-charcoal-400 hover:text-gold-300 transition-colors"
                        title="Edit product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-charcoal-400 hover:text-rose-400 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-charcoal-950 border border-charcoal-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-xs">
            
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-800 mb-6">
              <h2 className="font-serif text-xl font-bold text-ivory">
                {editingId ? 'Edit Fashion Product' : 'Add New Fashion Product'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-charcoal-400 hover:text-ivory">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold uppercase tracking-wider text-charcoal-300 block mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Royal Banarasi Silk Saree"
                    className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-charcoal-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value, variety: DEFAULT_GIRLS_VARIETY })}
                    className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory focus:outline-none focus:border-gold-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {categories.find((category) => category.id === form.category_id)?.slug === 'girls-collection' && (
                  <div>
                    <label htmlFor="product-variety" className="font-bold uppercase tracking-wider text-charcoal-300 block mb-1">
                      Girls Collection Variety *
                    </label>
                    <select
                      id="product-variety"
                      required
                      value={form.variety}
                      onChange={(e) => setForm({ ...form, variety: e.target.value })}
                      className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory focus:outline-none focus:border-gold-500"
                    >
                      {GIRLS_VARIETIES.map((variety) => (
                        <option key={variety} value={variety}>{variety}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="font-bold uppercase tracking-wider text-charcoal-300 block mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="HD-SAR-001"
                    className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory font-mono focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-charcoal-300 block mb-1">
                    Original Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold uppercase tracking-wider text-charcoal-300">
                      Offer Price (₹) *
                    </label>
                    {previewDiscount > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400">
                        Auto Discount: {previewDiscount}% OFF
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.offer_price}
                    onChange={(e) => setForm({ ...form, offer_price: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-charcoal-300 block mb-1">
                    Total Inventory Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-charcoal-300 block mb-1">
                    Primary Fabric Color
                  </label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="e.g. Wine Plum, Gold"
                    className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold uppercase tracking-wider text-charcoal-300 block mb-1">
                    Available Sizes (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => toggleSizeSelection(sz)}
                        className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-colors ${
                          form.sizes.includes(sz)
                            ? 'bg-gold-400 text-burgundy-950 border-gold-400'
                            : 'bg-charcoal-900 text-charcoal-400 border-charcoal-700 hover:text-ivory'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="product-image" className="font-bold uppercase tracking-wider text-charcoal-300 block mb-2">
                    Product Image *
                  </label>
                  <input
                    id="product-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const selectedFile = event.target.files?.[0] || null;
                      setImageFile(selectedFile);
                      setImagePreview(selectedFile ? URL.createObjectURL(selectedFile) : '');
                    }}
                    className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory file:mr-3 file:rounded-lg file:border-0 file:bg-gold-400 file:px-3 file:py-2 file:font-bold file:text-burgundy-950"
                  />
                  <p className="mt-1 text-[10px] text-charcoal-500">JPG, PNG, or WebP. Maximum size 5 MB.</p>
                  {imagePreview && (
                    <div className="relative mt-3 aspect-[4/3] w-40 overflow-hidden rounded-xl border border-charcoal-700 bg-charcoal-900">
                      <Image src={imagePreview} alt="Product image preview" fill sizes="160px" unoptimized className="object-cover" />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold uppercase tracking-wider text-charcoal-300 block mb-1">
                    Description &amp; Fabric Details
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe weave, occasion, craftsmanship..."
                    className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Status checkboxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-charcoal-800">
                <label className="flex items-center gap-2 cursor-pointer text-charcoal-300">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="accent-gold-400"
                  />
                  <span>Active in Store</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-charcoal-300">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="accent-gold-400"
                  />
                  <span>Featured Style</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-charcoal-300">
                  <input
                    type="checkbox"
                    checked={form.is_new_arrival}
                    onChange={(e) => setForm({ ...form, is_new_arrival: e.target.checked })}
                    className="accent-gold-400"
                  />
                  <span>New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-charcoal-300">
                  <input
                    type="checkbox"
                    checked={form.is_offer}
                    onChange={(e) => setForm({ ...form, is_offer: e.target.checked })}
                    className="accent-gold-400"
                  />
                  <span>Special Offer</span>
                </label>
              </div>

              <div className="pt-4 border-t border-charcoal-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-charcoal-700 text-charcoal-400 hover:text-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gold-400 hover:bg-gold-300 text-burgundy-950 font-bold uppercase rounded-xl shadow-gold-glow"
                >
                  {saving ? 'Saving…' : editingId ? 'Save Updates' : 'Add to Catalog'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
