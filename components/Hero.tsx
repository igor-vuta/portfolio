import Reveal from "@/components/Reveal";
import { identity } from "@/lib/profile";

export default function Hero() {
  return (
    <section id="top">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-40 sm:pt-48">
        <Reveal>
          <p className="text-sm text-fog">
            {identity.name} · {identity.role} · {identity.location}
          </p>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Software that ships — with numbers to prove it.
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
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-clay"
            >
              Explore Intelli-Factory ↓
            </a>
            <a
              href={identity.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium transition hover:border-clay hover:text-clay"
            >
              GitHub ↗
            </a>
            <a
              href={identity.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium transition hover:border-clay hover:text-clay"
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
