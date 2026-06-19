'use client'

import React, { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { Star, MessageSquare, Send, ChevronLeft, CornerDownRight, Lock, Pin } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getWorkerReviewsAction, pinReviewAction } from '../../worker/[id]/actions/reviewActions'
import { replyToReviewAction } from '../../worker/[id]/actions/replyToReviewAction'

interface Review {
    id: string;
    rating: number;
    review_text: string;
    reviewer_name: string;
    created_at: string;
    worker_reply?: string;
    worker_reply_created_at?: string;
    is_pinned?: boolean;
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

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 transition-colors ${
                        star <= Math.round(rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                    }`}
                />
            ))}
        </div>
    );
}

export default function DashboardReviewsPage() {
    const router = useRouter()
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [workerId, setWorkerId] = useState('')
    const [subscriptionTier, setSubscriptionTier] = useState('free')

    // Reply state
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyText, setReplyText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const userStr = localStorage.getItem('grabme_user')
                if (!userStr) {
                    router.push('/login')
                    return
                }
                const user = JSON.parse(userStr)
                setWorkerId(user.id)
                setSubscriptionTier(user.subscription_tier || 'free')

                const { reviews } = await getWorkerReviewsAction(user.id)
                setReviews(reviews)
            } catch (error) {
                console.error("Error fetching reviews:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchReviews()
    }, [router])

    const handleReplySubmit = async (reviewId: string) => {
        if (!replyText.trim() || replyText.length < 10) {
            alert('Reply must be at least 10 characters.');
            return;
        }
        setIsSubmitting(true);
        const res = await replyToReviewAction(workerId, reviewId, replyText);
        setIsSubmitting(false);
        if (res.success) {
            // Update local state to show the reply instantly
            setReviews(prev => prev.map(r => r.id === reviewId ? {
                ...r,
                worker_reply: replyText.trim(),
                worker_reply_created_at: new Date().toISOString()
            } : r));
            setReplyingTo(null);
            setReplyText('');
        } else {
            alert(res.error || 'Failed to submit reply.');
        }
    };

    const handlePinReview = async (reviewId: string) => {
        if (subscriptionTier !== 'pro') {
            router.push('/dashboard/billing');
            return;
        }

        // Optimistic update
        setReviews(reviews.map(r => ({
            ...r,
            is_pinned: r.id === reviewId
        })));

        const res = await pinReviewAction(workerId, reviewId);
        if (!res.success) {
            alert(res.error || 'Failed to pin review.');
            // Revert on error
            setReviews(reviews);
        }
    };

    if (isLoading) {
        return (
        <main className="flex-1 overflow-y-auto flex items-center justify-center pb-32 lg:pb-12">
            <div className="w-8 h-8 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
        </main>
        )
    }

    return (
        <main className="flex-1 overflow-y-auto pb-32 lg:pb-12">
                <header className="h-20 border-b border-[#e2e8f0] flex items-center justify-between px-8 lg:px-12 bg-white/95 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-all lg:hidden">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-widest">Customer Reviews</h2>
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto p-4 lg:p-12 space-y-6">
                    {/* Intro Card */}
                    <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative bg-[#0f172a] rounded-3xl p-6 lg:p-8 overflow-hidden shadow-xl"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400 border border-amber-500/30">
                                <Star className="w-8 h-8 fill-current" />
                            </div>
                            <div>
                                <h2 className="text-white font-black text-lg uppercase tracking-widest mb-2">Manage Your Reputation</h2>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-xl font-medium">
                                    Build trust by responding to customers. Replying to reviews shows future clients that you are professional and care about your reputation.
                                </p>
                            </div>
                        </div>
                    </m.div>

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Star className="w-10 h-10 text-amber-400 fill-amber-400/20" />
                            </div>
                            <p className="text-sm font-black text-slate-800 uppercase tracking-widest">No Reviews Yet</p>
                            <p className="text-xs font-bold text-slate-500 mt-2">When customers review your profile, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review, index) => (
                                <m.div 
                                    key={review.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-sm font-black text-blue-600 border border-blue-100 flex-shrink-0">
                                                {review.reviewer_name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 uppercase tracking-widest">{review.reviewer_name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <StarDisplay rating={review.rating} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePinReview(review.id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${
                                                    review.is_pinned 
                                                    ? 'bg-amber-50 text-amber-600 border-amber-200' 
                                                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                                                }`}
                                            >
                                                <Pin className={`w-3 h-3 ${review.is_pinned ? 'fill-amber-600' : ''}`} />
                                                {review.is_pinned ? 'Pinned' : 'Pin'}
                                            </button>
                                            <span className="text-[11px] font-bold text-slate-500 flex-shrink-0 whitespace-nowrap bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                                {timeAgo(review.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {review.review_text && (
                                        <p className="text-[14px] font-medium text-slate-600 leading-relaxed pl-[4rem]">
                                            "{review.review_text}"
                                        </p>
                                    )}

                                    {/* Worker Reply Display */}
                                    {review.worker_reply && (
                                        <div className="ml-[4rem] mt-6 p-5 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl relative shadow-inner">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1d4ed8] rounded-l-2xl" />
                                            <div className="flex items-center gap-2 mb-3">
                                                <CornerDownRight className="w-5 h-5 text-[#1d4ed8]" />
                                                <span className="text-[11px] font-black uppercase tracking-widest text-[#1e3a8a]">Your Response</span>
                                                {review.worker_reply_created_at && (
                                                    <span className="text-[10px] font-bold text-[#64748b] ml-auto">{timeAgo(review.worker_reply_created_at)}</span>
                                                )}
                                            </div>
                                            <p className="text-[13px] font-medium text-[#334155] leading-relaxed">
                                                "{review.worker_reply}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Pro Worker Reply Action */}
                                    {!review.worker_reply && (
                                        <div className="pl-[4rem] mt-6 pt-6 border-t border-slate-100">
                                            {subscriptionTier === 'pro' ? (
                                                replyingTo === review.id ? (
                                                    <div className="space-y-4">
                                                        <textarea 
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            placeholder="Write a professional response to this review..."
                                                            className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 text-sm font-medium outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/10 min-h-[120px] resize-none transition-all"
                                                        />
                                                        <div className="flex gap-3 justify-end">
                                                            <button 
                                                                onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                                                className="px-6 py-3 text-xs font-black uppercase tracking-widest text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                onClick={() => handleReplySubmit(review.id)}
                                                                disabled={isSubmitting || replyText.length < 10}
                                                                className="flex items-center gap-2 px-8 py-3 bg-[#1d4ed8] hover:bg-[#1e3a8a] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                                                            >
                                                                <Send className="w-4 h-4" />
                                                                {isSubmitting ? 'Posting...' : 'Post Reply'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => { setReplyingTo(review.id); setReplyText(''); }}
                                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#eff6ff] text-[#1d4ed8] hover:bg-[#dbeafe] rounded-xl transition-colors text-[11px] font-black uppercase tracking-widest border border-[#bfdbfe]"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        Reply to Review
                                                    </button>
                                                )
                                            ) : (
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
                                                    <div className="flex items-center gap-3 text-[#64748b]">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                                            <Lock className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-[11px] font-black uppercase tracking-widest">Pro Feature</span>
                                                    </div>
                                                    <Link 
                                                        href="/dashboard/billing" 
                                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md hover:scale-105 active:scale-95"
                                                    >
                                                        Upgrade to Reply
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </m.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Attribution */}
                <div className="px-8 lg:px-12 py-10 border-t border-[#e2e8f0] flex justify-between items-center text-[10px] font-bold text-[#64748b] uppercase tracking-widest mt-12">
                    <span>&copy; 2026 Grab Me Dash</span>
                    <span className="text-[#475569]">Powered by Mr² Labs</span>
                </div>
            </main>

    )
}
