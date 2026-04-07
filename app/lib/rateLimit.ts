import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * SECURE: Distributed Rate Limiter (Upstash Redis)
 * Persists across Vercel cold starts and serverless instances.
 * 
 * LIMIT: 5 attempts per 1 hour window per IP.
 */
export const registrationRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: false,
})

/**
 * LIMIT: 5 attempts per 15 minutes window per IP.
 */
export const loginRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: false,
})

/**
 * LIMIT: 3 attempts per 30 minutes window per IP.
 */
export const adminRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, '30 m'),
    analytics: false,
})
