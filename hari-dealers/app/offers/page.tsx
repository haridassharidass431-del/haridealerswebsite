'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Copy, Check, Tag, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';
import ProductCard from '@/components/products/ProductCard';

export default function OffersPage() {
  const { products, coupons, offerBanner } = useStore();
  const { success } = useToast();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const offerProducts = products.filter((p) => p.is_active && p.is_offer);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="bg-ivory min-h-screen pb-20">
      
      {/* Festive Hero Banner */}
      <section className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 text-ivory py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-gold-500/20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-widest mb-4 border border-gold-400/40">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Limited Period Value Deals</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-ivory tracking-wide">
            {offerBanner.title || 'Festive Offers & Exclusive Deals'}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ivory/80 font-light max-w-xl mx-auto">
            {offerBanner.subtitle || 'Upgrade your ethnic wardrobe with handwoven sarees, royal anarkalis and designer kurtis at up to 50% discount.'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* Active Coupon Codes Strip */}
        <div className="mb-14">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-4">
            <Tag className="w-4 h-4 text-gold-600" />
            <span>Available Voucher Codes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.filter(c => c.is_active).map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-2xl border-2 border-dashed border-gold-400/70 shadow-sm flex items-center justify-between gap-4"
              >
                <div>
                  <span className="font-mono text-sm font-black text-burgundy-950 tracking-wider">
                    {c.code}
                  </span>
                  <p className="text-xs text-charcoal-600 mt-0.5">{c.description}</p>
                  <span className="text-[10px] text-charcoal-400 mt-1 block">
                    Min order: ₹{c.minimum_order_amount}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCoupon(c.code)}
                  className="px-3 py-1.5 bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-900 text-xs font-bold rounded-lg border border-burgundy-200 flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedCode === c.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Offer Products Grid */}
        <div className="flex items-center justify-between pb-4 border-b border-sand mb-8">
          <div>
            <h2 className="font-serif text-2xl font-bold text-charcoal-900">
              Sale Styles on Offer ({offerProducts.length})
            </h2>
            <p className="text-xs text-charcoal-500 font-light mt-0.5">
              Enjoy verified discounts directly applied to the cart.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-burgundy-900 hover:text-gold-600 flex items-center gap-1 underline"
          >
            <span>View All Regular Styles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {offerProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-sand shadow-sm my-6">
            <h3 className="font-serif text-xl font-bold text-charcoal-900">
              No offer products currently live
            </h3>
            <p className="text-sm text-charcoal-600 mt-2 font-light">
              Check back soon for upcoming sale events!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
