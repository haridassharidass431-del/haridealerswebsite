'use client';

import React from 'react';
import { Users, Mail, Phone, ShoppingBag, MapPin } from 'lucide-react';
import { useStore } from '@/lib/store/store';

export default function AdminCustomersPage() {
  const { orders } = useStore();

  // Deduplicate customers from orders
  const customerMap = new Map<string, {
    name: string;
    email: string;
    phone: string;
    city: string;
    orderCount: number;
    totalSpent: number;
  }>();

  orders.forEach((o) => {
    const existing = customerMap.get(o.customer_email);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += o.total_amount;
    } else {
      customerMap.set(o.customer_email, {
        name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
        city: o.shipping_address.city,
        orderCount: 1,
        totalSpent: o.total_amount,
      });
    }
  });

  const customers = Array.from(customerMap.values());

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
            Patron Database
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-0.5">
            Registered Customers
          </h1>
        </div>
        <span className="text-xs text-charcoal-400">
          Total: <strong className="text-ivory">{customers.length}</strong>
        </span>
      </div>

      <div className="bg-charcoal-950 rounded-2xl border border-charcoal-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-charcoal-900 text-charcoal-400 uppercase tracking-wider font-semibold border-b border-charcoal-800">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">City</th>
                <th className="p-4">Orders Placed</th>
                <th className="p-4 text-right">Lifetime Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/60 text-charcoal-300">
              {customers.map((c, i) => (
                <tr key={i} className="hover:bg-charcoal-900/60 transition-colors">
                  <td className="p-4 font-bold text-ivory flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-burgundy-950 text-gold-300 font-bold flex items-center justify-center border border-gold-400/40">
                      {c.name.charAt(0)}
                    </div>
                    <span>{c.name}</span>
                  </td>
                  <td className="p-4 font-mono text-charcoal-400">{c.email}</td>
                  <td className="p-4">{c.phone}</td>
                  <td className="p-4">{c.city}</td>
                  <td className="p-4">
                    <span className="bg-charcoal-800 px-2 py-0.5 rounded font-mono font-bold text-ivory">
                      {c.orderCount}
                    </span>
                  </td>
                  <td className="p-4 text-right font-serif font-bold text-gold-300 text-sm">
                    ₹{c.totalSpent.toLocaleString('en-IN')}
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
