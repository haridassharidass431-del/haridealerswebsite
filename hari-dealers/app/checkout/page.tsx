'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, CreditCard, Banknote, ArrowRight, Lock, 
  CheckCircle2, AlertCircle, ShoppingBag, Truck 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';
import { PaymentMethod } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, appliedCoupon, settings, createOrder, currentUser } = useStore();
  const { success, error } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const [loading, setLoading] = useState(false);
  const [mockRazorpayOpen, setMockRazorpayOpen] = useState(false);
  const [pendingOrderDetails, setPendingOrderDetails] = useState<any>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || 'Priya Sharma',
    email: currentUser?.email || 'priya@gmail.com',
    phone: currentUser?.phone || '9840123456',
    addressLine1: 'Flat 402, Royal Palms',
    addressLine2: 'Anna Nagar West',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600040',
  });

  // Calculate authoritative numbers
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

  if (cart.length === 0) {
    return (
      <div className="bg-ivory min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-2xl font-bold text-charcoal-900">Your shopping bag is empty.</h2>
        <p className="text-sm text-charcoal-600 mt-2">Please add items to your bag before checking out.</p>
        <Link
          href="/shop"
          className="mt-6 px-6 py-2.5 rounded-xl bg-burgundy-950 text-gold-300 font-bold text-xs uppercase tracking-wider"
        >
          Browse Styles
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.addressLine1.trim() || !formData.city.trim() || !formData.pincode.trim()) {
      error('Please complete all required shipping fields.');
      return;
    }

    if (formData.pincode.length !== 6 || !/^\d+$/.test(formData.pincode)) {
      error('Please provide a valid 6-digit Indian Pincode.');
      return;
    }

    setLoading(true);

    const shippingAddress = {
      id: `addr-${Date.now()}`,
      full_name: formData.fullName,
      phone: formData.phone,
      address_line1: formData.addressLine1,
      address_line2: formData.addressLine2,
      city: formData.city,
      district: formData.district || formData.city,
      state: formData.state,
      pincode: formData.pincode,
      is_default: true,
    };

    const orderPayload = {
      customer_name: formData.fullName,
      customer_email: formData.email,
      customer_phone: formData.phone,
      subtotal: cartSubtotal,
      discount: 0,
      coupon_code: appliedCoupon?.code,
      coupon_discount: couponDiscount,
      delivery_charge: deliveryCharge,
      total_amount: finalTotal,
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      items: cart.map((i) => ({
        id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        order_id: '',
        product_id: i.product_id,
        product_name: i.product.name,
        variant_id: i.variant_id,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price,
        image_url: i.product.images[0] || '/logo.jpg',
      })),
    };

    if (paymentMethod === 'cod') {
      // Direct Cash on Delivery placement
      try {
        const order = createOrder({
          ...orderPayload,
          payment_status: 'pending',
        });

        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        success(`Order #${order.order_number} confirmed via Cash on Delivery!`);
        router.push(`/account/orders/${order.order_number}`);
      } catch (err) {
        error('Failed to create order. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Online Payment Flow (Razorpay)
      try {
        const res = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal,
            receipt: `rcpt_${Date.now()}`,
            notes: { customer_email: formData.email },
          }),
        });

        const data = await res.json();
        setLoading(false);

        if (!data.success) {
          error(data.error || 'Failed to initiate Razorpay payment order');
          return;
        }

        // Check if live Razorpay SDK or simulation
        if (data.isConfigured && typeof window !== 'undefined' && (window as any).Razorpay) {
          // Live Razorpay SDK execution
          const options = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: 'Hari Dealers',
            description: 'Luxury Ethnic Fashion Order',
            image: '/logo.jpg',
            order_id: data.orderId,
            handler: async function (response: any) {
              // Verify signature on server
              const verifyRes = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                const order = createOrder({
                  ...orderPayload,
                  payment_status: 'paid',
                });
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                success(`Payment successful! Order #${order.order_number} confirmed.`);
                router.push(`/account/orders/${order.order_number}`);
              } else {
                error('Payment verification failed. Please contact support.');
              }
            },
            prefill: {
              name: formData.fullName,
              email: formData.email,
              contact: formData.phone,
            },
            theme: { color: '#3b0c22' },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          // Graceful simulated gateway modal for interactive previewing
          setPendingOrderDetails({
            ...orderPayload,
            razorpayOrderId: data.orderId,
          });
          setMockRazorpayOpen(true);
        }
      } catch (err: any) {
        setLoading(false);
        error('Error contacting payment gateway. Please try again.');
      }
    }
  };

  const handleCompleteMockPayment = async (status: 'success' | 'failed') => {
    if (!pendingOrderDetails) return;

    if (status === 'failed') {
      setMockRazorpayOpen(false);
      error('Payment was declined or cancelled. Your order was not placed.');
      return;
    }

    setMockRazorpayOpen(false);
    setLoading(true);

    // Verify signature on server
    try {
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: pendingOrderDetails.razorpayOrderId || `order_${Date.now()}`,
          razorpay_payment_id: `pay_${Date.now()}`,
          razorpay_signature: `mock_sig_${Date.now()}_verified`,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        const order = createOrder({
          ...pendingOrderDetails,
          payment_status: 'paid',
        });
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        success(`Payment verified! Order #${order.order_number} has been placed.`);
        router.push(`/account/orders/${order.order_number}`);
      } else {
        error(verifyData.error || 'Payment verification failed.');
      }
    } catch (err) {
      error('Error verifying payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-8 pb-4 border-b border-sand">
          <span className="text-xs font-bold uppercase tracking-widest text-burgundy-800">
            Secure Order
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-0.5">
            Checkout &amp; Shipping
          </h1>
        </div>

        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Customer Address & Payment Options (Span 7) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Contact & Shipping Address Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-sand">
                <span className="w-6 h-6 rounded-full bg-burgundy-950 text-gold-300 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-serif text-lg font-bold text-charcoal-900">
                  Shipping Address
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile"
                    className="w-full p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    Email Address (For Order Tracking &amp; Invoice) *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    House / Flat / Building Name *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    required
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="e.g. Flat 402, Royal Palms"
                    className="w-full p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    Street / Area / Colony
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="e.g. Anna Nagar West"
                    className="w-full p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-burgundy-900"
                  >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Other">Other State</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    6-Digit Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    maxLength={6}
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-sand font-mono focus:outline-none focus:border-burgundy-900"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method Selector */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-sand">
                <span className="w-6 h-6 rounded-full bg-burgundy-950 text-gold-300 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-serif text-lg font-bold text-charcoal-900">
                  Select Payment Method
                </h2>
              </div>

              {/* Online Payment (Razorpay Ready) */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? 'border-burgundy-900 bg-burgundy-50/40 shadow-sm'
                    : 'border-sand hover:border-gold-400'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="mt-1 accent-burgundy-900"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-charcoal-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-burgundy-900" />
                      <span>Online Payment (Razorpay Secure)</span>
                    </span>
                    <span className="text-[10px] font-bold bg-gold-400 text-burgundy-950 px-2 py-0.5 rounded-full uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600 mt-1 font-light">
                    Pay securely using UPI (Google Pay, PhonePe, Paytm), Credit / Debit Card, or Net Banking.
                  </p>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-burgundy-900 bg-burgundy-50/40 shadow-sm'
                    : 'border-sand hover:border-gold-400'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 accent-burgundy-900"
                />
                <div className="flex-1">
                  <span className="font-serif font-bold text-sm text-charcoal-900 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-burgundy-900" />
                    <span>Cash on Delivery (COD)</span>
                  </span>
                  <p className="text-xs text-charcoal-600 mt-1 font-light">
                    Pay in cash or digital UPI to our delivery executive when the parcel arrives at your doorstep.
                  </p>
                </div>
              </label>

              <div className="pt-2 text-[11px] text-charcoal-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gold-600" />
                <span>Your transaction is encrypted with 256-bit bank-grade SSL security.</span>
              </div>
            </div>

          </div>

          {/* RIGHT: Order Snapshot (Span 5) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-sand shadow-sm sticky top-24 space-y-6">
            <h2 className="font-serif text-xl font-bold text-charcoal-900 pb-3 border-b border-sand">
              Order Items ({cart.length})
            </h2>

            {/* Item preview list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-sand/30 shrink-0 border border-sand">
                      <Image src={item.product.images[0] || '/logo.jpg'} alt="Item" fill className="object-cover" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-charcoal-900 line-clamp-1 max-w-[180px]">
                        {item.product.name}
                      </div>
                      <span className="text-[11px] text-charcoal-500">
                        {item.size} | {item.color} &times; {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-charcoal-900 font-serif">
                    ₹{item.total_price.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs pt-4 border-t border-sand">
              <div className="flex justify-between text-charcoal-600">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal-900 font-serif text-sm">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{Math.round(couponDiscount).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-charcoal-600">
                <span>Shipping / Delivery</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <strong className="text-emerald-700 uppercase font-bold">FREE</strong>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-sand flex justify-between items-baseline text-sm font-bold text-charcoal-900">
                <span className="font-serif text-base">Grand Total</span>
                <span className="font-serif text-2xl font-extrabold text-burgundy-950">
                  ₹{Math.round(finalTotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Submit / Place Order CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl bg-burgundy-950 text-gold-300 hover:bg-burgundy-900 font-bold text-xs uppercase tracking-widest shadow-gold-glow flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'PROCESSING...' : paymentMethod === 'online' ? 'PAY & PLACE ORDER' : 'PLACE ORDER (COD)'}</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </button>
          </div>

        </form>

      </div>

      {/* RAZORPAY PAYMENT SIMULATION MODAL (When live API key is not yet set in production) */}
      {mockRazorpayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/75 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-gold-500/40 relative">
            <div className="flex items-center gap-3 pb-4 border-b border-sand">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gold-400">
                <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-charcoal-900">Razorpay Secure Checkout</h3>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Bank Encrypted
                </span>
              </div>
            </div>

            <div className="my-6 space-y-4">
              <div className="p-4 bg-burgundy-50/50 rounded-2xl border border-sand text-center">
                <span className="text-xs uppercase text-charcoal-500 tracking-wider">Amount to Pay</span>
                <div className="font-serif text-3xl font-extrabold text-burgundy-950 mt-0.5">
                  ₹{Math.round(finalTotal).toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-charcoal-500 mt-1 block">
                  Paying to <strong>Hari Dealers</strong>
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1 font-light">
                <p><strong>Razorpay Architecture Ready:</strong></p>
                <p>To connect your live Razorpay merchant account, simply set <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> in <code>.env.local</code>.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleCompleteMockPayment('failed')}
                className="w-1/2 py-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
              >
                Cancel Payment
              </button>
              <button
                type="button"
                onClick={() => handleCompleteMockPayment('success')}
                className="w-1/2 py-3 text-xs font-bold text-burgundy-950 bg-gold-400 hover:bg-gold-300 rounded-xl shadow-gold-glow transition-all"
              >
                Simulate Success
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
