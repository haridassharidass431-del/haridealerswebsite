'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Star, Heart, ShoppingBag, Zap, Truck, ShieldCheck, 
  RotateCcw, Check, Sparkles, ChevronRight, HelpCircle, 
  MapPin, X, MessageSquare 
} from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';
import ProductCard from '@/components/products/ProductCard';

export default function ProductDetailsPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { products, addToCart, toggleWishlist, isInWishlist, reviews, addReview, currentUser } = useStore();
  const { success, error } = useToast();

  const product = products.find((p) => p.slug === params.slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  
  // Pincode checker state
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-ivory">
        <h2 className="font-serif text-3xl font-bold text-charcoal-900">Product Not Found</h2>
        <p className="text-sm text-charcoal-600 mt-2">The dress you are looking for is no longer in our catalogue.</p>
        <Link
          href="/shop"
          className="mt-6 px-6 py-2.5 rounded-xl bg-burgundy-950 text-gold-300 font-semibold text-xs uppercase tracking-wider"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const availableColors = product.variants ? Array.from(new Set(product.variants.map((v) => v.color))) : ['Classic'];
  const activeColor = selectedColor || availableColors[0] || 'Standard';

  // Product reviews
  const productReviews = reviews.filter((r) => r.product_id === product.id && r.is_approved);

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.is_active && p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const added = addToCart(product, selectedSize, activeColor, quantity);
    if (added) {
      success(`Added ${quantity} &times; "${product.name}" (${selectedSize}) to shopping bag!`);
    } else {
      error('Could not add item to bag.');
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const added = addToCart(product, selectedSize, activeColor, quantity);
    if (added) {
      router.push('/checkout');
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length === 6 && /^\d+$/.test(pincode.trim())) {
      const today = new Date();
      const deliveryDate = new Date(today.setDate(today.getDate() + 3));
      setDeliveryEstimate(`Expected delivery by ${deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}`);
    } else {
      setDeliveryEstimate('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    addReview({
      user_id: currentUser?.id || 'guest',
      user_name: currentUser?.name || 'Verified Customer',
      product_id: product.id,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });

    setReviewSubmitted(true);
    success('Thank you! Your verified review has been posted.');
    setReviewTitle('');
    setReviewComment('');
  };

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-charcoal-500 mb-6">
          <Link href="/" className="hover:text-gold-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-gold-600">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-burgundy-900 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Showcase: Left Gallery, Right Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-sand shadow-sm">
          
          {/* LEFT: Image Gallery (Span 6) */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Thumbnail Column */}
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-20 shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-burgundy-900 shadow-md scale-102'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="Thumb" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Featured Image with Zoom View */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-sand/30 shadow-3d border border-sand">
              <Image
                src={product.images[activeImageIndex] || product.images[0] || '/logo.jpg'}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover transition-transform duration-700 hover:scale-110 cursor-zoom-in"
              />

              {/* Offer Badge */}
              {product.is_offer && product.discount_percentage > 0 && (
                <span className="absolute top-4 left-4 bg-burgundy-900 text-gold-300 text-xs font-black px-3 py-1.5 rounded-full border border-gold-400/50 shadow-md">
                  {product.discount_percentage}% OFF SALE
                </span>
              )}

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all ${
                  isFavorited ? 'bg-rose-50 text-rose-600 scale-110' : 'bg-white/90 text-charcoal-700 hover:text-rose-600'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

          </div>

          {/* RIGHT: Product Information (Span 6) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-burgundy-800 font-bold">
                {product.category_name || 'Ethnic Wear'}
              </span>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal-900 mt-1 leading-snug">
                {product.name}
              </h1>

              {/* Rating & SKU */}
              <div className="flex items-center gap-3 mt-3 pb-4 border-b border-sand text-xs">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="ml-1 font-bold text-charcoal-800">{product.rating || 4.8}</span>
                </div>
                <span className="text-charcoal-400">&bull;</span>
                <span className="text-charcoal-600">{product.reviews_count || 32} Customer Reviews</span>
                <span className="text-charcoal-400">&bull;</span>
                <span className="font-mono text-charcoal-500">SKU: {product.sku || 'HD-001'}</span>
              </div>

              {/* Price Details */}
              <div className="flex items-baseline gap-4 mt-5">
                <span className="font-serif text-3xl font-extrabold text-burgundy-950">
                  ₹{product.offer_price.toLocaleString('en-IN')}
                </span>
                {product.original_price > product.offer_price && (
                  <span className="text-base text-charcoal-400 line-through">
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discount_percentage > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                    Save ₹{(product.original_price - product.offer_price).toLocaleString('en-IN')} ({product.discount_percentage}%)
                  </span>
                )}
              </div>
              <span className="text-[11px] text-charcoal-500 block mt-1">
                Inclusive of all taxes &bull; Free shipping on orders over ₹1,499
              </span>

              {/* Stock Status Indicator */}
              <div className="mt-4">
                {isOutOfStock ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold uppercase tracking-wider">
                    Out of Stock
                  </div>
                ) : product.stock <= 5 ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold animate-pulse">
                    Only {product.stock} items left in stock — order soon!
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>In Stock &amp; Ships in 24 Hours</span>
                  </div>
                )}
              </div>

              {/* Size Selector + Size Guide */}
              <div className="mt-6 pt-6 border-t border-sand">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
                    Select Size:
                  </span>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs text-burgundy-900 hover:text-gold-600 font-medium underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[48px] h-11 px-4 rounded-xl text-xs font-bold transition-all border ${
                        selectedSize === sz
                          ? 'bg-burgundy-950 text-gold-300 border-burgundy-950 shadow-md scale-105'
                          : 'bg-white text-charcoal-700 border-sand hover:border-gold-500'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              {availableColors.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-2">
                    Color: <span className="font-normal text-charcoal-600">{activeColor}</span>
                  </div>
                  <div className="flex gap-2">
                    {availableColors.map((clr) => (
                      <button
                        key={clr}
                        onClick={() => setSelectedColor(clr)}
                        className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                          activeColor === clr
                            ? 'border-burgundy-900 bg-burgundy-50 text-burgundy-950 font-bold'
                            : 'border-sand text-charcoal-600 hover:border-charcoal-400'
                        }`}
                      >
                        {clr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-5 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
                  Quantity:
                </span>
                <div className="flex items-center border border-sand rounded-xl bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1.5 text-charcoal-600 hover:bg-sand/30 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold text-charcoal-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3.5 py-1.5 text-charcoal-600 hover:bg-sand/30 font-bold disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                    isOutOfStock
                      ? 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
                      : 'bg-white text-burgundy-950 border-2 border-burgundy-950 hover:bg-burgundy-50'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-gold-glow ${
                    isOutOfStock
                      ? 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
                      : 'bg-burgundy-950 text-gold-300 hover:bg-burgundy-900 hover:scale-102 active:scale-98'
                  }`}
                >
                  <Zap className="w-4 h-4 text-gold-400" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Pincode Delivery Availability Checker */}
              <div className="mt-8 p-4 bg-sand/30 rounded-2xl border border-sand">
                <div className="flex items-center gap-2 text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-2">
                  <MapPin className="w-4 h-4 text-burgundy-900" />
                  <span>Check Delivery Availability</span>
                </div>
                <form onSubmit={handleCheckPincode} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter 6-digit Pincode"
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-burgundy-950 text-gold-300 text-xs font-bold rounded-xl hover:bg-burgundy-900 transition-colors"
                  >
                    Check
                  </button>
                </form>
                {deliveryEstimate && (
                  <p className="mt-2 text-xs text-charcoal-700 font-medium flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-gold-600" />
                    <span>{deliveryEstimate}</span>
                  </p>
                )}
              </div>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-charcoal-600 pt-4 border-t border-sand">
                <div className="flex flex-col items-center">
                  <Truck className="w-4 h-4 text-gold-600 mb-1" />
                  <span>Fast Express Shipping</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw className="w-4 h-4 text-gold-600 mb-1" />
                  <span>7-Day Return / Exchange</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-gold-600 mb-1" />
                  <span>100% Quality Inspected</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Product Description & Details Tabs */}
        <div className="mt-12 bg-white p-6 sm:p-10 rounded-3xl border border-sand shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-charcoal-900 mb-4">
            Product Description &amp; Craftsmanship
          </h2>
          <div className="text-sm text-charcoal-700 leading-relaxed font-light space-y-4 max-w-3xl">
            <p>{product.description}</p>
            <p>
              Each dress in our Hari Dealers collection is hand-inspected for weaving integrity, seam durability, and zari brilliance. Whether attending an intimate gathering or a grand festive wedding, our silhouettes are designed to let your grace shine.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-sand grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div>
              <span className="font-bold text-charcoal-900 uppercase tracking-wider block mb-1">Fabric</span>
              <span className="text-charcoal-600">Pure Soft Cotton &amp; Fine Silk Blend</span>
            </div>
            <div>
              <span className="font-bold text-charcoal-900 uppercase tracking-wider block mb-1">Wash Care</span>
              <span className="text-charcoal-600">Dry Clean Preferred / Gentle Cold Handwash</span>
            </div>
            <div>
              <span className="font-bold text-charcoal-900 uppercase tracking-wider block mb-1">Occasion</span>
              <span className="text-charcoal-600">Festive, Wedding Ceremonies, Evening Celebrations</span>
            </div>
            <div>
              <span className="font-bold text-charcoal-900 uppercase tracking-wider block mb-1">Origin</span>
              <span className="text-charcoal-600">Handcrafted in India</span>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Write Review */}
        <div className="mt-12 bg-white p-6 sm:p-10 rounded-3xl border border-sand shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-sand">
            <div>
              <h2 className="font-serif text-2xl font-bold text-charcoal-900">
                Customer Reviews ({productReviews.length})
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <span className="text-xs font-bold text-charcoal-800">4.9 out of 5</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {productReviews.length === 0 ? (
              <p className="text-xs text-charcoal-500 italic">No reviews yet. Be the first to review this style!</p>
            ) : (
              productReviews.map((r) => (
                <div key={r.id} className="pb-6 border-b border-sand last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900">{r.user_name}</span>
                    <span className="text-[11px] text-charcoal-400">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center text-amber-500 my-1">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  {r.title && <h4 className="text-xs font-bold text-charcoal-800 mt-1">{r.title}</h4>}
                  <p className="text-xs text-charcoal-600 mt-1 font-light">{r.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Review Form */}
          <div className="mt-8 pt-6 border-t border-sand">
            <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-3">
              Write a Review
            </h3>
            {reviewSubmitted ? (
              <p className="text-xs text-emerald-700 font-semibold">Thank you! Your review has been added.</p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-charcoal-700">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setReviewRating(val)}
                        className="text-amber-500 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${val <= reviewRating ? 'fill-amber-500' : 'text-charcoal-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Review Headline (e.g. Gorgeous fabric!)"
                  className="w-full text-xs p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                />

                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  placeholder="Share details of the fit, finish, and fabric..."
                  className="w-full text-xs p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                />

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-burgundy-950 text-gold-300 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-burgundy-900"
                >
                  Submit Verified Review
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 mb-6">
              You May Also Adore
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gold-500/30 relative">
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="absolute top-4 right-4 text-charcoal-500 hover:text-charcoal-900"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">Hari Dealers Standard Size Chart</h3>
            <p className="text-xs text-charcoal-500 mb-4">Measurements shown in inches (Garment measurements).</p>
            
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-burgundy-950 text-gold-300">
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Bust</th>
                  <th className="p-2.5">Waist</th>
                  <th className="p-2.5">Hip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                <tr><td className="p-2 font-bold">S</td><td className="p-2">36&quot;</td><td className="p-2">32&quot;</td><td className="p-2">40&quot;</td></tr>
                <tr><td className="p-2 font-bold">M</td><td className="p-2">38&quot;</td><td className="p-2">34&quot;</td><td className="p-2">42&quot;</td></tr>
                <tr><td className="p-2 font-bold">L</td><td className="p-2">40&quot;</td><td className="p-2">36&quot;</td><td className="p-2">44&quot;</td></tr>
                <tr><td className="p-2 font-bold">XL</td><td className="p-2">42&quot;</td><td className="p-2">38&quot;</td><td className="p-2">46&quot;</td></tr>
                <tr><td className="p-2 font-bold">XXL</td><td className="p-2">44&quot;</td><td className="p-2">40&quot;</td><td className="p-2">48&quot;</td></tr>
              </tbody>
            </table>

            <div className="mt-5 text-center">
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="px-6 py-2 bg-burgundy-950 text-gold-300 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
