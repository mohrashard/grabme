// actions/monetizationActions.ts
'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'

export async function getAdminRunwayMetricsAction() {
    try {
        // 1. Get total active workers
        const { count: workerCount, error: countErr } = await supabaseAdmin
            .from('workers')
            .select('*', { count: 'exact', head: true })
            .eq('account_status', 'active');

        if (countErr) throw countErr;

        // 2. Get Database Size
        const { data: dbSizeData, error: dbErr } = await supabaseAdmin.rpc('get_database_size');
        if (dbErr) throw dbErr;

        // 3. Get Storage Size
        const { data: storageSizeData, error: storageErr } = await supabaseAdmin.rpc('get_storage_size');
        if (storageErr) throw storageErr;

        // 4. Get current Monetization Switch status
        const { data: settingsData, error: settingsErr } = await supabaseAdmin
            .from('system_settings')
            .select('is_monetized')
            .eq('id', 1)
            .single();

        return {
            success: true,
            metrics: {
                totalWorkers: workerCount || 0,
                dbSizeBytes: dbSizeData || 0,
                storageSizeBytes: storageSizeData || 0,
                isMonetized: settingsData?.is_monetized || false
            }
        };
    } catch (err: any) {
        console.error('[getAdminRunwayMetricsAction]', err);
        return { success: false, error: err.message };
    }
}

export async function toggleMonetizationSwitchAction(turnOn: boolean) {
    try {
        const { error } = await supabaseAdmin
            .from('system_settings')
            .update({ is_monetized: turnOn, updated_at: new Date().toISOString() })
            .eq('id', 1);

        if (error) throw error;

        return { success: true };
    } catch (err: any) {
        console.error('[toggleMonetizationSwitchAction]', err);
        return { success: false, error: err.message };
    }
}