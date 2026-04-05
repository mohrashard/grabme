'use server'

/**
 * SECURE: Admin Contact URL Generator
 *
 * Reads ADMIN_WHATSAPP from a server-only env var (no NEXT_PUBLIC_ prefix).
 * The raw phone number is NEVER transmitted to the browser. Only the
 * fully-constructed wa.me URL is returned, and only on demand.
 */
export async function getAdminContactAction(message: string): Promise<{ url: string }> {
    const adminNumber = process.env.ADMIN_WHATSAPP
    if (!adminNumber) throw new Error('Admin contact not configured')
    return {
        url: `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`
    }
}
