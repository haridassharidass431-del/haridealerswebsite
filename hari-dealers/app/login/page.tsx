'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      error('Please enter your email and password');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login(email, 'customer');
      success(`Welcome back, ${email.split('@')[0]}!`);
      setLoading(false);
      router.push('/account');
    }, 400);
  };

  const handleQuickDemo = () => {
    setEmail('priya@gmail.com');
    setPassword('password123');
    login('priya@gmail.com', 'customer');
    success('Logged in as customer (Priya Sharma)');
    router.push('/account');
  };

  return (
    <div className="bg-ivory min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-sand shadow-3d space-y-6">
        
        {/* Brand header */}
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-gold-400 shadow-gold-glow mb-3">
            <Image src="/logo.jpg" alt="Hari Dealers" fill className="object-cover" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-burgundy-800">
            Welcome Back
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 mt-1">
            Sign In to Hari Dealers
          </h1>
          <p className="text-xs text-charcoal-500 mt-1 font-light">
            Access your orders, track parcels, and manage your wishlist.
          </p>
        </div>

        {/* Customer Demo */}
        <div className="p-3 bg-burgundy-50/60 rounded-2xl border border-sand text-xs flex items-center justify-between gap-2">
          <span className="text-charcoal-600 font-medium">Customer demo:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="px-2.5 py-1 bg-white border border-sand text-burgundy-950 font-bold rounded-lg hover:border-gold-500"
            >
              Customer
            </button>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
              />
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
              />
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-burgundy-950 text-gold-300 hover:bg-burgundy-900 font-bold text-xs uppercase tracking-widest shadow-gold-glow flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN'}</span>
            <ArrowRight className="w-4 h-4 text-gold-400" />
          </button>
        </form>

        <div className="text-center text-xs text-charcoal-500 pt-2 border-t border-sand">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-bold text-burgundy-900 hover:text-gold-600 underline">
            Register now
          </Link>
        </div>

      </div>
    </div>
  );
}
