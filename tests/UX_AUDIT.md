# UX & Language Audit (Sri Lanka Context)

## 1. Compliance Toggles
- [x] No technical jargon (stripped from error boundaries)
- [x] No Western-specific terms 
- [x] Forms enforce Sri Lanka number layouts (07X | +94X)
- [x] Trades named appropriately for LK market
- [x] Date formatting is explicit DD/MM/YYYY
- [x] Currency locked to LKR / Rs.

## 2. Error Message Master Matrix

| File Path | Raw Error String | Localization Verdict | Suggested Fix |
|---|---|---|---|
| `/app/admin/actions/authActions.ts` | "Incorrect credentials. Please try again." | PASS | Keep as-is |
| `/app/admin/actions/authActions.ts` | "Something went wrong. Please try again." | PASS | Keep as-is |
| `/app/login/actions/loginActions.ts` | "Too many attempts. Please wait a few minutes and try again." | PASS | Keep as-is |
| `/app/login/actions/loginActions.ts` | "Account deactivated." (Custom) | FAIL | Update to: "Your account has been paused. Please contact us via WhatsApp." |
| `/app/customer/register/page.tsx` | "Enter a valid Sri Lankan number (e.g. 0771234567)" | PASS | Keep as-is |
| `/app/api/upload/route.ts` | "File exceeds 10MB limit." | FAIL | Update to: "The photo is too large to send over mobile data. Try a smaller one." |
| `middleware.ts` | Redirect loop / auth missing | PASS | Silent handling, generic redirect |

## 3. Trust Signal Audit (Zero Reviews)
- **Concept Pitch:** Homepage clearly explains "Directory of verified workers".
- **Contact:** UI specifies "No commision, talk directly on WhatsApp".
- **Evidence:** Worker profiles contain verifiable visual evidence (Verified tags linked to NIC/Reference checks).
