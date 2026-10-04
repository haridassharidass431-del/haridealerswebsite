'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TrendingUp, ShoppingBag, Clock, CheckCircle2, XCircle, 
  AlertTriangle, Users, DollarSign, ArrowRight, Package, 
  ExternalLink 
} from 'lucide-react';
import { useStore } from '@/lib/store/store';

export default function AdminDashboardPage() {
  const { products, orders, categories } = useStore();

  // Metric Calculations
  const totalSales = orders
    .filter((o) => o.payment_status === 'paid' || o.order_status === 'delivered')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const todayOrders = orders.filter((o) => {
    const orderDate = new Date(o.created_at).toDateString();
    return orderDate === new Date().toDateString();
  });

  const todaySales = todayOrders
    .filter((o) => o.payment_status === 'paid' || o.order_status === 'delivered')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingOrders = orders.filter(
    (o) => o.order_status === 'pending' || o.order_status === 'confirmed' || o.order_status === 'processing'
  );
  const deliveredOrders = orders.filter((o) => o.order_status === 'delivered');
  const cancelledOrders = orders.filter((o) => o.order_status === 'cancelled');
  const lowStockProducts = products.filter((p) => p.is_active && p.stock <= 5);
  const uniqueCustomers = new Set(orders.map((o) => o.customer_email)).size;

  const kpis = [
    {
      label: "Today's Sales",
      value: `₹${todaySales.toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'text-gold-400',
      bg: 'bg-gold-400/10 border-gold-400/30',
      sub: `${todayOrders.length} orders today`,
    },
    {
      label: 'Total Revenue',
      value: `₹${totalSales.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      sub: 'Lifetime store earnings',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ShoppingBag,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/30',
      sub: 'All-time checkout transactions',
    },
    {
      label: 'Pending Orders',
      value: pendingOrders.length,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      sub: 'Requires packaging & dispatch',
    },
    {
      label: 'Delivered Orders',
      value: deliveredOrders.length,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      sub: 'Successfully fulfilled',
    },
    {
      label: 'Cancelled Orders',
      value: cancelledOrders.length,
      icon: XCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
      sub: 'Customer or admin cancelled',
    },
    {
      label: 'Low Stock Products',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/30',
      sub: 'Under 5 units remaining',
    },
    {
      label: 'Total Customers',
      value: Math.max(1, uniqueCustomers),
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/30',
      sub: 'Verified buyers registered',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
            Realtime Analytics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-0.5">
            Store Performance Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-gold-400 hover:bg-gold-300 text-burgundy-950 rounded-xl text-xs font-bold uppercase tracking-wider shadow-gold-glow transition-all"
          >
            + Add New Product
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-ivory rounded-xl text-xs font-semibold border border-charcoal-700 transition-colors"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-charcoal-950 p-5 rounded-2xl border border-charcoal-800 shadow-sm flex items-start justify-between gap-4"
            >
              <div>
                <span className="text-xs text-charcoal-400 font-medium">{kpi.label}</span>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-1">
                  {kpi.value}
                </div>
                <span className="text-[11px] text-charcoal-400 mt-1 block font-light">
                  {kpi.sub}
                </span>
              </div>
              <div className={`p-3 rounded-xl border ${kpi.bg}`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section: Sales by Day & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sales by Day (SVG/CSS Bar Chart) */}
        <div className="lg:col-span-7 bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <h2 className="font-serif text-base font-bold text-ivory">
              Sales Volume (Last 7 Days)
            </h2>
            <span className="text-xs text-gold-400 font-semibold">Weekly View</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { day: 'Mon', amount: 3200, height: '40%' },
              { day: 'Tue', amount: 4800, height: '60%' },
              { day: 'Wed', amount: 2199, height: '35%' },
              { day: 'Thu', amount: 6500, height: '80%' },
              { day: 'Fri', amount: 5400, height: '70%' },
              { day: 'Sat', amount: 7800, height: '95%' },
              { day: 'Sun', amount: 4100, height: '55%' },
            ].map((col, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] text-charcoal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{col.amount}
                </span>
                <div 
                  className="w-full bg-gradient-to-t from-burgundy-900 via-gold-500 to-gold-400 rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                  style={{ height: col.height }}
                />
                <span className="text-[11px] text-charcoal-400 font-medium">{col.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share Breakdown */}
        <div className="lg:col-span-5 bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <h2 className="font-serif text-base font-bold text-ivory">
              Category Distribution
            </h2>
            <Link href="/admin/categories" className="text-xs text-gold-400 hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-3.5 pt-2">
            {categories.slice(0, 5).map((cat, i) => {
              const count = products.filter((p) => p.category_id === cat.id).length;
              const pct = Math.round((count / Math.max(1, products.length)) * 100);

              return (
                <div key={cat.id} className="space-y-1 text-xs">
                  <div className="flex justify-between text-charcoal-300">
                    <span className="font-medium text-ivory">{cat.name}</span>
                    <span>{count} styles ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-charcoal-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gold-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Tables Row: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recent Orders (Span 7) */}
        <div className="lg:col-span-7 bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <h2 className="font-serif text-base font-bold text-ivory">
              Recent Customer Orders
            </h2>
            <Link href="/admin/orders" className="text-xs text-gold-400 hover:underline">
              View All ({orders.length}) &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 5).map((ord) => (
              <div
                key={ord.id}
                className="flex items-center justify-between p-3 bg-charcoal-900 rounded-2xl border border-charcoal-800 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-ivory">#{ord.order_number}</strong>
                    <span className="text-charcoal-400">&bull;</span>
                    <span className="text-charcoal-300">{ord.customer_name}</span>
                  </div>
                  <span className="text-[11px] text-charcoal-500">
                    {ord.items.length} items &bull; {ord.payment_method.toUpperCase()} ({ord.payment_status.toUpperCase()})
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-serif font-bold text-gold-300">₹{ord.total_amount}</div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-400 bg-charcoal-800 px-2 py-0.5 rounded">
                    {ord.order_status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts (Span 5) */}
        <div className="lg:col-span-5 bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <h2 className="font-serif text-base font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Low Stock Alerts</span>
            </h2>
            <Link href="/admin/inventory" className="text-xs text-gold-400 hover:underline">
              Inventory &rarr;
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-charcoal-500 italic p-4 text-center">All product stocks healthy.</p>
          ) : (
            <div className="space-y-2.5">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-rose-950/20 border border-rose-900/30 rounded-2xl text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <strong className="text-ivory truncate block">{p.name}</strong>
                    <span className="text-charcoal-400 text-[11px]">{p.category_name}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-900/40 text-rose-300 font-bold font-mono shrink-0">
                    {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
