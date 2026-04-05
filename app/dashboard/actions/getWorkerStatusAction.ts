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
            .select('account_status, is_featured, is_identity_verified, is_reference_checked')
            .eq('id', workerId)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        console.error('[getWorkerStatusAction] error:', err);
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}
