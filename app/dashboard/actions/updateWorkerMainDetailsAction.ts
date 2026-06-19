'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'
import { z } from 'zod'

const MainDetailsSchema = z.object({
    workerId: z.string().uuid(),
    years_experience: z.coerce.number().min(0).max(60),
    phone: z.string().regex(/^0\d{9}$/, "Invalid phone format"),
    short_bio: z.string().min(20, "Your bio is a bit too short. Please add a few more words!").max(500, "Your bio is a bit too long! Please keep it under 500 characters."),
    home_district: z.string().min(1),
    districts_covered: z.array(z.string()),
    languages_spoken: z.array(z.string()).default([]),
    service_warranty: z.string().optional(),
    education_history: z.array(z.string()).default([]),
    certificate_name: z.string().optional(),
    secondary_trade: z.string().optional()
})

export async function updateWorkerMainDetailsAction(rawData: unknown) {
    try {
        const res = MainDetailsSchema.safeParse(rawData)
        if (!res.success) {
            return { success: false, error: res.error.issues[0].message }
        }

        const data = res.data

        const { error } = await supabaseAdmin
            .from('workers')
            .update({
                years_experience: data.years_experience,
                phone: data.phone,
                short_bio: data.short_bio,
                home_district: data.home_district,
                districts_covered: data.districts_covered,
                languages_spoken: data.languages_spoken,
                service_warranty: data.service_warranty || '',
                education_history: data.education_history,
                certificate_name: data.certificate_name || '',
                secondary_trade: data.secondary_trade || ''
            })
            .eq('id', data.workerId)

        if (error) {
            if (error.code === '23505' && error.message.includes('workers_phone_key')) {
                return { success: false, error: "This phone number is already registered by another user." }
            }
            throw error;
        }

        return { success: true }
    } catch (err: any) {
        console.error('[updateWorkerMainDetailsAction]', err)
        return { success: false, error: err.message || 'Failed to update details' }
    }
}
