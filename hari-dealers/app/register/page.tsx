'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
  const router = useRouter();
  const { setCurrentUser } = useStore();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      error('Please complete all required fields');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newUser = {
        id: `cust-${Date.now()}`,
        name,
        email,
        phone,
        role: 'customer' as const,
        created_at: new Date().toISOString(),
      };
      setCurrentUser(newUser);
      success(`Welcome to Hari Dealers, ${name}!`);
      setLoading(false);
      router.push('/account');
    }, 400);
  };

  return (
    <div className="bg-ivory min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-sand shadow-3d space-y-6">
        
        {/* Brand header */}
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-gold-400 shadow-gold-glow mb-3">
            <Image src="/logo.jpg" alt="Hari Dealers" fill className="object-cover" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-burgundy-800">
            Create Account
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 mt-1">
            Join Hari Dealers
          </h1>
          <p className="text-xs text-charcoal-500 mt-1 font-light">
            Enjoy exclusive festive member rewards, rapid checkout, and order tracking.
          </p>
        </div>

        {/* Register form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
              />
              <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
              Email Address *
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
              Mobile Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
              />
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
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
            <span>{loading ? 'CREATING ACCOUNT...' : 'REGISTER'}</span>
            <ArrowRight className="w-4 h-4 text-gold-400" />
          </button>
        </form>

        <div className="text-center text-xs text-charcoal-500 pt-2 border-t border-sand">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-burgundy-900 hover:text-gold-600 underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
