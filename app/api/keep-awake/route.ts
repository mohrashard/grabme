import { createClient } from '@supabase/supabase-js'
import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // --- Authorization check ---
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // --- Ping Supabase ---
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error: supabaseError } = await supabase
      .from('workers')
      .select('id')
      .limit(1)

    if (supabaseError) {
      throw new Error(`Supabase ping failed: ${supabaseError.message}`)
    }

    // --- Ping Upstash Redis ---
    const redis = Redis.fromEnv()
    await redis.set('grabme-keep-awake', Date.now(), { ex: 60 })

    return Response.json(
      {
        ok: true,
        message: 'Both databases pinged successfully.',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
