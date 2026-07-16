export const identity = {
  name: "Igor Vuta",
  role: "Software Developer",
  stackLine: "Python · TypeScript · FastAPI · Next.js",
  location: "Leicester, UK",
  degree: "BSc (Hons) Computer Science, First-Class Honours — De Montfort University, 2026",
  email: "igor_vuta@proton.me",
  github: "https://github.com/igor-vuta",
  linkedin: "https://www.linkedin.com/in/igor-vuta-b88017390",
  availability:
    "Open to entry-level software / web developer roles · UK Graduate Route — full-time work rights, no sponsorship required",
  summary:
    "Computer Science graduate with commercial experience building Telegram bots and CRM integrations in Python, and a deployed, benchmarked full-stack platform as a final-year project. I care about clean code, measurable results, and security done properly.",
};

export const flagship = {
  name: "Intelli-Factory",
  eyebrow: "Flagship project — BSc Final Year Project",
  tagline: "A multi-objective optimization platform for supply-chain matching",
  liveUrl: "https://intelli-factory-frontend.vercel.app/",
  apiDocsUrl: "https://intelli-factory-api.onrender.com/docs",
  repoUrl: "https://github.com/igor-vuta/intelli-factory",
  description:
    "A B2B2C platform that matches customer requests with manufacturer–logistics pairs across the “supply-chain trilemma”: cost, delivery time, and reliability. Four user roles, a nine-state request lifecycle enforced by explicit state machines, three-party contract signing, and an admin UI for comparing optimization strategies live.",
  pillars: [
    {
      title: "Optimization engine",
      body: "NSGA-II-style genetic algorithm built on DEAP (population 100, 80 generations) plus a fast weighted strategy and a greedy baseline — producing Pareto-optimal sets with knee-point selection.",
    },
    {
      title: "Production platform",
      body: "FastAPI + PostgreSQL (~25 Prisma models) behind a Next.js 14 App Router frontend; deployed as a three-tier system on Vercel, Render, and Aiven with Docker Compose for local dev.",
    },
    {
      title: "Security & testing",
      body: "OWASP-aligned: Argon2id hashing, CSPRNG server-side sessions, rate-limited login. 51 automated pytest unit and integration tests, TDD on the engine.",
    },
  ],
  metrics: [
    { value: "+17.5%", label: "composite fitness vs greedy baseline" },
    { value: "41.8%", label: "faster delivery (8.02 → 4.67 days)" },
    { value: "+8.1%", label: "reliability score (0.824 → 0.891)" },
    { value: "0.069 s", label: "avg Deep GA response time" },
    { value: "100%", label: "feasibility across 120 scenarios" },
    { value: "3,600", label: "benchmark evaluations (120 × 30 seeds)" },
  ],
  benchmarkNote:
    "Verified benchmark: 120 synthetic scenarios × 30 random seeds, run on the production engine code.",
  architecture: [
    { layer: "Frontend", tech: "Next.js 14 · TypeScript · Tailwind", host: "Vercel" },
    { layer: "API", tech: "FastAPI · Python 3.12 · DEAP", host: "Render" },
    { layer: "Database", tech: "PostgreSQL · Prisma", host: "Aiven" },
  ],
};

export type Project = {
  name: string;
  blurb: string;
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
};

export const projects: Project[] = [
  {
    name: "Drive Pro",
    blurb:
      "Public website for a family-run earthworks and heavy-equipment hire company in Almaty (200+ projects since 2018). Bilingual Russian/Kazakh, equipment catalogue, pricing tables, WhatsApp call-to-action.",
    stack: ["Next.js 14", "TypeScript", "Tailwind", "next-intl", "GitHub Pages"],
    liveUrl: "https://igor-vuta.github.io/drivePro-website/",
    repoUrl: "https://github.com/igor-vuta/drivePro-website",
  },
  {
    name: "Qubly Landing Page",
    blurb:
      "Pixel-perfect, responsive landing page implemented from a Figma design — spacing, typography, and breakpoints matched to spec.",
    stack: ["HTML", "Sass", "JavaScript", "Bootstrap", "Figma"],
    liveUrl: "https://igor-vuta.github.io/qubly-landing/",
    repoUrl: "https://github.com/igor-vuta/qubly-landing",
  },
  {
    name: "Currency Exchange Bot",
    blurb:
      "Multilingual Telegram bot for currency rates, conversions, and financial insights — dual data sources (exchange-rate API + Central Bank data), deployed on Heroku.",
    stack: ["Python", "Telegram Bot API", "REST", "Heroku"],
    repoUrl: "https://github.com/igor-vuta/currency-exchange-bot",
  },
  {
    name: "Todo Web App",
    blurb:
      "Full-stack task-management app with JWT authentication, lists, groups, and role-based access — modular PHP backend, MySQL, vanilla JS (ESM) frontend, Dockerized local setup.",
    stack: ["PHP 8.2", "MySQL", "JavaScript (ESM)", "JWT", "Docker"],
    repoUrl: "https://github.com/igor-vuta/todo-webapp-refactored",
  },
];

export const experience = [
  {
    company: "Papa Gadget",
    role: "Software Developer — Telegram Bots & CRM Integration",
    period: "Feb 2024 – Sep 2024",
    points: [
      "Designed and built Python Telegram bots and adapted the company CRM to the real workflow of a gadget-repair shop",
      "Cut repetitive manual data entry by 30% by streamlining CRM workflows through the bots",
      "Built automation scripts against REST APIs; documented processes for scalability",
    ],
  },
];

export const internships =
  "Earlier: IT support internships at Kaspi Bank (fintech) and Kazakhfilm (national film studio).";

export const certifications = [
  {
    name: "Meta Front-End Developer Professional Certificate",
    issuer: "Coursera · 9 courses incl. React Basics, Advanced React, UX/UI Principles",
    verifyUrl: "https://coursera.org/share/a4bd8f48de33fec60e93458c3667c6b7",
    code: "97UEVYXQM4UL",
  },
  {
    name: "Cybersecurity Foundation",
    issuer: "Palo Alto Networks Cybersecurity Academy",
    verifyUrl: "https://paloaltonetworksacademy.net/mod/customcert/verify_certificate.php",
    code: "9A5AD9bUXV",
  },
  {
    name: "Red Hat System Administration I (RH124)",
    issuer: "Red Hat Academy · Certificate of Attendance, Feb 2025",
  },
];

export const skills: { group: string; items: string[] }[] = [
  {
    group: "Languages",
    items: ["TypeScript", "Python 3.12", "SQL", "JavaScript (ES6+)", "HTML5", "CSS3/SCSS"],
  },
  {
    group: "Frontend",
    items: ["Next.js (App Router)", "React", "Tailwind CSS", "Zustand", "Recharts", "i18n", "Accessibility (WCAG)"],
  },
  {
    group: "Backend",
    items: ["FastAPI", "Node.js", "Express", "REST / OpenAPI", "Prisma ORM", "PostgreSQL", "Redis (familiar)"],
  },
  {
    group: "Algorithms",
    items: ["DEAP", "NSGA-II multi-objective GA", "Pareto-front analysis", "Hypervolume metrics", "Benchmarking"],
  },
  {
    group: "Testing & DevOps",
    items: ["pytest · TDD", "Docker Compose", "Git & GitHub", "CI/CD basics", "Vercel · Render · Aiven", "OWASP practices"],
  },
];
