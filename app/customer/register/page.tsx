import { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import CustomerRegisterClient from './components/CustomerRegisterClient'

export const metadata: Metadata = {
    title: "Get Notified | Find Workers in Your Area | Grab Me",
    description: "Don't see a worker in your city? Register for notifications and we'll alert you when a verified electrician, plumber, or technician joins near you.",
    keywords: ["customer registration", "get notified", "find workers Sri Lanka", "home services alert"],
    openGraph: {
        title: "Get Notified of New Workers on Grab Me",
        description: "We'll alert you when a pro is available in your district.",
        images: ["/grabme.png"],
    }
}

export default function CustomerRegistrationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#090A0F] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        }>
            <CustomerRegisterClient />
        </Suspense>
    )
}
