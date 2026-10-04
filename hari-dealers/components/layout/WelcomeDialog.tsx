'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, X } from 'lucide-react';

const WELCOME_SEEN_KEY = 'hd_welcome_seen';

export default function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(WELCOME_SEEN_KEY) !== 'true') setIsOpen(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal-950/60 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="relative w-full max-w-md rounded-3xl border border-gold-400/40 bg-white p-7 text-center shadow-3d sm:p-9"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close welcome message"
          className="absolute right-4 top-4 rounded-full p-2 text-charcoal-500 transition-colors hover:bg-sand hover:text-charcoal-900"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-burgundy-950 text-gold-300">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-burgundy-800">Hari Dealers</p>
        <h2 id="welcome-title" className="mt-2 font-serif text-2xl font-bold text-charcoal-900">
          Welcome to Hari Dealers!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-charcoal-600">
          Thank you for visiting us. We&rsquo;re happy to have you here. Take a look at our latest collections and enjoy your shopping!
        </p>
        <Link
          href="/shop"
          onClick={dismiss}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-burgundy-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-gold-300 shadow-gold-glow transition-colors hover:bg-burgundy-900"
        >
          Start Shopping
        </Link>
      </section>
    </div>
  );
}
