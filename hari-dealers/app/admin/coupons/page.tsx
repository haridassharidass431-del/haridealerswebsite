'use client';

import React, { useState } from 'react';
import { Plus, Ticket, Trash2, Edit2, X, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';
import { Coupon } from '@/types';

export default function AdminCouponsPage() {
  const { coupons, addCoupon, deleteCoupon, updateCoupon } = useStore();
  const { success } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    minimum_order_amount: 999,
    maximum_discount: 500,
    usage_limit: 100,
    is_active: true,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;

    addCoupon({
      code: form.code.toUpperCase().trim(),
      description: form.description,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      minimum_order_amount: Number(form.minimum_order_amount),
      maximum_discount: Number(form.maximum_discount),
      usage_limit: Number(form.usage_limit),
      used_count: 0,
      is_active: form.is_active,
      start_date: new Date().toISOString(),
    });

    success(`Coupon "${form.code.toUpperCase()}" created successfully!`);
    setModalOpen(false);
    setForm({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      minimum_order_amount: 999,
      maximum_discount: 500,
      usage_limit: 100,
      is_active: true,
    });
  };

  const handleDelete = (id: string, code: string) => {
    deleteCoupon(id);
    success(`Coupon "${code}" deleted.`);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
            Discounts &amp; Vouchers
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-0.5">
            Coupon Codes Manager
          </h1>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-gold-400 hover:bg-gold-300 text-burgundy-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-gold-glow flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-charcoal-950 p-6 rounded-2xl border border-charcoal-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black text-gold-300 tracking-wider">
                  {c.code}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  c.is_active ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-charcoal-800 text-charcoal-400'
                }`}>
                  {c.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-charcoal-400 mt-1 font-light">{c.description}</p>

              <div className="mt-4 pt-3 border-t border-charcoal-800 space-y-1.5 text-xs text-charcoal-400">
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <strong className="text-ivory">
                    {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Cart Value:</span>
                  <strong className="text-ivory">₹{c.minimum_order_amount}</strong>
                </div>
                {c.maximum_discount && (
                  <div className="flex justify-between">
                    <span>Max Discount Cap:</span>
                    <strong className="text-ivory">₹{c.maximum_discount}</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Times Used:</span>
                  <strong className="text-gold-300 font-mono">{c.used_count} times</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-charcoal-800 flex justify-end gap-2">
              <button
                onClick={() => handleDelete(c.id, c.code)}
                className="p-1.5 text-charcoal-500 hover:text-rose-400 transition-colors"
                title="Delete coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-charcoal-950 border border-charcoal-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800 mb-4">
              <h3 className="font-serif text-lg font-bold text-ivory">Create New Coupon</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-charcoal-400 hover:text-ivory">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="font-bold text-charcoal-300 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE20"
                  className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal-300 block mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Flat 20% off on festive wear"
                  className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-charcoal-300 block mb-1">Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}
                    className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-charcoal-300 block mb-1">Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-charcoal-300 block mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={form.minimum_order_amount}
                    onChange={(e) => setForm({ ...form, minimum_order_amount: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-300 block mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={form.maximum_discount}
                    onChange={(e) => setForm({ ...form, maximum_discount: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
                  />
                </div>
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
