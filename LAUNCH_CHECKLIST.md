# 🚀 GRAB ME PWA — FINAL LAUNCH CHECKLIST

This is your final Go / No-Go protocol. **Do not share the grabme.lk link until every single box is checked.**

---

### Phase 1: Environment & DNS Verification
- [ ] **Vercel Production Env Variables Verified:**
  - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (Database admin override token)
  - `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`
  - `ADMIN_JWT_SECRET` (Secure 32+ char string)
  - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (Rate limiting)
  - `NEXT_PUBLIC_SITE_URL` (Set to `https://grabme.lk`)
- [ ] **Custom Domain Verified:** `grabme.lk` resolves perfectly on mobile data (no SSL warnings).
- [ ] **SEO Visibility:** Check `grabme.lk/robots.txt` and `grabme.lk/sitemap.xml` load properly.

### Phase 2: Live Database Sanity Check
- [ ] Test Database rows purged (No fake test workers in the production UI).
- [ ] Supabase Storage instances (`avatars` & `worker-documents`) are completely empty.
- [ ] Supabase Analytics / Logs show zero unauthorized RLS breaches. 

### Phase 3: The Golden Path Tests (Run on your personal phone)
- [ ] Open `grabme.lk` on your mobile data (turn off WiFi). Wait for it to load.
- [ ] Formally register **Worker #1** (e.g., yourself or a known friendly electrician).
  - Verify you can easily tap all fields.
  - Verify the camera uploads the NIC/Selfie flawlessly.
- [ ] Log into the Ops Center (`/admin/login`).
  - Verify you can see Worker #1.
  - Click **Activate**. Verify it triggers the automated WhatsApp message to their phone.
- [ ] Open `grabme.lk/browse` in a fresh incognito tab. 
  - Verify **Worker #1** appears cleanly.
  - Do a test search to filter them. 
- [ ] **The Critical Customer Flow:** Click "Contact via WhatsApp" on that worker.
  - Enter your details as a Customer.
  - Hit Confirm. Verify your WhatsApp opens with the pre-filled lead message targeted exactly to the Worker.

### Phase 4: Security Confirmations
- [ ] Try navigating to `grabme.lk/admin` without being logged in. You MUST be redirected to login.
- [ ] Try submitting the admin login with wrong credentials 5 times. You MUST receive the `Too many login attempts` cooldown message.
- [ ] Hit the `/browse` API or network tab. Verify no phone numbers or NICs leak into the public client payload.

### Phase 5: Commencing Operations
- [ ] **Draft the Announcement Message:** Keep it under 5 lines. Clear value prop (Zero fees, verified pros).
- [ ] **Send the First Ping:** Dispatch the WhatsApp broadcast to your initial seed group.
- [ ] **Monitor:** Keep the `/admin` dashboard open on your desktop to watch the first 10 organic registrations roll in!

---
*Checked off? Turn the lights on. Let's make Sri Lanka work.*
