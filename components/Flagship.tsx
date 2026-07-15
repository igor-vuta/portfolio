import Reveal from "@/components/Reveal";
import ParetoChart from "@/components/ParetoChart";
import CountUp from "@/components/CountUp";
import { flagship } from "@/lib/profile";

export default function Flagship() {
  return (
    <section id="flagship" className="border-t border-line">
      <div className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-clay">
            {flagship.eyebrow}
          </p>
          <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-6xl">
            {flagship.name}
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-fog">{flagship.tagline}</p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start">
          <div>
            <Reveal>
              <p className="leading-relaxed text-fog">{flagship.description}</p>
            </Reveal>
            <div className="mt-8 space-y-4">
              {flagship.pillars.map((pillar, i) => (
                <Reveal key={pillar.title} delay={i * 100}>
                  <div className="rounded-2xl border border-line bg-card p-6 transition hover:border-clay/50">
                    <h3 className="font-serif text-xl font-semibold">{pillar.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-fog">{pillar.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={140}>
            <ParetoChart />
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3 lg:grid-cols-6">
            {flagship.metrics.map((m) => (
              <div key={m.label} className="bg-card p-6">
                <p className="font-serif text-3xl font-semibold text-ink">
                  <CountUp value={m.value} />
                </p>
                <p className="mt-2 text-xs leading-snug text-fog">{m.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-fog">{flagship.benchmarkNote}</p>
        </Reveal>

        <Reveal>
          <div className="mt-14 rounded-2xl border border-line bg-card p-8">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-fog">
              Production architecture
            </p>
            <div className="mt-6 flex flex-col items-stretch gap-3 md:flex-row md:items-center">
              {flagship.architecture.map((a, i) => (
                <div key={a.layer} className="flex flex-1 items-center gap-3">
                  <div className="w-full rounded-xl border border-line bg-oat px-5 py-4">
                    <p className="text-xs text-fog">{a.layer}</p>
                    <p className="mt-1 text-sm font-medium">{a.tech}</p>
                    <p className="mt-1 text-xs font-medium text-clay">{a.host}</p>
                  </div>
                  {i < flagship.architecture.length - 1 && (
                    <span className="hidden text-fog md:block" aria-hidden="true">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-fog">
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
              className="btn-lift inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-clay"
            >
              <span className="live-dot" aria-hidden="true" />
              Live demo ↗
            </a>
            <a
              href={flagship.apiDocsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium transition hover:border-clay hover:text-clay"
            >
              API docs (Swagger) ↗
            </a>
            <a
              href={flagship.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium transition hover:border-clay hover:text-clay"
            >
              Source &amp; README ↗
            </a>
          </div>
          <p className="mt-4 text-xs text-fog">
            Deployed and running right now — the free-tier API cold-starts in ~50 s on first
            request.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
