import React from 'react';
import Link from 'next/link';
import { RotateCcw, CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ReturnsPolicyPage() {
  return (
    <div className="bg-ivory min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center">
          <span className="text-xs uppercase font-bold tracking-[0.2em] text-burgundy-800">
            Hassle-Free Doorstep Service
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-2">
            Returns &amp; Exchange Policy
          </h1>
          <div className="w-16 h-1 bg-gold-400 mx-auto mt-4 rounded-full" />
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-sand shadow-sm space-y-8 text-xs sm:text-sm text-charcoal-700 leading-relaxed font-light">
          
          <div className="p-4 bg-burgundy-50 border border-gold-400/40 rounded-2xl flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-burgundy-900 shrink-0" />
            <div>
              <strong className="text-burgundy-950 font-bold block text-sm">7-Day Easy Returns Guarantee</strong>
              <span>Items can be returned or exchanged within 7 days of delivery through your customer account.</span>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-lg font-bold text-charcoal-900 mb-2">1. Eligibility Criteria</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-charcoal-600">
              <li>Item must be unused, unwashed, and in its original pristine condition.</li>
              <li>All original brand tags, invoice copy, and garment polybags must be intact.</li>
              <li>Blouse pieces attached with sarees must not be unstitched or cut.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-lg font-bold text-charcoal-900 mb-2">2. How to Request a Return</h2>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-charcoal-600">
              <li>Go to <Link href="/account/orders" className="text-burgundy-900 font-bold underline">My Orders</Link>.</li>
              <li>Select your delivered order and click the <strong>&ldquo;Return / Exchange&rdquo;</strong> button.</li>
              <li>Choose your reason (e.g. Wrong Size, Defective Fabric, Style Mismatch) and submit.</li>
              <li>Our courier partner will schedule reverse pickup from your doorstep within 48 hours.</li>
            </ol>
          </div>

          <div>
            <h2 className="font-serif text-lg font-bold text-charcoal-900 mb-2">3. Refund Processing</h2>
            <p className="text-xs text-charcoal-600">
              For prepaid online orders (Razorpay UPI, Cards, Netbanking), the full amount is refunded directly back to your source account within 5-7 working days after receipt at our warehouse. For Cash on Delivery (COD) orders, refunds are disbursed via UPI or direct NEFT bank transfer.
            </p>
          </div>

          <div className="pt-4 border-t border-sand flex justify-center">
            <Link
              href="/account/orders"
              className="px-6 py-3 bg-burgundy-950 text-gold-300 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md hover:bg-burgundy-900"
            >
              Go to My Orders to Initiate Return &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
