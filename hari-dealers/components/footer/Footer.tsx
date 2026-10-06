'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw, CreditCard, Sparkles, MessageCircle } from 'lucide-react';
import { getWhatsAppLink, HARI_DEALERS_EMAIL, HARI_DEALERS_PHONE_DISPLAY } from '@/lib/whatsapp';
import { GIRLS_VARIETIES, getVarietySlug } from '@/lib/collections';

export default function Footer() {
  return (
    <footer className="bg-charcoal-950 text-ivory/80 pt-16 pb-24 lg:pb-12 border-t-2 border-gold-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-charcoal-800">
          
          {/* Brand Info (Span 2) */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gold-400 shadow-gold-glow flex-shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="Hari Dealers Brand Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-ivory">
                  HARI <span className="text-gold-400">DEALERS</span>
                </span>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold-300/80">
                  Luxury Ethnic Fashion
                </p>
              </div>
            </Link>
            <p className="text-sm text-ivory/70 leading-relaxed max-w-sm mb-6 font-light">
              Discover the latest Girls and Boys collections, with styles selected and added by the Hari Dealers team.
            </p>
            <div className="flex flex-col gap-2.5 text-xs text-ivory/80">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400" />
                <a href="tel:+917339635485" className="hover:text-gold-300">
                  {HARI_DEALERS_PHONE_DISPLAY} (Mon - Sat, 10 AM - 7 PM)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400" />
                <a href={`mailto:${HARI_DEALERS_EMAIL}`} className="hover:text-gold-300">
                  {HARI_DEALERS_EMAIL}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <a
                  href={getWhatsAppLink('Hello Hari Dealers, I would like to know more about your collections.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-300"
                >
                  Chat with us on WhatsApp
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>Fashion Avenue, Commercial Street, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-bold text-gold-300 tracking-wider uppercase mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/category/girls-collection" className="hover:text-gold-300 transition-colors">
                  Girls Collection
                </Link>
              </li>
              {GIRLS_VARIETIES.map((variety) => (
                <li key={variety}>
                  <Link
                    href={`/category/girls-collection?variety=${getVarietySlug(variety)}`}
                    className="pl-3 text-ivory/65 hover:text-gold-300 transition-colors"
                  >
                    {variety}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/category/boys-collection" className="hover:text-gold-300 transition-colors">
                  Boys Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif text-base font-bold text-gold-300 tracking-wider uppercase mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/account/orders" className="hover:text-gold-300 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-gold-300 transition-colors">
                  Returns &amp; Exchange
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-300 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-300 transition-colors">
                  About Hari Dealers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gold-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gold-300 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust Badges & Newsletter */}
          <div>
            <h4 className="font-serif text-base font-bold text-gold-300 tracking-wider uppercase mb-4">
              Our Promise
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Free delivery on orders over ₹1,499</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-gold-400 shrink-0" />
                <span>7-Day Easy Doorstep Return Policy</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
                <span>100% Quality &amp; Fabric Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Razorpay Secured UPI &amp; Cards</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory/50">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-gold-400">HARI DEALERS</strong>. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="bg-charcoal-900 border border-charcoal-800 px-2 py-1 rounded text-[10px] font-semibold text-ivory/70">
              UPI Accepted
            </span>
            <span className="bg-charcoal-900 border border-charcoal-800 px-2 py-1 rounded text-[10px] font-semibold text-ivory/70">
              Razorpay Secured
            </span>
            <span className="bg-charcoal-900 border border-charcoal-800 px-2 py-1 rounded text-[10px] font-semibold text-ivory/70">
              COD Available
            </span>
            <span className="bg-charcoal-900 border border-charcoal-800 px-2 py-1 rounded text-[10px] font-semibold text-ivory/70">
              SSL 256-bit
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
