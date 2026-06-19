'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'

/**
 * Log a WhatsApp Click for a specific worker.
 * Bypasses RLS to ensure clicks are always tracked.
 */
export async function logWhatsAppClickAction(workerId: string, customerId?: string) {
    try {
        const { error } = await supabaseAdmin
            .from('whatsapp_clicks')
            .insert([{ 
                worker_id: workerId,
                customer_id: customerId 
            }]);

        // Repurpose visits_count to track total WhatsApp clicks
        const { data } = await supabaseAdmin
            .from('workers')
            .select('visits_count')
            .eq('id', workerId)
            .single();
            
        await supabaseAdmin
            .from('workers')
            .update({ visits_count: (data?.visits_count || 0) + 1 })
            .eq('id', workerId);

        if (error) {
            // Postgres error code for foreign key violation
            if (error.code === '23503') {
                return { success: false, error: 'STALE_CUSTOMER_ID' };
            }
            throw error;
        }
        return { success: true };
    } catch (err: any) {
        console.error('[logWhatsAppClickAction] error:', err);
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}



export async function toggleLikeAction(workerId: string, isLiked: boolean) {
    try {
        const { data, error } = await supabaseAdmin
            .from('workers')
            .select('likes_count')
            .eq('id', workerId)
            .single();

        if (error) return { success: false, newCount: 0 };

        let currentCount = data?.likes_count || 0;
        if (isLiked) {
            currentCount += 1;
        } else {
            currentCount = Math.max(0, currentCount - 1);
        }

        await supabaseAdmin
            .from('workers')
            .update({ likes_count: currentCount })
            .eq('id', workerId);

        return { success: true, newCount: currentCount };
    } catch {
        return { success: false, newCount: 0 };
    }
}

export async function trackProfileViewAction(workerId: string) {
    try {
        await supabaseAdmin.from('profile_views').insert([{ worker_id: workerId }]);
        return { success: true };
    } catch (err) {
        console.error('[trackProfileViewAction] error:', err);
        return { success: false };
    }
}
