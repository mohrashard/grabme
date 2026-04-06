'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'
import { verifyAdminSession } from '@/app/lib/verifyAdminSession'

// ─── Add a new service ─────────────────────────────────────────────────────
export async function addServiceAction(name: string) {
    if (!await verifyAdminSession()) return { success: false, error: 'Unauthorized' };
    const { data, error } = await supabaseAdmin
        .from('services')
        .upsert({ 
            name: name.trim(), 
            name_en: name.trim() 
        }, { onConflict: 'name_en' })
        .select('*')
        .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

// ─── Delete a service (cascades skills + keywords) ─────────────────────────
export async function deleteServiceAction(id: string) {
    if (!await verifyAdminSession()) return { success: false, error: 'Unauthorized' };
    const { error } = await supabaseAdmin.from('services').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
}

// ─── Add a skill to a service ──────────────────────────────────────────────
export async function addSkillAction(serviceId: string, name: string) {
    if (!await verifyAdminSession()) return { success: false, error: 'Unauthorized' };
    const { data, error } = await supabaseAdmin
        .from('skills').insert({ service_id: serviceId, name: name.trim() }).select('*').single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

// ─── Delete a skill ────────────────────────────────────────────────────────
export async function deleteSkillAction(id: string) {
    if (!await verifyAdminSession()) return { success: false, error: 'Unauthorized' };
    const { error } = await supabaseAdmin.from('skills').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
}

// ─── Add a search keyword to a service ────────────────────────────────────
export async function addKeywordAction(serviceId: string, keyword: string) {
    if (!await verifyAdminSession()) return { success: false, error: 'Unauthorized' };
    const { data, error } = await supabaseAdmin
        .from('search_keywords')
        .insert({ service_id: serviceId, keyword: keyword.trim().toLowerCase() })
        .select('*').single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

// ─── Delete a keyword ──────────────────────────────────────────────────────
export async function deleteKeywordAction(id: string) {
    if (!await verifyAdminSession()) return { success: false, error: 'Unauthorized' };
    const { error } = await supabaseAdmin.from('search_keywords').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
}

// ─── Fetch full taxonomy (admin view - all services including inactive) ────
export async function fetchTaxonomyAdminAction() {
    if (!await verifyAdminSession()) return { success: false, error: 'Unauthorized', data: null };
    const [servicesRes, skillsRes, keywordsRes] = await Promise.all([
        supabaseAdmin.from('services').select('*').order('sort_order'),
        supabaseAdmin.from('skills').select('*').order('sort_order'),
        supabaseAdmin.from('search_keywords').select('*').order('keyword'),
    ]);
    if (servicesRes.error) return { success: false, error: servicesRes.error.message, data: null };
    return {
        success: true,
        data: {
            services: servicesRes.data || [],
            skills: skillsRes.data || [],
            keywords: keywordsRes.data || [],
        }
    };
}
// ─── Bulk Import Taxonomy ──────────────────────────────────────────────────
export async function bulkImportTaxonomyAction(jsonData: any[]) {
    if (!await verifyAdminSession()) return { success: false, error: 'Unauthorized' };
    
    const results = { 
        created: 0, 
        updated: 0, 
        skipped: 0, // In this version, we will treat duplicates as "updated" if we choose, or skipped
        skills: 0, 
        keywords: 0, 
        errors: [] as string[] 
    };

    for (const item of jsonData) {
        try {
            // First check if it exists
            const { data: existing } = await supabaseAdmin
                .from('services')
                .select('id')
                .eq('name_en', item.nameEn)
                .single();

            // 1. Create/Find Service
            const combinedName = item.nameSi ? `${item.nameEn} (${item.nameSi})` : item.nameEn;
            const { data: svc, error: svcErr } = await supabaseAdmin
                .from('services')
                .upsert({ 
                    name: combinedName,
                    name_en: item.nameEn,
                    name_si: item.nameSi
                }, { onConflict: 'name_en' })
                .select('*')
                .single();

            if (svcErr || !svc) {
                results.errors.push(`Service "${item.nameEn}": ${svcErr?.message}`);
                continue;
            }

            if (existing) results.updated++;
            else results.created++;

            // 2. Add Skills
            if (item.skills && Array.isArray(item.skills)) {
                for (const sk of item.skills) {
                    const skCombinedName = sk.nameSi ? `${sk.nameEn} (${sk.nameSi})` : sk.nameEn;
                    const { error: skErr } = await supabaseAdmin
                        .from('skills')
                        .upsert({ 
                            service_id: svc.id, 
                            name: skCombinedName,
                            name_en: sk.nameEn,
                            name_si: sk.nameSi
                        }, { onConflict: 'service_id,name_en' });
                    if (!skErr) results.skills++;
                    else results.errors.push(`Skill "${sk.nameEn}": ${skErr.message}`);
                }
            }

            // 3. Add Keywords
            if (item.keywords && Array.isArray(item.keywords)) {
                for (const kw of item.keywords) {
                    const { error: kwErr } = await supabaseAdmin
                        .from('search_keywords')
                        .upsert({ 
                            service_id: svc.id, 
                            keyword: kw.trim().toLowerCase() 
                        }, { onConflict: 'service_id,keyword' });
                    if (!kwErr) results.keywords++;
                    else results.errors.push(`Keyword "${kw}": ${kwErr.message}`);
                }
            }
        } catch (e: any) {
            results.errors.push(`General error: ${e.message}`);
        }
    }

    return { success: true, results };
}
