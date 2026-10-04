'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { getWhatsAppLink, HARI_DEALERS_EMAIL, HARI_DEALERS_PHONE_DISPLAY } from '@/lib/whatsapp';

export default function ContactPage() {
  const { success } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    success('Message sent! Our customer care team will respond within 24 hours.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="bg-ivory min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-[0.2em] text-burgundy-800">
            We Are Here For You
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-2">
            Contact Hari Dealers
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-2 font-light">
            Questions regarding dress sizing, order tracking, returns, or wholesale? Reach out to our dedicated support executives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-burgundy-950 to-burgundy-900 text-ivory p-8 sm:p-10 rounded-3xl shadow-3d border border-gold-500/30 flex flex-col justify-between space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-gold-300 mb-6">
                Direct Contact
              </h2>
              <div className="space-y-6 text-xs text-ivory/80">
                <div className="flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-sm">Customer Helpline</strong>
                    <a href="tel:+917339635485" className="hover:text-gold-300">
                      {HARI_DEALERS_PHONE_DISPLAY}
                    </a>
                    <p className="text-[11px] text-ivory/50 mt-0.5">Mon - Sat: 10:00 AM - 7:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-sm">WhatsApp</strong>
                    <a
                      href={getWhatsAppLink('Hello Hari Dealers, I have a question about your collection.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gold-300"
                    >
                      Chat with us
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Mail className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-sm">Email Support</strong>
                    <a href={`mailto:${HARI_DEALERS_EMAIL}`} className="hover:text-gold-300">
                      {HARI_DEALERS_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-sm">Corporate Studio</strong>
                    <span>Hari Dealers Flagship Studio, Fashion Boulevard, Commercial Street, India</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gold-500/20 text-[11px] text-ivory/60">
              Orders placed online are fulfilled and dispatched within 24 business hours.
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-sand shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-charcoal-900 mb-4">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Priya Sharma"
                  className="w-full p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="priya@example.com"
                    className="w-full p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                  How can we help you? *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter details of your inquiry, order ID or sizing request..."
                  className="w-full p-3 rounded-xl border border-sand focus:outline-none focus:border-burgundy-900"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 bg-burgundy-950 text-gold-300 font-bold uppercase tracking-wider text-xs rounded-xl shadow-gold-glow hover:bg-burgundy-900 transition-all flex items-center gap-2"
              >
                <span>Send Message</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
