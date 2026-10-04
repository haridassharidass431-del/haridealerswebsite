'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, Check, Clock, Truck, ShieldCheck, MapPin, 
  ExternalLink, AlertTriangle, RotateCcw, XCircle, FileText 
} from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';
import { OrderStatus } from '@/types';

export default function OrderDetailsTrackingPage({ params }: { params: { id: string } }) {
  const { orders, cancelOrder, requestReturn } = useStore();
  const { success, error } = useToast();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Wrong size');

  const order = orders.find(
    (o) => o.order_number === params.id || o.id === params.id
  );

  if (!order) {
    return (
      <div className="bg-ivory min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-2xl font-bold text-charcoal-900">Order Not Found</h2>
        <p className="text-sm text-charcoal-600 mt-2">Could not locate order #{params.id}.</p>
        <Link
          href="/account/orders"
          className="mt-6 px-6 py-2.5 rounded-xl bg-burgundy-950 text-gold-300 font-bold text-xs uppercase tracking-wider"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  // Ordered sequence of delivery milestones
  const steps: { key: OrderStatus; label: string }[] = [
    { key: 'confirmed', label: 'Order Placed' },
    { key: 'confirmed', label: 'Payment Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  // Helper to determine status index
  const statusLevels: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    processing: 2,
    packed: 3,
    shipped: 4,
    out_for_delivery: 5,
    delivered: 6,
    cancel_requested: 1,
    cancelled: -1,
    return_requested: 6,
    returned: 6,
    refunded: -1,
  };

  const currentLevel = statusLevels[order.order_status] ?? 1;
  const isCancelled = order.order_status === 'cancelled';
  const isDelivered = order.order_status === 'delivered';
  const canCancel = ['pending', 'confirmed', 'processing', 'packed'].includes(order.order_status);
  const canReturn = order.order_status === 'delivered';

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = cancelOrder(order.id, cancelReason);
    if (ok) {
      success(`Order #${order.order_number} has been cancelled.`);
      setCancelModalOpen(false);
    } else {
      error('Could not cancel this order.');
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = requestReturn(order.id, returnReason);
    if (ok) {
      success(`Return request for #${order.order_number} submitted successfully!`);
      setReturnModalOpen(false);
    } else {
      error('Could not submit return request.');
    }
  };

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs text-burgundy-900 hover:text-gold-600 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        {/* Order Header Summary */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-burgundy-800">
              Live Order Status
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal-900">
                Order #{order.order_number}
              </h1>
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                isDelivered ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' :
                isCancelled ? 'bg-rose-50 text-rose-800 border border-rose-300' :
                'bg-amber-50 text-amber-900 border border-amber-300'
              }`}>
                {order.order_status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {canCancel && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel Order
              </button>
            )}
            {canReturn && (
              <button
                onClick={() => setReturnModalOpen(true)}
                className="px-4 py-2 border border-burgundy-900 text-burgundy-900 hover:bg-burgundy-50 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return / Exchange</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            VISUAL TRACKING TIMELINE
        ======================================================== */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-sand shadow-sm mb-8">
          <div className="flex items-center justify-between pb-6 border-b border-sand mb-8">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-burgundy-900" />
              <h2 className="font-serif text-lg font-bold text-charcoal-900">
                Shipment Tracking Timeline
              </h2>
            </div>

            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-burgundy-950 text-gold-300 hover:bg-burgundy-900 text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <span>TRACK PACKAGE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {isCancelled ? (
            <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 text-center">
              <XCircle className="w-10 h-10 text-rose-600 mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-rose-900">Order Was Cancelled</h3>
              {order.cancellation_reason && (
                <p className="text-xs text-rose-700 mt-1">Reason: {order.cancellation_reason}</p>
              )}
              {order.payment_method === 'online' && (
                <p className="text-xs text-amber-800 font-semibold mt-2">
                  Refund has been scheduled back to your payment method.
                </p>
              )}
            </div>
          ) : (
            <div className="relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-sand/60 -z-0">
                <div 
                  className="h-full bg-burgundy-900 transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (currentLevel / 6) * 100))}%` }}
                />
              </div>

              {/* Steps Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 relative z-10 text-center">
                {steps.map((step, idx) => {
                  const isPassed = currentLevel >= idx;
                  const isCurrent = currentLevel === idx;

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                          isPassed
                            ? 'bg-burgundy-950 text-gold-300 ring-4 ring-gold-400/20'
                            : 'bg-sand/40 text-charcoal-400 border border-sand'
                        }`}
                      >
                        {isPassed ? <Check className="w-5 h-5 text-gold-300" /> : idx + 1}
                      </div>
                      <span className={`text-xs mt-3 font-serif font-bold ${
                        isCurrent ? 'text-burgundy-900' : isPassed ? 'text-charcoal-900' : 'text-charcoal-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Courier Partner & AWB details */}
              <div className="mt-10 p-4 bg-sand/30 rounded-2xl border border-sand grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-charcoal-500 block">Courier Partner</span>
                  <strong className="text-charcoal-900">{order.courier_name || 'Express Logistics'}</strong>
                </div>
                <div>
                  <span className="text-charcoal-500 block">Tracking Number / AWB</span>
                  <strong className="text-charcoal-900 font-mono">{order.tracking_number || 'Will update on dispatch'}</strong>
                </div>
                <div>
                  <span className="text-charcoal-500 block">Estimated Delivery</span>
                  <strong className="text-emerald-700">3 - 5 Business Days</strong>
                </div>
              </div>
            </div>
          )}

          {/* Audit History Log */}
          {order.history && order.history.length > 0 && (
            <div className="mt-8 pt-6 border-t border-sand">
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-3">
                Tracking Updates Log
              </h3>
              <div className="space-y-2 text-xs">
                {order.history.map((h, i) => (
                  <div key={i} className="flex items-start justify-between p-2.5 bg-sand/20 rounded-xl">
                    <span className="text-charcoal-800">{h.message}</span>
                    <span className="text-[11px] text-charcoal-400 shrink-0 ml-4">
                      {new Date(h.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Items & Shipping Address Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Items Table (Span 7) */}
          <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-sand shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-charcoal-900 pb-3 border-b border-sand">
              Purchased Items
            </h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-18 rounded-xl overflow-hidden bg-sand/30 shrink-0 border border-sand">
                      <Image src={item.image_url || '/logo.jpg'} alt="Item" fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-charcoal-900 line-clamp-1">{item.product_name}</h4>
                      <p className="text-charcoal-500 mt-0.5">Size: {item.size} &bull; Color: {item.color} &bull; Qty: {item.quantity}</p>
                      <span className="text-burgundy-950 font-bold font-serif">₹{item.unit_price} each</span>
                    </div>
                  </div>
                  <span className="font-bold text-charcoal-900 font-serif text-sm">
                    ₹{item.total_price.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-sand space-y-2 text-xs">
              <div className="flex justify-between text-charcoal-600">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.coupon_discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount ({order.coupon_code})</span>
                  <span>-₹{order.coupon_discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-charcoal-600">
                <span>Delivery Charge</span>
                <span>{order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge}`}</span>
              </div>
              <div className="pt-2 border-t border-sand flex justify-between font-serif font-bold text-base text-burgundy-950">
                <span>Total Amount</span>
                <span>₹{order.total_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Info (Span 5) */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-sand shadow-sm text-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-sand">
                <MapPin className="w-4 h-4 text-burgundy-900" />
                <h3 className="font-serif text-base font-bold text-charcoal-900">Shipping Details</h3>
              </div>
              <p className="font-bold text-charcoal-900 text-sm">{order.shipping_address.full_name}</p>
              <p className="text-charcoal-600">
                {order.shipping_address.address_line1}, {order.shipping_address.address_line2 && `${order.shipping_address.address_line2}, `}
                {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
              </p>
              <p className="text-charcoal-600">Mobile: {order.shipping_address.phone}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-sand shadow-sm text-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-sand">
                <FileText className="w-4 h-4 text-burgundy-900" />
                <h3 className="font-serif text-base font-bold text-charcoal-900">Payment Information</h3>
              </div>
              <p className="text-charcoal-600">
                Method: <strong className="text-charcoal-900 uppercase">{order.payment_method}</strong>
              </p>
              <p className="text-charcoal-600">
                Status: <strong className="text-charcoal-900 uppercase">{order.payment_status}</strong>
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sand">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">Cancel Order #{order.order_number}</h3>
            <p className="text-xs text-charcoal-500 mb-4">Please let us know why you are cancelling this order:</p>
            
            <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-sand bg-white"
              >
                <option value="Wrong size">Wrong size selected</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Delivery delay">Delivery time too long</option>
                <option value="Other">Other reason</option>
              </select>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-sand text-charcoal-700 font-semibold"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Confirm Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return / Exchange Modal */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sand">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">Request Return / Exchange</h3>
            <p className="text-xs text-charcoal-500 mb-4">Eligible within 7 days of delivery under our easy return policy.</p>
            
            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-sand bg-white"
              >
                <option value="Wrong size">Need different size</option>
                <option value="Damaged product">Received damaged item</option>
                <option value="Wrong product">Received incorrect style</option>
                <option value="Quality issue">Textile / quality concern</option>
                <option value="Other">Other reason</option>
              </select>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-sand text-charcoal-700 font-semibold"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-burgundy-950 text-gold-300 hover:bg-burgundy-900 font-bold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
