# Continuous Regression Checklist

Run this manually or via Playwright CI before ANY major version bump or Next.js layout rewrite.

## Critical Path Regression
- [ ] **Browse:** Customer can browse workers (`/browse` loads 200 OK)
- [ ] **Profile:** Customer can view worker profile (`/worker/[id]`)
- [ ] **Lead Gen:** WhatsApp button triggers lead modal, captures customer, and resolves to `wa.me`
- [ ] **Worker Onboarding:** Registration wizard traversable across all 6 steps without state-loss on "Back".
- [ ] **Authentication:** Worker Login strictly validates token cookies.
- [ ] **Privilege Invocation:** Admin Login executes without leakage.
- [ ] **Mutations:** Admin can cleanly update `account_status` (pending -> active) on `/admin` dashboard.
- [ ] **Visibility Gate:** Approved worker appears on `/browse`.
- [ ] **Obfuscation Gate:** Rejected/suspended worker INSTANTLY drops from `/browse` and direct-links return unlisted states.
- [ ] **Infrastructure Limits:** Rate limiting strikes identically for repeated `/login` requests.
- [ ] **Sanitation:** Build step `npm run build` throws 0 type and 0 Suspense boundary errors.
