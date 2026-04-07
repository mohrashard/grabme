# GRAB ME — PROJECT RULES & FEATURE PRESERVATION DOCUMENT
**"THIS FILE IS THE LAW OF THIS PROJECT.
Read it before every change.
Update it after every change.
Never break what works.
Always ask before touching what is locked.
The founder built this in 29 hours. Respect the craft."**

## Version: 1.0 | Domain: grabme.page | Stack: Next.js 16, Supabase, Vercel, Upstash

---

## SECTION 1: THE PRIME DIRECTIVE

Rule 1: **Read this entire document before touching any file.**
Rule 2: **Never break a working feature to add a new one.**
Rule 3: **Show BEFORE + AFTER for every change, no exceptions.**
Rule 4: **If a change touches security — STOP and ask first.**
Rule 5: **If unsure — ask, don't assume.**

---

## SECTION 2: WORKING FEATURES — DO NOT BREAK

### [Worker Directory (Browse)]
- Status: WORKING ✅
- Files: `app/browse/page.tsx`, `app/browse/components/BrowsePageClient.tsx`, `app/lib/taxonomyActions.ts`
- What it does: Server-side rendering of active workers with client-side filtering, searching, and geolocation.
- What breaks if touched incorrectly: SEO visibility, location-based browsing, real-time filtering performance.
- Safe to modify: **ASK FIRST** (SEO sensitive)

### [Worker Profile]
- Status: WORKING ✅
- Files: `app/worker/[id]/page.tsx`, `app/worker/[id]/components/*`, `app/worker/[id]/actions/*`
- What it does: Public profile rendering with metadata, JSON-LD, and trust badges.
- What breaks if touched incorrectly: Individual profile SEO, WhatsApp contact flow, private data exposure.
- Safe to modify: **ASK FIRST** (SEO sensitive)

### [6-Step Worker Registration]
- Status: WORKING ✅
- Files: `app/register/page.tsx`, `app/register/hooks/useRegistrationForm.ts`, `app/register/components/steps/*`, `app/register/actions/registrationActions.ts`
- What it does: Multi-step onboarding with camera capture, image compression, NIC validation, and DB insertion.
- What breaks if touched incorrectly: Onboarding conversion, data integrity, image upload reliability.
- Safe to modify: **NEVER WITHOUT APPROVAL**

### [WhatsApp Contact Flow]
- Status: WORKING ✅
- Files: `app/worker/[id]/components/WhatsAppButton.tsx`, `app/worker/[id]/components/LeadCaptureModal.tsx`, `app/worker/[id]/actions/getWorkerContactAction.ts`
- What it does: Latency-sensitive lead capture and redirection to worker's WhatsApp.
- What breaks if touched incorrectly: The entire platform's monetization and utility (leads are not tracked or redirected).
- Safe to modify: **NEVER WITHOUT APPROVAL**

### [Admin Dashboard & Verification Hub]
- Status: WORKING ✅
- Files: `app/admin/page.tsx`, `app/admin/actions/authActions.ts`, `app/admin/actions/workerActions.ts`, `middleware.ts`
- What it does: KPI tracking, worker approval/rejection, private document viewing via Signed URLs.
- What breaks if touched incorrectly: Security of citizen documents, admin access, platform quality control.
- Safe to modify: **NEVER WITHOUT APPROVAL**

### [PWA Support]
- Status: WORKING ✅
- Files: `public/manifest.json`, `app/layout.tsx`
- What it does: "Add to Home Screen" support, standalone display mode, and themed UI.
- What breaks if touched incorrectly: App installability, native feel on mobile.
- Safe to modify: **ASK FIRST**

---

## SECTION 3: SECURITY RULES — NEVER TOUCH WITHOUT APPROVAL

### Authentication
- **LOCKED**: HttpOnly JWT cookie — never change to `localStorage`.
- **LOCKED**: `verifyAdminSession()` must remain the **FIRST** line in every admin mutation/action.
- **LOCKED**: bcrypt cost factor 10 or 12 — never lower for security.
- **LOCKED**: Middleware fail-closed pattern — unauthorized or error state **MUST** redirect to `/login`.
- Files: `app/admin/actions/authActions.ts`, `app/lib/verifyAdminSession.ts`, `middleware.ts`

### Rate Limiting
- **LOCKED**: `registrationRateLimit` — 5 req/hour per IP (Sliding Window).
- **LOCKED**: `loginRateLimit` — 5 req/15min per IP.
- **LOCKED**: `adminRateLimit` — 3 req/30min per IP.
- **LOCKED**: Rate limit check must be the **FIRST** operation before any DB query in protected actions.
- Files: `app/lib/rateLimit.ts`, `app/register/actions/registrationActions.ts`, `app/admin/actions/authActions.ts`

### Data Privacy
- **LOCKED**: Sensitive fields **NEVER** appear in `ANY` public API/Component response:
  `phone`, `nic_number`, `password`, `email`, `nic_front_url`, `nic_back_url`, `selfie_url`, `reference_phone`, `emergency_contact`, `address`.
- **LOCKED**: Worker profile contact action returns a WhatsApp deep-link URL only, never the raw phone number.
- **LOCKED**: `err.message` from Postgres/Supabase must never be returned to the client (use generic errors).
- Files: `app/browse/page.tsx`, `app/worker/[id]/page.tsx`, `app/worker/[id]/actions/getWorkerContactAction.ts`

### Environment Variables
- **LOCKED**: Sensitive keys are **NEVER** `NEXT_PUBLIC_`:
  `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- **LOCKED**: Never hardcode any of these values.
- Files: `.env.local`

### Supabase RLS
- **LOCKED**: `worker-documents` bucket must remain **PRIVATE**. No public `SELECT`.
- **LOCKED**: Public `INSERT` only for `workers` (registration), `customers`, and `whatsapp_clicks`.
- **LOCKED**: `verification_log` is invisible to the public (No RLS policies for `anon`).
- **Current Policies**: See `database.txt` for exact active policies (Audit before changes).

---

## SECTION 4: SEO RULES — NEVER BREAK

### Domain
- **LOCKED**: All URLs must use `https://www.grabme.page`.
- **LOCKED**: Never reintroduce `grabme.lk` anywhere (Deprecated).

### SSR Rules
- **LOCKED**: `app/browse/page.tsx` must remain a **Server Component** (No `'use client'` at file top).
- **LOCKED**: `app/worker/[id]/page.tsx` must use `generateMetadata` for dynamic indexing.
- **LOCKED**: `app/page.tsx` must remain a Server Component for landing page indexing.
- **WHY**: Google indexing is dependent on these pages rendering HTML on the server.

### Metadata Rules
- **LOCKED**: unique `title` + `description` per page.
- **LOCKED**: `og:image` must be an absolute URL (`https://...`).
- **LOCKED**: `og:image` dimensions 1200x630 (WhatsApp/FB standard).
- **LOCKED**: `og:locale` must be `en_LK`, HTML lang `en-LK`.
- **LOCKED**: JSON-LD `LocalBusiness` in `layout.tsx`, `Person` in `profile` page.

### Sitemap & Robots
- **LOCKED**: `sitemap.xml` must include all active workers dynamically.
- **LOCKED**: `/admin` and `/dashboard` must remain in `Disallow`.
- Files: `app/sitemap.ts`, `public/robots.txt`

---

## SECTION 5: DATABASE RULES

### Schema Rules
- **LOCKED Columns (Do not rename)**:
  - `workers`: `id`, `full_name`, `nic_number`, `phone`, `trade_category`, `account_status`, `profile_photo_url`.
  - `customers`: `id`, `full_name`, `phone`, `district`, `source`.
  - `whatsapp_clicks`: `id`, `worker_id`, `customer_id`, `clicked_at`.
  - `verification_log`: `worker_id`, `action`, `outcome`.

### Query Rules
- **LOCKED Protection**: Public worker `SELECT` must use explicit whitelist:
  `id, full_name, trade_category, sub_skills, years_experience, short_bio, home_district, districts_covered, specific_areas, profile_photo_url, past_work_photos, certificate_url, is_identity_verified, is_reference_checked, is_certificate_verified, is_featured, account_status`.
- **LOCKED Access**: Always use `supabaseAdmin` for admin actions and `supabase` (anon) for public data.

---

## SECTION 6: ARCHITECTURE RULES

### Component Rules
- **LOCKED**: Server Components for top-level pages.
- **LOCKED**: Client Components only for interactive islands (e.g., `BrowsePageClient.tsx`).
- **LOCKED**: No sensitive data fetching directly inside `'use client'` files.

### File Structure Rules
- **LOCKED**: `app/admin` and `app/dashboard` must remain restricted by middleware.
- **LOCKED**: `app/lib` contains shared logic used by server actions.

---

## SECTION 7: INTENTIONAL DECISIONS — NEVER "FIX" THESE

- **WhatsApp ping = phone verification**: intentional. Avoids $ cost of SMS OTP while validating the exact communication channel.
- **No User SMS/Push**: intentional. Keeps Opex at $0 during MVP.
- **Forgot Password -> WhatsApp**: intentional. Manual reset by founder ensures zero automated account takeovers.
- **Public Workers Table INSERT**: intentional. Allows anonymous registration.
- **Public Avatars Bucket**: intentional. High performance for directory browsing.
- **PWA over Flutter**: intentional. Zero deployment friction for workers; "install" is a browser menu tap.
- **GPS via Nominatim**: intentional. $0 cost compared to Google Maps API.
- **Generic Login Errors**: intentional. Prevents user enumeration by attackers.

---

## SECTION 8: HOW TO ADD NEW FEATURES SAFELY

1. Step 1: Read `RULES.md` completely.
2. Step 2: Identify which **LOCKED** items the new feature touches.
3. Step 3: State explicitly: "This change touches [X]. Here's how I'll avoid breaking it: [Y]".
4. Step 4: Show the complete implementation plan before writing code.
5. Step 5: Wait for approval if any **LOCKED** item is involved.
6. Step 6: Show **BEFORE** code for every file being modified.
7. Step 7: Show **AFTER** code for every file being modified.
8. Step 8: Update **Regression Checklist** in `RULES.md`.
9. Step 9: Update **Version History** table.

---

## SECTION 9: REGRESSION CHECKLIST

Perform these checks after EVERY change:
- [ ] `npm run build` passes.
- [ ] `tsc --noEmit` passes.
- [ ] `/browse` loads active worker cards (Verify SSR view-source).
- [ ] `/worker/[id]` loads profile with correct metadata.
- [ ] Worker registration flow reaches Step 6 without error.
- [ ] Admin login redirects correctly.
- [ ] `/admin` access without cookie redirects to `/login`.
- [ ] `grabme.lk` grep count = 0.

---

## SECTION 10: VERSION HISTORY

| Version | Date | What Changed | Who Approved |
|---------|------|-------------|--------------|
| 1.0 | April 2026 | Initial MVP Project Rules | Founder |
