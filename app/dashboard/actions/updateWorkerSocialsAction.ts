'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'
import { z } from 'zod'

const SocialSchema = z.object({
    workerId: z.string().uuid(),
    instagram_url: z.string().url().or(z.literal('')).nullable(),
    tiktok_url: z.string().url().or(z.literal('')).nullable(),
    facebook_url: z.string().url().or(z.literal('')).nullable(),
})

export async function updateWorkerSocialsAction(rawData: any) {
    try {
        const res = SocialSchema.safeParse(rawData)
        if (!res.success) {
            return { success: false, error: res.error.issues[0].message }
        }

        const { workerId, ...socials } = res.data;

        // Perform administrative update (Service Role)
        const { error } = await supabaseAdmin
            .from('workers')
            .update(socials)
            .eq('id', workerId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Update Socials Error:', error);
        return { success: false, error: error.message || 'Failed to update social links' };
    }
}
