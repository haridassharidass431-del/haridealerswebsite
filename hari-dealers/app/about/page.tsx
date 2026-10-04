import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Award, ShieldCheck, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-ivory min-h-screen py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gold-400 shadow-gold-glow mb-4">
            <Image src="/logo.jpg" alt="Hari Dealers" fill className="object-cover" />
          </div>
          <span className="text-xs uppercase font-bold tracking-[0.2em] text-burgundy-800">
            Our Heritage &amp; Passion
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal-900 mt-2">
            The Story of Hari Dealers
          </h1>
          <div className="w-16 h-1 bg-gold-400 mx-auto mt-4 rounded-full" />
        </div>

        {/* Narrative Block */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-sand shadow-sm space-y-6 text-sm text-charcoal-700 leading-relaxed font-light">
          <p className="text-base font-normal text-burgundy-950">
            Hari Dealers was founded with a single mission: to bring royal Indian elegance and authentic craftsmanship directly to women who cherish timeless ethnic fashion.
          </p>
          <p>
            From the handloom clusters of Varanasi and Kanchipuram to the vibrant block-printing hubs of Jaipur, our design curators partner with master artisans to craft sarees, kurtis, anarkalis, and chudidhars that honor traditional aesthetics while delivering modern comfort.
          </p>
          <p>
            We believe luxury should never be inaccessible. By working directly with weaving centers and eliminating layers of middlemen, Hari Dealers offers pure tested zari, breathable combed cottons, and rich georgettes at fair, honest prices.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="bg-white p-6 rounded-2xl border border-sand shadow-sm">
            <Award className="w-8 h-8 text-gold-600 mx-auto mb-3" />
            <h3 className="font-serif text-base font-bold text-charcoal-900 mb-1">Authentic Weaves</h3>
            <p className="text-xs text-charcoal-600 font-light">Every thread and motif is verified for textile purity and finish.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-sand shadow-sm">
            <ShieldCheck className="w-8 h-8 text-gold-600 mx-auto mb-3" />
            <h3 className="font-serif text-base font-bold text-charcoal-900 mb-1">Direct Value</h3>
            <p className="text-xs text-charcoal-600 font-light">Transparent pricing that respects your budget and empowers local artisans.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-sand shadow-sm">
            <Heart className="w-8 h-8 text-gold-600 mx-auto mb-3" />
            <h3 className="font-serif text-base font-bold text-charcoal-900 mb-1">Customer Happiness</h3>
            <p className="text-xs text-charcoal-600 font-light">Dedicated doorstep returns, prompt exchanges, and responsive care.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
