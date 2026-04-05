import { verifyAdminAction } from '@/app/admin/actions/authActions';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { cookies, headers } from 'next/headers';
import { supabaseAdmin } from '@/app/lib/supabaseServer';
import { adminRateLimit } from '@/app/lib/rateLimit';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
  headers: jest.fn(),
}));

jest.mock('@/app/lib/supabaseServer', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

jest.mock('@/app/lib/rateLimit', () => ({
  adminRateLimit: {
    limit: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt-token'),
  })),
}));

describe('verifyAdminAction', () => {
  const mockSetCookie = jest.fn();
  const mockHeadersGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (cookies as jest.Mock).mockReturnValue({
      set: mockSetCookie,
    });
    
    (headers as jest.Mock).mockReturnValue({
      get: mockHeadersGet.mockReturnValue('127.0.0.1'),
    });

    (adminRateLimit.limit as jest.Mock).mockResolvedValue({ success: true, pending: Promise.resolve(), limit: 3, remaining: 2, reset: 0 });
    
    process.env.ADMIN_EMAIL = 'admin@grabme.lk';
    process.env.ADMIN_PASSWORD_HASH = '$2a$10$XxxMockHashXxx';
    process.env.ADMIN_JWT_SECRET = 'supersecretjwtkey';
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.ADMIN_JWT_SECRET;
  });

  it('Correct credentials -> returns token + sets HttpOnly cookie', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    
    const result = await verifyAdminAction('admin@grabme.lk', 'correctpassword');
    
    expect(result.success).toBe(true);
    expect(mockSetCookie).toHaveBeenCalledWith(
      'admin_session',
      'mock-jwt-token',
      expect.objectContaining({
        httpOnly: true,
        secure: false, // in development
        sameSite: 'lax',
      })
    );
  });

  it('Wrong password -> returns "Incorrect credentials. Please try again."', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    
    const result = await verifyAdminAction('admin@grabme.lk', 'wrongpassword');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Incorrect credentials. Please try again.');
  });

  it('User not found -> returns SAME "Incorrect credentials. Please try again."', async () => {
    const result = await verifyAdminAction('wrong_email@grabme.lk', 'anypassword');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Incorrect credentials. Please try again.');
    // Ensure bcrypt is NOT called if email mismatches to save CPU, but error is identical
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('Empty email -> validation error before DB hit', async () => {
    const result = await verifyAdminAction('', 'password');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Auth system misconfigured');
  });

  it('Empty password -> validation error before DB hit', async () => {
    const result = await verifyAdminAction('admin@grabme.lk', '');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Auth system misconfigured');
  });

  it('Rate limit exceeded -> returns rate limit error', async () => {
    (adminRateLimit.limit as jest.Mock).mockResolvedValue({ success: false });
    
    const result = await verifyAdminAction('admin@grabme.lk', 'password');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Too many login attempts. Please wait 30 minutes.');
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('JWT secret missing from env -> throws server error safely', async () => {
    delete process.env.ADMIN_JWT_SECRET;
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    
    const result = await verifyAdminAction('admin@grabme.lk', 'correctpassword');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Something went wrong. Please try again.');
  });
});
