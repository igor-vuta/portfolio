<div align="center">

# igor-vuta.github.io/portfolio

**Personal portfolio — an editorial, animation-driven one-pager built with zero UI libraries.**

[![Live site](https://img.shields.io/badge/%F0%9F%8C%90%20Live-igor--vuta.github.io%2Fportfolio-C15F3C?style=for-the-badge)](https://igor-vuta.github.io/portfolio/)

<img src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/animations-hand--rolled%2C%200%20libs-C15F3C" />

<br /><br />

<img src="docs/screenshots/portfolio-hero.png" alt="Hero — serif display type on an oat background" width="85%" />

</div>

---

## Design

Editorial light theme: oat background, high-contrast serif display type, a single clay accent, and a dark charcoal contact block. The design language borrows from modern research-lab sites — restraint over decoration.

## ✨ Signature animations (all hand-rolled, no libraries)

- 📈 **Self-drawing Pareto chart** — the SVG front line draws itself when scrolled into view, points fade in sequentially, the knee-point pulses
- 🔢 **Count-up metrics** — benchmark numbers animate from zero on first view, preserving prefixes/suffixes and formatting
- ✍️ **Hand-drawn underline** — the hero headline's accent stroke draws in on load
- 🫧 **Breathing blobs** — slow, organic background motion in the hero
- 🧭 **Section rail** — dot navigation that tracks the active section, with hover labels
- 📊 **Reading progress bar** — a hairline clay indicator under the nav
- 🟢 **Live badge** — pulsing indicator on the flagship demo button
- 📋 **Copy-email button** — one-tap clipboard with inline confirmation

Every animation respects `prefers-reduced-motion`.

<div align="center">
<img src="docs/screenshots/portfolio-flagship.png" alt="Flagship section — pillars and self-drawing Pareto chart" width="85%" />
</div>

## 🛠 Stack & architecture

- **Next.js 15** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS v4**
- Static export (`output: "export"`) — no server, deploys anywhere
- All content lives in **one file**: [`lib/profile.ts`](lib/profile.ts) — links, metrics, projects, certifications
- First Load JS ≈ 103 kB; fonts loaded client-side with `display=swap`
- CI/CD: GitHub Actions → GitHub Pages on every push to `main`

## 🚀 Run locally

```bash
npm install
npm run dev      # http://localhost:3000/portfolio
npm run build    # static export to ./out
```

---

<div align="center">

**[Igor Vuta](https://github.com/igor-vuta)** · [LinkedIn](https://www.linkedin.com/in/igor-vuta-b88017390) · igor_vuta@proton.me

</div>
