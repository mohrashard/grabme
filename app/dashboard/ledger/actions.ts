'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'

export async function addLedgerEntryAction(entryData: any) {
    try {
        const { data, error } = await supabaseAdmin
            .from('financial_entries')
            .insert([entryData])
            .select()
            .single()

        if (error) {
            console.error('[addLedgerEntryAction]', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getLedgerEntriesAction(workerId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('financial_entries')
            .select('*')
            .eq('worker_id', workerId)
            .order('entry_date', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[getLedgerEntriesAction]', error)
            return { success: false, entries: [] }
        }

        return { success: true, entries: data || [] }
    } catch (error: any) {
        return { success: false, entries: [] }
    }
}
