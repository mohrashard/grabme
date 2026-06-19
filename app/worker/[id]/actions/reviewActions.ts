'use server';

import { supabaseAdmin } from '../../../lib/supabaseServer';

interface SubmitReviewInput {
    workerId: string;
    customerPhone: string;
    rating: number;
    reviewText: string;
}

export async function submitReviewAction({ workerId, customerPhone, rating, reviewText }: SubmitReviewInput) {
    // --- 1. Normalize phone number ---
    let phone = customerPhone.trim().replace(/\D/g, '');
    if (phone.startsWith('94') && phone.length === 11) phone = '0' + phone.slice(2);
    if (phone.length !== 10 || !phone.startsWith('0')) {
        return { success: false, error: 'Invalid phone number. Use format: 07xxxxxxxx' };
    }

    // --- 2. Validate rating ---
    if (rating < 1 || rating > 5) {
        return { success: false, error: 'Rating must be between 1 and 5.' };
    }

    // --- 3. Validate review text ---
    const trimmedText = reviewText.trim();
    if (trimmedText.length < 10) {
        return { success: false, error: 'Review must be at least 10 characters.' };
    }
    if (trimmedText.length > 400) {
        return { success: false, error: 'Review must be under 400 characters.' };
    }

    // --- 4. Find customer by phone ---
    const { data: customer } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

    if (!customer) {
        return { 
            success: false, 
            error: 'This phone number was not used to contact this worker. Only verified clients can leave reviews.' 
        };
    }

    // --- 5. Verify WhatsApp click exists (the "Verified Lead" check) ---
    const { data: click } = await supabaseAdmin
        .from('whatsapp_clicks')
        .select('clicked_at')
        .eq('worker_id', workerId)
        .eq('customer_id', customer.id)
        .order('clicked_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!click) {
        return { 
            success: false, 
            error: 'You can only review a worker you have contacted through GrabMe.' 
        };
    }

    // --- 6. Enforce 24-hour time lock (The Shadowban Bluff) ---
    const clickTime = new Date(click.clicked_at).getTime();
    const now = Date.now();
    const hoursSinceClick = (now - clickTime) / (1000 * 60 * 60);

    if (hoursSinceClick < 24) {
        // Option 3 Bluff: Return success so the spammer thinks it worked, 
        // but do NOT save it to the database.
        return { success: true, isBluff: true };
    }

    // --- 7. One-review-per-worker rule ---
    const { data: existingReview } = await supabaseAdmin
        .from('reviews')
        .select('id')
        .eq('worker_id', workerId)
        .eq('customer_id', customer.id)
        .maybeSingle();

    if (existingReview) {
        return { success: false, error: 'You have already reviewed this worker.' };
    }

    // --- 8. Insert the review (auto-approved since it passed all checks) ---
    const { error: insertError } = await supabaseAdmin
        .from('reviews')
        .insert([{
            worker_id: workerId,
            customer_id: customer.id,
            rating,
            review_text: trimmedText,
            reviewer_name: 'Verified Client', // Privacy-friendly, no name exposed
        }]);

    if (insertError) {
        console.error('[submitReviewAction]', insertError);
        return { success: false, error: 'Failed to submit review. Please try again.' };
    }

    return { success: true, isBluff: false };
}

export async function getWorkerReviewsAction(workerId: string) {
    const { data: reviews, error } = await supabaseAdmin
        .from('reviews')
        .select('id, rating, review_text, reviewer_name, created_at, worker_reply, worker_reply_created_at, is_pinned')
        .eq('worker_id', workerId)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error || !reviews) return { reviews: [], avgRating: 0, totalReviews: 0 };

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
        reviews,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
    };
}

export async function pinReviewAction(workerId: string, reviewId: string) {
    // 1. Unpin all other reviews for this worker
    await supabaseAdmin
        .from('reviews')
        .update({ is_pinned: false })
        .eq('worker_id', workerId);

    // 2. Pin the selected review
    const { error } = await supabaseAdmin
        .from('reviews')
        .update({ is_pinned: true })
        .eq('id', reviewId)
        .eq('worker_id', workerId);

    if (error) {
        console.error('[pinReviewAction]', error);
        return { success: false, error: 'Failed to pin review' };
    }
    return { success: true };
}
