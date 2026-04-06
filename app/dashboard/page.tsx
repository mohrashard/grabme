import { Metadata } from 'next'
import DashboardClient from './components/DashboardClient'

export const metadata: Metadata = {
    title: "Worker Dashboard | Grab Me Sri Lanka",
    description: "Manage your professional profile, view leads, and track your account status on the Grab Me worker portal.",
    robots: {
        index: false,
        follow: false,
    }
}

export default function DashboardPage() {
    return <DashboardClient />
}
