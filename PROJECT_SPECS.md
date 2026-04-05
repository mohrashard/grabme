# Grab Me — Project Blueprint & Specifications

**Grab Me** is an elite, trust-based home service marketplace for Sri Lanka, designed and developed by **Mr² Labs**. It bridges the gap between high-quality "Baas" workers and homeowners through a premium, cinematic PWA experience.

---

## 🏛️ Project Information
*   **Version**: 1.0.4 - Alpha
*   **Lead Labs**: Mr² Labs
*   **Design Era**: Deep Obsidian V2

---

## 🎭 User Experience (Non-Technical Features)

### 1. **"Deep Obsidian" Cinematic Design**
- **High-End Palette**: Deep Zinc and Black bases (`#090A0F`) with high-contrast White and Indigo accents.
- **Glassmorphism**: Subtle translucency and blurred background effects on cards and navigation to create a "premium" layer.
- **Micro-Interactions**: Fluid staggered animations on all page loads to establish professional quality.

### 2. **The "Bento Box" Marketplace**
- **Trade Tiles**: Visual service boxes (Electrician, Plumber, etc.) that make navigation immediate and intuitive.
- **Featured Icons**: High-reputation workers are highlighted with premium star icons.

### 3. **The "Zero Barrier" Contact**
- **Instant WhatsApp Link**: One-click connection to workers without account registration for customers, maximizing conversion speed.

---

## 🖥️ Platform Features (Functional)

### 1. **Worker Registration Engine**
- **Modular 6-Step Flow**: Logic-driven registration to prevent form fatigue.
- **Visual Identity Capture**: Side-by-side Selfie and NIC photo uploads.
- **Experience Matrix**: Traditional trade selection with the ability to add custom niche skills.
- **District Multi-Select**: Workers can define their specific operational perimeter across all Sri Lankan districts.

### 2. **Worker Partner Portal**
- **Multi-Method Login**: Workers can securely access their dashboard using **Email, NIC, or Phone Number**.
- **Live Status Heartbeat**: Real-time dashboard that syncs with administrative approvals.
- **Trust Indicators**: Dynamic badges (Level 0–2) based on verification depth.

### 3. **Founder's Ops Center (Admin Panel)**
- **Gatekeeper Pipeline**: Secure interface for comparing IDs and activating profiles.
- **One-Click Activation**: Simultaneously approves the worker and opens an automated WhatsApp activation message tab.
- **Analytics Dashboard**: Real-time tracking of district distribution, trade popularity, and activation rates.
- **Verification Logs**: Internal "Audit Trail" to store sensitive call logs and reference check data.

---

## ⚙️ Technical Infrastructure (Backend)

### 1. **Supabase Core Integration**
- **PostgreSQL Database**: Relational schema handling `workers`, `customers`, and `whatsapp_clicks`.
- **Row Level Security (RLS)**: Automated policies that protect worker data while allowing secure administrative lookups.
- **Storage Buckets**: Encrypted storage for sensitive identity documents (NIC fronts, selfies).

### 2. **Next.js 14 (App Router)**
- **Server Actions**: Secure server-side credential verification.
- **Framer Motion**: Advanced layout-driven animations.
- **Client-Side Persistence**: `localStorage` used for efficient session tracking without heavy session overhead.
- **Lucide Icon Library**: Unified, high-contrast iconography across all interfaces.

### 3. **Security Architecture**
- **Zero-Exposure Auth**: Admin credentials stored in server-only environment variables (`.env.local`) and verified via Server Actions (never exposed to GitHub or the browser).
- **Hardened RLS**: Policies defined to prevent unauthorized status changes in the `workers` table.

---

## 🗃️ Database Schema Overview (Live)

| Table | Key Responsibility | Security Level |
|---|---|---|
| `workers` | Central identity, status, and trade repository | RLS: Public Insert / Admin Update |
| `verification_log` | Sensitive audit trail for founder notes | RLS: Restricted to Admin |
| `customers` | Lead generation tracking | RLS: Public Insert |
| `whatsapp_clicks` | Traction & "Heatmap" tracking | RLS: Public Insert |

---

*This blueprint represents the complete DNA of the Grab Me platform as of April 2026. Every feature is engineered to prioritize trust, speed, and premium aesthetics.*
