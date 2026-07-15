# igor-vuta.dev — Portfolio

Personal portfolio site for Igor Vuta. Single-page, statically exported Next.js app.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · static export (`output: "export"`)

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run build      # emits static site to ./out
```

A prebuilt copy of `out/` is included — preview it with `npx serve out`.

## Deploy (Vercel, ~3 minutes)

1. Push this folder to GitHub:

   ```bash
   cd portfolio
   git init && git add -A && git commit -m "Portfolio site"
   git remote add origin https://github.com/igor-vuta/portfolio.git
   git push -u origin main
   ```

2. On [vercel.com/new](https://vercel.com/new), import `igor-vuta/portfolio` — Vercel auto-detects Next.js; no settings needed. Done.

All content (links, metrics, projects, certifications) lives in one file: `lib/profile.ts`.
