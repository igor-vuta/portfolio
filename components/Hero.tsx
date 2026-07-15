import Reveal from "@/components/Reveal";
import { identity } from "@/lib/profile";

export default function Hero() {
  return (
    <section id="top" className="hero-glow relative overflow-hidden">
      <div className="grid-lines pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-36 sm:pt-44">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-fog">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            Open to entry-level developer roles — {identity.location}
          </p>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl">
            {identity.name}
          </h1>
        </Reveal>
        <Reveal delay={180}>
          <p className="mt-4 font-mono text-sm text-amber sm:text-base">
            {identity.role} · {identity.stackLine}
          </p>
        </Reveal>
        <Reveal delay={270}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-fog sm:text-lg">
            {identity.summary}
          </p>
        </Reveal>
        <Reveal delay={360}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#flagship"
              className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-ink transition hover:bg-amber"
            >
              Explore Intelli-Factory ↓
            </a>
            <a
              href={identity.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line px-5 py-3 text-sm font-medium transition hover:border-accent/60 hover:text-amber"
            >
              GitHub ↗
            </a>
            <a
              href={identity.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line px-5 py-3 text-sm font-medium transition hover:border-accent/60 hover:text-amber"
            >
              LinkedIn ↗
            </a>
          </div>
        </Reveal>
        <Reveal delay={450}>
          <p className="mt-8 text-sm text-fog">
            {identity.degree} · {identity.availability}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
