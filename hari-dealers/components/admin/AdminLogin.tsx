'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(response.status === 401 ? 'Invalid admin credentials' : (result.error || 'Unable to sign in. Please try again.'));
        return;
      }
      window.location.assign('/admin');
    } catch {
      setMessage('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center p-4 sm:p-6 text-ivory">
      <div className="max-w-md w-full bg-charcoal-900 border border-gold-500/30 rounded-3xl p-7 sm:p-9 shadow-3d">
        <div className="text-center mb-7">
          <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-gold-400 shadow-gold-glow mb-4">
            <Image src="/logo.jpg" alt="Hari Dealers" fill sizes="64px" className="object-cover" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
            Staff &amp; Management Portal
          </span>
          <h1 className="font-serif text-2xl font-bold text-ivory mt-1">Admin Login</h1>
          <p className="text-xs text-charcoal-400 mt-2">
            Sign in to manage products, stock, and orders.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-username" className="block text-xs font-semibold text-charcoal-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
              <input
                id="admin-username"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-xl bg-charcoal-950 border border-charcoal-700 py-3 pl-10 pr-3 text-sm text-ivory focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-semibold text-charcoal-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl bg-charcoal-950 border border-charcoal-700 py-3 pl-10 pr-12 text-sm text-ivory focus:outline-none focus:border-gold-500"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-charcoal-400 hover:text-ivory">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {message && (
            <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-sm text-rose-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gold-400 hover:bg-gold-300 disabled:opacity-60 text-burgundy-950 rounded-xl font-bold text-xs uppercase tracking-wider shadow-gold-glow transition-all"
          >
            {loading ? 'Signing In…' : 'Login'}
          </button>
        </form>

        <Link href="/" className="mt-5 block text-center text-xs text-charcoal-400 hover:text-ivory underline">
          Return to Customer Website
        </Link>
      </div>
    </div>
  );
}
