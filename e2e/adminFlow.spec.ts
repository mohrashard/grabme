import { test, expect } from '@playwright/test';

test.describe('Admin Flow E2E', () => {
  test('Admin cannot access /admin without login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('Admin login with wrong password', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@grabme.lk');
    await page.fill('input[type="password"]', 'totally-wrong');
    await page.click('button:has-text("Enter Ops Center")');
    
    await expect(page.locator('text=Incorrect credentials')).toBeVisible();
  });
});
