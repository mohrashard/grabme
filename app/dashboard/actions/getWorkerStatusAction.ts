'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'

/**
 * SECURE: Fetch Worker Status (Bypasses RLS)
 * 
 * Necessary because the 'anon' client cannot see its own row 
 * if account_status is 'pending' or 'suspended' due to strict RLS policies.
 */
export async function getWorkerStatusAction(workerId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('workers')
            .select('account_status, is_featured, is_identity_verified, is_reference_checked, visits_count, likes_count, slug, subscription_tier, pro_expires_at, is_available_now, profile_photo_url, full_name, trade_category')
            .eq('id', workerId)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        console.error('[getWorkerStatusAction] error:', err);
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}
