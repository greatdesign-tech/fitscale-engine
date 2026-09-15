# FitScale Engine 🚀

> **The Unified B2B Agency Platform: GymLead Finder + Interactive Mobile App Demo Studio.**

FitScale Engine empowers agencies selling custom branded mobile apps to Gyms, Fitness Studios, CrossFit Boxes, and Pilates/Yoga Hubs to discover high-opportunity prospects, generate interactive mobile app demos in under 60 seconds, and export enriched cold outreach campaigns.

---

## 🌟 Key Features

### 1. 🎯 GymLead Finder (`/admin/leads`)
- **Prospect Discovery Database**: Pre-seeded with realistic US gym leads across top metropolitan fitness markets (Austin, Denver, Santa Monica, Miami, Scottsdale, Los Angeles, Brooklyn, Nashville, Chicago).
- **Mobile App Status Detection**: Highlights gyms with `No App (High Opportunity)`, `Third-Party Web Only`, or `Demo Ready`.
- **1-Click Workflow**: Clicking **"⚡ Create Demo App"** automatically transfers the gym's name, city, and website into the Demo Builder and creates a unique demo slug (`/demo/[slug]`).
- **Enriched CSV Export**: One-click export with required outreach columns:
  `[Gym Name, Website, Contact Email, Mobile App Status, Personalized Demo URL]`

### 2. 📱 Split-Screen Demo Studio (`/admin/builder`)
- **Real-Time Split-Screen**: Live iPhone 16 Pro mockup updates in real time as parameters are customized.
- **1-Click Industry Design Presets**:
  - 🏋️‍♂️ **Apex Athletic Club** (Modern Luxury Gym, Neon Lime / Dark)
  - ⚡ **IronForge CrossFit** (Functional Fitness, Electric Amber / Dark)
  - 🧘‍♀️ **Zenith Pilates & Sanctuary** (Reformer Pilates & Yoga, Cyan Sage / Light)
  - 🥊 **Rumble Boxing & HIIT Lab** (High Energy Studio, Crimson Pink / Dark)
- **Feature Toggles**: Class Booking, PT Scheduler, Loyalty Punch-Card, Simulated Push Alert, Turnstile Access Pass.
- **"Attach to Lead Record"**: Binds the generated demo URL directly to the lead in Lead Finder for automated tracking.
- **Outreach Kit**: Generates public URLs, live smartphone QR codes, and pre-formatted cold email pitch templates.

### 3. 📲 Prospect Mobile App Concept (`/demo/[slug]`)
- **Realistic iPhone 16 Pro Container**: Dynamic Island, status bar with live clock, 5G, Wi-Fi, battery indicator, and iOS home bar.
- **Simulated Push Notification**: Drops down automatically from the Dynamic Island after 3 seconds: *"🔥 Reminder: 2 spots left for tonight's workout! Tap to reserve."*
- **Interactive App Tabs**:
  - **Tab 1: Home Screen** — Branded header, VIP badge, quick actions, turnstile digital access pass with scanning laser animation.
  - **Tab 2: Live Class Schedule** — 7-day selector, category filter chips, capacity decrements, and working booking sheet with Apple/Google Calendar toast.
  - **Tab 3: Trainers & PT Scheduling** — Coach bios, expertise tags, and 30m vs 60m session booking.
  - **Tab 4: Member Loyalty & Rewards** — 10-punch digital streak card with interactive check-in button, punch stamp animation, confetti explosion, and voucher codes.
- **High-Converting Desktop Canvas**: Floating agency CTA card with value proposition bullets (+30% retention, zero no-shows) and strategy consultation modal.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with dynamic CSS variable brand color injection
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visual FX**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **QR Code Engine**: [qrcode](https://www.npmjs.com/package/qrcode)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 📍 Core Routes

| Route | Description |
|---|---|
| `/` | FitScale Engine Agency Showcase Landing Page |
| `/admin` | Redirects to Lead Finder |
| `/admin/leads` | GymLead Finder Table & CSV Export |
| `/admin/builder` | Split-Screen Mobile App Demo Studio |
| `/demo/[slug]` | Interactive Client Prototype Canvas (e.g. `/demo/apex-fitness`) |
| `/api/leads` | REST API for Gym Leads Pipeline |
| `/api/demos` | REST API for Custom Demo Configurations |

---

## 📄 License
MIT © 2026 FitScale Engine
