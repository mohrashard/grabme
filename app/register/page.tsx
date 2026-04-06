import { Metadata } from 'next'
import WorkerRegisterClient from './components/WorkerRegisterClient'

export const metadata: Metadata = {
    title: "Join as a Verified Worker | Grab Me Sri Lanka",
    description: "Register as a verified electrician, plumber, or home service professional. Get more jobs, connect via WhatsApp, and keep 100% of your earnings. No commission.",
    keywords: ["register as worker", "Sri Lanka worker jobs", "verified baas", "handyman registration", "join Grab Me"],
    openGraph: {
        title: "Be a Verified Worker on Grab Me",
        description: "Grow your business in Sri Lanka. Connect directly with customers on WhatsApp.",
        images: ["/grabme.png"],
    }
}

export default function WorkerRegistrationPage() {
    return <WorkerRegisterClient />
}