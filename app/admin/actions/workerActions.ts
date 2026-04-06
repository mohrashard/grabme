'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'
import { verifyAdminSession } from '@/app/lib/verifyAdminSession'
import bcrypt from 'bcryptjs'

/**
 * SECURE: Delete Worker & All Associated Media
 */
export async function deleteWorkerAction(id: string) {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    try {
        // 1. Fetch worker to get their file paths for cleanup
        const { data: worker, error: fetchError } = await supabaseAdmin
            .from('workers')
            .select('profile_photo_url, nic_front_url, nic_back_url, selfie_url, certificate_url, past_work_photos')
            .eq('id', id)
            .single();
        
        if (fetchError) throw fetchError;

        // 2. Delete the record (FK cascades will handle logs & clicks automatically if migration was run)
        const { error: deleteError } = await supabaseAdmin
            .from('workers')
            .delete()
            .eq('id', id);
        
        if (deleteError) throw deleteError;

        // 3. STORAGE CLEANUP: Safely remove files from buckets
        const documentFiles = [
            worker.nic_front_url,
            worker.nic_back_url,
            worker.selfie_url,
            worker.certificate_url
        ].filter((url: string | null): url is string => !!url).map((url: string) => url.split('/').pop()!); // Extract filename from URL

        const avatarFiles = [worker.profile_photo_url].filter((url: string | null): url is string => !!url).map((url: string) => url.split('/').pop()!);

        const portfolioFiles = (worker.past_work_photos || []).filter((url: string | null): url is string => !!url).map((url: string) => url.split('/').pop()!);

        if (documentFiles.length > 0) {
            await supabaseAdmin.storage.from('worker-documents').remove(documentFiles);
        }
        if (avatarFiles.length > 0) {
            await supabaseAdmin.storage.from('avatars').remove(avatarFiles);
        }
        if (portfolioFiles.length > 0) {
            await supabaseAdmin.storage.from('portfolio').remove(portfolioFiles);
        }

        return { success: true };
    } catch (err: any) {
        console.error('[deleteWorkerAction] error:', err);
        return { success: false, error: 'Failed to delete worker safely.' };
    }
}

/**
 * SECURE: Update Worker Profile Details
 */
export async function updateWorkerAction(id: string, updates: any) {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    try {
        const payload: any = { ...updates };
        
        // Securely handle password hashing if it's being updated
        if (payload.password && payload.password.trim() !== '') {
            payload.password = await bcrypt.hash(payload.password, 10);
        } else {
            delete payload.password; // Don't overwrite with empty string
        }

        const { error } = await supabaseAdmin
            .from('workers')
            .update(payload)
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error('[updateWorkerAction] error:', err);
        return { success: false, error: 'Failed to update worker.' };
    }
}

/**
 * SECURE: Delete Customer Lead (Notify Me)
 */
export async function deleteCustomerAction(id: string) {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    try {
        // Manual cleanup of clicks first (to prevent FK violations if not cascading)
        await supabaseAdmin.from('whatsapp_clicks').delete().eq('customer_id', id);
        
        const { error } = await supabaseAdmin
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error('[deleteCustomerAction] error:', err);
        return { success: false, error: 'Failed to delete customer lead.' };
    }
}

/**
 * SECURE: Delete a specific engagement record (Matrix Click)
 */
export async function deleteClickAction(id: string) {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    try {
        const { error } = await supabaseAdmin
            .from('whatsapp_clicks')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error('[deleteClickAction] error:', err);
        return { success: false, error: 'Failed to delete record.' };
    }
}
