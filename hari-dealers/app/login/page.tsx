'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const { error } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      error('Google sign-in is not configured. Add your Supabase URL and anon key, then enable Google in Supabase Auth.');
      return;
    }
    setLoading(true);
    const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/account';
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
    });
    if (authError) {
      error(authError.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
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
              Google account
            </label>
            <p className="text-xs text-charcoal-500 rounded-xl border border-sand bg-ivory p-3">Continue securely with your Google account. Your email is confirmed by Google.</p>
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
          You can browse the store without signing in. Login is needed only to place an order.
        </div>
      </div>
    </div>
  );
}
