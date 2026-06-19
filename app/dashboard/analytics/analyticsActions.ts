'use server'

import { supabaseAdmin } from '../../lib/supabaseServer'

export async function getAnalyticsDataAction(workerId: string) {
    try {
        if (!workerId) throw new Error('Not authorized');

        // Verify tier
        const { data: profile } = await supabaseAdmin
            .from('workers')
            .select('subscription_tier, video_pitch_url, reviews:reviews(count)')
            .eq('id', workerId)
            .single();

        const isPro = profile?.subscription_tier === 'pro';

        // 1. Fetch Profile Views (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: views } = await supabaseAdmin
            .from('profile_views')
            .select('viewed_at')
            .eq('worker_id', workerId)
            .gte('viewed_at', thirtyDaysAgo.toISOString());

        // 2. Fetch WhatsApp Clicks with Customer Location
        const { data: clicks } = await supabaseAdmin
            .from('whatsapp_clicks')
            .select('clicked_at, customers(district)')
            .eq('worker_id', workerId)
            .gte('clicked_at', thirtyDaysAgo.toISOString());

        // Process Funnel
        const totalViews = views?.length || 0;
        const totalClicks = clicks?.length || 0;
        const conversionRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

        // Process Time Series (Last 7 Days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const chartData = last7Days.map(date => {
            const dayViews = views?.filter(v => v.viewed_at.startsWith(date)).length || 0;
            const dayClicks = clicks?.filter((c: any) => c.clicked_at.startsWith(date)).length || 0;
            return {
                name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                views: dayViews,
                clicks: dayClicks
            };
        });

        // Process Audience (Top Districts)
        const districtCounts: Record<string, number> = {};
        clicks?.forEach((c: any) => {
            const d = c.customers?.district || 'Unknown';
            districtCounts[d] = (districtCounts[d] || 0) + 1;
        });

        const topDistricts = Object.entries(districtCounts)
            .map(([district, count]) => ({ district, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        // Profile Gamification Insights
        const hasVideo = !!profile?.video_pitch_url;
        const hasReviews = (profile?.reviews?.[0]?.count || 0) > 0;

        return {
            success: true,
            isPro,
            funnel: { views: totalViews, clicks: totalClicks, rate: conversionRate },
            chartData,
            topDistricts,
            insights: { hasVideo, hasReviews }
        };

    } catch (err) {
        console.error("Analytics Error:", err);
        return { success: false, error: 'Failed to load analytics' };
    }
}

export async function getRevenueAnalyticsAction(workerId: string) {
    try {
        if (!workerId) throw new Error('Not authorized');

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

        // Fetch all income entries
        const { data: allEntries } = await supabaseAdmin
            .from('financial_entries')
            .select('amount, category, lead_source, entry_date, type')
            .eq('worker_id', workerId)
            .eq('type', 'income')
            .order('entry_date', { ascending: true });

        // Fetch invoices
        const { data: invoices } = await supabaseAdmin
            .from('invoices')
            .select('total_amount, status, created_at')
            .eq('worker_id', workerId);

        // Fetch estimates
        const { data: estimates } = await supabaseAdmin
            .from('estimates')
            .select('total_amount, status, created_at')
            .eq('worker_id', workerId);

        // This month's income
        const thisMonthEntries = (allEntries || []).filter(e => e.entry_date >= startOfMonth.split('T')[0]);
        const thisMonthTotal = thisMonthEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

        // Last month's income
        const lastMonthEntries = (allEntries || []).filter(e =>
            e.entry_date >= startOfLastMonth.split('T')[0] &&
            e.entry_date <= endOfLastMonth.split('T')[0]
        );
        const lastMonthTotal = lastMonthEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

        // Month-over-month growth %
        const growth = lastMonthTotal > 0
            ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
            : null;

        // Unpaid invoices total
        const unpaidTotal = (invoices || [])
            .filter(i => i.status === 'unpaid')
            .reduce((sum, i) => sum + (i.total_amount || 0), 0);

        // Pending estimates total
        const pendingEstimatesTotal = (estimates || [])
            .filter(e => e.status === 'pending')
            .reduce((sum, e) => sum + (e.total_amount || 0), 0);

        // Revenue by lead source
        const sourceMap: Record<string, number> = {};
        (allEntries || []).forEach(e => {
            const src = e.lead_source || 'other';
            sourceMap[src] = (sourceMap[src] || 0) + (e.amount || 0);
        });
        const revenueBySource = Object.entries(sourceMap).map(([source, amount]) => ({
            source: source.charAt(0).toUpperCase() + source.slice(1),
            amount
        })).sort((a, b) => b.amount - a.amount);

        // Revenue by category
        const categoryMap: Record<string, number> = {};
        (allEntries || []).forEach(e => {
            const cat = e.category || 'Other';
            categoryMap[cat] = (categoryMap[cat] || 0) + (e.amount || 0);
        });
        const revenueByCategory = Object.entries(categoryMap).map(([category, amount]) => ({
            category,
            amount
        })).sort((a, b) => b.amount - a.amount);

        // 6-month income trend (bar chart data)
        const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const monthStr = d.toISOString().split('T')[0].substring(0, 7); // "YYYY-MM"
            const monthTotal = (allEntries || [])
                .filter(e => e.entry_date.startsWith(monthStr))
                .reduce((sum, e) => sum + (e.amount || 0), 0);
            return {
                name: d.toLocaleDateString('en-US', { month: 'short' }),
                income: monthTotal
            };
        });

        return {
            success: true,
            thisMonthTotal,
            lastMonthTotal,
            growth,
            unpaidTotal,
            pendingEstimatesTotal,
            revenueBySource,
            revenueByCategory,
            monthlyTrend,
            totalInvoices: invoices?.length || 0,
            totalEstimates: estimates?.length || 0,
        };

    } catch (err) {
        console.error("Revenue Analytics Error:", err);
        return { success: false, error: 'Failed to load revenue data' };
    }
}
