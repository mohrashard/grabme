'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'
import { z } from 'zod'

const CertUpdateSchema = z.object({
    workerId: z.string().uuid(),
    certificateUrl: z.string().url(),
    certificateName: z.string()
})

export async function updateWorkerCertificateAction(rawData: unknown) {
    try {
        const res = CertUpdateSchema.safeParse(rawData)
        if (!res.success) {
            return { success: false, error: res.error.issues[0].message }
        }

        const { workerId, certificateUrl, certificateName } = res.data

        const { error } = await supabaseAdmin
            .from('workers')
            .update({ 
                certificate_url: certificateUrl,
                certificate_name: certificateName
            })
            .eq('id', workerId)

        if (error) throw error;

        return { success: true }
    } catch (err: any) {
        console.error('[updateWorkerCertificateAction]', err)
        return { success: false, error: err.message || 'Failed to update certificate' }
    }
}
