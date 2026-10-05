'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const normalized = email.trim();
    if (!normalized || !/^[^\s@]+@gmail\.com$/i.test(normalized) && !/^[^\s@]+@googlemail\.com$/i.test(normalized)) {
      error('Please enter a valid Gmail / Google account email.');
      return;
    }

    setLoading(true);

    const localPart = normalized.split('@')[0].replace(/\+.*$/, '').replace(/[._-]+/g, ' ').trim();
    const displayName = localPart
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ') || 'Google User';

    setTimeout(() => {
      login(normalized, 'customer', displayName);
      success(`Welcome, ${displayName}!`);
      setLoading(false);
      const redirectTo = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect') || '/account'
        : '/account';
      router.push(redirectTo);
    }, 300);
  };

  return (
    <div className="bg-ivory min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-sand shadow-3d space-y-6">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-gold-400 shadow-gold-glow mb-3">
            <Image src="/logo.jpg" alt="Hari Dealers" fill className="object-cover" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-burgundy-800">
            Welcome Back
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 mt-1">
            Continue with Google
          </h1>
          <p className="text-xs text-charcoal-500 mt-1 font-light">
            Sign in with your Gmail account to place orders and track your saved items.
          </p>
        </div>

        <form onSubmit={handleGoogleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
              Gmail Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
              />
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-burgundy-950 text-gold-300 hover:bg-burgundy-900 font-bold text-xs uppercase tracking-widest shadow-gold-glow flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
          >
            <span>{loading ? 'CONNECTING...' : 'Continue with Google'}</span>
            <ArrowRight className="w-4 h-4 text-gold-400" />
          </button>
        </form>

        <div className="text-center text-xs text-charcoal-500 pt-2 border-t border-sand">
          Need a different account?{' '}
          <Link href="/register" className="font-bold text-burgundy-900 hover:text-gold-600 underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
