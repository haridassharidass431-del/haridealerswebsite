'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, 
  Sparkles, ShieldCheck, ArrowRight, MessageCircle
} from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { getWhatsAppLink } from '@/lib/whatsapp';

export default function Navbar() {
  const router = useRouter();
  const { cartCount, wishlistCount, currentUser, products, categories } = useStore();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sticky navbar shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered live search suggestions
  const searchResults = searchQuery.trim().length > 0
    ? products.filter(
        (p) =>
          p.is_active &&
          (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.sku?.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-burgundy-950/95 backdrop-blur-md shadow-3d border-b border-gold-500/20 py-2.5'
            : 'bg-burgundy-950 border-b border-gold-500/10 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-ivory hover:text-gold-300 transition-colors rounded-lg focus:outline-none"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-gold-400 shadow-gold-glow flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.jpg"
                  alt="Hari Dealers Brand Logo"
                  fill
                  sizes="44px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-ivory group-hover:text-gold-300 transition-colors">
                  HARI <span className="text-gold-400">DEALERS</span>
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-gold-300/80 -mt-1 font-medium hidden sm:block">
                  Luxury Ethnic Fashion
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              <Link 
                href="/" 
                className="text-sm font-medium text-ivory/90 hover:text-gold-400 transition-colors tracking-wide"
              >
                Home
              </Link>
              <Link 
                href="/shop" 
                className="text-sm font-medium text-ivory/90 hover:text-gold-400 transition-colors tracking-wide"
              >
                Shop
              </Link>

              {/* Categories Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setCategoryDropdownOpen(true)}
                onMouseLeave={() => setCategoryDropdownOpen(false)}
              >
                <button 
                  className="flex items-center gap-1 text-sm font-medium text-ivory/90 hover:text-gold-400 transition-colors tracking-wide py-2"
                >
                  <span>Categories</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 w-64 bg-burgundy-900 border border-gold-500/30 rounded-xl shadow-3d-hover py-2 z-50 animate-fadeIn">
                    {categories.filter(c => c.is_active).map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-ivory/80 hover:text-gold-300 hover:bg-burgundy-800/60 transition-colors"
                      >
                        <span>{cat.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                      </Link>
                    ))}
                    <div className="border-t border-gold-500/20 mt-1 pt-1">
                      <Link
                        href="/shop"
                        className="block px-4 py-2 text-xs font-semibold text-gold-400 hover:text-gold-300 tracking-wider uppercase"
                      >
                        View All Collections &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link 
                href="/shop?filter=new" 
                className="text-sm font-medium text-ivory/90 hover:text-gold-400 transition-colors tracking-wide flex items-center gap-1.5"
              >
                <span>New Arrivals</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              </Link>

              <Link 
                href="/offers" 
                className="text-sm font-semibold text-gold-400 hover:text-gold-300 transition-colors tracking-wide"
              >
                Offers
              </Link>

              <Link 
                href="/contact" 
                className="text-sm font-medium text-ivory/90 hover:text-gold-400 transition-colors tracking-wide"
              >
                Contact
              </Link>
            </nav>

            {/* Search Bar (Desktop) */}
            <div ref={searchRef} className="hidden md:block relative flex-1 max-w-xs lg:max-w-sm">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="Search collections and styles..."
                    className="w-full bg-burgundy-900/60 text-ivory placeholder-ivory/40 text-xs sm:text-sm pl-9 pr-4 py-2 rounded-full border border-gold-500/25 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all shadow-inner"
                  />
                  <Search className="w-4 h-4 text-gold-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </form>

              {/* Live search autocomplete */}
              {searchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-burgundy-950 border border-gold-500/30 rounded-xl shadow-3d-hover py-2 z-50 overflow-hidden">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gold-400/80 uppercase tracking-wider">
                    Products
                  </div>
                  {searchResults.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug}`}
                      onClick={() => setSearchFocused(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-burgundy-900/70 transition-colors"
                    >
                      <div className="relative w-8 h-10 rounded overflow-hidden flex-shrink-0 bg-burgundy-900">
                        <Image
                          src={prod.images[0] || '/logo.jpg'}
                          alt={prod.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-ivory truncate">{prod.name}</div>
                        <div className="text-[11px] text-gold-300 font-semibold">₹{prod.offer_price}</div>
                      </div>
                    </Link>
                  ))}
                  <div className="border-t border-gold-500/20 mt-1 pt-1 text-center">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-xs text-gold-400 hover:text-gold-300 font-medium py-1"
                    >
                      View all results for &ldquo;{searchQuery}&rdquo; &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Account, Wishlist, Cart */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Customer Account */}
              {currentUser ? (
                <Link
                  href="/account"
                  className="p-2 text-ivory/90 hover:text-gold-300 transition-colors rounded-full hover:bg-burgundy-900/60"
                  title="My Account"
                >
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="p-2 text-ivory/90 hover:text-gold-300 transition-colors rounded-full hover:bg-burgundy-900/60 flex items-center gap-1 text-xs font-medium"
                  title="Sign In"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">Sign In</span>
                </Link>
              )}

              {/* Wishlist Icon */}
              <Link
                href="/account/wishlist"
                className="relative p-2 text-ivory/90 hover:text-gold-300 transition-colors rounded-full hover:bg-burgundy-900/60"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-gold-400 text-burgundy-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link
                href="/cart"
                className="relative p-2 text-ivory/90 hover:text-gold-300 transition-colors rounded-full hover:bg-burgundy-900/60 flex items-center gap-1.5"
                title="Shopping Bag"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold-400 text-burgundy-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-gold-glow animate-pulse-subtle">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>

              <a
                href={getWhatsAppLink('Hello Hari Dealers, I would like to know more about your collections.')}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden 2xl:inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#20bd5a]"
                aria-label="Chat with Hari Dealers on WhatsApp"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Mobile Search Row */}
          <div className="mt-3 md:hidden">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collections and styles..."
                  className="w-full bg-burgundy-900/80 text-ivory placeholder-ivory/40 text-xs pl-8 pr-4 py-2 rounded-full border border-gold-500/25 focus:outline-none focus:border-gold-400"
                />
                <Search className="w-3.5 h-3.5 text-gold-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-burgundy-950 text-ivory h-full shadow-2xl flex flex-col p-6 z-10 border-r border-gold-500/30 overflow-y-auto">
            <div className="flex items-center justify-between pb-5 border-b border-gold-500/20">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gold-400">
                  <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
                </div>
                <span className="font-serif text-lg font-bold text-ivory">HARI DEALERS</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-ivory/60 hover:text-ivory rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-4 mt-6">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium hover:text-gold-400 py-1"
              >
                Home
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium hover:text-gold-400 py-1"
              >
                Shop All Collections
              </Link>
              <Link
                href="/shop?filter=new"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium hover:text-gold-400 py-1 flex items-center justify-between"
              >
                <span>New Arrivals</span>
                <span className="text-[10px] bg-gold-400/20 text-gold-300 px-2 py-0.5 rounded-full">New</span>
              </Link>
              <Link
                href="/offers"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gold-400 py-1 flex items-center justify-between"
              >
                <span>Special Offers</span>
                <Sparkles className="w-4 h-4" />
              </Link>

              <div className="pt-2 pb-1 border-t border-gold-500/10 text-xs font-semibold text-gold-400/80 uppercase tracking-wider">
                Categories
              </div>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-ivory/80 hover:text-gold-300 pl-2 py-1"
                >
                  {c.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-gold-500/20 flex flex-col gap-3">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm hover:text-gold-400"
                >
                  Customer Support
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm hover:text-gold-400"
                >
                  About Us
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
