'use server'

import { supabaseAdmin } from '../../../lib/supabaseServer'

export async function createInvoiceAction(invoiceData: any) {
    try {
        const { data, error } = await supabaseAdmin
            .from('invoices')
            .insert([invoiceData])
            .select()
            .single()

        if (error) {
            console.error('[createInvoiceAction]', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getInvoiceAction(invoiceId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('invoices')
            .select(`
                *,
                workers (
                    full_name,
                    trade_category,
                    phone,
                    profile_photo_url
                )
            `)
            .eq('id', invoiceId)
            .single()

        if (error) {
            console.error('[getInvoiceAction]', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
