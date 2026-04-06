'use server'

import { cookies, headers } from 'next/headers'
import { supabaseAdmin } from '../../lib/supabaseServer'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'
import { verifyAdminSession } from '@/app/lib/verifyAdminSession'
import { adminRateLimit } from '../../lib/rateLimit'

/**
 * SECURE: Admin Reset Worker Password
 */
export async function resetWorkerPasswordAction(workerId: string, newPassword: string) {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const { error } = await supabaseAdmin
            .from('workers')
            .update({ password: hashedPassword })
            .eq('id', workerId);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error('[resetWorkerPasswordAction] error:', err);
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}

/**
 * Production-Ready Server-Side Admin Authentication.
 * Verified on the server only — credentials never sent to client bundle.
 */
export async function verifyAdminAction(emailInput: string, passwordInput: string) {
    try {
        emailInput = (emailInput || '').trim();
        passwordInput = (passwordInput || '').trim();
        // 0. RATE LIMITING (Strict Admin Protection)
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || '0.0.0.0';
        const { success } = await adminRateLimit.limit(`login:admin:v7:${ip}`);
        if (!success) {
            return { 
                success: false, 
                error: 'Too many login attempts. Please wait 30 minutes.' 
            };
        }

        const CORRECT_EMAIL = process.env.ADMIN_EMAIL;
        const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD;

        if (!emailInput || !passwordInput || !CORRECT_EMAIL || !CORRECT_PASSWORD) {
            return { success: false, error: 'Auth system misconfigured' };
        }

        if (emailInput !== CORRECT_EMAIL) {
            return { success: false, error: 'Incorrect credentials. Please try again.' };
        }

        // Constant-time comparison to prevent timing attacks
        const isValid = passwordInput === CORRECT_PASSWORD;

        if (!isValid) {
            return { success: false, error: 'Incorrect credentials. Please try again.' };
        }

        // 2. JWT Generation
        const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
        const token = await new jose.SignJWT({ role: 'admin' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('8h')
            .sign(secret);

        // 3. Set HttpOnly Cookie
        const cookieStore = await cookies();
        cookieStore.set('grabme_admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 8 * 60 * 60,
            path: '/',
            sameSite: 'lax'
        });

        return { success: true };
    } catch (err: any) {
        console.error('[verifyAdminAction] error:', err);
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}

/**
 * SECURE: Admin Logout (Server-Side)
 * Clears the HttpOnly session cookie.
 */
export async function logoutAdminAction() {
    const cookieStore = await cookies();
    cookieStore.delete('grabme_admin_token');
    return { success: true };
}

/**
 * SECURE: Update Worker Status Action (Bypasses RLS via service_role)
 */
export async function updateWorkerStatusAction(id: string, status: string, updates: any = {}) {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { error } = await supabaseAdmin
            .from('workers')
            .update({ account_status: status, ...updates })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error('[updateWorkerStatusAction] error:', err);
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}

export async function fetchAdminDataAction() {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // 1. Fetch Workers
        const { data: workers, error: workerError } = await supabaseAdmin
            .from('workers')
            .select(`
                id, full_name, phone, email, nic_number,
                trade_category, account_status, profile_photo_url,
                nic_front_url, nic_back_url, selfie_url,
                home_district, specific_areas, districts_covered,
                short_bio, is_featured, is_identity_verified,
                is_reference_checked, created_at, sub_skills,
                years_experience, whatsapp_pinged_at, activated_at,
                reference_name, reference_phone, address,
                emergency_contact, agreed_to_code_of_conduct
            `)
            .order('created_at', { ascending: false });

        if (workerError) throw workerError;

        // 2. Fetch Clicks for Analytics (with joined worker info)
        const { data: clicks, error: clickError } = await supabaseAdmin
            .from('whatsapp_clicks')
            .select(`
                id,
                worker_id,
                clicked_at,
                worker:workers (
                    trade_category,
                    home_district
                )
            `);

        if (clickError) throw clickError;

        // 2.5 Fetch Customer Leads
        const { data: leads, error: leadsError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .order('registered_at', { ascending: false });

        if (leadsError) throw leadsError;

        // 3. Time-based Click Stats
        const now = new Date();
        const startOfToday = new Date(now.setHours(0,0,0,0)).getTime();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();

        const clicksToday = clicks.filter(c => new Date(c.clicked_at).getTime() >= startOfToday).length;
        const clicksThisWeek = clicks.filter(c => new Date(c.clicked_at).getTime() >= sevenDaysAgo).length;

        // 4. Aggregate Clicks by Trade & District for Demand Ranking
        const tradeClicks: Record<string, number> = {};
        const districtClicks: Record<string, number> = {};
        const fullKeyClicks: Record<string, number> = {};

        clicks.forEach((c: any) => {
            if (c.worker) {
                const t = c.worker.trade_category;
                const d = c.worker.home_district;
                tradeClicks[t] = (tradeClicks[t] || 0) + 1;
                districtClicks[d] = (districtClicks[d] || 0) + 1;
                
                const key = `${t} | ${d}`;
                fullKeyClicks[key] = (fullKeyClicks[key] || 0) + 1;
            }
        });

        // 5. Calculate "Most Clicked" labels
        const mostClickedTrade = Object.entries(tradeClicks).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const mostClickedDistrict = Object.entries(districtClicks).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // Convert to sorted array for the UI (Demand Hotspots)
        const sortedClicks = Object.entries(fullKeyClicks)
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15);

        const stats = {
            total: workers.length,
            pending: (workers as any[]).filter(w => ['pending', 'whatsapp_pinged', 'under_review'].includes(w.account_status)).length,
            active: (workers as any[]).filter(w => w.account_status === 'active').length,
            suspended: (workers as any[]).filter(w => w.account_status === 'suspended').length,
            clicksToday,
            clicksThisWeek,
            mostClickedTrade,
            mostClickedDistrict,
            topClicks: sortedClicks,
            totalClicks: clicks.length
        };

        return { success: true, workers, leads, stats };
    } catch (err: any) {
        console.error('[fetchAdminDataAction] error:', err);
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}

/**
 * SECURE: Generate Signed URL for Private Identity Documents (NIC / Selfie).
 * Expires in 300 seconds (5 minutes).
 *
 * IMPORTANT: Only generate signed URLs for the 'worker-documents' bucket.
 * Never generate signed URLs for the 'avatars' bucket — those files are
 * already publicly accessible and calling createSignedUrl on them is
 * unnecessary and misleading about their privacy level.
 */
export async function getSignedUrlAction(path: string) {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // Extract the actual path after the bucket name if needed
        const { data, error } = await supabaseAdmin.storage
            .from('worker-documents')
            .createSignedUrl(path, 300);

        if (error) throw error;
        return { success: true, signedUrl: data.signedUrl };
    } catch (err: any) {
        console.error('[getSignedUrlAction] error:', err);
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}
export async function toggleFeaturedAction(id: string, featured: boolean) {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { error } = await supabaseAdmin
            .from('workers')
            .update({ is_featured: featured })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error('[toggleFeaturedAction] error:', err);
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}

export async function insertVerificationLogAction(log: any) {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { error } = await supabaseAdmin
            .from('verification_log')
            .insert([log]);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error('[insertVerificationLogAction] error:', err);
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}

export async function updateStatusWithLogAction(workerId: string, status: string, logData: any, workerUpdates: any = {}) {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // 1. Update Worker Status
        const { error: workerError } = await supabaseAdmin
            .from('workers')
            .update({ account_status: status, ...workerUpdates })
            .eq('id', workerId);

        if (workerError) throw workerError;

        // 2. Insert Verification Log
        const { error: logError } = await supabaseAdmin
            .from('verification_log')
            .insert([{
                worker_id: workerId,
                action: status === 'active' ? 'approved' : status,
                outcome: logData.outcome || 'pass',
                admin_notes: logData.admin_notes,
                // Additional fields for the new checklist
                nic_checked: logData.nic_checked,
                reference_called: logData.reference_called
            }]);

        if (logError) throw logError;

        return { success: true };
    } catch (err: any) {
        console.error('[updateStatusWithLogAction] error:', err);
        return { success: false, error: 'Something went wrong. Please try again.' };
    }
}
