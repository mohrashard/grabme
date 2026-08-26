import React from 'react'

export function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { color: string; label: string }> = {
        pending: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Pending' },
        whatsapp_pinged: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'WA Pinged' },
        under_review: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Under Review' },
        active: { color: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Active' },
        rejected: { color: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Rejected' },
        suspended: { color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', label: 'Suspended' },
    };
    const c = map[status] ?? map['pending'];
    return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${c.color}`}>{c.label}</span>;
}
