'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, ShieldCheck, Check } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useStore();
  const { success } = useToast();

  const [name, setName] = useState(currentUser?.name || 'Priya Sharma');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98401 23456');

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated = {
      ...currentUser,
      name,
      phone,
    };
    setCurrentUser(updated);
    success('Profile updated successfully!');
  };

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="pb-6 border-b border-sand mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-burgundy-800">
            Account Preferences
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-0.5">
            Personal Profile
          </h1>
        </div>

        <form onSubmit={handleUpdate} className="bg-white p-6 sm:p-10 rounded-3xl border border-sand shadow-sm space-y-6 text-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-sand">
            <div className="w-16 h-16 rounded-full bg-burgundy-950 text-gold-300 font-serif text-2xl font-bold flex items-center justify-center border-2 border-gold-400">
              {name.charAt(0)}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">{name}</h3>
              <p className="text-charcoal-500">{currentUser?.email || 'customer@example.com'}</p>
              <span className="inline-block mt-1 bg-gold-400/20 text-burgundy-950 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                {currentUser?.role === 'admin' ? 'Store Administrator' : 'Privilege Customer'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={currentUser?.email || 'customer@example.com'}
                className="w-full p-3 rounded-xl border border-sand bg-sand/30 text-charcoal-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-charcoal-400 mt-1 block">
                Email is linked to your authentication credentials and cannot be changed here.
              </span>
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-sand flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-burgundy-950 text-gold-300 font-bold uppercase tracking-wider rounded-xl hover:bg-burgundy-900 transition-all shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
