'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AddressesPage() {
  const { success } = useToast();
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      full_name: 'Priya Sharma',
      phone: '+91 98401 23456',
      address_line1: 'Flat 402, Royal Palms, Anna Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      is_default: true,
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newAddr, setNewAddr] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.full_name || !newAddr.address_line1 || !newAddr.pincode) return;

    setAddresses((prev) => [
      ...prev,
      {
        ...newAddr,
        id: `addr-${Date.now()}`,
        is_default: false,
      },
    ]);
    success('New shipping address saved!');
    setIsAdding(false);
    setNewAddr({ full_name: '', phone: '', address_line1: '', city: '', state: 'Tamil Nadu', pincode: '' });
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    success('Address removed.');
  };

  return (
    <div className="bg-ivory min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between pb-6 border-b border-sand mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-burgundy-800">
              Delivery Locations
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-0.5">
              Saved Addresses
            </h1>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-burgundy-950 text-gold-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-burgundy-900 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Add Address Form */}
        {isAdding && (
          <form onSubmit={handleAdd} className="bg-white p-6 sm:p-8 rounded-3xl border border-sand shadow-sm mb-8 space-y-4 max-w-xl">
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Add Shipping Address</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={newAddr.full_name}
                onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })}
                className="p-3 rounded-xl border border-sand"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                required
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                className="p-3 rounded-xl border border-sand"
              />
              <input
                type="text"
                placeholder="House / Street / Area"
                required
                value={newAddr.address_line1}
                onChange={(e) => setNewAddr({ ...newAddr, address_line1: e.target.value })}
                className="col-span-2 p-3 rounded-xl border border-sand"
              />
              <input
                type="text"
                placeholder="City"
                required
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="p-3 rounded-xl border border-sand"
              />
              <input
                type="text"
                placeholder="6-digit Pincode"
                required
                maxLength={6}
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                className="p-3 rounded-xl border border-sand font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-sand text-charcoal-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-burgundy-950 text-gold-300 text-xs font-bold uppercase rounded-xl"
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {addresses.map((a) => (
            <div key={a.id} className="bg-white p-6 rounded-3xl border border-sand shadow-sm text-xs space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-charcoal-900">{a.full_name}</span>
                {a.is_default && (
                  <span className="bg-gold-400/20 text-burgundy-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    Default
                  </span>
                )}
              </div>
              <p className="text-charcoal-600">{a.address_line1}, {a.city}, {a.state} - {a.pincode}</p>
              <p className="text-charcoal-600">Phone: {a.phone}</p>
              
              <div className="pt-3 border-t border-sand flex justify-end">
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-rose-600 hover:text-rose-800 p-1 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
