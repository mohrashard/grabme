import { cookies } from 'next/headers'
import * as jose from 'jose'

export async function verifyAdminSession(): Promise<boolean> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('grabme_admin_token')?.value

        if (!token) return false

        const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET)
        await jose.jwtVerify(token, secret)
        
        return true
    } catch (err) {
        // Silently return false for any verification error
        return false
    }
}
