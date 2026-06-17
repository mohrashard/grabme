'use client';

import React, { useState } from 'react';
import { Star, ShieldCheck, X, Loader2, CheckCircle } from 'lucide-react';
import { submitReviewAction } from '../actions/reviewActions';
import { toast } from 'sonner';

interface ReviewFormProps {
    workerId: string;
    workerName: string;
    onSuccess?: () => void;
}

export default function ReviewForm({ workerId, workerName, onSuccess }: ReviewFormProps) {
    const [phone, setPhone] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'bluff' | 'verifying' | 'verified'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) { toast.error('Please select a star rating.'); return; }
        if (!phone.trim()) { toast.error('Please enter your phone number.'); return; }

        setStatus('loading');
        const res = await submitReviewAction({ workerId, customerPhone: phone, rating, reviewText });

        if (res.success) {
            if (res.isBluff) {
                setStatus('bluff');
                // Never call onSuccess, keep the bluff screen forever
            } else {
                setStatus('verifying');
                setTimeout(() => {
                    setStatus('verified');
                    setTimeout(() => {
                        onSuccess?.();
                    }, 2000); // 2 sec delay to show verified
                }, 2500); // 2.5 sec delay to simulate verification
            }
        } else {
            setStatus('idle');
            toast.error(res.error || 'Could not submit review.');
        }
    };

    if (status === 'bluff') {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                    <p className="text-base font-black text-slate-800 dark:text-white uppercase tracking-widest">Review Submitted!</p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-[250px] mx-auto">
                        It has been sent to our moderation team for verification and will appear on the profile shortly.
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'verifying') {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
                <div>
                    <p className="text-base font-black text-slate-800 dark:text-white uppercase tracking-widest">Verifying Job</p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-[250px] mx-auto">
                        Checking service records...
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'verified') {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                    <p className="text-base font-black text-slate-800 dark:text-white uppercase tracking-widest">Verified Hire!</p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-[250px] mx-auto">
                        Your review has been verified and added to the professional's profile.
                    </p>
                </div>
            </div>
        );
    }

    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
    const displayRating = hoverRating || rating;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trust Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/40">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 leading-relaxed">
                    Only verified customers who contacted <span className="font-black">{workerName}</span> through GrabMe can leave a review. Enter the phone number you used to chat.
                </p>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Your Rating</p>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110 active:scale-95"
                        >
                            <Star
                                className={`w-9 h-9 transition-colors ${
                                    star <= displayRating
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-slate-200 dark:text-slate-700'
                                }`}
                            />
                        </button>
                    ))}
                    {displayRating > 0 && (
                        <span className="text-sm font-black text-amber-500 uppercase tracking-widest ml-2">
                            {ratingLabels[displayRating]}
                        </span>
                    )}
                </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Your Phone Number (used on GrabMe)
                </label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(v);
                    }}
                    placeholder="07xxxxxxxx"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-black text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors tracking-widest"
                />
            </div>

            {/* Review Text */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Your Review <span className="text-slate-400 normal-case tracking-normal font-bold">(optional, but helpful)</span>
                </label>
                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value.slice(0, 400))}
                    placeholder='e.g. "Fixed my inverter AC within an hour, very clean work. Arrived on time in Rajagiriya."'
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none leading-relaxed"
                />
                <p className="text-right text-[10px] font-bold text-slate-400">{reviewText.length}/400</p>
            </div>

            <button
                type="submit"
                disabled={status === 'loading' || rating === 0}
                className="w-full py-4 rounded-xl bg-[#1d4ed8] text-white text-xs font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Verified Review'}
            </button>
        </form>
    );
}
