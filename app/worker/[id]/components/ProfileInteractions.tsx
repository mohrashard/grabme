'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { toggleLikeAction } from '../actions';

interface ProfileInteractionsProps {
    workerId: string;
    initialLikes: number;
    initialVisits: number;
}

export default function ProfileInteractions({ workerId, initialLikes, initialVisits }: ProfileInteractionsProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [visits, setVisits] = useState(initialVisits);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const hasVisited = useRef(false);

    useEffect(() => {
        // Check if user has liked this profile before
        const likedProfiles = JSON.parse(localStorage.getItem('liked_profiles') || '[]');
        if (likedProfiles.includes(workerId)) {
            setIsLiked(true);
        }

        // Removed automatic visit tracking. We now use the visits_count column 
        // to track WhatsApp clicks, which is handled directly by the WhatsAppButton logic!
    }, [workerId]);

    const handleToggleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);

        const newLikedState = !isLiked;
        
        // Optimistic UI update
        setIsLiked(newLikedState);
        setLikes(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

        // Update LocalStorage
        let likedProfiles = JSON.parse(localStorage.getItem('liked_profiles') || '[]');
        if (newLikedState) {
            if (!likedProfiles.includes(workerId)) likedProfiles.push(workerId);
        } else {
            likedProfiles = likedProfiles.filter((id: string) => id !== workerId);
        }
        localStorage.setItem('liked_profiles', JSON.stringify(likedProfiles));

        // Sync with server
        const res = await toggleLikeAction(workerId, newLikedState);
        if (res.success && res.newCount !== undefined) {
            setLikes(res.newCount); // Sync true count from server
        }
        
        setIsLiking(false);
    };

    return (
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5">
            <button 
                onClick={handleToggleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-colors ${
                    isLiked 
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/20' 
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
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
