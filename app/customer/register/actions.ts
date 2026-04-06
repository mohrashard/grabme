'use server'

import { z } from 'zod';
import { supabaseAdmin } from '../../lib/supabaseServer';

import { headers } from 'next/headers';
import { registrationRateLimit } from '../../lib/rateLimit';

const CustomerSchema = z.object({
    full_name: z.string().min(2, 'Name is too short').max(100),
    phone: z.string().regex(/^0\d{9}$/, 'Invalid SL phone number (e.g. 0771234567)'),
    district: z.string().min(2, 'Please select a district'),
    lat: z.number().optional(),
    lng: z.number().optional(),
    area_name: z.string().optional(),
    service_needed: z.string().optional(),
    source: z.enum(['notify_me', 'whatsapp_click']).optional(),
});

export type CustomerData = z.infer<typeof CustomerSchema>;

/**
 * Register a new customer in the platform.
 * Used for lead tracking and localized experience.
 */
export async function registerCustomerAction(formData: CustomerData) {
    try {
        // 0. RATE LIMITING (IP-Based Protection)
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || '0.0.0.0';
        const { success } = await registrationRateLimit.limit(ip);
        if (!success) {
            return { success: false, error: 'Too many registration attempts. Please try again in an hour.' };
        }

        // 1. Validate incoming data
        const validated = CustomerSchema.safeParse(formData);
        
        if (!validated.success) {
            const errors: any = {};
            validated.error.issues.forEach((issue: any) => {
                if (issue.path[0]) errors[issue.path[0]] = issue.message;
            });
            return { success: false, errors };
        }

        // 2. Insert into Supabase (Bypass RLS for public registration)
        // Selecting "id" to return it for frontend tracking
        const { data, error } = await supabaseAdmin
            .from('customers')
            .upsert([
                {
                    full_name: validated.data.full_name,
                    phone: validated.data.phone,
                    district: validated.data.district,
                    lat: validated.data.lat,
                    lng: validated.data.lng,
                    area_name: validated.data.area_name,
                    service_needed: validated.data.service_needed,
                    source: validated.data.source || 'notify_me',
                }
            ], { onConflict: 'phone' })
            .select('id')
            .single();

        if (error) {
            console.error('Customer DB Error:', error.message);
            throw error;
        }

        return { success: true, id: data.id };

    } catch (err: any) {
        console.error('Customer Registration Critical Error:', err);
        return { success: false, error: 'Internal Server Error' };
    }
}
