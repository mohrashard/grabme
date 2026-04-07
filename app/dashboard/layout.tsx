'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        const raw = localStorage.getItem('grabme_user')
        if (!raw) {
            router.push('/login')
        } else {
            setAuthorized(true)
        }
    }, [router])

    if (!authorized) {
        // Return matching background from dashboard page component to avoid white flash
        return (
            <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return <>{children}</>
}
