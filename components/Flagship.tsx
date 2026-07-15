import Reveal from "@/components/Reveal";
import ParetoChart from "@/components/ParetoChart";
import { flagship } from "@/lib/profile";

export default function Flagship() {
  return (
    <section id="flagship" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          {flagship.eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
          {flagship.name}
        </h2>
        <p className="mt-3 max-w-3xl text-lg text-fog">{flagship.tagline}</p>
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start">
        <div>
          <Reveal>
            <p className="leading-relaxed text-fog">{flagship.description}</p>
          </Reveal>
          <div className="mt-8 space-y-4">
            {flagship.pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 110}>
                <div className="rounded-2xl border border-line bg-card p-5 transition hover:border-accent/40">
                  <h3 className="font-semibold text-amber">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fog">{pillar.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={150}>
          <ParetoChart />
        </Reveal>
      </div>

      <Reveal>
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {flagship.metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-line bg-panel p-5">
              <p className="font-mono text-2xl font-bold text-amber">{m.value}</p>
              <p className="mt-2 text-xs leading-snug text-fog">{m.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-fog">{flagship.benchmarkNote}</p>
      </Reveal>

      <Reveal>
        <div className="mt-12 rounded-2xl border border-line bg-panel p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fog">
            Production architecture
          </p>
          <div className="mt-5 flex flex-col items-stretch gap-3 md:flex-row md:items-center">
            {flagship.architecture.map((a, i) => (
              <div key={a.layer} className="flex flex-1 items-center gap-3">
                <div className="w-full rounded-xl border border-line bg-card px-4 py-3">
                  <p className="text-xs text-fog">{a.layer}</p>
                  <p className="mt-1 text-sm font-medium">{a.tech}</p>
                  <p className="mt-1 font-mono text-xs text-amber">{a.host}</p>
                </div>
                {i < flagship.architecture.length - 1 && (
                  <span className="hidden text-fog md:block" aria-hidden="true">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-fog">
            Docker Compose for local development · 51 automated pytest tests · Ruff + ESLint ·
            Brevo SMTP email verification · state-machine-enforced request lifecycle
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={flagship.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-ink transition hover:bg-amber"
          >
            Live demo ↗
          </a>
          <a
            href={flagship.apiDocsUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-line px-5 py-3 text-sm font-medium transition hover:border-accent/60 hover:text-amber"
          >
            API docs (Swagger) ↗
          </a>
          <a
            href={flagship.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-line px-5 py-3 text-sm font-medium transition hover:border-accent/60 hover:text-amber"
          >
            Source & README ↗
          </a>
        </div>
      </Reveal>
    </section>
  );
}
