'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import ProductCard from '@/components/products/ProductCard';
import { GIRLS_VARIETIES, getVarietyFromSlug, getVarietySlug } from '@/lib/collections';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { categories, products } = useStore();
  const searchParams = useSearchParams();
  const varietySlug = searchParams.get('variety');
  const selectedVariety = varietySlug ? getVarietyFromSlug(varietySlug) : undefined;

  const category = categories.find((c) => c.slug === params.slug);

  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-ivory">
        <h2 className="font-serif text-3xl font-bold text-charcoal-900">Category Not Found</h2>
        <p className="text-sm text-charcoal-600 mt-2">The collection you are looking for does not exist.</p>
        <Link
          href="/shop"
          className="mt-6 px-6 py-2.5 rounded-xl bg-burgundy-950 text-gold-300 font-semibold text-xs uppercase tracking-wider"
        >
          Browse All Collections
        </Link>
      </div>
    );
  }

  const categoryProducts = products.filter((product) =>
    product.is_active &&
    product.is_admin_uploaded === true &&
    product.category_id === category.id &&
    (!selectedVariety || product.variety === selectedVariety)
  );

  return (
    <div className="bg-ivory min-h-screen pb-16">
      
      {/* Category Banner */}
      <div className="relative bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 text-ivory py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 mb-4 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Collections</span>
            </Link>
            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-ivory tracking-wide">
              {category.name}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-ivory/80 font-light leading-relaxed">
              {category.description || 'Explore our exclusive collection designed with exquisite Indian craftsmanship and rich silhouettes.'}
            </p>
          </div>

          <div className="relative w-40 h-48 sm:w-48 sm:h-56 rounded-2xl overflow-hidden border-2 border-gold-400/40 shadow-3d-hover shrink-0 hidden sm:block">
            <Image
              src={category.image_url || '/logo.jpg'}
              alt={category.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {category.slug === 'girls-collection' && (
          <nav aria-label="Girls Collection varieties" className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/category/girls-collection"
              aria-current={!selectedVariety ? 'page' : undefined}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                !selectedVariety
                  ? 'border-burgundy-950 bg-burgundy-950 text-gold-300'
                  : 'border-sand bg-white text-charcoal-700 hover:border-gold-500'
              }`}
            >
              All Girls Collection
            </Link>
            {GIRLS_VARIETIES.map((variety) => (
              <Link
                key={variety}
                href={`/category/girls-collection?variety=${getVarietySlug(variety)}`}
                aria-current={selectedVariety === variety ? 'page' : undefined}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  selectedVariety === variety
                    ? 'border-burgundy-950 bg-burgundy-950 text-gold-300'
                    : 'border-sand bg-white text-charcoal-700 hover:border-gold-500'
                }`}
              >
                {variety}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex items-center justify-between pb-6 border-b border-sand mb-8">
          <span className="text-xs font-semibold text-charcoal-600">
            Showing <strong className="text-charcoal-900">{categoryProducts.length}</strong> styles in {selectedVariety || category.name}
          </span>
          <Link
            href="/shop"
            className="text-xs font-bold text-burgundy-900 hover:text-gold-600 underline"
          >
            Filter By Price &amp; Size
          </Link>
        </div>

        {categoryProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-sand shadow-sm my-6">
            <h3 className="font-serif text-xl font-bold text-charcoal-900">
              No styles currently in {selectedVariety || category.name}
            </h3>
            <p className="text-sm text-charcoal-600 mt-2 font-light">
              Check back soon or explore our other fashion collections.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-burgundy-950 text-gold-300 text-xs font-bold uppercase tracking-wider"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
