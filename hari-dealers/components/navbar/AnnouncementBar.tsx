'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 text-gold-300 text-xs sm:text-sm py-2 px-4 border-b border-gold-500/20 text-center tracking-wide">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse-subtle hidden sm:inline" />
        <span>Special Offers Available &bull; Free Delivery on Selected Orders &bull; Handcrafted Indian Fashion</span>
        <Link 
          href="/offers" 
          className="ml-2 underline hover:text-gold-200 transition-colors font-semibold"
        >
          View Deals
        </Link>
      </div>
    </div>
  );
}
