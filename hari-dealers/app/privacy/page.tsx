import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-ivory min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center">
          <span className="text-xs uppercase font-bold tracking-[0.2em] text-burgundy-800">Legal Compliance</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-2">Privacy Policy</h1>
          <p className="text-xs text-charcoal-500 mt-2">Last updated: September 2026</p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-sand shadow-sm space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed font-light">
          <p>
            At Hari Dealers, we take the confidentiality and privacy of our fashion patrons very seriously. This policy outlines how your personal information is gathered, utilized, and protected.
          </p>

          <h3 className="font-serif text-base font-bold text-charcoal-900">1. Information We Collect</h3>
          <p>
            When you purchase our ethnic dresses or create an account, we collect contact information including your full name, shipping destination address, mobile contact number, and email. Payment credentials (card numbers, UPI PINs) are processed directly by our secure PCI-DSS Level 1 compliant gateway (Razorpay) and are never stored on Hari Dealers servers.
          </p>

          <h3 className="font-serif text-base font-bold text-charcoal-900">2. How Information is Used</h3>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>To dispatch and track your dress deliveries via authorized courier networks.</li>
            <li>To transmit transactional order confirmations and electronic invoices.</li>
            <li>To offer customer assistance regarding returns and size exchanges.</li>
          </ul>

          <h3 className="font-serif text-base font-bold text-charcoal-900">3. Contacting our Privacy Officer</h3>
          <p>
            For privacy inquiries or account data deletion requests, email: <a href="mailto:privacy@haridealers.com" className="text-burgundy-900 font-bold underline">privacy@haridealers.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
