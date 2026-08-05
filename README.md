<div align="center">

# igor-vuta.github.io/portfolio

**My portfolio. One page, statically exported, no UI or animation libraries.**

[![Live site](https://img.shields.io/badge/Live-igor--vuta.github.io%2Fportfolio-C15F3C?style=for-the-badge)](https://igor-vuta.github.io/portfolio/)

<img src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/dependencies-3-C15F3C" />

</div>

---

## Boot

<div align="center">
<img src="docs/screenshots/portfolio-boot.png" alt="Boot terminal — a deploy log printing compile, bundle, export, upload and verify, each marked ok, then ready" width="88%" />
</div>

The first visit in a session opens on a terminal that deploys the page you are about to read. The command types itself, five stages report in over about four seconds, and the page arrives behind it at 6.2s. Any key, tap, wheel or touch skips the whole thing, and the screen says so.

The figures printed are real properties of this build — Next 15, 109 kB first load, static export, GitHub Pages. A boot screen that lied about the thing it is booting would be a strange choice here.

It is decoration, so it runs under conditions:

1. It cannot withhold content. The markup is complete before the script runs, and every boot rule hangs off a class only that script adds. Thus a thrown exception, a blocked bundle, or scripting switched off all land on the finished page instead of a blank one.
2. It ends. A 6.4-second cap clears it even if a stage never fires, and the cap is a timeout set in the same breath as the class, not a completion callback from an animation that may never arrive.
3. It plays once per session, tracked in `sessionStorage`, and not at all under `prefers-reduced-motion`.

## Intro

<div align="center">
<img src="docs/screenshots/portfolio-hero.png" alt="Intro section — the headline “Software that ships — with numbers to prove it.” over a faint blueprint grid, above a spec panel of role, location, degree, stack and availability" width="88%" />
</div>

Name and role, the headline, three sentences of summary, and the three links a recruiter actually opens: the flagship project, GitHub, LinkedIn.

Under it a spec panel — role, location, degree, stack, availability — because those are the five facts every reader checks first and none of them should need scrolling to find. The whole page is styled this way: paper ground, a measuring grid, one clay accent, IBM Plex for the prose and the readouts both. Closer to a spec sheet than to a landing page.

## Flagship

<div align="center">
<img src="docs/screenshots/portfolio-flagship.png" alt="Flagship section — Intelli-Factory description, three pillar panels, and a Pareto front chart with the knee point marked" width="88%" />
</div>

Intelli-Factory, my final-year project. It matches supply-chain requests against manufacturer–logistics pairs across three objectives that pull against each other — cost, delivery time, reliability — so there is no single best answer, only a Pareto front and a decision about what you are optimizing for. Three pillars cover the optimization engine, the production platform and the security work.

The chart is real data: the non-dominated set from the Deep GA run, cost against delivery time, with the knee point the engine selects. It draws itself when you arrive at it, since a line that appears fully formed says nothing about how it was arrived at.

<div align="center">
<img src="docs/screenshots/portfolio-benchmark.png" alt="Verified benchmark — six metric tiles including +17.5% composite fitness and 3,600 evaluations — above the frontend / API / database architecture row" width="88%" />
</div>

Then the evidence for those claims. Six metrics that count up from zero on first sight, the note saying exactly where they came from — 120 synthetic scenarios × 30 seeds, run on the production engine code — and the three-tier architecture that serves them. The buttons go to the live demo, the Swagger docs and the source, with the free-tier cold start stated rather than left as a surprise.

## Standard of evidence

<div align="center">
<img src="docs/screenshots/portfolio-manifesto.png" alt="Standard of evidence — “Not promises — measurements.” with a link to benchmark_evaluation.py" width="88%" />
</div>

One line between the flagship and the projects, and the only band on the page with no panel, no index and no controls. It states where every number came from and links `benchmark_evaluation.py` so you can rerun it yourself.

## Selected work

<div align="center">
<img src="docs/screenshots/portfolio-projects.png" alt="Projects grid — cards for Drive Pro, Qubly Landing Page, Currency Exchange Bot, Todo Web App, Vue Folder Tree and React Starter Pro" width="88%" />
</div>

Six shipped projects, each with a live deployment and readable source: a bilingual company site, a Figma-to-spec landing page, a Telegram bot, a full-stack task manager, a Vue tree component and a React starter. Every card carries its stack and both links.

**Live** opens in place rather than in a tab. The links are ordinary `<a href target="_blank">` elements intercepted by delegation and shown in a native `<dialog>`, so focus trapping and Esc-to-close come from the platform, cmd/ctrl/shift/middle clicks still give you a real tab, and with no JS every link is still a link. A site that refuses to be framed renders blank and nothing cross-origin can detect that, hence the permanent **Open ↗** in the panel header.

## Credentials

<div align="center">
<img src="docs/screenshots/portfolio-credentials.png" alt="Credentials — Papa Gadget experience card, three certification cards with verification links and codes, and the start of the skills matrix" width="88%" />
</div>

Commercial experience, certifications and skills in one section. Each certificate carries its verification link and code, and the Red Hat one is labelled a certificate of attendance with no online verification, because it is one and pretending otherwise is the kind of thing that gets checked.

## Contact

<div align="center">
<img src="docs/screenshots/portfolio-contact.png" alt="Skills matrix above the dark contact block — “Let's build something.” with email, copy-address, GitHub and LinkedIn buttons" width="88%" />
</div>

The page stops being paper and turns dark, so the end reads as an end. Availability, visa status, and four ways to get in touch. The copy-address button falls back to a hidden textarea where the Clipboard API is absent or denied, and if both routes fail it says so and puts the address on screen pre-selected — a button that fails silently is unfinished.

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS v4**
- Static export (`output: "export"`) — no server, no runtime, deploys anywhere
- **109 kB First Load JS** for `/`, of which 103 kB is shared, measured on the build in this repo
- Dependencies: `next`, `react`, `react-dom`. Every animation on the page is handwritten.
- IBM Plex Sans and Mono, self-hosted at build time through `next/font`, Latin subset only, `display: swap`
- All content is in one file, [`lib/profile.ts`](lib/profile.ts) — identity, metrics, projects, certifications. Changing what the page says never means touching a component.
- Reduced motion, forced colors, print and no-JS are all real paths, not disabled animations
- GitHub Actions builds and publishes to Pages on every push to `main`

## Run it

```bash
npm install
npm run dev      # http://localhost:3000/portfolio
npm run build    # static export to ./out
```

## Screenshots

In [`docs/screenshots/`](docs/screenshots), captured at 1440×900 at 2×. They go stale as the page changes, so the [live site](https://igor-vuta.github.io/portfolio/) is the source of truth.

---

<div align="center">

**[Igor Vuta](https://github.com/igor-vuta)** · [LinkedIn](https://www.linkedin.com/in/igor-vuta-b88017390) · igor_vuta@proton.me

</div>
