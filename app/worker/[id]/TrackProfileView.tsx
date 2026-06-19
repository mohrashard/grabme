'use client'

import { useEffect, useRef } from 'react'
import { trackProfileViewAction } from './actions'

export default function TrackProfileView({ workerId }: { workerId: string }) {
    const tracked = useRef(false)

    useEffect(() => {
        if (tracked.current) return
        tracked.current = true

        // Don't track if the worker is viewing their own profile
        try {
            const raw = localStorage.getItem('grabme_user')
            if (raw) {
                const user = JSON.parse(raw)
                if (user.id === workerId) return
            }
        } catch (e) {
            // ignore
        }

        trackProfileViewAction(workerId).catch(console.error)
    }, [workerId])

    return null
}
