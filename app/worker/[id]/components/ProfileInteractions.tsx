'use client';

import React, { useState, useLayoutEffect } from 'react';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { toggleLikeAction } from '../actions';

interface ProfileInteractionsProps {
    workerId: string;
    initialLikes: number;
    initialVisits: number;
}

// Read liked state synchronously so there's no layout shift after mount.
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
    // Initialize isLiked synchronously to prevent the button jumping on mount.
    // On SSR this returns false (safe), on the client it reads localStorage immediately.
    const [isLiked, setIsLiked] = useState(() => getInitialLikedState(workerId));
    const [isLiking, setIsLiking] = useState(false);

    // useLayoutEffect as a safety net: re-reads localStorage after hydration
    // to guard against stale closure values on React strict-mode double-invoke.
    useLayoutEffect(() => {
        setIsLiked(getInitialLikedState(workerId));
    }, [workerId]);

    const handleToggleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);

        const newLikedState = !isLiked;

        // Optimistic UI update
        setIsLiked(newLikedState);
        setLikes(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

        // Persist to LocalStorage
        try {
            let likedProfiles = JSON.parse(localStorage.getItem('liked_profiles') || '[]');
            if (!Array.isArray(likedProfiles)) likedProfiles = [];
            if (newLikedState) {
                if (!likedProfiles.includes(workerId)) likedProfiles.push(workerId);
            } else {
                likedProfiles = likedProfiles.filter((id: string) => id !== workerId);
            }
            localStorage.setItem('liked_profiles', JSON.stringify(likedProfiles));
        } catch { /* ignore private-mode localStorage errors */ }

        // Sync with server
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
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
                }`}
            >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-blue-600 dark:fill-blue-400' : ''}`} />
                {likes} Likes
            </button>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">
                <MessageSquare className="w-4 h-4" />
                {visits} Chats
            </div>
        </div>
    );
}
