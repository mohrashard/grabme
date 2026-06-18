'use client';

import React, { useState } from 'react';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { toggleLikeAction } from '../actions';

interface ProfileInteractionsProps {
    workerId: string;
    initialLikes: number;
    initialVisits: number;
}

// Reads localStorage synchronously — runs once during initial render.
// NO useLayoutEffect/useEffect needed. This avoids the post-paint
// re-render that caused the dark-mode flicker on Android.
function getInitialLikedState(workerId: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
        const likedProfiles = JSON.parse(localStorage.getItem('liked_profiles') || '[]');
        return Array.isArray(likedProfiles) && likedProfiles.includes(workerId);
    } catch {
        return false;
    }
}

export default function ProfileInteractions({ workerId, initialLikes, initialVisits }: ProfileInteractionsProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [visits] = useState(initialVisits);
    const [isLiked, setIsLiked] = useState(() => getInitialLikedState(workerId));
    const [isLiking, setIsLiking] = useState(false);

    // NO useLayoutEffect here — the useState initializer already reads
    // the correct value. Adding a useLayoutEffect on top caused a second
    // setIsLiked() call → second re-render → dark mode flicker on mobile.

    const handleToggleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);

        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setLikes(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

        try {
            let likedProfiles = JSON.parse(localStorage.getItem('liked_profiles') || '[]');
            if (!Array.isArray(likedProfiles)) likedProfiles = [];
            if (newLikedState) {
                if (!likedProfiles.includes(workerId)) likedProfiles.push(workerId);
            } else {
                likedProfiles = likedProfiles.filter((id: string) => id !== workerId);
            }
            localStorage.setItem('liked_profiles', JSON.stringify(likedProfiles));
        } catch { /* private browsing */ }

        const res = await toggleLikeAction(workerId, newLikedState);
        if (res.success && res.newCount !== undefined) {
            setLikes(res.newCount);
        }

        setIsLiking(false);
    };

    return (
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5">
            <button
                onClick={handleToggleLike}
                disabled={isLiking}
                aria-pressed={isLiked}
                aria-label={`${isLiked ? 'Unlike' : 'Like'} this profile`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${
                    isLiked
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-[#0f1e38] border-slate-200 dark:border-[#1e3a5f] text-slate-500 dark:text-slate-400'
                }`}
            >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-blue-600 dark:fill-blue-400' : ''}`} />
                {likes} Likes
            </button>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-[#0f1e38] border border-slate-200 dark:border-[#1e3a5f] text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">
                <MessageSquare className="w-4 h-4" />
                {visits} Chats
            </div>
        </div>
    );
}
