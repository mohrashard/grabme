# Grab Me - Premium Home Services Marketplace (Sri Lanka)

**Grab Me** is a high-performance, cinematic PWA designed to connect Sri Lankan homeowners with verified home workers (Electricians, Plumbers, AC Repair, etc.) instantly via WhatsApp.

---

## 🚀 Core Features

### 1. **Cinematic Landing Page (`/`)**
- **Orbit Service Visual**: Interactive planetary-style orbits of service icons.
- **Bento Grid Features**: High-trust highlighting of safety, direct WhatsApp contact, and zero commissions.
- **Dynamic Services Directory**: Categorized bento cards for 8+ primary trades with a "More Services" quick-pill list.
- **Micro-Animations**: Framed with `framer-motion` for a fluid, premium feel.

### 2. **Modular Worker Registration (`/register`)**
- **6-Phase Flow**: Optimized for high completion rates and data accuracy.
  - **Phase 1 (Identity)**: Full name, WhatsApp, NIC, Email, Password, Emergency contact.
  - **Phase 2 (Visual Proof)**: Profile photo, NIC front/back, Selfie verification, Certifications.
  - **Phase 3 (Experience)**: Dynamic trade selection, suggested + custom skills, Work bio.
  - **Phase 4 (Location)**: Detailed district coverage (Multi-select) and service radius.
  - **Phase 5 (Reference)**: Experience check and former employer details.
  - **Phase 6 (Confirmation)**: Final review and WhatsApp-triggered admin activation.

### 3. **Secure Partner Portal (`/login`)**
- **Multi-Identifier Entry**: Workers can log in using **Email, NIC Number,** or **Phone Number**.
- **Secure Password Layer**: Identity-verified credentials to access the private dashboard.
- **Premium Aesthetics**: Consistent "Deep Obsidian" dark mode experience.

### 4. **Worker Dashboard (`/dashboard`)**
- **Personal Command Center**: Sidebar navigation for Overview, Jobs, and Profile.
- **Real-Time Status**: Visual alerts for "Pending Review" vs "Active" statuses.
- **Account Summary**: Stats on jobs, payments, and verification markers.

---

## 🛠️ Technology Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Storage**: Supabase Storage (`worker-documents` bucket)
- **Communications**: Direct WhatsApp Integration via `wa.me` API.

---

## 🗃️ Database Architecture

The project uses a structured PostgreSQL schema in Supabase with **Row Level Security (RLS)** enabled for data protection.

### **Tables**
- **`workers`**: Stores identity, credentials, media URLs, qualifications, and pipeline status.
- **`verification_log`**: Internal audit trail for admin approval/rejection notes.
- **`customers`**: Lightweight tracking for homeowners seeking services.
- **`whatsapp_clicks`**: Critical traction metric tracking every WhatsApp connection.

### **Security Policies**
- **Public Enrollment**: Anyone can submit a registration form (Insert policy).
- **Public Uploads**: Anonymous access to the `worker-documents` bucket for onboarding.
- **Unified Login**: RLS allows lookup across multiple identifiers for authentication.

---

## 🎨 Design System: "Deep Obsidian"

A curated, state-of-the-art aesthetic designed by **Mr² Labs**:
- **Primary BG**: `#090A0F` (Deep Obsidian)
- **Cards**: `#18181B` (Matte Zinc) with subtle gradients.
- **Accents**: `#4F46E5` (Electric Indigo) used for primary CTAs and orbits.
- **Typography**: Inter (Modern sans-serif) with high-contrast weights.

---

## 📈 Current Project State: **Alpha v1.0.4**
- **Status**: Registration and Login flows are **Fully Functional**.
- **Branding**: Official "Grab Me" logo and "Powered by Mr² Labs" integrated across all pages.
- **Optimization**: Modular component architecture and code splitting implemented for elite performance.

---

*This project is built and maintained with a focus on trust, speed, and premium user experience.*
