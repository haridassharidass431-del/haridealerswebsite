'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, Heart, MapPin, User, LogOut,
  ChevronRight, ArrowRight, Clock, Truck 
} from 'lucide-react';
import { useStore } from '@/lib/store/store';

export default function AccountPage() {
  const router = useRouter();
  const { currentUser, orders, wishlistCount, logout } = useStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const userOrders = orders.filter((o) => !currentUser?.id || o.user_id === currentUser.id || o.customer_email === currentUser?.email);
  const recentOrder = userOrders[0];

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* User Greeting & Role Banner */}
        <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 text-ivory p-6 sm:p-10 rounded-3xl shadow-3d border border-gold-500/20 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold-300 font-semibold">
              Hari Dealers Privilege Member
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-1 text-ivory">
              Welcome, {currentUser?.name || 'Valued Customer'}
            </h1>
            <p className="text-xs text-ivory/70 mt-1 font-light">
              {currentUser?.email || 'customer@example.com'} &bull; {currentUser?.phone || '+91 98401 23456'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-ivory border border-gold-400/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <Link
            href="/account/orders"
            className="bg-white p-6 rounded-2xl border border-sand shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs text-charcoal-500 font-medium">My Orders</span>
              <div className="font-serif text-2xl font-bold text-charcoal-900 mt-0.5">
                {userOrders.length}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-burgundy-50 border border-gold-400/30 flex items-center justify-center text-burgundy-900 group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6 text-gold-600" />
            </div>
          </Link>

          <Link
            href="/account/wishlist"
            className="bg-white p-6 rounded-2xl border border-sand shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs text-charcoal-500 font-medium">Saved Items</span>
              <div className="font-serif text-2xl font-bold text-charcoal-900 mt-0.5">
                {wishlistCount}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-burgundy-50 border border-gold-400/30 flex items-center justify-center text-burgundy-900 group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 text-gold-600" />
            </div>
          </Link>

          <Link
            href="/account/addresses"
            className="bg-white p-6 rounded-2xl border border-sand shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs text-charcoal-500 font-medium">Addresses</span>
              <div className="font-serif text-sm font-bold text-charcoal-900 mt-1">
                Manage Saved
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-burgundy-50 border border-gold-400/30 flex items-center justify-center text-burgundy-900 group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6 text-gold-600" />
            </div>
          </Link>

          <Link
            href="/account/profile"
            className="bg-white p-6 rounded-2xl border border-sand shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs text-charcoal-500 font-medium">My Profile</span>
              <div className="font-serif text-sm font-bold text-charcoal-900 mt-1">
                Edit Details
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-burgundy-50 border border-gold-400/30 flex items-center justify-center text-burgundy-900 group-hover:scale-105 transition-transform">
              <User className="w-6 h-6 text-gold-600" />
            </div>
          </Link>
        </div>

        {/* Recent Order Preview */}
        {recentOrder && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-sand mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-burgundy-800">
                  Latest Activity
                </span>
                <h2 className="font-serif text-xl font-bold text-charcoal-900">
                  Order #{recentOrder.order_number}
                </h2>
              </div>
              <Link
                href={`/account/orders/${recentOrder.order_number}`}
                className="text-xs font-bold text-burgundy-900 hover:text-gold-600 flex items-center gap-1 underline"
              >
                <span>Track Parcel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div>
                <div className="font-medium text-charcoal-700">
                  Status:{' '}
                  <span className="font-bold uppercase tracking-wider text-burgundy-950 bg-gold-400/20 px-2 py-0.5 rounded">
                    {recentOrder.order_status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-charcoal-500 mt-1">
                  Placed on {new Date(recentOrder.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="font-serif text-lg font-bold text-burgundy-950">
                  ₹{recentOrder.total_amount.toLocaleString('en-IN')}
                </div>
                <div className="text-charcoal-500">
                  {recentOrder.items.length} {recentOrder.items.length === 1 ? 'item' : 'items'} &bull; {recentOrder.payment_method.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
