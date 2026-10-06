'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, FolderTree, Tag, Package, 
  Users, Boxes, CreditCard, Ticket, Star, Settings, Bell, 
  BarChart3, LogOut, ExternalLink, Menu, X, Printer, UserRound
} from 'lucide-react';
import { useStore } from '@/lib/store/store';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { orders } = useStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.order_status === 'confirmed' || o.order_status === 'pending').length;

  const navLinks = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Offers & Banners', href: '/admin/offers', icon: Tag },
    { label: 'Orders', href: '/admin/orders', icon: Package, badge: pendingOrdersCount },
    { label: 'Xerox & Pricing', href: '/admin/xerox', icon: Printer },
    { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Payments Log', href: '/admin/payments', icon: CreditCard },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Admin Profile', href: '/admin/profile', icon: UserRound },
    { label: 'Sales Reports', href: '/admin/reports', icon: BarChart3 },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Could not sign out. Please try again.');
      window.location.replace('/admin/login');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not sign out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-900 text-ivory flex">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-charcoal-950 border-r border-charcoal-800 shrink-0 select-none">
        
        {/* Brand header */}
        <div className="p-6 border-b border-charcoal-800 flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gold-400 shadow-gold-glow shrink-0">
            <Image src="/logo.jpg" alt="Logo" fill sizes="40px" className="object-cover" />
          </div>
          <div>
            <span className="font-serif text-base font-bold text-ivory block leading-tight">
              HARI <span className="text-gold-400">DEALERS</span>
            </span>
            <span className="text-[10px] text-gold-400/80 uppercase font-semibold tracking-wider">
              Admin Suite
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto text-xs font-medium">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-burgundy-950 text-gold-300 font-bold border border-gold-500/40 shadow-sm'
                    : 'text-charcoal-300 hover:text-ivory hover:bg-charcoal-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-charcoal-400'}`} />
                  <span>{item.label}</span>
                </div>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="bg-gold-400 text-burgundy-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-charcoal-800 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 bg-charcoal-900 hover:bg-charcoal-800 text-gold-300 rounded-xl text-xs font-semibold border border-charcoal-700 transition-colors"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl text-xs font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-4/5 max-w-xs bg-charcoal-950 h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10 border-r border-charcoal-800">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-charcoal-800">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gold-400">
                    <Image src="/logo.jpg" alt="Logo" fill sizes="32px" className="object-cover" />
                  </div>
                  <span className="font-serif text-sm font-bold text-ivory">HARI ADMIN</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1">
                  <X className="w-5 h-5 text-charcoal-400" />
                </button>
              </div>

              <nav className="mt-4 space-y-1 text-xs">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl ${
                        isActive ? 'bg-burgundy-950 text-gold-300 font-bold' : 'text-charcoal-300 hover:text-ivory'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-gold-400" />
                        <span>{item.label}</span>
                      </div>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span className="bg-gold-400 text-burgundy-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-charcoal-800">
              <Link href="/" onClick={() => setMobileSidebarOpen(false)} className="text-xs text-gold-400 block py-1">
                &larr; Return to Customer Store
              </Link>
              <button
                onClick={handleLogout}
                className="mt-3 flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN ADMIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-charcoal-950/80 backdrop-blur-md border-b border-charcoal-800 px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-charcoal-300 hover:text-ivory"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-xs font-semibold text-charcoal-400 hidden sm:inline">
              Store: <strong className="text-ivory">Hari Dealers Official</strong> &bull; Currency: <strong className="text-gold-400">INR (₹)</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 text-charcoal-300 hover:text-gold-400 rounded-full hover:bg-charcoal-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {pendingOrdersCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gold-400 rounded-full ring-2 ring-charcoal-950 animate-pulse" />
                )}
              </button>

              {/* Notification dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-charcoal-950 border border-charcoal-700 rounded-2xl shadow-3d p-4 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-charcoal-800 mb-3">
                    <span className="font-bold text-ivory">Store Notifications</span>
                    <span className="text-[10px] text-gold-400 font-semibold">{pendingOrdersCount} New Orders</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {orders.slice(0, 4).map((ord) => (
                      <Link
                        key={ord.id}
                        href="/admin/orders"
                        onClick={() => setNotificationOpen(false)}
                        className="block p-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 transition-colors"
                      >
                        <div className="font-bold text-ivory">🔔 Order #{ord.order_number}</div>
                        <div className="text-[11px] text-charcoal-400 mt-0.5">
                          {ord.customer_name} &bull; ₹{ord.total_amount} &bull; {ord.payment_status.toUpperCase()}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin User Badge */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-charcoal-800 text-xs">
              <div className="w-8 h-8 rounded-full bg-burgundy-950 border border-gold-400 flex items-center justify-center font-bold text-gold-300">
                A
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-ivory block leading-none">Admin</span>
                <span className="text-[10px] text-charcoal-400">haridealers@gmail.com</span>
              </div>
            </div>

          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
