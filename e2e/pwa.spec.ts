import { test, expect } from '@playwright/test';

test.describe('PWA Validation', () => {
  test('manifest.json returns 200 with correct content-type', async ({ request }) => {
    const response = await request.get('/manifest.json');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    
    const manifest = await response.json();
    expect(manifest.name).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('Icons exist at expected paths', async ({ request }) => {
    const response192 = await request.get('/icon-192x192.png');
    expect(response192.status()).toBe(200);
    expect(response192.headers()['content-type']).toContain('image/png');
  });
});
