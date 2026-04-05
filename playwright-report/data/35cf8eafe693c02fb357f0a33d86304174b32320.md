# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workerRegistration.spec.ts >> Worker Registration Full Flow >> Worker registration blocks on invalid Sri Lanka phone
- Location: e2e\workerRegistration.spec.ts:21:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="full_name"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e4]:
        - link "Grab Me Grab Me" [ref=e5] [cursor=pointer]:
          - /url: /
          - img "Grab Me" [ref=e7]
          - generic [ref=e8]: Grab Me
        - link "Back to Home" [ref=e9] [cursor=pointer]:
          - /url: /
    - generic [ref=e11]:
      - generic [ref=e13]:
        - generic [ref=e14]:
          - img [ref=e16]
          - heading "Partner Portal" [level=1] [ref=e19]
          - paragraph [ref=e20]: Phase 1 of 6
        - generic [ref=e21]:
          - button "1" [ref=e22]:
            - generic [ref=e23]: "1"
          - button "2" [ref=e24]:
            - generic [ref=e25]: "2"
          - button "3" [ref=e26]:
            - generic [ref=e27]: "3"
          - button "4" [ref=e28]:
            - generic [ref=e29]: "4"
          - button "5" [ref=e30]:
            - generic [ref=e31]: "5"
          - button "6" [ref=e32]:
            - generic [ref=e33]: "6"
      - generic [ref=e36]:
        - generic [ref=e37]:
          - generic [ref=e38]:
            - heading "Identity Basics" [level=2] [ref=e39]
            - paragraph [ref=e40]: Tell us who you are. Matches NIC exactly.
          - generic [ref=e41]:
            - generic [ref=e42]:
              - text: Full Name (as per NIC)
              - textbox "As per NIC" [ref=e43]
              - paragraph [ref=e45]: Min 5 chars • Letters/Dots only
            - generic [ref=e46]:
              - text: WhatsApp Number
              - textbox "07x xxxxxxx" [ref=e47]
              - paragraph [ref=e49]: "SL format: 07x/947x • Used for verification"
            - generic [ref=e50]:
              - text: Email Address (Portal ID)
              - textbox "partner@email.com" [ref=e51]
              - paragraph [ref=e53]: Standard email • Used for secure login
            - generic [ref=e54]:
              - text: Portal Password
              - textbox "••••••••" [ref=e55]
              - paragraph [ref=e57]: 8+ chars • Uppercase + Number + Special
            - generic [ref=e58]:
              - text: NIC Number
              - textbox "e.g. 92xxxxxxxV" [ref=e59]
              - paragraph [ref=e61]: Old (9+V/X) or New (12 digits)
            - generic [ref=e62]:
              - text: Emergency Contact (WA)
              - textbox "Relative's WhatsApp" [ref=e63]
              - paragraph [ref=e65]: Family or friend WhatsApp number
            - generic [ref=e66]:
              - text: Date of Birth
              - textbox [ref=e67]
              - paragraph [ref=e69]: Must match birth year in NIC
            - generic [ref=e70]:
              - text: Home Address
              - textbox "Current residence address" [ref=e71]
              - paragraph [ref=e73]: Full address required for trust verification
        - button "Next Phase" [disabled] [ref=e75]:
          - text: Next Phase
          - img [ref=e76]
    - contentinfo [ref=e78]:
      - generic [ref=e79]:
        - generic [ref=e81]:
          - generic [ref=e82]:
            - img "Logo" [ref=e83]
            - generic [ref=e84]: Grab Me
          - paragraph [ref=e85]: Sri Lanka's Preferred Home Service Network
        - generic [ref=e86]:
          - generic [ref=e87]: © 2026 Grab Me Logic (Pvt) Ltd.
          - generic [ref=e88]: Powered by Mr² Labs
          - generic [ref=e91]: Colombo · South Asia
  - contentinfo [ref=e92]:
    - generic [ref=e93]:
      - generic [ref=e94]:
        - img "Grab Me" [ref=e96]
        - generic [ref=e97]: Grab Me
      - navigation [ref=e98]:
        - link "Terms" [ref=e99] [cursor=pointer]:
          - /url: /terms
        - link "Privacy" [ref=e100] [cursor=pointer]:
          - /url: /privacy
        - link "Conduct" [ref=e101] [cursor=pointer]:
          - /url: /conduct
        - link "Directory" [ref=e102] [cursor=pointer]:
          - /url: /browse
      - generic [ref=e103]: © 2026 Mr² Labs
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e109] [cursor=pointer]:
    - img [ref=e110]
  - alert [ref=e113]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Worker Registration Full Flow', () => {
  4  |   test('Worker can complete full 6-step registration', async ({ page }) => {
  5  |     await page.goto('/register');
  6  |     
  7  |     // Step 1: Account
  8  |     await page.fill('input[name="full_name"]', 'Test Worker');
  9  |     await page.fill('input[name="phone"]', '0779998888');
  10 |     await page.fill('input[name="nic_number"]', '199012345678');
  11 |     await page.fill('input[name="password"]', 'SecurePass123!');
  12 |     await page.locator('button:has-text("Next")').first().click();
  13 | 
  14 |     // Verification step check
  15 |     await expect(page.locator('text=Profile Photo')).toBeVisible();
  16 |     
  17 |     // Skipping full upload intercepts for pure E2E demo
  18 |     // The rest of the wizard navigation logic goes here
  19 |   });
  20 | 
  21 |   test('Worker registration blocks on invalid Sri Lanka phone', async ({ page }) => {
  22 |     await page.goto('/register');
> 23 |     await page.fill('input[name="full_name"]', 'Test Worker');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  24 |     await page.fill('input[name="phone"]', '123456'); // invalid
  25 |     await page.fill('input[name="password"]', 'SecurePass123!');
  26 |     await page.locator('button:has-text("Next")').first().click();
  27 |     
  28 |     await expect(page.locator('text=Enter a valid Sri Lankan phone')).toBeVisible();
  29 |   });
  30 | });
  31 | 
```