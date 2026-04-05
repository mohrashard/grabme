'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { loginRateLimit } from '../../lib/rateLimit'

/**
 * SECURE LOGIN ACTION: Zero-Trust Authentication
 * This action replaces insecure client-side password checks.
 */
export async function loginWorkerAction(identifier: string, plaintext: string) {
    try {
        // 0. RATE LIMITING (IP-Based Protection)
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || '0.0.0.0';
        const { success } = await loginRateLimit.limit(`login:${ip}`);
        if (!success) {
            return { 
                success: false, 
                error: 'Too many login attempts. Please wait 15 minutes.' 
            };
        }

        if (!identifier || !plaintext) {
            return { success: false, error: 'Please enter both ID and password.' }
        }

        const trimmedId = identifier.trim()
        const selectQuery = 'id, full_name, email, phone, nic_number, account_status, password, trade_category, home_district, profile_photo_url, is_identity_verified, is_reference_checked';
        
        let worker = null;

        // 1. Sequential Safe Lookup Strategy
        // Try Email
        const { data: byEmail } = await supabaseAdmin
            .from('workers')
            .select(selectQuery)
            .eq('email', trimmedId)
            .maybeSingle();
        worker = byEmail;

        // Try Phone
        if (!worker) {
            const { data: byPhone } = await supabaseAdmin
                .from('workers')
                .select(selectQuery)
                .eq('phone', trimmedId)
                .maybeSingle();
            worker = byPhone;
        }

        // Try NIC
        if (!worker) {
            const { data: byNic } = await supabaseAdmin
                .from('workers')
                .select(selectQuery)
                .eq('nic_number', trimmedId.toUpperCase())
                .maybeSingle();
            worker = byNic;
        }

        if (!worker) {
            return { success: false, error: 'Incorrect credentials. Please try again.' }
        }

        // 2. Cryptographic Comparison
        const isMatch = await bcrypt.compare(plaintext, worker.password)
        
        if (!isMatch) {
            return { success: false, error: 'Incorrect credentials. Please try again.' }
        }

        // 3. SECURE RETURN: Strip password hash
        const { password: _, ...safeUser } = worker
        return { success: true, user: safeUser }

    } catch (err: any) {
        console.error('Portal Login Server Error:', err)
        return { success: false, error: 'Something went wrong. Please try again.' }
    }
}

