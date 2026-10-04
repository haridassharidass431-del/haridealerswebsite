'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowRight, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { OrderStatus } from '@/types';

export default function MyOrdersPage() {
  const { orders, currentUser } = useStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Filter orders for the user
  const userOrders = orders.filter(
    (o) => !currentUser?.id || o.user_id === currentUser.id || o.customer_email === currentUser?.email
  );

  const filteredOrders = userOrders.filter((o) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery'].includes(o.order_status);
    if (selectedFilter === 'delivered') return o.order_status === 'delivered';
    if (selectedFilter === 'cancelled') return ['cancelled', 'cancel_requested', 'return_requested'].includes(o.order_status);
    return true;
  });

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex items-center justify-between pb-6 border-b border-sand mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-burgundy-800">
              Order History
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-0.5">
              My Orders ({userOrders.length})
            </h1>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-burgundy-900 hover:text-gold-600 underline"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 text-xs">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'active', label: 'Active / In Transit' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled / Returned' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-4 py-2 rounded-xl font-bold tracking-wide transition-all shrink-0 ${
                selectedFilter === tab.id
                  ? 'bg-burgundy-950 text-gold-300 shadow-sm'
                  : 'bg-white text-charcoal-600 border border-sand hover:bg-sand/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Listing */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-sand shadow-sm my-6">
            <div className="w-16 h-16 rounded-full bg-burgundy-50 border border-gold-400/30 flex items-center justify-center mx-auto mb-4 text-burgundy-900">
              <Package className="w-8 h-8 text-gold-600" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-charcoal-900">
              You haven&apos;t placed any orders yet.
            </h3>
            <p className="text-sm text-charcoal-600 mt-2 max-w-sm mx-auto font-light">
              Once you place an order, you will be able to track live delivery progress here.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block px-8 py-3 rounded-xl bg-burgundy-950 text-gold-300 font-bold text-xs uppercase tracking-wider shadow-gold-glow hover:bg-burgundy-900"
            >
              Explore Festive Styles
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const isDelivered = order.order_status === 'delivered';
              const isCancelled = order.order_status === 'cancelled';
              const isShipped = order.order_status === 'shipped' || order.order_status === 'out_for_delivery';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-sand shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Order header row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-sand text-xs">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-lg font-bold text-charcoal-900">
                          #{order.order_number}
                        </span>
                        <span
                          className={`font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-[10px] ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isCancelled
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : isShipped
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-burgundy-50 text-burgundy-900 border border-burgundy-200'
                          }`}
                        >
                          {order.order_status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-charcoal-500 mt-0.5 block">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="font-serif text-lg font-bold text-burgundy-950">
                        ₹{order.total_amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-charcoal-500 block text-[11px]">
                        Payment: {order.payment_method.toUpperCase()} ({order.payment_status.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  {/* Items snapshot */}
                  <div className="py-4 space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-xs">
                        <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-sand/30 shrink-0 border border-sand">
                          <Image src={item.image_url || '/logo.jpg'} alt={item.product_name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-charcoal-900 truncate">
                            {item.product_name}
                          </h4>
                          <span className="text-charcoal-500 text-[11px]">
                            Size: <strong>{item.size}</strong> &bull; Color: <strong>{item.color}</strong> &times; {item.quantity}
                          </span>
                        </div>
                        <span className="font-bold text-charcoal-900 font-serif">
                          ₹{item.total_price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Courier tracking summary & action button */}
                  <div className="pt-4 border-t border-sand flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      {order.courier_name && order.tracking_number ? (
                        <div className="flex items-center gap-2 text-charcoal-700">
                          <Truck className="w-4 h-4 text-gold-600" />
                          <span>
                            Shipped via <strong>{order.courier_name}</strong> (AWB: {order.tracking_number})
                          </span>
                        </div>
                      ) : (
                        <span className="text-charcoal-500 italic">
                          Tracking details will update once dispatched.
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/account/orders/${order.order_number}`}
                      className="px-5 py-2.5 rounded-xl bg-burgundy-950 text-gold-300 font-bold text-xs uppercase tracking-wider hover:bg-burgundy-900 transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <span>Order Details &amp; Tracking</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
