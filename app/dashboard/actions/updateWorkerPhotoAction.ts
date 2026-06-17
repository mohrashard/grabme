'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'
import { z } from 'zod'

const PhotoUpdateSchema = z.object({
    workerId: z.string().uuid(),
    photoUrl: z.string().url(),
})

export async function updateWorkerPhotoAction(rawData: unknown) {
    try {
        const res = PhotoUpdateSchema.safeParse(rawData)
        if (!res.success) {
            return { success: false, error: res.error.issues[0].message }
        }

        const { workerId, photoUrl } = res.data

        const { error } = await supabaseAdmin
            .from('workers')
            .update({ profile_photo_url: photoUrl })
            .eq('id', workerId)

        if (error) throw error;

        return { success: true }
    } catch (err: any) {
        console.error('[updateWorkerPhotoAction]', err)
        return { success: false, error: err.message || 'Failed to update photo' }
    }
}
