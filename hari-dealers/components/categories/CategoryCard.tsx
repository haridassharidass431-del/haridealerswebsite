'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative block rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] shadow-3d hover:shadow-3d-hover transition-all duration-500 hover:-translate-y-1.5"
    >
      {/* Background Image */}
      <Image
        src={category.image_url || '/logo.jpg'}
        alt={category.name}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />

      {/* Luxury Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950 via-burgundy-950/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

      {/* Decorative Gold Border line */}
      <div className="absolute inset-2 border border-gold-400/20 rounded-xl pointer-events-none group-hover:border-gold-400/60 transition-colors" />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-end text-ivory">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">
          Collection
        </span>
        <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wide mt-1 text-ivory group-hover:text-gold-200 transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-xs text-ivory/70 line-clamp-2 mt-1 hidden sm:block font-light">
            {category.description}
          </p>
        )}

        {/* Explore Button */}
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gold-400 group-hover:text-gold-300 transition-colors">
          <span>Explore Collection</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
