'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'
import { z } from 'zod'

const ToggleSchema = z.object({
    workerId: z.string().uuid(),
    isAvailable: z.boolean(),
})

export async function toggleAvailableNowAction(workerId: string, isAvailable: boolean) {
    try {
        const res = ToggleSchema.safeParse({ workerId, isAvailable })
        if (!res.success) {
            return { success: false, error: 'Invalid data format.' }
        }

        // Verify they are a PRO user before allowing the toggle
        const { data: worker } = await supabaseAdmin
            .from('workers')
            .select('subscription_tier')
            .eq('id', workerId)
            .single()

        if (worker?.subscription_tier !== 'pro') {
            return { success: false, error: 'This feature is only available for Pro users.' }
        }

        // Update the status using Admin client
        const { error } = await supabaseAdmin
            .from('workers')
            .update({ is_available_now: isAvailable })
            .eq('id', workerId)

        if (error) throw error

        return { success: true }
    } catch (err: any) {
        console.error('[toggleAvailableNowAction] error:', err)
        return { success: false, error: 'Failed to update availability status.' }
    }
}
