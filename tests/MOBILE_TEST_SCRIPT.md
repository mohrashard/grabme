# Manual Mobile Device Audit (Budget Android — Moto G4 / 3G)

## Pre-requisites
- Open Chrome DevTools (F12)
- Toggle Device Toolbar (Ctrl+Shift+M)
- Select **Moto G4** (360x640)
- In the Network tab, set Throttling to **Fast 3G**

## Test Execution Matrix

### 1. Global Checks (Applies to all pages)
- [ ] NO horizontal scrolling occurs at 360px width.
- [ ] All typography remains readable (min 14px size, no clipping).
- [ ] All interactive areas (buttons, links) possess a tap target area of at least 44x44px.
- [ ] Mobile virtual keyboard invocation does NOT break sticky navigation bars or overlap form inputs permanently.

### 2. Page: `/` (Home)
- [ ] Hero text fits completely on screen.
- [ ] Call to action buttons are above the fold or immediately obvious.

### 3. Page: `/browse` 
- [ ] Filter dropdowns stack vertically or flex efficiently without squishing options.
- [ ] Worker cards display symmetrically, text bounds are respected for long bios.
- [ ] Lazy loading triggers gracefully on 3G (no CLS jank when avatars pop in).

### 4. Page: `/worker/[id]` (Profile)
- [ ] Main avatar does not exceed viewport width.
- [ ] "Contact via WhatsApp" button is sticky or placed prominently above the fold.
- [ ] Trust badges scale cleanly on narrow screens.

### 5. Flow: Registration Wizard `/register`
- [ ] **Step 1:** Form fields readable, phone number numpad opens native `tel` keyboard.
- [ ] **Step 2:** File upload UI is usable via mobile touch (native system file picker opens).
- [ ] On fast 3G, uploading 4 heavy images (camera shots) does not crash the browser tab (compression chunking).
- [ ] Complete 6-step flow must physically take less than 5 minutes total.

### 6. Flow: Login (`/login`, `/admin/login`)
- [ ] Rate limit error toasts are legible and wrap appropriately.
- [ ] Password field reveal toggle is easy to tap without hitting "submit".
