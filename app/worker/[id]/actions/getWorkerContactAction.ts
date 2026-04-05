'use server'

import { supabaseAdmin } from '../../../lib/supabaseServer'

/**
 * SECURE: Fetches worker phone number on demand and returns a WhatsApp URL.
 * The phone number is never passed to any client component.
 */
export async function getWorkerContactAction(workerId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('workers')
            .select('phone')
            .eq('id', workerId)
            .eq('account_status', 'active')
            .maybeSingle();

        if (error || !data?.phone) {
            throw new Error('Worker not found or inactive');
        }

        // WhatsApp Phone must be in 94XXXXXXXXXX format (usually data.phone is 7XXXXXXXX)
        const phone = data.phone.startsWith('94') ? data.phone : `94${data.phone}`;

        const message = encodeURIComponent(
            'Hi! I found you on Grab Me and I would like to inquire about your services.'
        );
        const url = `https://wa.me/${phone}?text=${message}`;

        return { url };
    } catch (err: any) {
        console.error('getWorkerContactAction Error:', err.message);
        return { error: 'Could not connect. Please try again.' };
    }
}
