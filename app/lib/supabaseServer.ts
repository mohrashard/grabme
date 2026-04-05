import { createClient } from '@supabase/supabase-js'

/**
 * PRODUCTION-READY: Supabase Service Role Client (Server-Side Only)
 * Used to bypass RLS for Admin actions (Status updates, Private Buckets).
 * NEVER use this in client components or export it to the browser.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  throw new Error('CRITICAL: MISSING SUPABASE_SERVICE_ROLE_KEY in .env.local')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
