'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Eye, ShoppingBag, Star, MessageCircle } from 'lucide-react';
import { Product } from '@/types';
import { getProductWhatsAppLink } from '@/lib/whatsapp';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { toggleWishlist, isInWishlist, addToCart, currentUser } = useStore();
  const { success, error } = useToast();
  
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const discount = product.discount_percentage || (
    product.original_price > product.offer_price
      ? Math.round(((product.original_price - product.offer_price) / product.original_price) * 100)
      : 0
  );

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    // Pick first available variant or standard
    const size = product.variants?.[0]?.size || 'Free Size';
    const color = product.variants?.[0]?.color || 'Standard';

    const added = addToCart(product, size, color, 1);
    if (!currentUser) {
      if (added) {
        error('Please login with Google to place your order.');
        router.push('/login?redirect=/checkout');
      }
      return;
    }
    if (added) {
      success(`Added "${product.name}" to your shopping bag!`);
    } else {
      error('Could not add to bag.');
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (!isFavorited) {
      success(`Saved "${product.name}" to your wishlist!`);
    }
  };

  return (
    <>
      <div
        className="group relative bg-white rounded-2xl overflow-hidden border border-sand/80 transition-all duration-500 hover:shadow-3d-hover hover:-translate-y-1.5 flex flex-col justify-between"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top Badges & Actions */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-sand/30">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <Image
              src={product.images[0] || '/logo.jpg'}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            />
          </Link>

          {/* Discount / Offer Badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
            {product.is_offer && discount > 0 && (
              <span className="bg-burgundy-900/90 backdrop-blur-md text-gold-300 text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-full border border-gold-400/40 shadow-sm uppercase tracking-wider animate-pulse-subtle">
                {discount}% OFF
              </span>
            )}
            {product.is_new_arrival && (
              <span className="bg-gold-500/90 backdrop-blur-md text-burgundy-950 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                NEW
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 shadow-md ${
              isFavorited
                ? 'bg-rose-50 text-rose-600 scale-110'
                : 'bg-white/80 backdrop-blur-md text-charcoal-700 hover:bg-white hover:text-rose-600'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
          </button>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
              <span className="bg-charcoal-900 text-rose-300 border border-rose-500/50 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                OUT OF STOCK
              </span>
            </div>
          )}

          {/* Quick View Button on Hover */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
            <button
              onClick={() => setQuickViewOpen(true)}
              className="w-full py-2 bg-white/95 backdrop-blur-md hover:bg-burgundy-950 hover:text-gold-300 text-charcoal-900 text-xs font-semibold rounded-xl shadow-lg border border-gold-500/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 flex flex-col justify-between flex-grow">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
              <span className="uppercase tracking-wider text-burgundy-800 font-semibold truncate">
                {product.variety ? `${product.category_name} · ${product.variety}` : product.category_name || 'Collection'}
              </span>
              <div className="flex items-center text-amber-500 shrink-0">
                <Star className="w-3 h-3 fill-amber-500" />
                <span className="ml-1 font-bold text-charcoal-700">{product.rating || 4.8}</span>
              </div>
            </div>

            {/* Product Title */}
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-serif text-sm sm:text-base font-semibold text-charcoal-900 group-hover:text-burgundy-900 transition-colors line-clamp-2 leading-snug">
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Pricing & Add to Cart button */}
          <div className={`mt-3 pt-3 border-t border-sand ${product.is_admin_uploaded ? 'flex flex-col gap-2' : 'flex items-center justify-between gap-2'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg font-bold text-burgundy-950 font-serif">
                    ₹{product.offer_price.toLocaleString('en-IN')}
                  </span>
                  {product.original_price > product.offer_price && (
                    <span className="text-xs text-charcoal-400 line-through">
                      ₹{product.original_price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                {product.stock > 0 && product.stock <= 4 && (
                  <span className="text-[10px] text-amber-700 font-medium">
                    Only {product.stock} left!
                  </span>
                )}
              </div>

              <button
                onClick={handleQuickAdd}
                disabled={isOutOfStock}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  isOutOfStock
                    ? 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed'
                    : 'bg-burgundy-950 text-gold-300 hover:bg-burgundy-900 hover:shadow-gold-glow hover:scale-105 active:scale-95'
                }`}
                title={isOutOfStock ? 'Out of Stock' : 'Add to Shopping Bag'}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">{isOutOfStock ? 'Sold' : 'Add'}</span>
              </button>
            </div>
            {product.is_admin_uploaded && (
              <a
                href={getProductWhatsAppLink(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>Order on WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
}
