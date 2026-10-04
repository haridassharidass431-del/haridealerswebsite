'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Package, Search, Eye, Truck, CheckCircle2, Clock, 
  XCircle, RotateCcw, X, ExternalLink 
} from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';
import { Order, OrderStatus } from '@/types';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useStore();
  const { success, error } = useToast();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Tracking Form state
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  const filteredOrders = orders.filter((o) => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.order_status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openOrderModal = (ord: Order) => {
    setSelectedOrder(ord);
    setCourierName(ord.courier_name || 'BlueDart Express');
    setTrackingNumber(ord.tracking_number || `BLD${Math.floor(100000000 + Math.random() * 900000000)}`);
    setTrackingUrl(ord.tracking_url || 'https://www.bluedart.com');
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!selectedOrder) return;

    let trackingData = undefined;
    if (newStatus === 'shipped') {
      trackingData = {
        courier_name: courierName,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
      };
    }

    updateOrderStatus(selectedOrder.id, newStatus, `Admin updated status to ${newStatus.toUpperCase()}`, trackingData);
    success(`Order #${selectedOrder.order_number} marked as ${newStatus.toUpperCase().replace('_', ' ')}`);

    // Update local modal state
    setSelectedOrder((prev) => prev ? {
      ...prev,
      order_status: newStatus,
      courier_name: trackingData?.courier_name || prev.courier_name,
      tracking_number: trackingData?.tracking_number || prev.tracking_number,
      tracking_url: trackingData?.tracking_url || prev.tracking_url,
    } : null);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
            Fulfillment Center
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-0.5">
            Customer Orders &amp; Dispatch
          </h1>
        </div>
        <span className="text-xs text-charcoal-400 font-medium">
          Total Store Orders: <strong className="text-ivory">{orders.length}</strong>
        </span>
      </div>

      {/* Filter Tabs Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 text-xs">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'confirmed', label: 'Confirmed' },
          { id: 'processing', label: 'Processing' },
          { id: 'packed', label: 'Packed' },
          { id: 'shipped', label: 'Shipped' },
          { id: 'out_for_delivery', label: 'Out for Delivery' },
          { id: 'delivered', label: 'Delivered' },
          { id: 'cancelled', label: 'Cancelled' },
          { id: 'return_requested', label: 'Return Requests' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-2 rounded-xl font-bold tracking-wide transition-all shrink-0 ${
              filterStatus === tab.id
                ? 'bg-burgundy-950 text-gold-300 border border-gold-500/40 shadow-sm'
                : 'bg-charcoal-950 text-charcoal-400 border border-charcoal-800 hover:text-ivory'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-charcoal-950 p-4 rounded-2xl border border-charcoal-800 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Customer Name, Email..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-charcoal-900 border border-charcoal-700 rounded-xl text-ivory placeholder-charcoal-500 focus:outline-none focus:border-gold-500"
          />
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-charcoal-400">
          Matching: <strong className="text-ivory">{filteredOrders.length}</strong>
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-charcoal-950 rounded-2xl border border-charcoal-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-charcoal-900 text-charcoal-400 uppercase tracking-wider font-semibold border-b border-charcoal-800">
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Order Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/60 text-charcoal-300">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-charcoal-900/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-gold-300">
                    #{ord.order_number}
                  </td>
                  <td className="p-4">
                    <strong className="text-ivory block">{ord.customer_name}</strong>
                    <span className="text-[10px] text-charcoal-500">{ord.customer_email}</span>
                  </td>
                  <td className="p-4 text-charcoal-400">
                    {new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-4">{ord.items.length} items</td>
                  <td className="p-4 font-bold text-ivory font-serif text-sm">
                    ₹{ord.total_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4">
                    <span className="uppercase text-[10px] font-bold text-charcoal-300">
                      {ord.payment_method} ({ord.payment_status})
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                      ord.order_status === 'delivered' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' :
                      ord.order_status === 'cancelled' ? 'bg-rose-950/40 text-rose-400 border-rose-800/40' :
                      ord.order_status === 'shipped' ? 'bg-amber-950/40 text-amber-400 border-amber-800/40' :
                      'bg-burgundy-950 text-gold-300 border-gold-500/30'
                    }`}>
                      {ord.order_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openOrderModal(ord)}
                      className="px-3 py-1.5 bg-burgundy-950 hover:bg-burgundy-900 text-gold-300 rounded-xl text-xs font-bold uppercase tracking-wider border border-gold-500/30"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Workflow Transition Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-charcoal-950 border border-charcoal-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-xs text-charcoal-300">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-800 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider">
                  Order Management
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-ivory">
                  Order #{selectedOrder.order_number}
                </h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-charcoal-400 hover:text-ivory">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 bg-charcoal-900 rounded-2xl border border-charcoal-800 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-charcoal-500 block">Current Status</span>
                <span className="font-serif font-bold text-base text-gold-300 uppercase">
                  {selectedOrder.order_status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-charcoal-500 block">Payment Method</span>
                <strong className="text-ivory uppercase">{selectedOrder.payment_method} ({selectedOrder.payment_status})</strong>
              </div>
              <div>
                <span className="text-charcoal-500 block">Total Amount</span>
                <span className="font-serif font-bold text-base text-ivory">₹{selectedOrder.total_amount}</span>
              </div>
            </div>

            {/* Admin Workflow Action Buttons */}
            <div className="mb-6 p-4 bg-burgundy-950/40 rounded-2xl border border-gold-500/30">
              <span className="font-bold text-gold-300 uppercase tracking-wider block mb-3 text-[11px]">
                Fulfillment Workflow Actions:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange('confirmed')}
                  className="px-3 py-1.5 bg-charcoal-900 hover:bg-charcoal-800 text-ivory rounded-lg font-bold uppercase"
                >
                  CONFIRM
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('processing')}
                  className="px-3 py-1.5 bg-charcoal-900 hover:bg-charcoal-800 text-ivory rounded-lg font-bold uppercase"
                >
                  PROCESS
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('packed')}
                  className="px-3 py-1.5 bg-charcoal-900 hover:bg-charcoal-800 text-ivory rounded-lg font-bold uppercase"
                >
                  PACK
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('shipped')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-burgundy-950 rounded-lg font-bold uppercase"
                >
                  SHIP (UPDATE TRACKING)
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('out_for_delivery')}
                  className="px-3 py-1.5 bg-charcoal-900 hover:bg-charcoal-800 text-ivory rounded-lg font-bold uppercase"
                >
                  OUT FOR DELIVERY
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('delivered')}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-burgundy-950 rounded-lg font-bold uppercase"
                >
                  DELIVER
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('cancelled')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold uppercase"
                >
                  CANCEL
                </button>
              </div>
            </div>

            {/* Courier Dispatch Settings (For Shipping) */}
            <div className="mb-6 p-4 bg-charcoal-900 rounded-2xl border border-charcoal-800 space-y-3">
              <span className="font-bold text-ivory uppercase tracking-wider block text-[11px]">
                Courier &amp; Tracking Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-charcoal-400 block mb-1">Courier Partner</label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="e.g. BlueDart Express"
                    className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-ivory"
                  />
                </div>
                <div>
                  <label className="text-charcoal-400 block mb-1">Tracking Number (AWB)</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BLD123456"
                    className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-ivory font-mono"
                  />
                </div>
                <div>
                  <label className="text-charcoal-400 block mb-1">Tracking URL</label>
                  <input
                    type="text"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-ivory"
                  />
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="mb-6">
              <h3 className="font-bold text-ivory uppercase tracking-wider mb-2">
                Order Items ({selectedOrder.items.length})
              </h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-charcoal-900 rounded-xl border border-charcoal-800">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-charcoal-800 shrink-0">
                        <Image src={item.image_url || '/logo.jpg'} alt="Item" fill className="object-cover" />
                      </div>
                      <div>
                        <strong className="text-ivory block">{item.product_name}</strong>
                        <span className="text-[11px] text-charcoal-400">Size: {item.size} &bull; Color: {item.color} &bull; Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-gold-300">₹{item.total_price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-4 bg-charcoal-900 rounded-2xl border border-charcoal-800 text-xs">
              <h3 className="font-bold text-ivory uppercase tracking-wider mb-2">Shipping Destination</h3>
              <p className="text-ivory font-bold">{selectedOrder.shipping_address.full_name}</p>
              <p>{selectedOrder.shipping_address.address_line1}, {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}</p>
              <p>Phone: {selectedOrder.shipping_address.phone} &bull; Email: {selectedOrder.customer_email}</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
