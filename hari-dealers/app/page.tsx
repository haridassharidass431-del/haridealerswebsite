'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw, 
  CreditCard, Award, Star, CheckCircle, Mail, Send 
} from 'lucide-react';
import { useStore } from '@/lib/store/store';
import ProductCard from '@/components/products/ProductCard';
import CategoryCard from '@/components/categories/CategoryCard';
import { useToast } from '@/components/ui/Toast';

export default function HomePage() {
  const { products, categories, offerBanner, reviews } = useStore();
  const { success } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Filter products for various homepage sections
  const trendingProducts = products.filter((p) => p.is_active && p.is_featured).slice(0, 4);
  const newArrivals = products.filter((p) => p.is_active && p.is_new_arrival).slice(0, 4);
  const specialOffers = products.filter((p) => p.is_active && p.is_offer).slice(0, 4);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      success('Thank you for subscribing to Hari Dealers VIP privileges!');
      setNewsletterEmail('');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ========================================================
          3. HERO SECTION (Subtle 3D Depth, Floating Elements)
      ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-burgundy-950 via-burgundy-900 to-burgundy-950 text-ivory py-16 sm:py-24 lg:py-28 border-b border-gold-500/20">
        
        {/* Floating Background Subtle 3D Accents */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-gold-500/10 blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-burgundy-600/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy & CTA */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-400/30 text-gold-300 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-5 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
                <span>Latest Girls &amp; Boys Collections</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ivory leading-[1.15]">
                Style That Speaks <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-amber-200">
                  For You
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-ivory/80 max-w-xl font-light leading-relaxed">
                Explore the latest Girls and Boys collections, with every available style added directly by the Hari Dealers team.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <Link
                  href="/shop"
                  className="px-8 py-3.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-burgundy-950 font-bold text-sm tracking-wider uppercase shadow-gold-glow transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/offers"
                  className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-ivory border border-gold-400/40 font-semibold text-sm tracking-wider uppercase backdrop-blur-md transition-all duration-300 hover:border-gold-300"
                >
                  VIEW OFFERS
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 pt-8 border-t border-gold-500/20 grid grid-cols-3 gap-6 text-ivory/80">
                <div>
                  <div className="font-serif text-xl sm:text-2xl font-bold text-gold-300">10,000+</div>
                  <div className="text-xs text-ivory/60">Happy Customers</div>
                </div>
                <div>
                  <div className="font-serif text-xl sm:text-2xl font-bold text-gold-300">100%</div>
                  <div className="text-xs text-ivory/60">Authentic Fabric</div>
                </div>
                <div>
                  <div className="font-serif text-xl sm:text-2xl font-bold text-gold-300">7-Day</div>
                  <div className="text-xs text-ivory/60">Easy Returns</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual with 3D Depth Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-3d-hover border-2 border-gold-400/30 group">
                <Image
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
                  alt="Hari Dealers fashion collection"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />

                {/* Subtle Gradient Shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950/80 via-transparent to-black/20" />

                {/* Floating Badge (3D Look) */}
                <div className="absolute top-4 right-4 bg-burgundy-950/80 backdrop-blur-md border border-gold-400/40 text-gold-300 p-3 rounded-2xl shadow-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-gold-400" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-ivory/60 font-semibold">Just Added</div>
                    <div className="text-xs font-bold text-gold-300">New Collection Styles</div>
                  </div>
                </div>

                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md text-charcoal-900 p-4 rounded-2xl shadow-2xl border border-gold-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-burgundy-800 uppercase tracking-widest">Curated for you</span>
                    <h3 className="font-serif text-sm font-bold text-charcoal-900">Girls &amp; Boys Collections</h3>
                    <p className="text-xs font-semibold text-burgundy-950 mt-0.5">Explore Admin-added styles</p>
                  </div>
                  <Link
                    href="/category/girls-collection"
                    className="p-2.5 rounded-xl bg-burgundy-950 text-gold-300 hover:bg-burgundy-900 transition-colors"
                    aria-label="Shop Girls Collection"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          4. ADMIN-CONTROLLED OFFER BANNER (Near the Top)
      ======================================================== */}
      {offerBanner.is_active && (
        <section className="bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500 text-burgundy-950 py-5 sm:py-6 px-4 shadow-md border-y border-gold-600/30">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <span className="hidden md:inline-flex bg-burgundy-950 text-gold-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                {offerBanner.discount_badge}
              </span>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-black uppercase tracking-wide text-burgundy-950">
                  {offerBanner.title}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-burgundy-900">
                  {offerBanner.subtitle}
                </p>
              </div>
            </div>

            <Link
              href={offerBanner.button_link || '/offers'}
              className="px-6 py-2.5 rounded-xl bg-burgundy-950 hover:bg-burgundy-900 text-gold-300 font-bold text-xs tracking-wider uppercase transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>{offerBanner.button_text || 'SHOP OFFERS'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* ========================================================
          5. CATEGORY SECTION (Premium 3D Cards)
      ======================================================== */}
      <section className="py-16 sm:py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-burgundy-800 uppercase tracking-[0.2em]">
              Curated Elegance
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">
              Shop by Category
            </h2>
            <div className="w-16 h-1 bg-gold-400 mx-auto mt-3 rounded-full" />
            <p className="text-sm text-charcoal-600 mt-3 font-light">
              Explore our handpicked range of Indian ethnic fashion crafted for weddings, festive gatherings, and daily elegance.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.filter(c => c.is_active).map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          6. TRENDING PRODUCTS (Grid with Lift, Zoom & Actions)
      ======================================================== */}
      <section className="py-16 bg-sand/30 border-y border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-burgundy-800 uppercase tracking-[0.2em]">
                Customer Favorites
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 mt-1">
                Trending Styles
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-burgundy-900 hover:text-gold-600 flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <span>View All Trending</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          7. NEW ARRIVALS (Latest Fashion Drops)
      ======================================================== */}
      <section className="py-16 sm:py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-gold-600 uppercase tracking-[0.2em]">
                Fresh Off The Looms
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 mt-1">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/shop?filter=new"
              className="text-xs font-bold text-burgundy-900 hover:text-gold-600 flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <span>Explore New Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          8. SPECIAL OFFERS (is_offer = true)
      ======================================================== */}
      <section className="py-16 bg-burgundy-950 text-ivory relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-gold-400 uppercase tracking-[0.2em]">
                Limited Period Value
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-1">
                Exclusive Festive Offers
              </h2>
            </div>
            <Link
              href="/offers"
              className="text-xs font-bold text-gold-300 hover:text-gold-200 flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <span>View All Offers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {specialOffers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          9. WHY CHOOSE HARI DEALERS (Trust Pillars)
      ======================================================== */}
      <section className="py-16 sm:py-20 bg-sand/40 border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-burgundy-800 uppercase tracking-[0.2em]">
              The Hari Promise
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900 mt-1">
              Why Choose Hari Dealers
            </h2>
            <div className="w-16 h-1 bg-gold-400 mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                icon: Award,
                title: 'Quality Products',
                desc: 'Carefully inspected textiles and pure tested zari threads.',
              },
              {
                icon: Sparkles,
                title: 'Affordable Prices',
                desc: 'Direct-from-weaver values without intermediate retail markup.',
              },
              {
                icon: CreditCard,
                title: 'Secure Payments',
                desc: 'Razorpay 256-bit encrypted checkout with full UPI & COD support.',
              },
              {
                icon: Truck,
                title: 'Fast Delivery',
                desc: 'Dispatched within 24 hours with live express parcel tracking.',
              },
              {
                icon: RotateCcw,
                title: 'Easy Returns',
                desc: 'Hassle-free 7-day doorstep return and size exchange guarantee.',
              },
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-sand shadow-3d hover:shadow-3d-hover transition-all duration-300 hover:-translate-y-1 text-center flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-burgundy-50 border border-gold-400/30 flex items-center justify-center text-burgundy-900 mb-4 shadow-sm">
                    <Icon className="w-6 h-6 text-gold-600" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-charcoal-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          10. CUSTOMER REVIEWS (Interactive Testimonials)
      ======================================================== */}
      <section className="py-16 sm:py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-gold-600 uppercase tracking-[0.2em]">
              Real Experiences
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900 mt-1">
              Words From Our Customers
            </h2>
            <div className="w-16 h-1 bg-gold-400 mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 rounded-2xl border border-sand shadow-3d hover:shadow-3d-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <h4 className="font-serif text-sm font-bold text-charcoal-900 mb-2">
                    &ldquo;{review.title}&rdquo;
                  </h4>
                  <p className="text-xs text-charcoal-600 leading-relaxed font-light italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-sand flex items-center justify-between text-xs">
                  <div className="font-bold text-burgundy-900">{review.user_name}</div>
                  <div className="flex items-center gap-1 text-emerald-700 text-[11px] font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified Buyer</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          11. NEWSLETTER (VIP Privileges)
      ======================================================== */}
      <section className="py-14 bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 text-ivory border-t border-gold-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-8 h-8 text-gold-400 mx-auto mb-3 animate-pulse" />
          <h2 className="font-serif text-3xl font-bold text-ivory">
            Join the Hari Dealers Privilege Club
          </h2>
          <p className="mt-2 text-sm text-ivory/80 max-w-md mx-auto font-light">
            Subscribe to receive private invitations to secret clearance sales, new festive arrivals, and exclusive coupon codes.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="mt-6 max-w-md mx-auto flex gap-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="flex-1 bg-burgundy-900/80 text-ivory placeholder-ivory/40 text-xs sm:text-sm px-4 py-3 rounded-xl border border-gold-500/30 focus:outline-none focus:border-gold-400"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gold-400 hover:bg-gold-300 text-burgundy-950 font-bold text-xs uppercase tracking-wider transition-all shadow-gold-glow flex items-center gap-1.5 shrink-0"
            >
              <span>{subscribed ? 'Subscribed' : 'Join'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <span className="block mt-3 text-[11px] text-ivory/50">
            We respect your privacy. Unsubscribe at any time.
          </span>
        </div>
      </section>

    </div>
  );
}
