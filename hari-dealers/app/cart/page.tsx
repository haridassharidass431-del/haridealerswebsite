'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Truck, ChevronLeft } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';

export default function CartPage() {
  const router = useRouter();
  const { 
    cart, 
    cartSubtotal, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    appliedCoupon, 
    applyCoupon, 
    removeCoupon,
    settings 
  } = useStore();
  const { success, error } = useToast();

  const [couponInput, setCouponInput] = useState('');

  // Calculations
  const deliveryCharge = cartSubtotal >= settings.free_delivery_threshold || cartSubtotal === 0 ? 0 : settings.delivery_charge;
  
  let couponDiscount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minimum_order_amount) {
    if (appliedCoupon.discount_type === 'percentage') {
      couponDiscount = (cartSubtotal * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.maximum_discount && couponDiscount > appliedCoupon.maximum_discount) {
        couponDiscount = appliedCoupon.maximum_discount;
      }
    } else {
      couponDiscount = Math.min(appliedCoupon.discount_value, cartSubtotal);
    }
  }

  const finalTotal = Math.max(0, cartSubtotal - couponDiscount + deliveryCharge);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    if (res.success) {
      success(res.message);
      setCouponInput('');
    } else {
      error(res.message);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-ivory min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-burgundy-50 border border-gold-400/30 flex items-center justify-center mx-auto mb-4 text-burgundy-950 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-gold-600" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-charcoal-900">
          Your shopping bag is waiting for you.
        </h2>
        <p className="text-sm text-charcoal-600 mt-2 max-w-sm font-light">
          Explore the latest styles in our Girls and Boys collections.
        </p>
        <Link
          href="/shop"
          className="mt-6 px-8 py-3.5 rounded-xl bg-burgundy-950 text-gold-300 font-bold text-xs uppercase tracking-wider shadow-gold-glow hover:bg-burgundy-900 transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex items-center justify-between pb-6 border-b border-sand mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-burgundy-800">
              Checkout Bag
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-0.5">
              Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-rose-700 hover:text-rose-900 font-semibold underline"
          >
            Clear Entire Bag
          </button>
        </div>

        {/* Content Grid: Cart Items (Left) + Order Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Items List (Span 8) */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-sand shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-sand/30 shrink-0 border border-sand">
                    <Image
                      src={item.product.images[0] || '/logo.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-burgundy-800">
                      {item.product.category_name || 'Ethnic Wear'}
                    </span>
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="font-serif text-sm sm:text-base font-bold text-charcoal-900 hover:text-burgundy-900 transition-colors line-clamp-1">
                        {item.product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-charcoal-600 mt-1">
                      <span>Size: <strong className="text-charcoal-900">{item.size}</strong></span>
                      <span>&bull;</span>
                      <span>Color: <strong className="text-charcoal-900">{item.color}</strong></span>
                    </div>
                    <div className="text-sm font-bold text-burgundy-950 font-serif mt-2">
                      ₹{item.unit_price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-sand">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-sand rounded-xl bg-sand/20 overflow-hidden shadow-inner">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 text-charcoal-600 hover:bg-sand/40 font-bold text-xs"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-charcoal-900">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="px-3 py-1 text-charcoal-600 hover:bg-sand/40 font-bold text-xs disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-charcoal-900 font-serif">
                      ₹{item.total_price.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-charcoal-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Remove from bag"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-burgundy-900 hover:text-gold-600 uppercase tracking-wider"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>CONTINUE SHOPPING</span>
              </Link>
            </div>
          </div>

          {/* RIGHT: Order Summary Card (Span 4) */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-sand shadow-sm sticky top-24 space-y-6">
            <h2 className="font-serif text-xl font-bold text-charcoal-900 pb-3 border-b border-sand">
              Order Summary
            </h2>

            {/* Coupon Code Field */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-800 block mb-2">
                Have a Coupon Code?
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Applied: <strong>{appliedCoupon.code}</strong> (-₹{Math.round(couponDiscount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-700 underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. HARI10)"
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-sand uppercase font-mono tracking-wider focus:outline-none focus:border-burgundy-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-burgundy-950 text-gold-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-burgundy-900 transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations Breakdown */}
            <div className="space-y-3 text-xs pt-4 border-t border-sand">
              <div className="flex justify-between text-charcoal-600">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-charcoal-900 font-serif text-sm">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{Math.round(couponDiscount).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-charcoal-600">
                <span>Delivery Charges</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <strong className="text-emerald-700 uppercase font-bold">FREE</strong>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>

              {cartSubtotal < settings.free_delivery_threshold && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg">
                  Add ₹{(settings.free_delivery_threshold - cartSubtotal).toLocaleString('en-IN')} more to unlock <strong>FREE DELIVERY</strong>!
                </p>
              )}

              <div className="pt-3 border-t border-sand flex justify-between items-baseline text-sm font-bold text-charcoal-900">
                <span className="font-serif text-base">Total Amount</span>
                <span className="font-serif text-2xl font-extrabold text-burgundy-950">
                  ₹{Math.round(finalTotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-4 px-6 rounded-xl bg-burgundy-950 text-gold-300 hover:bg-burgundy-900 font-bold text-xs uppercase tracking-widest shadow-gold-glow flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </button>

            {/* Trust Assurances */}
            <div className="pt-4 border-t border-sand text-center text-[11px] text-charcoal-500 space-y-1">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                <span>100% Safe &amp; Secure Checkout</span>
              </p>
              <p>Cash on Delivery &bull; Razorpay UPI &bull; Netbanking</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
