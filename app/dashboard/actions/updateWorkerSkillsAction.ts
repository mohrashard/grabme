'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'
import { z } from 'zod'

const SkillsSchema = z.object({
    workerId: z.string().uuid(),
    sub_skills: z.array(z.string()).max(20),
})

export async function updateWorkerSkillsAction(rawData: unknown) {
    try {
        const res = SkillsSchema.safeParse(rawData)
        if (!res.success) {
            return { success: false, error: res.error.issues[0].message }
        }

        const { workerId, sub_skills } = res.data

        const { error } = await supabaseAdmin
            .from('workers')
            .update({ sub_skills })
            .eq('id', workerId)

        if (error) throw error

        return { success: true }
    } catch (err: any) {
        console.error('[updateWorkerSkillsAction]', err)
        return { success: false, error: err.message || 'Failed to save skills' }
    }
}
