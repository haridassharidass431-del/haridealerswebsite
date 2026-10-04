'use client';

import React from 'react';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store/store';
import { useToast } from '@/components/ui/Toast';

export default function AdminReviewsPage() {
  const { reviews, moderateReview, products } = useStore();
  const { success } = useToast();

  const handleAction = (id: string, action: 'approve' | 'reject' | 'delete') => {
    moderateReview(id, action);
    if (action === 'approve') success('Review approved and visible to shoppers.');
    if (action === 'reject') success('Review hidden from product page.');
    if (action === 'delete') success('Review deleted permanently.');
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-charcoal-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
            Customer Feedback
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory mt-0.5">
            Product Review Moderation
          </h1>
        </div>
        <span className="text-xs text-charcoal-400">
          Total Reviews: <strong className="text-ivory">{reviews.length}</strong>
        </span>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => {
          const product = products.find((p) => p.id === rev.product_id);

          return (
            <div
              key={rev.id}
              className="bg-charcoal-950 p-6 rounded-2xl border border-charcoal-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ivory text-sm">{rev.user_name}</span>
                  <span className="text-charcoal-500">&bull;</span>
                  <span className="text-gold-300 font-medium">on {product?.name || 'Dress Style'}</span>
                </div>

                <div className="flex items-center text-amber-500 gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                  <span className="text-charcoal-400 font-bold ml-1">{rev.rating}/5</span>
                </div>

                {rev.title && <h4 className="font-serif font-bold text-ivory">{rev.title}</h4>}
                <p className="text-charcoal-300 font-light">{rev.comment}</p>
                <span className="text-[10px] text-charcoal-500 block">
                  Submitted: {new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {rev.is_approved ? (
                  <button
                    onClick={() => handleAction(rev.id, 'reject')}
                    className="px-3 py-1.5 bg-charcoal-900 hover:bg-charcoal-800 text-amber-400 border border-charcoal-700 rounded-xl font-bold uppercase text-[10px]"
                  >
                    Hide / Unapprove
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(rev.id, 'approve')}
                    className="px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 rounded-xl font-bold uppercase text-[10px]"
                  >
                    Approve
                  </button>
                )}

                <button
                  onClick={() => handleAction(rev.id, 'delete')}
                  className="p-2 text-charcoal-500 hover:text-rose-400 rounded-xl hover:bg-rose-950/30 transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
