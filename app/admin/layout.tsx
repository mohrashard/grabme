'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        // Skip auth guard for the login page itself
        if (pathname === '/admin/login') {
            setAuthorized(true)
            return
        }

        const raw = localStorage.getItem('grabme_admin')
        if (!raw) {
            router.push('/admin/login')
            return
        }

        try {
            const session = JSON.parse(raw)
            const EIGHT_HOURS = 8 * 60 * 60 * 1000
            const isExpired = Date.now() - session.loggedInAt > EIGHT_HOURS

            if (session.role !== 'admin' || isExpired) {
                localStorage.removeItem('grabme_admin')
                router.push('/admin/login')
            } else {
                setAuthorized(true)
            }
        } catch {
            localStorage.removeItem('grabme_admin')
            router.push('/admin/login')
        }
    }, [pathname, router])

    if (!authorized && pathname !== '/admin/login') {
        // Return matching background from admin page to avoid flash
        return (
            <div className="min-h-screen bg-[#090A0F] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return <>{children}</>
}
