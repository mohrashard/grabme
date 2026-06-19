'use server'

import { supabaseAdmin } from '../../../lib/supabaseServer'

export async function createestimateAction(estimateData: any) {
    try {
        const { data, error } = await supabaseAdmin
            .from('estimates')
            .insert([estimateData])
            .select()
            .single()

        if (error) {
            console.error('[createestimateAction]', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getestimateAction(estimateId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('estimates')
            .select(`
                *,
                workers (
                    full_name,
                    trade_category,
                    phone,
                    profile_photo_url
                )
            `)
            .eq('id', estimateId)
            .single()

        if (error) {
            console.error('[getestimateAction]', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
