'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Tag, Sparkles, Check, ArrowRight, Eye } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';

export default function AdminOffersPage() {
  const { offerBanner, updateOfferBanner } = useStore();
  const { success } = useToast();

  const [form, setForm] = useState({
    title: offerBanner.title,
    subtitle: offerBanner.subtitle,
    discount_badge: offerBanner.discount_badge,
    button_text: offerBanner.button_text,
    button_link: offerBanner.button_link,
    banner_image: offerBanner.banner_image,
    is_active: offerBanner.is_active,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOfferBanner(form);
    success('Homepage Promotional Banner updated successfully!');
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
            Marketing &amp; Promotions
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-0.5">
            Homepage Offers Banner
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Banner Editor Form (Span 7) */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-charcoal-950 p-6 sm:p-8 rounded-3xl border border-charcoal-800 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <h2 className="font-serif text-base font-bold text-ivory">Banner Controls</h2>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-gold-400">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="accent-gold-400"
              />
              <span>Banner Active on Homepage</span>
            </label>
          </div>

          <div>
            <label className="font-bold text-charcoal-300 block mb-1">Headline Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. FESTIVE CLEARANCE SALE"
              className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory focus:outline-none focus:border-gold-500 font-serif"
            />
          </div>

          <div>
            <label className="font-bold text-charcoal-300 block mb-1">Subtitle / Promotion Description</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="Celebrate in timeless luxury with handcrafted ethnic wear"
              className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-charcoal-300 block mb-1">Discount Tag Badge</label>
              <input
                type="text"
                value={form.discount_badge}
                onChange={(e) => setForm({ ...form, discount_badge: e.target.value })}
                placeholder="UP TO 50% OFF"
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="font-bold text-charcoal-300 block mb-1">CTA Button Text</label>
              <input
                type="text"
                value={form.button_text}
                onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                placeholder="SHOP OFFERS"
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-charcoal-300 block mb-1">Button Link Target</label>
            <input
              type="text"
              value={form.button_link}
              onChange={(e) => setForm({ ...form, button_link: e.target.value })}
              placeholder="/offers"
              className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-ivory font-mono focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="pt-4 border-t border-charcoal-800 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-gold-400 hover:bg-gold-300 text-burgundy-950 font-bold uppercase tracking-wider rounded-xl shadow-gold-glow transition-all"
            >
              Save &amp; Update Banner
            </button>
          </div>
        </form>

        {/* Live Preview (Span 5) */}
        <div className="lg:col-span-5 bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-charcoal-800">
            <Eye className="w-4 h-4 text-gold-400" />
            <h3 className="font-serif text-sm font-bold text-ivory">Live Banner Preview</h3>
          </div>

          {form.is_active ? (
            <div className="bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500 text-burgundy-950 p-5 rounded-2xl shadow-md space-y-3">
              <span className="bg-burgundy-950 text-gold-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                {form.discount_badge}
              </span>
              <div>
                <h4 className="font-serif text-lg font-black uppercase text-burgundy-950">
                  {form.title}
                </h4>
                <p className="text-xs text-burgundy-900 font-medium mt-0.5">
                  {form.subtitle}
                </p>
              </div>
              <span className="inline-block px-4 py-1.5 bg-burgundy-950 text-gold-300 font-bold text-[10px] rounded-lg">
                {form.button_text} &rarr;
              </span>
            </div>
          ) : (
            <div className="p-8 text-center text-charcoal-500 border border-dashed border-charcoal-800 rounded-2xl text-xs">
              Banner is currently deactivated and hidden from homepage.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
