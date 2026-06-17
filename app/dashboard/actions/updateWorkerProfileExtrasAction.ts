'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'
import { z } from 'zod'

const PriceEstimateSchema = z.object({
    label: z.string().min(1).max(100),
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
})

const ProfileExtrasSchema = z.object({
    workerId: z.string().uuid(),
    languages_spoken: z.array(z.string()).max(5).optional(),
    base_visiting_fee: z.number().int().nonnegative().nullable().optional(),
    service_warranty_days: z.number().int().nonnegative().max(365).nullable().optional(),
    price_estimates: z.array(PriceEstimateSchema).max(10).optional(),
})

export async function updateWorkerProfileExtrasAction(rawData: any) {
    try {
        const res = ProfileExtrasSchema.safeParse(rawData)
        if (!res.success) {
            return { success: false, error: res.error.issues[0].message }
        }

        const { workerId, ...fields } = res.data

        // Clean up nullish values so we don't accidentally overwrite good data
        const updatePayload: Record<string, any> = {}
        if (fields.languages_spoken !== undefined) updatePayload.languages_spoken = fields.languages_spoken
        if (fields.base_visiting_fee !== undefined) updatePayload.base_visiting_fee = fields.base_visiting_fee
        if (fields.service_warranty_days !== undefined) updatePayload.service_warranty_days = fields.service_warranty_days
        if (fields.price_estimates !== undefined) updatePayload.price_estimates = fields.price_estimates

        if (Object.keys(updatePayload).length === 0) {
            return { success: false, error: 'Nothing to update' }
        }

        const { error } = await supabaseAdmin
            .from('workers')
            .update(updatePayload)
            .eq('id', workerId)

        if (error) throw error

        return { success: true }
    } catch (error: any) {
        console.error('Update Profile Extras Error:', error)
        return { success: false, error: error.message || 'Failed to update profile' }
    }
}
