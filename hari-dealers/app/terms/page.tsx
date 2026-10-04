import React from 'react';

export default function TermsConditionsPage() {
  return (
    <div className="bg-ivory min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center">
          <span className="text-xs uppercase font-bold tracking-[0.2em] text-burgundy-800">Terms of Service</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-2">Terms &amp; Conditions</h1>
          <p className="text-xs text-charcoal-500 mt-2">Effective: September 2026</p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-sand shadow-sm space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed font-light">
          <p>
            Welcome to Hari Dealers. By viewing, browsing, or ordering from this online boutique, you agree to comply with and be bound by the following terms.
          </p>

          <h3 className="font-serif text-base font-bold text-charcoal-900">1. Product Representation &amp; Handcrafting Variations</h3>
          <p>
            Due to the handcrafted, artisanal nature of pure silk sarees, hand-embroidered kurtis, and natural textile dyes, minor variations in thread weave or color shade may naturally occur and are a hallmark of authentic craftsmanship.
          </p>

          <h3 className="font-serif text-base font-bold text-charcoal-900">2. Pricing &amp; Orders</h3>
          <p>
            All listed prices are in Indian Rupees (INR) and inclusive of statutory GST. Hari Dealers reserves the right to decline or cancel orders resulting from typographical pricing errors or inventory stock exhaustion.
          </p>

          <h3 className="font-serif text-base font-bold text-charcoal-900">3. Delivery &amp; Transit</h3>
          <p>
            Delivery dates provided at checkout or via tracking are estimates based on standard courier logistics. Hari Dealers is not liable for force majeure transit delays caused by regional holidays or severe weather disruptions.
          </p>
        </div>
      </div>
    </div>
  );
}
