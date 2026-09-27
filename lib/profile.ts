export const identity = {
  name: "Igor Vuta",
  role: "Software Developer",
  stackLine: "Python · TypeScript · FastAPI · Next.js",
  location: "Leicester, UK",
  degree: "BSc (Hons) Computer Science, First-Class Honours, De Montfort University, 2026",
  email: "igor.vuta.dev@gmail.com",
  github: "https://github.com/igor-vuta",
  linkedin: "https://www.linkedin.com/in/igor-vuta-b88017390",
  availability:
    "Available immediately for entry-level software / web developer roles. Full right to work in the UK, no sponsorship required",
  summary:
    "Computer Science graduate with commercial experience building Telegram bots and CRM integrations in Python, and a deployed, benchmarked full-stack platform as a final-year project. I care about clean code, measurable results, and security done properly.",
  // Compiled from the general CV in the auto repo (pdflatex, one page) and
  // served from public/. Update both together when the CV changes.
  cv: "/cv/Igor_Vuta_CV.pdf",
  // The hero's one line. `summary` is the full version; this is what fits in a
  // first viewport alongside the device without pushing the CTA below the fold.
  pitch:
    "Python and TypeScript developer with commercial experience and a deployed, benchmarked full-stack platform.",
};

export const flagship = {
  name: "Intelli-Factory",
  eyebrow: "Flagship project, BSc final-year project",
  tagline: "A multi-objective optimization platform for supply-chain matching",
  liveUrl: "https://intelli-factory-frontend.vercel.app/",
  apiDocsUrl: "https://intelli-factory-api.onrender.com/docs",
  repoUrl: "https://github.com/igor-vuta/intelli-factory",
  description:
    "A B2B2C platform that matches customer requests with manufacturer-logistics pairs across the “supply-chain trilemma”: cost, delivery time, and reliability. Four user roles, a nine-state request lifecycle enforced by explicit state machines, three-party contract signing, and an admin UI for comparing optimization strategies live.",
  pillars: [
    {
      title: "Optimization engine",
      body: "NSGA-II-style genetic algorithm built on DEAP (population 100, 80 generations) plus a fast weighted strategy and a greedy baseline, producing Pareto-optimal sets with knee-point selection.",
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
  /** Captured from the live deployment, under public/. Only live projects have one. */
  shot?: string;
  /** The same deployment captured on a 390px phone, where it has a phone layout. */
  phone?: string;
};

export const projects: Project[] = [
  {
    name: "Intelli-Factory",
    blurb:
      "Multi-objective supply-chain matching platform and my final-year project, covered in depth in its own case study. An NSGA-II genetic algorithm on DEAP scores manufacturer-logistics pairs across cost, delivery time and reliability; benchmarked at +17.5% composite fitness over a greedy baseline across 3,600 evaluations.",
    stack: ["Next.js 14", "TypeScript", "FastAPI", "Python 3.12", "DEAP", "PostgreSQL"],
    liveUrl: "https://intelli-factory-frontend.vercel.app/",
    repoUrl: "https://github.com/igor-vuta/intelli-factory",
    shot: "/projects/intelli-factory.webp",
    phone: "/projects/intelli-factory-phone.webp",
  },
  {
    name: "Todo Web App",
    blurb:
      "Full-stack task manager with JWT auth and shared, role-based lists: a PHP 8 REST API over a hand-written MySQL schema, shipped as one container whose CI proves the schema and seeds are idempotent.",
    stack: ["PHP 8", "MySQL 8", "JavaScript (ESM)", "JWT", "Docker", "GitHub Actions"],
    liveUrl: "https://todo-app-production-5509.up.railway.app/",
    repoUrl: "https://github.com/igor-vuta/todo-webapp-refactored",
    shot: "/projects/todo.webp",
    phone: "/projects/todo-phone.webp",
  },
  {
    name: "Vue Folder Tree",
    blurb:
      "Recursive, keyboard-navigable folder tree for Vue 3 with ARIA roles, animated expand/collapse and optional checkboxes, and zero runtime dependencies.",
    stack: ["Vue 3", "Vite", "Accessibility (ARIA)", "GitHub Pages"],
    liveUrl: "https://igor-vuta.github.io/vue-folder-tree/",
    repoUrl: "https://github.com/igor-vuta/vue-folder-tree",
    shot: "/projects/vue-folder-tree.webp",
    phone: "/projects/vue-folder-tree-phone.webp",
  },
  {
    name: "Qubly Landing Page",
    blurb:
      "Pixel-perfect responsive landing page built from a Figma design, with hand-written navigation, tabbed reviews and smooth-scroll anchors.",
    stack: ["HTML5", "Sass", "jQuery", "Bootstrap grid", "Figma"],
    liveUrl: "https://igor-vuta.github.io/qubly-landing/",
    repoUrl: "https://github.com/igor-vuta/qubly-landing",
    shot: "/projects/qubly.webp",
    phone: "/projects/qubly-phone.webp",
  },
  {
    name: "Drive Pro",
    blurb:
      "Bilingual Russian/Kazakh website for a family-run heavy-equipment hire company in Almaty, with an equipment catalogue, pricing tables and a WhatsApp call-to-action.",
    stack: ["Next.js 14", "TypeScript", "Tailwind", "next-intl", "GitHub Pages"],
    liveUrl: "https://igor-vuta.github.io/drivePro-website/",
    repoUrl: "https://github.com/igor-vuta/drivePro-website",
    shot: "/projects/drive-pro.webp",
    phone: "/projects/drive-pro-phone.webp",
  },
  {
    name: "React Starter Pro",
    blurb:
      "React 19 + Vite starter with Tailwind CSS 4, linting, pre-commit hooks and a deploy pipeline already wired, and a written rationale for every decision.",
    stack: ["React 19", "Vite", "Tailwind CSS 4", "ESLint", "GitHub Actions"],
    liveUrl: "https://igor-vuta.github.io/react-starter-pro/",
    repoUrl: "https://github.com/igor-vuta/react-starter-pro",
    shot: "/projects/react-starter-pro.webp",
    phone: "/projects/react-starter-pro-phone.webp",
  },
  {
    name: "Currency Exchange Bot",
    blurb:
      "Button-only multilingual Telegram bot for live exchange rates, with an API source, a scraping fallback and saved user preferences.",
    stack: ["Python", "python-telegram-bot", "BeautifulSoup4", "REST", "Railway"],
    liveUrl: "https://t.me/currenvy_bot_for_demo_bot",
    repoUrl: "https://github.com/igor-vuta/currency-exchange-bot",
    shot: "/projects/currency-bot.webp",
  },
  {
    name: "DrivePro Ride-Hailing App",
    blurb:
      "Peer-to-peer rides app: an Expo client over a zero-dependency Node.js backend with a WebSocket hub, live location, route and ETA, and first-accept-wins driver matching.",
    stack: ["React Native (Expo)", "Node.js (stdlib)", "WebSockets", "SQLite", "Claude Code"],
    repoUrl: "https://github.com/igor-vuta/DrivePro_2",
  },
  {
    name: "Student Course Hub",
    blurb:
      "Course catalogue with a role-gated admin CMS, server-rendered in TypeScript on Deno and Oak, with CSRF protection and bcrypt throughout.",
    stack: ["Deno", "Oak", "TypeScript", "SQLite", "Server-side rendering"],
    repoUrl: "https://github.com/igor-vuta/student-course-hub",
  },
  {
    name: "Module Chooser",
    blurb:
      "JavaFX module-selection app with strict MVC separation, credit-aware selection rules and saved state, compiled with plain javac.",
    stack: ["Java", "JavaFX", "MVC", "Object serialization"],
    repoUrl: "https://github.com/igor-vuta/module-chooser-javafx",
  },
  {
    name: "Stackroom",
    blurb:
      "Turns a folder of documents into a public, searchable archive: a Python service with Jinja-templated pages and a light JavaScript frontend.",
    stack: ["Python", "Jinja", "JavaScript", "CSS"],
    repoUrl: "https://github.com/igor-vuta/stackroom",
  },
  {
    name: "Table CRM",
    blurb:
      "Desktop tool that turns grouped photos into spreadsheet rows with EasyOCR and OpenCV; walkthrough on request.",
    stack: ["Python", "tkinter", "EasyOCR", "OpenCV", "openpyxl"],
  },
  {
    name: "Intro Skipper",
    blurb:
      "Chrome Manifest V3 extension that detects and skips intros and outros on Netflix and Kinopoisk HD; walkthrough on request.",
    stack: ["JavaScript", "Chrome Manifest V3", "CSS"],
  },
];

const intakeSaving =
  "Cut repetitive manual data entry by 30%, measured by timing device intake before and after rollout";

export const experience = [
  {
    company: "Papa Gadget",
    role: "Software Developer, Telegram Bots & CRM Integration",
    period: "Feb 2024 - Sep 2024",
    // The logbook's one headline figure. `source` is the bullet it summarises:
    // the logbook leaves that bullet out beside the figure, and the TL;DR
    // quotes it.
    metric: { value: "30%", label: "less manual data entry, timed before and after rollout", source: intakeSaving },
    points: [
      "Worked in a two-person development team on two Python Telegram bots against the RemOnline CRM, including a staff intake bot with login and a whitelist so only authorised staff could write",
      intakeSaving,
      "Built automation scripts against REST APIs and JSON, and documented the processes so shop staff could support the tools themselves",
    ],
  },
  {
    company: "Kovacs Group (agency), on site at DPD",
    role: "Warehouse Operative",
    period: "Dec 2025 - Sep 2026",
    points: [
      "Parcel sorting, scanning and dispatch preparation against tight delivery deadlines in a high-volume logistics operation",
      "Held accuracy and throughput across shifts while completing my final year and the Intelli-Factory project in parallel",
    ],
  },
];

export const internships = {
  note: "2023",
  items: [
    {
      org: "Kaspi Bank",
      context: "Leading fintech ecosystem in Kazakhstan",
      period: "Jun - Jul 2023",
      point:
        "First-line technical support for internal users, resolving software and hardware issues to deadline; JIRA ticket hygiene and written troubleshooting documentation.",
    },
    {
      org: "Kazakhfilm",
      context: "The national film studio of Kazakhstan",
      period: "Sep - Oct 2023",
      point:
        "Account setup, device connectivity and CCTV support for staff; documented requests and incidents and kept the hardware and software inventory in order.",
    },
  ],
};

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
    items: ["TypeScript", "Python 3.12", "SQL", "JavaScript (ES6+)", "HTML5", "CSS3/SCSS", "PHP 8", "Java"],
  },
  {
    group: "Frontend",
    items: ["Next.js (App Router)", "React", "Vue 3", "React Native (Expo)", "Tailwind CSS", "Zustand", "Recharts", "jQuery", "i18n", "Accessibility (WCAG)"],
  },
  {
    group: "Backend",
    items: ["FastAPI", "Node.js", "Express", "Deno / Oak", "REST / OpenAPI", "WebSockets", "Prisma ORM", "PostgreSQL", "MySQL", "SQLite", "Redis (familiar)"],
  },
  {
    group: "Algorithms",
    items: ["DEAP", "NSGA-II multi-objective GA", "Pareto-front analysis", "Hypervolume metrics", "Benchmarking"],
  },
  {
    group: "Testing & DevOps",
    items: ["pytest · TDD", "Docker Compose", "Git & GitHub", "GitHub Actions CI", "Vercel · Render · Aiven", "OWASP practices", "Claude Code (daily)"],
  },
];
