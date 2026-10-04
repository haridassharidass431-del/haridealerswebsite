'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Star, ShoppingBag, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Product } from '@/types';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart } = useStore();
  const { success, error } = useToast();

  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const availableColors = product.variants ? Array.from(new Set(product.variants.map((v) => v.color))) : ['Standard'];
  const activeColor = selectedColor || availableColors[0] || 'Burgundy';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const added = addToCart(product, selectedSize, activeColor, 1);
    if (added) {
      success(`Added "${product.name}" (${selectedSize}) to bag!`);
      onClose();
    } else {
      error('Could not add to bag. Item may be out of stock.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-3xl bg-ivory rounded-2xl shadow-3d-hover border border-gold-500/30 overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-burgundy-950/80 text-ivory hover:text-gold-300 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Images (Left) */}
        <div className="md:w-1/2 relative bg-sand/30 p-4 flex flex-col justify-between">
          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-burgundy-950/10">
            <Image
              src={product.images[selectedImageIndex] || product.images[0] || '/logo.jpg'}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
            {product.is_offer && (
              <span className="absolute top-3 left-3 bg-burgundy-900 text-gold-300 text-xs font-bold px-2.5 py-1 rounded-full border border-gold-400/50 shadow">
                {product.discount_percentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`relative w-12 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImageIndex === i ? 'border-burgundy-900 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info (Right) */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <span className="text-xs uppercase tracking-wider text-burgundy-800 font-semibold">
              {product.category_name || 'Ethnic Wear'}
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900 mt-1 leading-snug">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                <span className="text-xs font-bold ml-1 text-charcoal-800">{product.rating || 4.8}</span>
              </div>
              <span className="text-xs text-charcoal-500">({product.reviews_count || 24} reviews)</span>
              <span className="text-xs text-charcoal-300">&bull;</span>
              <span className="text-xs font-mono text-charcoal-500">SKU: {product.sku || 'HD-001'}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-2xl font-bold text-burgundy-900 font-serif">
                ₹{product.offer_price.toLocaleString('en-IN')}
              </span>
              {product.original_price > product.offer_price && (
                <span className="text-sm text-charcoal-400 line-through">
                  ₹{product.original_price.toLocaleString('en-IN')}
                </span>
              )}
              {product.discount_percentage > 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Save {product.discount_percentage}%
                </span>
              )}
            </div>

            {/* Stock indicator */}
            <div className="mt-3">
              {isOutOfStock ? (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                  OUT OF STOCK
                </span>
              ) : product.stock <= 5 ? (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded animate-pulse">
                  Only {product.stock} items left in stock!
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In Stock &amp; Ready to Ship
                </span>
              )}
            </div>

            {/* Size selector */}
            <div className="mt-5">
              <div className="text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-2">
                Select Size:
              </div>
              <div className="flex flex-wrap gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[40px] h-9 px-3 rounded-lg text-xs font-bold transition-all border ${
                      selectedSize === sz
                        ? 'bg-burgundy-900 text-ivory border-burgundy-900 shadow-md'
                        : 'bg-white text-charcoal-700 border-charcoal-200 hover:border-gold-500'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selector */}
            {availableColors.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-2">
                  Color: <span className="font-normal text-charcoal-600">{activeColor}</span>
                </div>
                <div className="flex gap-2">
                  {availableColors.map((clr) => (
                    <button
                      key={clr}
                      onClick={() => setSelectedColor(clr)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        activeColor === clr
                          ? 'border-burgundy-900 bg-burgundy-50 text-burgundy-950 font-bold'
                          : 'border-charcoal-200 text-charcoal-600 hover:border-charcoal-400'
                      }`}
                    >
                      {clr}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-charcoal-100 flex flex-col gap-2.5">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                isOutOfStock
                  ? 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
                  : 'bg-burgundy-900 text-gold-300 hover:bg-burgundy-800 border border-gold-500/50 hover:shadow-gold-glow'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
            </button>

            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="text-center text-xs font-semibold text-burgundy-900 hover:text-gold-600 underline py-1"
            >
              View Full Product Details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
