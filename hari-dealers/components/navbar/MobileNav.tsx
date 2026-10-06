'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Sparkles, ShoppingBag, User, Printer } from 'lucide-react';
import { useStore } from '@/lib/store/store';

export default function MobileNav() {
  const pathname = usePathname();
  const { cartCount, currentUser } = useStore();

  const links = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/shop', icon: Compass },
    { label: 'Offers', href: '/offers', icon: Sparkles, highlight: true },
    { label: 'Print', href: '/xerox', icon: Printer },
    { label: 'Cart', href: '/cart', icon: ShoppingBag, badge: cartCount },
    { 
      label: 'Account', 
      href: currentUser ? '/account' : '/login',
      icon: User 
    },
  ];

  // Do not show mobile bottom nav inside full-screen admin sections if preferred, or keep accessible
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-burgundy-950/95 backdrop-blur-md border-t border-gold-500/20 py-2 px-3 shadow-3d">
      <div className="flex items-center justify-around">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center relative py-1 px-3 min-w-[56px] transition-all ${
                isActive
                  ? 'text-gold-400 font-bold scale-105'
                  : 'text-ivory/60 hover:text-ivory font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.highlight ? 'text-gold-400 animate-pulse-subtle' : ''}`} />
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gold-400 text-burgundy-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
