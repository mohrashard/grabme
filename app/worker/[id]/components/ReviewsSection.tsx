'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import ReviewForm from './ReviewForm';

interface Review {
    id: string;
    rating: number;
    review_text: string;
    reviewer_name: string;
    created_at: string;
}

interface ReviewsSectionProps {
    workerId: string;
    workerName: string;
    reviews: Review[];
    avgRating: number;
    totalReviews: number;
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
    const cls = size === 'lg' ? 'w-6 h-6' : 'w-3.5 h-3.5';
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${cls} transition-colors ${
                        star <= Math.round(rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                    }`}
                />
            ))}
        </div>
    );
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
}

export default function ReviewsSection({ workerId, workerName, reviews, avgRating, totalReviews }: ReviewsSectionProps) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

    // Rating distribution
    const distribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        pct: totalReviews > 0 ? (reviews.filter(r => r.rating === star).length / totalReviews) * 100 : 0
    }));

    return (
        <div className="relative rounded-2xl border border-amber-200/50 dark:border-amber-500/15 bg-white dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden p-6 md:p-8 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Customer Reviews
                </h3>
                <button
                    onClick={() => setShowForm(f => !f)}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800/50 px-3 py-1.5 rounded-lg transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-1.5"
                >
                    <MessageSquare className="w-3 h-3" />
                    {showForm ? 'Cancel' : 'Leave Review'}
                </button>
            </div>

            {/* Review Form (slide in) */}
            {showForm && (
                <div className="mb-8 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <ReviewForm
                        workerId={workerId}
                        workerName={workerName}
                        onSuccess={() => {
                            setShowForm(false);
                            router.refresh(); // Refresh page to fetch the new review
                        }}
                    />
                </div>
            )}

            {totalReviews === 0 ? (
                <div className="text-center py-8 space-y-2">
                    <div className="text-4xl">⭐</div>
                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No Reviews Yet</p>
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-600">Be the first to review this professional!</p>
                </div>
            ) : (
                <>
                    {/* Rating Summary */}
                    <div className="flex items-center gap-6 mb-6 p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/30 dark:border-amber-700/20">
                        <div className="text-center flex-shrink-0">
                            <div className="text-5xl font-black text-slate-800 dark:text-white leading-none">{avgRating.toFixed(1)}</div>
                            <StarDisplay rating={avgRating} size="sm" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex-1 space-y-1.5">
                            {distribution.map(({ star, count, pct }) => (
                                <div key={star} className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 w-3">{star}</span>
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-amber-400 transition-all duration-700"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 w-3 text-right">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Individual Reviews */}
                    <div className="space-y-4">
                        {displayedReviews.map((review) => (
                            <div key={review.id} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8 space-y-2 transition-colors">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-black text-blue-600 dark:text-blue-400">
                                            {review.reviewer_name[0]}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{review.reviewer_name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <StarDisplay rating={review.rating} size="sm" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/40">
                                                    ✓ Verified Hire
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex-shrink-0">{timeAgo(review.created_at)}</span>
                                </div>
                                {review.review_text && (
                                    <p className="text-[13px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed pl-9">
                                        "{review.review_text}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {reviews.length > 3 && (
                        <button
                            onClick={() => setShowAll(s => !s)}
                            className="w-full mt-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
                        >
                            {showAll ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Show All {reviews.length} Reviews</>}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
