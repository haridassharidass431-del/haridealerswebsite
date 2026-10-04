'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Boxes, AlertTriangle, Check, Search } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';

export default function AdminInventoryPage() {
  const { products, updateProduct } = useStore();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchLow = !filterLowStock || p.stock <= 5;
    return matchSearch && matchLow;
  });

  const handleStockUpdate = async (productId: string, newStock: number) => {
    const safeStock = Math.max(0, newStock);
    try {
      await updateProduct(productId, { stock: safeStock });
      success(`Stock updated to ${safeStock}`);
    } catch (cause) {
      error(cause instanceof Error ? cause.message : 'Could not update stock.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
            Stock Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-0.5">
            Variant-Aware Inventory
          </h1>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-400 bg-rose-950/30 px-3 py-1.5 rounded-xl border border-rose-900/40">
          <input
            type="checkbox"
            checked={filterLowStock}
            onChange={(e) => setFilterLowStock(e.target.checked)}
            className="accent-rose-500"
          />
          <span>Show Low Stock Only (&le; 5 units)</span>
        </label>
      </div>

      {/* Search */}
      <div className="bg-charcoal-950 p-4 rounded-2xl border border-charcoal-800 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-charcoal-900 border border-charcoal-700 rounded-xl text-ivory placeholder-charcoal-500 focus:outline-none focus:border-gold-500"
          />
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-charcoal-400">
          Showing: <strong className="text-ivory">{filteredProducts.length}</strong> items
        </span>
      </div>

      {/* Inventory Table with Variant Breakdown */}
      <div className="space-y-4">
        {filteredProducts.map((p) => {
          const isCritical = p.stock <= 5;

          return (
            <div
              key={p.id}
              className={`bg-charcoal-950 p-5 rounded-2xl border transition-all ${
                isCritical ? 'border-rose-900/50 bg-rose-950/10' : 'border-charcoal-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-800/80">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-charcoal-800 shrink-0 border border-charcoal-700">
                    <Image src={p.images[0] || '/logo.jpg'} alt={p.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-ivory">{p.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-charcoal-400 mt-0.5">
                      <span className="font-mono text-gold-300">SKU: {p.sku || 'N/A'}</span>
                      <span>&bull;</span>
                      <span>{p.category_name}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Controls */}
                <div className="flex items-center gap-3">
                  {isCritical && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-900/40">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{p.stock === 0 ? 'Out of Stock' : `Low: ${p.stock} remaining`}</span>
                    </span>
                  )}
                  <div className="flex items-center border border-charcoal-700 rounded-xl bg-charcoal-900 overflow-hidden text-xs">
                    <button
                      onClick={() => handleStockUpdate(p.id, p.stock - 1)}
                      className="px-3 py-1.5 hover:bg-charcoal-800 text-charcoal-300 font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={p.stock}
                      onChange={(e) => handleStockUpdate(p.id, Number(e.target.value))}
                      className="w-16 text-center bg-transparent text-ivory font-bold font-mono focus:outline-none"
                    />
                    <button
                      onClick={() => handleStockUpdate(p.id, p.stock + 1)}
                      className="px-3 py-1.5 hover:bg-charcoal-800 text-charcoal-300 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Variant breakdown chips */}
              <div className="pt-3 flex flex-wrap gap-2 text-xs">
                {p.variants && p.variants.length > 0 ? (
                  p.variants.map((v) => (
                    <div
                      key={v.id}
                      className="px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-center gap-2"
                    >
                      <span className="font-bold text-ivory">Size {v.size}:</span>
                      <span className="text-charcoal-400">{v.color}</span>
                      <span className={`font-mono font-bold ${v.stock <= 2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        ({v.stock} pcs)
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-charcoal-500 italic text-[11px]">No variant sub-stocks defined</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
