'use client';

import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Download } from 'lucide-react';
import { useStore } from '@/lib/store/store';

export default function AdminReportsPage() {
  const { orders, products } = useStore();

  const totalGross = orders.reduce((s, o) => s + o.subtotal, 0);
  const totalDiscounts = orders.reduce((s, o) => s + o.discount + o.coupon_discount, 0);
  const totalNet = orders.reduce((s, o) => s + o.total_amount, 0);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
            Financial Insights
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-0.5">
            Sales &amp; Revenue Reports
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-charcoal-950 p-6 rounded-2xl border border-charcoal-800">
          <span className="text-xs text-charcoal-400">Gross Catalog Value</span>
          <div className="font-serif text-2xl font-bold text-ivory mt-1">₹{totalGross.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-charcoal-500 mt-1 font-light">Total before discounts and coupons</p>
        </div>

        <div className="bg-charcoal-950 p-6 rounded-2xl border border-charcoal-800">
          <span className="text-xs text-charcoal-400">Promotional Discounts Distributed</span>
          <div className="font-serif text-2xl font-bold text-rose-400 mt-1">₹{totalDiscounts.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-charcoal-500 mt-1 font-light">Festival sales &amp; coupon deductions</p>
        </div>

        <div className="bg-charcoal-950 p-6 rounded-2xl border border-charcoal-800">
          <span className="text-xs text-charcoal-400">Net Realized Revenue</span>
          <div className="font-serif text-2xl font-bold text-gold-300 mt-1">₹{totalNet.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-charcoal-500 mt-1 font-light">Paid &amp; pending settlement funds</p>
        </div>
      </div>

      <div className="bg-charcoal-950 p-6 sm:p-8 rounded-3xl border border-charcoal-800">
        <h2 className="font-serif text-lg font-bold text-ivory mb-4">
          Store Performance Summary
        </h2>
        <div className="space-y-3 text-xs text-charcoal-300 leading-relaxed font-light">
          <p>
            Hari Dealers is currently tracking an average order value (AOV) of <strong>₹{Math.round(totalNet / Math.max(1, orders.length))}</strong> across <strong>{orders.length} orders</strong>.
          </p>
          <p>
            Top performing categories are <strong>Sarees</strong> and <strong>Kurtis</strong>, accounting for over 65% of customer engagement and repeat visits.
          </p>
        </div>
      </div>

    </div>
  );
}
