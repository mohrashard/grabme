import { registrationRateLimit, loginRateLimit, adminRateLimit } from '@/app/lib/rateLimit';

// Since rateLimit.ts exports configured RateLimit instances, we just verify they exist 
// and have the expected configuration conceptually. Actual rate limit testing requires Redis.

describe('Rate Limiting Utility', () => {
  it('registrationRatelimit is exported', () => {
    expect(registrationRateLimit).toBeDefined();
    expect(typeof registrationRateLimit.limit).toBe('function');
  });

  it('loginRatelimit is exported', () => {
    expect(loginRateLimit).toBeDefined();
    expect(typeof loginRateLimit.limit).toBe('function');
  });

  it('adminRateLimit is exported', () => {
    expect(adminRateLimit).toBeDefined();
    expect(typeof adminRateLimit.limit).toBe('function');
  });
});
