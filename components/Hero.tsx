import Reveal from "@/components/Reveal";
import { identity } from "@/lib/profile";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <svg
        aria-hidden="true"
        viewBox="0 0 600 600"
        className="hero-blob pointer-events-none absolute -right-40 -top-24 w-[560px] opacity-[0.16] sm:-right-24"
      >
        <path
          fill="#c15f3c"
          d="M437 83c53 41 90 105 96 172 6 68-19 139-67 185-48 45-119 65-186 58-67-6-131-39-168-92-38-53-49-127-25-189 23-62 81-112 144-136 64-25 133-24 206 2z"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 600 600"
        className="hero-blob-2 pointer-events-none absolute -right-64 top-40 w-[480px] opacity-[0.1]"
      >
        <path
          fill="#1f1e1d"
          d="M389 108c60 25 116 74 133 136 18 62-4 137-49 184-45 48-113 68-178 62-64-6-125-38-158-89-33-52-38-123-12-181 27-58 84-103 145-121 61-19 126-13 119 9z"
        />
      </svg>

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-40 sm:pt-48">
        <Reveal>
          <p className="text-sm text-fog">
            {identity.name} · {identity.role} · {identity.location}
          </p>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Software that ships — with{" "}
            <span className="hl">
              numbers
              <svg
                aria-hidden="true"
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
                className="hl-svg"
              >
                <path
                  d="M2 9 C 25 3, 50 11, 98 5"
                  fill="none"
                  stroke="#c15f3c"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={1}
                />
              </svg>
            </span>{" "}
            to prove it.
          </h1>
        </Reveal>
        <Reveal delay={180}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-fog">
            {identity.summary}
          </p>
        </Reveal>
        <Reveal delay={260}>
          <p className="mt-4 text-sm font-medium text-clay">{identity.stackLine}</p>
        </Reveal>
        <Reveal delay={340}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#flagship"
              className="btn-lift rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-clay"
            >
              Explore Intelli-Factory ↓
            </a>
            <a
              href={identity.github}
              target="_blank"
              rel="noreferrer"
              className="btn-lift rounded-full border border-ink/20 px-6 py-3 text-sm font-medium transition hover:border-clay hover:text-clay"
            >
              GitHub ↗
            </a>
            <a
              href={identity.linkedin}
              target="_blank"
              rel="noreferrer"
              className="btn-lift rounded-full border border-ink/20 px-6 py-3 text-sm font-medium transition hover:border-clay hover:text-clay"
            >
              LinkedIn ↗
            </a>
          </div>
        </Reveal>
        <Reveal delay={420}>
          <p className="mt-10 max-w-2xl text-sm text-fog">
            {identity.degree} · {identity.availability}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
