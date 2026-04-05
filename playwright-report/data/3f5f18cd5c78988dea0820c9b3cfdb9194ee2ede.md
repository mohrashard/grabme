# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customerJourney.spec.ts >> Customer Journey (Full Flow) >> Customer can browse, view profile, and reach WhatsApp
- Location: e2e\customerJourney.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.group').first().locator('a')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - link "Grab Me Grab Me" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "Grab Me" [ref=e7]
        - generic [ref=e8]: Grab Me
    - main [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]:
          - heading "Find Your Service Hero." [level=1] [ref=e12]:
            - text: Find Your
            - text: Service Hero.
          - paragraph [ref=e13]: Browse verified home workers across Sri Lanka. High trust, zero commission.
        - generic [ref=e14]:
          - generic [ref=e15]:
            - img [ref=e16]
            - textbox "Search by name or skill..." [ref=e19]
          - generic [ref=e20]:
            - combobox [ref=e21]:
              - option "All Services" [selected]
              - option "Electrician (වයරින් බාස්)"
              - option "Plumber (බට බාස් / ප්ලම්බර්)"
              - option "AC & Fridge Repair (ඒසී / ෆ්‍රිජ් වැඩ)"
              - option "Carpenter (වඩු බාස්)"
              - option "Mason (මේසන් බාස්)"
              - option "Painter (පේන්ට් බාස්)"
              - option "Aluminium & Glass (ඇලුමිනියම් / වීදුරු වැඩ)"
              - option "Welder (වැල්ඩින් / යකඩ වැඩ)"
              - option "Cleaner / Helper (ක්ලීනර් / අත් උදව්කරුවන්)"
              - option "Handyman (සුළු අලුත්වැඩියා වැඩ)"
              - option "Vehicle Mechanic (වාහන මිකැනික්)"
              - option "Other (වෙනත්)"
            - combobox [ref=e22]:
              - option "All Districts" [selected]
              - option "Ampara"
              - option "Anuradhapura"
              - option "Badulla"
              - option "Batticaloa"
              - option "Colombo"
              - option "Galle"
              - option "Gampaha"
              - option "Hambantota"
              - option "Jaffna"
              - option "Kalutara"
              - option "Kandy"
              - option "Kegalle"
              - option "Kilinochchi"
              - option "Kurunegala"
              - option "Mannar"
              - option "Matale"
              - option "Matara"
              - option "Moneragala"
              - option "Mullaitivu"
              - option "Nuwara Eliya"
              - option "Polonnaruwa"
              - option "Puttalam"
              - option "Ratnapura"
              - option "Trincomalee"
              - option "Vavuniya"
            - button "Auto-detect my district" [ref=e23]:
              - img [ref=e24]
      - generic [ref=e26]:
        - paragraph [ref=e27]: Showing 2 Verified Partners
        - generic [ref=e28]:
          - button [ref=e29]:
            - img [ref=e30]
          - button [ref=e35]:
            - img [ref=e36]
      - generic [ref=e37]:
        - generic [ref=e38]:
          - generic [ref=e39]:
            - generic [ref=e40]:
              - img "KMM Zeeth" [ref=e42]
              - img [ref=e44]
            - generic [ref=e47]:
              - heading "KMM Zeeth" [level=3] [ref=e49]
              - generic [ref=e50]:
                - generic [ref=e51]: Handyman (සුළු අලුත්වැඩියා වැඩ)
                - generic [ref=e52]: •
                - generic [ref=e53]: 6 Years Exp
          - paragraph [ref=e54]: i want something do please help me
          - generic [ref=e55]:
            - generic [ref=e57]:
              - img [ref=e58]
              - text: Galle
            - link "View Profile & Connect" [ref=e61] [cursor=pointer]:
              - /url: /worker/be51f4ec-b20f-402a-9800-ee706ce46078
              - generic [ref=e62]:
                - img [ref=e63]
                - text: View Profile & Connect
              - img [ref=e65]
        - generic [ref=e67]:
          - generic [ref=e68]:
            - generic [ref=e69]:
              - img "Mohamed Rashard Rizmi" [ref=e71]
              - img [ref=e73]
            - generic [ref=e76]:
              - heading "Mohamed Rashard Rizmi" [level=3] [ref=e78]
              - generic [ref=e79]:
                - generic [ref=e80]: AC & Fridge Repair (ඒසී / ෆ්‍රිජ් වැඩ)
                - generic [ref=e81]: •
                - generic [ref=e82]: 3 Years Exp
          - paragraph [ref=e83]: i do ac with my mouth and everything
          - generic [ref=e84]:
            - generic [ref=e86]:
              - img [ref=e87]
              - text: Colombo
            - link "View Profile & Connect" [ref=e90] [cursor=pointer]:
              - /url: /worker/259ebebd-3b26-4ecd-afcc-81ff1ebe3c84
              - generic [ref=e91]:
                - img [ref=e92]
                - text: View Profile & Connect
              - img [ref=e94]
      - generic [ref=e96]:
        - generic [ref=e97]:
          - img [ref=e99]
          - img [ref=e103]
          - img [ref=e107]
          - img [ref=e111]
          - img [ref=e115]
        - generic [ref=e118]:
          - heading "Safe. Verified. Locally Managed." [level=3] [ref=e119]
          - paragraph [ref=e120]: Unlike marketplace giants, we verify every single partner manually. High trust, zero commission.
  - contentinfo [ref=e121]:
    - generic [ref=e122]:
      - generic [ref=e123]:
        - img "Grab Me" [ref=e125]
        - generic [ref=e126]: Grab Me
      - navigation [ref=e127]:
        - link "Terms" [ref=e128] [cursor=pointer]:
          - /url: /terms
        - link "Privacy" [ref=e129] [cursor=pointer]:
          - /url: /privacy
        - link "Conduct" [ref=e130] [cursor=pointer]:
          - /url: /conduct
        - link "Directory" [ref=e131] [cursor=pointer]:
          - /url: /browse
      - generic [ref=e132]: © 2026 Mr² Labs
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e138] [cursor=pointer]:
    - img [ref=e139]
  - alert [ref=e142]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Customer Journey (Full Flow)', () => {
  4  |   test('Customer can browse, view profile, and reach WhatsApp', async ({ page }) => {
  5  |     await page.goto('/browse');
  6  |     await expect(page.locator('text=Find Your')).toBeVisible();
  7  |     await expect(page.getByPlaceholder('Search by name or skill...')).toBeVisible();
  8  |     
  9  |     // Assume DB is populated for E2E
  10 |     const workerCard = page.locator('.group').first();
  11 |     if (await workerCard.isVisible()) {
> 12 |       await workerCard.locator('a').click();
     |                                     ^ Error: locator.click: Test timeout of 30000ms exceeded.
  13 |       
  14 |       // Navigate to /worker/[id]
  15 |       await expect(page).toHaveURL(/\/worker\/.+/);
  16 |       
  17 |       // Ensure phone is NOT visible
  18 |       const pageText = await page.content();
  19 |       expect(pageText).not.toMatch(/07\d{8}/);
  20 |       expect(pageText).not.toMatch(/\+94\d{9}/);
  21 | 
  22 |       // Contact flow
  23 |       const contactBtn = page.locator('button:has-text("Contact via WhatsApp")');
  24 |       await contactBtn.click();
  25 |       
  26 |       // Fill modal
  27 |       await page.fill('input[name="full_name"]', 'Test Customer');
  28 |       await page.fill('input[name="phone"]', '0771122334');
  29 |       
  30 |       // Click confirm - intercepts WA redirect to verify it
  31 |       const [popup] = await Promise.all([
  32 |         page.waitForEvent('popup'),
  33 |         page.locator('button:has-text("Confirm & Continue to WhatsApp")').click()
  34 |       ]);
  35 |       
  36 |       expect(popup.url()).toContain('wa.me/');
  37 |     }
  38 |   });
  39 | });
  40 | 
```