'use server'

import { supabase } from './supabase'
import { TRADE_SUB_SKILLS } from '../register/constants'

export type ServiceRecord = {
    id: string;
    name: string;
    is_active: boolean;
    sort_order: number;
};

export type SkillRecord = {
    id: string;
    service_id: string;
    name: string;
};

export type KeywordRecord = {
    id: string;
    service_id: string;
    keyword: string;
};

export type TaxonomyData = {
    services: ServiceRecord[];
    skillsByService: Record<string, SkillRecord[]>;  // keyed by service name
    keywordMap: Record<string, string[]>;            // keyword -> [service names]
};

/**
 * Fetches all dynamic taxonomy data (services, skills, keywords) from the DB.
 * Falls back to static constants.ts if the DB returns empty (safe during migration).
 */
export async function fetchTaxonomyAction(): Promise<TaxonomyData> {
    const [servicesRes, skillsRes, keywordsRes] = await Promise.all([
        supabase.from('services').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('skills').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('search_keywords').select('*'),
    ]);

    // Fallback to constants if DB is empty or errored
    const services: ServiceRecord[] = (servicesRes.data && servicesRes.data.length > 0)
        ? servicesRes.data
        : Object.keys(TRADE_SUB_SKILLS).map((name, i) => ({
            id: `static-${i}`,
            name,
            is_active: true,
            sort_order: i,
        }));

    // Build skills map keyed by service name
    const skillsByService: Record<string, SkillRecord[]> = {};
    services.forEach(s => { skillsByService[s.name] = []; });

    if (skillsRes.data && skillsRes.data.length > 0) {
        skillsRes.data.forEach((sk: SkillRecord) => {
            const svc = services.find(s => s.id === sk.service_id);
            if (svc) {
                if (!skillsByService[svc.name]) skillsByService[svc.name] = [];
                skillsByService[svc.name].push(sk);
            }
        });
    } else {
        // Fallback: use constants
        Object.entries(TRADE_SUB_SKILLS).forEach(([trade, skills]) => {
            skillsByService[trade] = skills.map((name, i) => ({
                id: `static-${i}`,
                service_id: `static`,
                name,
            }));
        });
    }

    // Build keyword map: keyword -> [service names]
    const keywordMap: Record<string, string[]> = {};
    if (keywordsRes.data && keywordsRes.data.length > 0) {
        keywordsRes.data.forEach((kw: KeywordRecord) => {
            const svc = services.find(s => s.id === kw.service_id);
            if (svc) {
                if (!keywordMap[kw.keyword]) keywordMap[kw.keyword] = [];
                keywordMap[kw.keyword].push(svc.name);
            }
        });
    }

    return { services, skillsByService, keywordMap };
}
