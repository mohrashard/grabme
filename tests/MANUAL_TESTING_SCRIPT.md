# Complete Manual Testing Script for Grab Me PWA

DEVICE SETUP REQUIRED BEFORE STARTING:

Tester 1 — Budget Android simulation:
- Chrome DevTools → Moto G4 → 3G Fast throttling → 360px viewport

Tester 2 — Real device (if available):
- Any Android phone under Rs. 20,000
- Chrome browser
- Mobile data (not WiFi) to simulate real user conditions

---

MANUAL TEST SUITE — RUN IN THIS EXACT ORDER:

## SESSION 1: CUSTOMER JOURNEY (30 mins)

### Test C-01: First Impression
1. Open grabme.lk in fresh incognito window
2. You have 5 seconds — does it immediately communicate what the app does?
   PASS: Clear headline, visible worker cards or CTA
   FAIL: Blank screen, confusing layout, loading forever

### Test C-02: Browse Page
1. Go to /browse
2. Check: Worker cards visible with photo, name, trade, district
3. Check: No phone numbers visible anywhere on the page
4. Check: Page usable with one thumb on a phone
5. Check: Filter/search works (if present)
6. Scroll to bottom — check: pagination or load more exists
   PASS: Clean cards, no sensitive data, mobile friendly
   FAIL: Any phone number visible, horizontal scroll, broken layout

### Test C-03: Worker Profile
1. Click any worker card
2. Check: Profile loads under 3 seconds on 3G
3. Check: Photos visible and not broken
4. Check: Trade, experience, district, verification badges visible
5. Check: NO phone number, NIC, email visible anywhere
6. Check: WhatsApp button visible WITHOUT scrolling on mobile
7. Right-click → View Page Source → Ctrl+F "phone" → should find ZERO instances
   PASS: All above checks clear
   FAIL: Any sensitive data in page source

### Test C-04: WhatsApp Contact Flow
1. Click the WhatsApp contact button
2. Check: Lead capture modal appears (name + phone fields)
3. Fill in: Name = "Test Customer", Phone = "0771234567"
4. Click confirm
5. Check: WhatsApp opens with pre-filled message to correct number
6. Check: The number in WhatsApp is the WORKER's contact (not admin)
   PASS: WhatsApp opens correctly
   FAIL: Wrong number, modal skipped, error shown

### Test C-05: Customer Registration
1. Go to /customer/register
2. Check: Only 3 fields — name, phone, district (nothing else)
3. Try submitting empty → check: friendly error messages
4. Try phone = "123" → check: Sri Lanka format error shown
5. Fill correctly → submit
6. Check: Success message explains what happens next
   PASS: Minimal form, friendly errors, clear success
   FAIL: Too many fields, technical errors, blank success screen

---

## SESSION 2: WORKER REGISTRATION (45 mins)

### Test W-01: Step Navigation
1. Go to /register
2. Check: Progress indicator shows "Step 1 of 6"
3. Check: Back button visible from Step 2 onwards
4. Fill Step 1 completely
5. Go to Step 2, then click Back
6. Check: Step 1 data is still filled in
   PASS: Progress shown, back works, data preserved
   FAIL: Data lost on back, no progress indicator

### Test W-02: Phone Validation
1. In Step 1 phone field, try these values one by one:
   - "123456" → FAIL expected: "Phone must start with 07 or +94"
   - "07712345" → FAIL expected: too short
   - "0771234567" → PASS expected
   - "+94771234567" → PASS expected
   - "94771234567" → check behavior (should this pass?)
2. Record exact error messages shown for each
   PASS: All Sri Lankan format rules enforced with clear messages
   FAIL: Technical error, wrong format accepted, no message

### Test W-03: NIC Validation
1. Try old format: "123456789V" → should be accepted
2. Try new format: "200012345678" → should be accepted  
3. Try invalid: "ABCDEFGH" → should be rejected with friendly message
4. Try duplicate NIC (register twice with same NIC) → should be rejected
   PASS: Both formats accepted, invalid rejected, duplicate blocked
   FAIL: Valid NIC rejected, duplicate allowed

### Test W-04: Photo Upload (Step 2)
1. Try uploading a .pdf file as profile photo
   Check: Rejected with friendly message
2. Try uploading a file over 5MB
   Check: Rejected with size error
3. Upload valid JPG under 5MB
   Check: Preview shown, upload progress visible
4. Check: Camera option available on mobile (not just file picker)
   PASS: Wrong types blocked, valid upload works, camera accessible
   FAIL: PDF accepted, no size limit, no preview

### Test W-05: GPS Location (Step 4)
1. When GPS prompt appears, check: explanation shown before browser asks
2. Click Allow
3. Check: Location detected and district auto-filled
4. Click Deny
5. Check: Manual district dropdown appears (not a broken state)
   PASS: Both GPS and manual work, no broken state
   FAIL: Blank screen on deny, no explanation before prompt

### Test W-06: Full Registration Completion
1. Complete all 6 steps with valid data
2. Step 6: Read code of conduct — check: readable, not legal jargon
3. Submit
4. Check: Success screen explains:
   - "Your application is under review"
   - "We will contact you on WhatsApp"
   - Expected wait time mentioned
5. Check: WhatsApp notification sent to admin
   PASS: Clear success, correct next steps explained
   FAIL: Generic "success", no explanation of what happens next

---

## SESSION 3: WORKER LOGIN + DASHBOARD (20 mins)

### Test WL-01: Login Methods
1. Go to /login
2. Login with email → check: works
3. Logout, login with phone number → check: works
4. Logout, login with NIC → check: works
   PASS: All 3 methods work
   FAIL: Any method fails

### Test WL-02: Wrong Password
1. Enter correct email + wrong password
2. Check EXACT message shown — must be:
   "Incorrect credentials. Please try again."
3. Enter non-existent email + any password
4. Check: SAME exact message (not "user not found")
   PASS: Identical message for both cases
   FAIL: Different messages reveal which field is wrong

### Test WL-03: Rate Limiting
1. Enter wrong password 5 times in a row
2. Check: Rate limit message appears on attempt 6
3. Check: Message is friendly (not "429 Too Many Requests")
4. Check: Message tells user how long to wait
   PASS: Blocked at 6th attempt, friendly message with wait time
   FAIL: Never blocked, technical error code shown

### Test WL-04: Dashboard
1. Login with approved worker account
2. Check: Account status displayed clearly
3. Check: Profile photo shown
4. Check: Trade and district shown
5. Check: No sensitive data (NIC, password) visible
6. Go offline (DevTools → Network → Offline)
7. Refresh dashboard
8. Check: Graceful message, not white screen
   PASS: Status clear, no sensitive data, offline handled
   FAIL: White screen offline, sensitive data visible

---

## SESSION 4: ADMIN PANEL (20 mins)

### Test A-01: Access Control
1. Open incognito window
2. Try to navigate directly to /admin
3. Check: Immediately redirected to /admin/login
4. Try to navigate to /admin/workers
5. Check: Same redirect
   PASS: All /admin/* routes redirect to login
   FAIL: Any admin page loads without login

### Test A-02: Admin Login Security
1. Go to /admin/login
2. Try wrong password 3 times
3. Check: Blocked on 4th attempt (stricter than worker login)
4. Check: Friendly rate limit message
   PASS: Blocked at 4th, friendly message
   FAIL: Not blocked, or blocked too late

### Test A-03: Pending Worker Queue
1. Login as admin
2. Check: Pending workers visible in queue
3. Click on a pending worker
4. Check: NIC front and back photos visible for comparison
5. Check: Signed URL used (URL contains "token=" parameter)
6. Check: Cannot guess/access NIC photos without being logged in as admin
   PASS: NIC visible in admin, not accessible publicly
   FAIL: NIC photos accessible without admin login

### Test A-04: Approve + Verify on Browse
1. Approve a pending worker
2. Open a new incognito window
3. Go to /browse
4. Check: Approved worker now visible
5. Back in admin, reject a different worker
6. Check: Rejected worker NOT visible on /browse
   PASS: Approval reflects instantly on browse
   FAIL: Worker visible before approval, or not visible after

### Test A-05: Analytics
1. Check: Analytics page loads without error
2. Check: KPI cards show real numbers (not 0 for everything if data exists)
3. Check: No /admin/analytics dead link
   PASS: Analytics loads, shows data
   FAIL: Dead link, 404, or blank data

---

## SESSION 5: SECURITY SPOT CHECKS (15 mins)

### Test S-01: View Source Check
On /browse page:
1. Right-click → View Page Source
2. Ctrl+F search for: "phone", "nic", "password", "ADMIN", "whatsapp", "secret"
3. Check: NONE of these appear with actual values
   PASS: No sensitive data in page source
   FAIL: Any real value found

### Test S-02: Network Tab Check
1. Open DevTools → Network tab
2. Browse the site normally (browse, view profile, contact)
3. Check every API response and page response
4. Confirm: No phone numbers, NIC numbers, or admin numbers in any response
   PASS: Clean responses
   FAIL: Any sensitive field in network response

### Test S-03: Cookie Check
1. DevTools → Application → Cookies
2. Check: grabme_admin_token cookie has HttpOnly = true, Secure = true
3. Check: No JWT visible in localStorage or sessionStorage
4. Try: document.cookie in browser console → admin token should NOT appear
   PASS: HttpOnly confirmed, not accessible via JS
   FAIL: Cookie accessible via JavaScript

### Test S-04: robots.txt
1. Go to grabme.lk/robots.txt
2. Check: /admin is in Disallow list
3. Check: /browse and /worker/* are allowed
   PASS: Admin blocked from crawlers
   FAIL: Admin missing from disallow

---

## SESSION 6: MOBILE UX FINAL CHECK (20 mins)

Use real Android phone or DevTools Moto G4 360px:

### Test M-01: Thumb Zone Test
Every interactive element on these pages must be reachable 
with right thumb without repositioning phone:
- /browse — filter, worker cards, scroll
- /worker/[id] — WhatsApp button MUST be in thumb zone
- /register Step 1 — all inputs reachable
- /login — email, password, submit button
   PASS: All key actions in thumb zone
   FAIL: WhatsApp button or submit buried at top

### Test M-02: Keyboard Overlap Test
1. On /register Step 1, tap into email field
2. On-screen keyboard appears
3. Check: Form doesn't break, submit button still reachable
4. Repeat for /login and /customer/register
   PASS: Layout adjusts, no elements hidden under keyboard
   FAIL: Submit button hidden, cannot dismiss keyboard

### Test M-03: Slow Connection Test
1. DevTools → Network → Slow 3G
2. Click through customer journey
3. Check: Loading states visible (spinner/skeleton) on every wait
4. Check: No blank screens during loading
5. Check: Error shown if request fails (not silent failure)
   PASS: Loading states everywhere, graceful errors
   FAIL: Blank screen, silent failure, no loading indicator

### Test M-04: PWA Install Test
1. Open grabme.lk in Chrome Android (or simulated)
2. Check: "Add to Home Screen" prompt appears or is available in menu
3. Install it
4. Open from home screen
5. Check: Opens without browser chrome (fullscreen app feel)
6. Check: App icon correct (not generic Chrome icon)
   PASS: Installs, opens as standalone app, correct icon
   FAIL: No install prompt, opens in browser, wrong icon

---

## FINAL SIGN-OFF CHECKLIST

Before go-live, founder must personally confirm each:

- [ ] Worker #1 (electrician) registered and profile looks professional
- [ ] Worker #1 approved and visible on /browse
- [ ] Full customer journey tested on own phone end-to-end
- [ ] WhatsApp message received when customer clicks contact
- [ ] Admin panel accessible and functional
- [ ] grabme.lk loads fast on mobile data
- [ ] All env vars set in Vercel dashboard (not just local)
- [ ] Domain grabme.lk pointing to Vercel deployment
- [ ] robots.txt and sitemap.xml returning correctly

**ONLY AFTER ALL ABOVE ARE CHECKED → Share the link.**
