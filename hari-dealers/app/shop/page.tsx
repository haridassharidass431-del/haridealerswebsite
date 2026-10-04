'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import ProductCard from '@/components/products/ProductCard';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';
  const initialFilter = searchParams.get('filter') || '';

  const { products, categories } = useStore();

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [offersOnly, setOffersOnly] = useState<boolean>(initialFilter === 'offers');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Available unique sizes and colors
  const allSizes = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const allColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.variants?.forEach((v) => set.add(v.color));
    });
    return Array.from(set);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.is_active) return false;

        // Query search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCategory = p.category_name?.toLowerCase().includes(q);
          const matchSku = p.sku?.toLowerCase().includes(q);
          if (!matchName && !matchCategory && !matchSku) return false;
        }

        // Category filter
        if (selectedCategory) {
          const cat = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
          if (cat && p.category_id !== cat.id) return false;
        }

        // Price filter
        if (p.offer_price > maxPrice) return false;

        // Offers only
        if (offersOnly && !p.is_offer) return false;

        // In Stock only
        if (inStockOnly && p.stock <= 0) return false;

        // Rating filter
        if (minRating > 0 && (p.rating || 0) < minRating) return false;

        // Size filter
        if (selectedSize) {
          const hasSize = p.variants?.some((v) => v.size === selectedSize && v.stock > 0);
          if (!hasSize) return false;
        }

        // Color filter
        if (selectedColor) {
          const hasColor = p.variants?.some((v) => v.color.toLowerCase() === selectedColor.toLowerCase());
          if (!hasColor) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.offer_price - b.offer_price;
        if (sortBy === 'price_desc') return b.offer_price - a.offer_price;
        if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        // Default: popular / rating
        return (b.rating || 0) - (a.rating || 0);
      });
  }, [products, categories, searchQuery, selectedCategory, maxPrice, offersOnly, inStockOnly, minRating, selectedSize, selectedColor, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMaxPrice(6000);
    setSelectedSize('');
    setSelectedColor('');
    setMinRating(0);
    setOffersOnly(false);
    setInStockOnly(false);
    setSortBy('popular');
  };

  const hasActiveFilters = Boolean(
    selectedCategory || searchQuery || maxPrice < 6000 || selectedSize || selectedColor || minRating > 0 || offersOnly || inStockOnly
  );

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest text-burgundy-800 font-semibold">
            All Collections
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">
            Browse Girls &amp; Boys Collections
          </h1>
          <p className="text-sm text-charcoal-600 mt-1 font-light">
            Browse available products uploaded by the Hari Dealers team.
          </p>
        </div>

        {/* Top Control Bar: Mobile Filter Toggle + Sorting */}
        <div className="bg-white p-4 rounded-2xl border border-sand shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-burgundy-950 text-gold-300 rounded-xl text-xs font-semibold"
            >
              <Filter className="w-4 h-4" />
              <span>Filters {hasActiveFilters && '(Active)'}</span>
            </button>

            <span className="text-xs font-medium text-charcoal-600">
              Showing <strong className="text-charcoal-900">{filteredProducts.length}</strong> styles
            </span>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <ArrowUpDown className="w-4 h-4 text-charcoal-400" />
            <span className="text-xs text-charcoal-600 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold bg-sand/30 border border-sand rounded-xl px-3 py-2 text-charcoal-800 focus:outline-none focus:border-gold-500"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Layout: Sidebar Filters (Desktop) + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-sand shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-sand">
                <div className="flex items-center gap-2 font-serif font-bold text-base text-charcoal-900">
                  <SlidersHorizontal className="w-4 h-4 text-gold-600" />
                  <span>Filters</span>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-burgundy-800 hover:text-gold-600 font-semibold underline"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-800 block mb-2.5">
                  Category
                </label>
                <div className="space-y-1.5 text-xs">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`block w-full text-left py-1.5 px-2.5 rounded-lg transition-colors ${
                      !selectedCategory ? 'bg-burgundy-900 text-gold-300 font-bold' : 'text-charcoal-600 hover:bg-sand/40'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`block w-full text-left py-1.5 px-2.5 rounded-lg transition-colors ${
                        selectedCategory === c.slug ? 'bg-burgundy-900 text-gold-300 font-bold' : 'text-charcoal-600 hover:bg-sand/40'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="pt-4 border-t border-sand">
                <div className="flex items-center justify-between text-xs font-bold text-charcoal-800 mb-2">
                  <span className="uppercase tracking-wider">Max Price</span>
                  <span className="text-burgundy-900 font-serif font-bold text-sm">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="6000"
                  step="200"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-burgundy-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-charcoal-400 mt-1">
                  <span>₹500</span>
                  <span>₹6,000+</span>
                </div>
              </div>

              {/* Size Filter */}
              <div className="pt-4 border-t border-sand">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-800 block mb-2.5">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        selectedSize === sz
                          ? 'bg-burgundy-900 text-gold-300 border-burgundy-900 shadow'
                          : 'bg-white text-charcoal-700 border-sand hover:border-gold-500'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              {allColors.length > 0 && (
                <div className="pt-4 border-t border-sand">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal-800 block mb-2.5">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {allColors.map((clr) => (
                      <button
                        key={clr}
                        onClick={() => setSelectedColor(selectedColor === clr ? '' : clr)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                          selectedColor === clr
                            ? 'bg-burgundy-900 text-gold-300 border-burgundy-900 font-bold'
                            : 'bg-white text-charcoal-600 border-sand hover:border-charcoal-400'
                        }`}
                      >
                        {clr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Checkboxes: Offers & In Stock */}
              <div className="pt-4 border-t border-sand space-y-2.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-charcoal-700">
                  <input
                    type="checkbox"
                    checked={offersOnly}
                    onChange={(e) => setOffersOnly(e.target.checked)}
                    className="accent-burgundy-900 rounded"
                  />
                  <span>On Offer / Sale Only</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-charcoal-700">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-burgundy-900 rounded"
                  />
                  <span>Exclude Out of Stock</span>
                </label>
              </div>

              {/* Rating Filter */}
              <div className="pt-4 border-t border-sand">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-800 block mb-2">
                  Minimum Rating
                </label>
                <div className="flex gap-2">
                  {[0, 4, 4.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(minRating === r ? 0 : r)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                        minRating === r
                          ? 'bg-burgundy-900 text-gold-300 border-burgundy-900 font-bold'
                          : 'bg-white border-sand text-charcoal-600'
                      }`}
                    >
                      {r === 0 ? 'All' : `${r}★ & up`}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              /* Attractive Empty State */
              <div className="bg-white rounded-3xl p-12 text-center border border-sand shadow-sm my-6">
                <div className="w-16 h-16 rounded-full bg-burgundy-50 border border-gold-400/30 flex items-center justify-center mx-auto mb-4 text-burgundy-900">
                  <SlidersHorizontal className="w-8 h-8 text-gold-600" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-charcoal-900">
                  No products found
                </h3>
                <p className="text-sm text-charcoal-600 mt-2 max-w-sm mx-auto font-light">
                  We could not find any styles matching your selected filters. Try broadening your criteria.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-burgundy-950 text-gold-300 font-semibold text-xs tracking-wider uppercase shadow-md hover:bg-burgundy-900"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative ml-auto w-4/5 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-sand">
                <h3 className="font-serif font-bold text-lg text-charcoal-900">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                  <X className="w-5 h-5 text-charcoal-600" />
                </button>
              </div>

              {/* Category options in mobile */}
              <div className="mt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-800 block mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-sand"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Price slider */}
              <div className="mt-5">
                <div className="flex justify-between text-xs font-bold text-charcoal-800 mb-1">
                  <span>Max Price</span>
                  <span>₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="6000"
                  step="200"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-burgundy-900"
                />
              </div>

              {/* Sizes */}
              <div className="mt-5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-800 block mb-2">
                  Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                      className={`px-3 py-1 rounded text-xs border ${
                        selectedSize === sz ? 'bg-burgundy-900 text-gold-300' : 'bg-white text-charcoal-700'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-sand flex gap-3">
              <button
                onClick={resetFilters}
                className="w-1/2 py-2.5 text-xs font-semibold text-charcoal-700 border border-sand rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 py-2.5 text-xs font-semibold bg-burgundy-950 text-gold-300 rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
