'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, FolderTree, X } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const { categories, products, refreshCatalog } = useStore();
  const { success, error } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '' });

  const handleOpenAdd = () => {
    setEditingCat(null);
    setForm({ name: '', slug: '', description: '', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, image_url: cat.image_url });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      const response = await fetch('/api/admin/categories', {
        method: editingCat ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: editingCat?.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save category.');
      await refreshCatalog();
      success(`${editingCat ? 'Updated' : 'Added'} category "${form.name}".`);
      setModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Could not save category.');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
            Store Taxonomy
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-0.5">
            Fashion Categories
          </h1>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gold-400 hover:bg-gold-300 text-burgundy-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-gold-glow flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.category_id === cat.id).length;

          return (
            <div
              key={cat.id}
              className="bg-charcoal-950 rounded-2xl border border-charcoal-800 p-5 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-charcoal-800 shrink-0 border border-charcoal-700">
                  <Image src={cat.image_url || '/logo.jpg'} alt={cat.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-ivory">{cat.name}</h3>
                  <span className="text-xs text-charcoal-400 font-mono">/category/{cat.slug}</span>
                  <span className="text-xs font-semibold text-gold-300 block mt-1">
                    {productCount} Products Active
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-charcoal-800 flex justify-end gap-2 text-xs">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="px-3 py-1.5 bg-charcoal-900 hover:bg-charcoal-800 text-charcoal-300 hover:text-ivory rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-charcoal-950 border border-charcoal-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800 mb-4">
              <h3 className="font-serif text-lg font-bold text-ivory">
                {editingCat ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-charcoal-400 hover:text-ivory">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-charcoal-300 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sarees"
                  className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal-300 block mb-1">URL Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="sarees"
                  className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal-300 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal-300 block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-charcoal-700 text-charcoal-400 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold-400 text-burgundy-950 font-bold uppercase rounded-xl"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
