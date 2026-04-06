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
