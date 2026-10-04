'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import ProductCard from '@/components/products/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useStore();

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex items-center justify-between pb-6 border-b border-sand mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-burgundy-800">
              Personal Favorites
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-0.5">
              My Wishlist ({wishlist.length})
            </h1>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-burgundy-900 hover:text-gold-600 underline"
          >
            Explore More Styles
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-sand shadow-sm my-6">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4 text-rose-600">
              <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-charcoal-900">
              Save your favourite styles here.
            </h3>
            <p className="text-sm text-charcoal-600 mt-2 max-w-sm mx-auto font-light">
              Tap the heart icon on any saree, kurti or dress to keep track of items you adore.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block px-8 py-3 rounded-xl bg-burgundy-950 text-gold-300 font-bold text-xs uppercase tracking-wider shadow-gold-glow hover:bg-burgundy-900"
            >
              Browse Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map((item) => (
              <ProductCard key={item.product_id} product={item.product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
