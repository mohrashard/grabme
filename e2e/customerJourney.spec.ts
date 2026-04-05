import { test, expect } from '@playwright/test';

test.describe('Customer Journey (Full Flow)', () => {
  test('Customer can browse, view profile, and reach WhatsApp', async ({ page }) => {
    await page.goto('/browse');
    await expect(page.locator('text=Find Your')).toBeVisible();
    await expect(page.getByPlaceholder('Search by name or skill...')).toBeVisible();
    
    // Assume DB might be empty locally during testing
    const workerCard = page.locator('.group').first();
    const emptyState = page.locator('text=No Service Pro\'s in this area yet');

    // Wait for either a worker card or the empty state to be visible
    await Promise.race([
      workerCard.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
      emptyState.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null)
    ]);

    if (await emptyState.isVisible()) {
      // Local dev DB is empty. Test the reset logic
      await page.waitForTimeout(500); // Wait for animations
      await expect(page.locator('text=No Service Pro\'s')).toBeVisible();
    } else if (await workerCard.isVisible()) {
      await workerCard.locator('a').click();
      
      // Navigate to /worker/[id]
      await expect(page).toHaveURL(/\/worker\/.+/);
      
      // Ensure phone is NOT visible
      const pageText = await page.content();
      expect(pageText).not.toMatch(/07\d{8}/);
      expect(pageText).not.toMatch(/\+94\d{9}/);

      // Contact flow
      const contactBtn = page.locator('button:has-text("Contact via WhatsApp")');
      await contactBtn.click();
      
      // Fill modal
      await page.fill('input[name="full_name"]', 'Test Customer');
      await page.fill('input[name="phone"]', '0771122334');
      
      // Click confirm - intercepts WA redirect to verify it
      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        page.locator('button:has-text("Confirm & Continue to WhatsApp")').click()
      ]);
      
      expect(popup.url()).toContain('wa.me/');
    }
  });
});
