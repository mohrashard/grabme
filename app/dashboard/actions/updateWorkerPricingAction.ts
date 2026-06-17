'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'
import { z } from 'zod'

const EstimateSchema = z.object({
    label: z.string().min(1).max(120),
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
})

const PricingSchema = z.object({
    workerId: z.string().uuid(),
    base_visiting_fee: z.number().int().nonnegative().nullable(),
    price_estimates: z.array(EstimateSchema).max(10),
})

export async function updateWorkerPricingAction(rawData: unknown) {
    try {
        const res = PricingSchema.safeParse(rawData)
        if (!res.success) {
            return { success: false, error: res.error.issues[0].message }
        }

        const { workerId, base_visiting_fee, price_estimates } = res.data

        const { error } = await supabaseAdmin
            .from('workers')
            .update({ base_visiting_fee, price_estimates })
            .eq('id', workerId)

        if (error) throw error

        return { success: true }
    } catch (err: any) {
        console.error('[updateWorkerPricingAction]', err)
        return { success: false, error: err.message || 'Failed to save pricing' }
    }
}
