'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Settings, Save, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useStore();
  const { success } = useToast();

  const [form, setForm] = useState({
    store_name: settings.store_name,
    store_email: settings.store_email,
    store_phone: settings.store_phone,
    logo_url: settings.logo_url,
    currency: settings.currency,
    cod_enabled: settings.cod_enabled,
    online_payment_enabled: settings.online_payment_enabled,
    delivery_charge: settings.delivery_charge,
    free_delivery_threshold: settings.free_delivery_threshold,
    return_period_days: settings.return_period_days,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    success('Store configuration updated successfully!');
  };

  return (
    <div className="space-y-6">
      
      <div className="pb-4 border-b border-charcoal-800">
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
          Global Configuration
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-0.5">
          Store Settings
        </h1>
      </div>

      <form onSubmit={handleSave} className="bg-charcoal-950 p-6 sm:p-8 rounded-3xl border border-charcoal-800 space-y-6 text-xs max-w-3xl">
        
        {/* Brand identity settings */}
        <div>
          <h2 className="font-serif text-base font-bold text-ivory mb-3 pb-2 border-b border-charcoal-800">
            Brand Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-charcoal-300 block mb-1">Store Name</label>
              <input
                type="text"
                required
                value={form.store_name}
                onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
              />
            </div>

            <div>
              <label className="font-bold text-charcoal-300 block mb-1">Logo Asset Path</label>
              <input
                type="text"
                value={form.logo_url}
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-charcoal-300 block mb-1">Store Support Email</label>
              <input
                type="email"
                required
                value={form.store_email}
                onChange={(e) => setForm({ ...form, store_email: e.target.value })}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
              />
            </div>

            <div>
              <label className="font-bold text-charcoal-300 block mb-1">Customer Support Phone</label>
              <input
                type="text"
                required
                value={form.store_phone}
                onChange={(e) => setForm({ ...form, store_phone: e.target.value })}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
              />
            </div>
          </div>
        </div>

        {/* Payment & Checkout Rules */}
        <div>
          <h2 className="font-serif text-base font-bold text-ivory mb-3 pb-2 border-b border-charcoal-800">
            Payment Methods
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 bg-charcoal-900 rounded-xl border border-charcoal-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.online_payment_enabled}
                onChange={(e) => setForm({ ...form, online_payment_enabled: e.target.checked })}
                className="accent-gold-400"
              />
              <div>
                <strong className="text-ivory block">Razorpay Online Gateway</strong>
                <span className="text-[11px] text-charcoal-400">Enable UPI, Cards, Netbanking</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-charcoal-900 rounded-xl border border-charcoal-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.cod_enabled}
                onChange={(e) => setForm({ ...form, cod_enabled: e.target.checked })}
                className="accent-gold-400"
              />
              <div>
                <strong className="text-ivory block">Cash on Delivery (COD)</strong>
                <span className="text-[11px] text-charcoal-400">Allow customers to pay at doorstep</span>
              </div>
            </label>
          </div>
        </div>

        {/* Shipping & Delivery Thresholds */}
        <div>
          <h2 className="font-serif text-base font-bold text-ivory mb-3 pb-2 border-b border-charcoal-800">
            Shipping &amp; Delivery Configuration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-charcoal-300 block mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                min={0}
                value={form.delivery_charge}
                onChange={(e) => setForm({ ...form, delivery_charge: Number(e.target.value) })}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
              />
            </div>

            <div>
              <label className="font-bold text-charcoal-300 block mb-1">Free Delivery Min Order (₹)</label>
              <input
                type="number"
                min={0}
                value={form.free_delivery_threshold}
                onChange={(e) => setForm({ ...form, free_delivery_threshold: Number(e.target.value) })}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
              />
            </div>

            <div>
              <label className="font-bold text-charcoal-300 block mb-1">Return Window (Days)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={form.return_period_days}
                onChange={(e) => setForm({ ...form, return_period_days: Number(e.target.value) })}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-charcoal-800 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-gold-400 hover:bg-gold-300 text-burgundy-950 font-bold uppercase tracking-wider rounded-xl shadow-gold-glow transition-all"
          >
            Save Settings
          </button>
        </div>

      </form>

    </div>
  );
}
