'use server'

import { supabaseAdmin } from '../../../lib/supabaseServer'
import { z } from 'zod'

const ReplySchema = z.object({
    workerId: z.string().uuid(),
    reviewId: z.string().uuid(),
    replyText: z.string().min(10, "Reply must be at least 10 characters.").max(500, "Reply must be under 500 characters.")
})

export async function replyToReviewAction(workerId: string, reviewId: string, replyText: string) {
    try {
        const res = ReplySchema.safeParse({ workerId, reviewId, replyText })
        if (!res.success) {
            return { success: false, error: res.error.issues[0].message }
        }

        // Verify they are a PRO user before allowing the reply
        const { data: worker } = await supabaseAdmin
            .from('workers')
            .select('subscription_tier')
            .eq('id', workerId)
            .single()

        if (worker?.subscription_tier !== 'pro') {
            return { success: false, error: 'Review replies are only available for Pro users.' }
        }

        // Verify the review actually belongs to this worker
        const { data: review } = await supabaseAdmin
            .from('reviews')
            .select('id')
            .eq('id', reviewId)
            .eq('worker_id', workerId)
            .single()

        if (!review) {
            return { success: false, error: 'You can only reply to reviews on your own profile.' }
        }

        // Save the reply
        const { error } = await supabaseAdmin
            .from('reviews')
            .update({ 
                worker_reply: replyText.trim(),
                worker_reply_created_at: new Date().toISOString()
            })
            .eq('id', reviewId)

        if (error) throw error

        return { success: true }
    } catch (err: any) {
        console.error('[replyToReviewAction] error:', err)
        return { success: false, error: 'Failed to post reply. Please try again.' }
    }
}
