import { Metadata } from 'next'
import ForgotPasswordClient from './components/ForgotPasswordClient'

export const metadata: Metadata = {
    title: "Reset Password | Worker Support | Grab Me",
    description: "Lost your password? Contact our admin via WhatsApp for a manual identity verification and account recovery. Secure and personal support for our partners.",
    openGraph: {
        title: "Reset Your Grab Me Password",
        description: "Manual password recovery via WhatsApp.",
        images: ["/grabme.png"],
    }
}

export default function ForgotPasswordPage() {
    return <ForgotPasswordClient />
}
