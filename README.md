# 📱 JanSeva — Citizen Civic Social Network & Municipal Interface (Frontend)

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green)](https://leafletjs.com/)

> **JanSeva** is the citizen-facing civic social platform and authority operations interface built on **Next.js 14 (App Router)**, **React 18**, and **Tailwind CSS**.

---

## 🌟 Key Features

### 👤 Citizen Social Network
- **📸 3-Step AI Defect Reporting (`/report`)**: Live camera photo capture, automated AI defect tagging, HTML5 GPS geolocation, and Indian PIN-code mapping.
- **📰 Hyperlocal Community Feed (`/feed`)**: Real-time grievance timeline with category filters (*Water, Roads, Sanitation, Electricity, Safety*), upvoting, and citizen discussion threads.
- **🗺️ Interactive Map Explorer (`/explore`)**: Clustered geospatial view of local complaints with live status pins.
- **🏛️ My Ward 360° Parallax (`/ward`)**: Background depth parallax view of Ward Corporator initiatives, fund allocations, and before/after community repairs.
- **💰 Participatory Ward Budgeting & Polls (`/ward-budget`)**: Community referendums and citizen budget allocation sliders.
- **🤖 Jana Bandhu Voice AI Assistant**: Multilingual floating civic assistant with speech recognition.
- **🎮 Gamified Civic XP & Leaderboard**: Earn XP badges (Civic Citizen, Civic Guardian, Ward Champion) by reporting and verifying defects.

### 🏢 Municipal Operations Command
- **🔒 Full-Width Authority Sign-In (`/officer-portal`)**: Secure department access code verification.
- **⚡ Department Operations Hub (`/officer/[department]`)**: Siloed consoles for *Water, Roads, Electricity, Sanitation, and Zonal Command*.
- **🎛️ 9 Workbench Modules**: Live Triage, Squad Dispatch, Donut KPI Gauges, AI Duplicate Review, SLA Breaches, Calendar, PIN Broadcasts, Polls, and Audit Reports.
- **📱 Responsive Mobile Authority Bar**: Dedicated bottom bar navigation and slide-over hamburger drawer for field engineers.

---

## 🚀 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```
*(When deployed to Vercel, set `NEXT_PUBLIC_API_URL` to your production Render backend URL, e.g. `https://rack-rhythm-1.onrender.com`)*.

---

## 📜 License

MIT License.
