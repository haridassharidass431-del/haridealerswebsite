'use client';

import React from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useStore } from '@/lib/store/store';

export default function AdminPaymentsPage() {
  const { orders } = useStore();

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
            Gateway Audit
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-0.5">
            Razorpay &amp; Payment Transactions
          </h1>
        </div>
      </div>

      <div className="bg-charcoal-950 rounded-2xl border border-charcoal-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-charcoal-900 text-charcoal-400 uppercase tracking-wider font-semibold border-b border-charcoal-800">
                <th className="p-4">Payment ID / Ref</th>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/60 text-charcoal-300">
              {orders.map((ord, idx) => (
                <tr key={ord.id} className="hover:bg-charcoal-900/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-gold-300">
                    {ord.payment_method === 'online' ? `pay_${ord.order_number.toLowerCase()}` : `cod_${ord.order_number.toLowerCase()}`}
                  </td>
                  <td className="p-4 font-bold text-ivory">#{ord.order_number}</td>
                  <td className="p-4">{ord.customer_name}</td>
                  <td className="p-4">
                    <span className="uppercase text-[10px] font-bold text-charcoal-300 bg-charcoal-800 px-2 py-0.5 rounded">
                      {ord.payment_method === 'online' ? 'Razorpay' : 'COD'}
                    </span>
                  </td>
                  <td className="p-4 font-serif font-bold text-ivory text-sm">
                    ₹{ord.total_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      ord.payment_status === 'paid' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' :
                      ord.payment_status === 'failed' ? 'bg-rose-950/40 text-rose-400 border border-rose-800/40' :
                      'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                    }`}>
                      {ord.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-charcoal-500">
                    {new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
