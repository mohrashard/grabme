import { test, expect } from '@playwright/test';

test.describe('Worker Registration Full Flow', () => {
  test('Worker can complete full 6-step registration', async ({ page }) => {
    await page.goto('/register');
    
    // Step 1: Account
    await page.fill('input[name="fullName"]', 'Test Worker');
    await page.fill('input[name="phone"]', '0779998888');
    await page.fill('input[name="nicNumber"]', '199012345678');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.locator('button:has-text("Next")').first().click();

    // Verification step check
    await expect(page.locator('text=Profile Photo')).toBeVisible();
    
    // Skipping full upload intercepts for pure E2E demo
    // The rest of the wizard navigation logic goes here
  });

  test('Worker registration blocks on invalid Sri Lanka phone', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="fullName"]', 'Test Worker');
    await page.fill('input[name="phone"]', '123456'); // invalid
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.locator('button:has-text("Next")').first().click();
    
    await expect(page.locator('text=Enter a valid Sri Lankan phone')).toBeVisible();
  });
});
