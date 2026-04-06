import { Metadata } from 'next'
import LoginClient from './components/LoginClient'

export const metadata: Metadata = {
    title: "Partner Login | Access Your Worker Dashboard | Grab Me",
    description: "Registered workers and partners can log in here to manage their profile, view leads, and update their availability. Secure access for Sri Lanka's verified pros.",
    openGraph: {
        title: "Partner Login | Grab Me Sri Lanka",
        description: "Secure dashboard for verified workers.",
        images: ["/grabme.png"],
    }
}

export default function LoginPage() {
    return <LoginClient />
}
