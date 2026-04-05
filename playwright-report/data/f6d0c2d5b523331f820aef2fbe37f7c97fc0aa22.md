# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adminFlow.spec.ts >> Admin Flow E2E >> Admin login with wrong password
- Location: e2e\adminFlow.spec.ts:9:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="email"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img "Grab Me" [ref=e6]
      - generic [ref=e7]:
        - paragraph [ref=e8]: Grab Me
        - paragraph [ref=e9]: Admin Access
    - generic [ref=e10]:
      - generic [ref=e11]:
        - img [ref=e13]
        - heading "Ops Center" [level=1] [ref=e16]
        - paragraph [ref=e17]: Restricted Access
      - generic [ref=e18]:
        - generic [ref=e19]:
          - text: Admin Email
          - textbox "admin@grabme.lk" [ref=e20]
        - generic [ref=e21]:
          - text: Password
          - textbox "••••••••" [ref=e22]
      - button "Enter Ops Center" [disabled] [ref=e23]:
        - text: Enter Ops Center
        - img [ref=e24]
    - paragraph [ref=e26]: Powered by Mr² Labs
  - contentinfo [ref=e27]:
    - generic [ref=e28]:
      - generic [ref=e29]:
        - img "Grab Me" [ref=e31]
        - generic [ref=e32]: Grab Me
      - navigation [ref=e33]:
        - link "Terms" [ref=e34] [cursor=pointer]:
          - /url: /terms
        - link "Privacy" [ref=e35] [cursor=pointer]:
          - /url: /privacy
        - link "Conduct" [ref=e36] [cursor=pointer]:
          - /url: /conduct
        - link "Directory" [ref=e37] [cursor=pointer]:
          - /url: /browse
      - generic [ref=e38]: © 2026 Mr² Labs
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e44] [cursor=pointer]:
    - img [ref=e45]
  - alert [ref=e48]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Flow E2E', () => {
  4  |   test('Admin cannot access /admin without login', async ({ page }) => {
  5  |     await page.goto('/admin');
  6  |     await expect(page).toHaveURL(/\/admin\/login/);
  7  |   });
  8  | 
  9  |   test('Admin login with wrong password', async ({ page }) => {
  10 |     await page.goto('/admin/login');
> 11 |     await page.fill('input[name="email"]', 'admin@grabme.lk');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  12 |     await page.fill('input[name="password"]', 'totally-wrong');
  13 |     await page.click('button[type="submit"]');
  14 |     
  15 |     await expect(page.locator('text=Incorrect credentials')).toBeVisible();
  16 |   });
  17 | });
  18 | 
```