import Reveal from "@/components/Reveal";
import ParetoChart from "@/components/ParetoChart";
import CountUp from "@/components/CountUp";
import Section, { LabelledPanel } from "@/components/ui/Section";
import { ExternalLink } from "@/components/ui/Control";
import { flagship } from "@/lib/profile";

export default function Flagship() {
  return (
    <Section
      id="flagship"
      eyebrow={flagship.eyebrow}
      title={flagship.name}
      lede={flagship.tagline}
    >
      <div className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-start">
        <div>
          <Reveal>
            <p className="measure text-fog">
              {flagship.description}
            </p>
          </Reveal>

          <div className="mt-8 space-y-4">
            {flagship.pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 60}>
                <LabelledPanel label={pillar.title} interactive>
                  <p className="text-detail text-fog">
                    {pillar.body}
                  </p>
                </LabelledPanel>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={60}>
          <ParetoChart />
        </Reveal>
      </div>

      {/* ── Benchmark readouts ──────────────────────────────────────────────
          Recessed wells: the page reports these, the user doesn't act on them.
          Tabular figures so the column reads straight down while counting. */}
      <Reveal>
        <div className="mt-16">
          <div className="border-b border-line pb-3">
            <p className="silk text-fog">Verified benchmark</p>
          </div>

          <dl className="mt-px grid grid-cols-2 gap-px bg-line md:grid-cols-3 lg:grid-cols-6">
            {flagship.metrics.map((m) => (
              <div key={m.label} className="well relative rounded-none p-5">
                <dd className="readout text-metric font-medium text-ink">
                  <CountUp value={m.value} />
                </dd>
                {/* The labels carry figures too ("8.02 → 4.67 days",
                    "120 × 30 seeds"), so they take tabular figures alongside
                    the readouts above them — otherwise the digits in the
                    caption row wander while the row above holds its columns. */}
                <dt className="mt-2 text-micro tabular-nums text-fog">
                  {m.label}
                </dt>
              </div>
            ))}
          </dl>

          <p className="mt-3 text-micro text-fog">{flagship.benchmarkNote}</p>
        </div>
      </Reveal>

      {/* ── Signal path ─────────────────────────────────────────────────────
          Read as a chain, because that is what it is. The arrow is decorative
          and hidden; the ordered list carries the sequence for assistive tech. */}
      <Reveal>
        <LabelledPanel
          label="Production architecture"
          className="mt-16"
        >
          <ol className="flex flex-col items-stretch gap-3 md:flex-row md:items-stretch">
            {flagship.architecture.map((a, i) => (
              <li key={a.layer} className="flex flex-1 items-center gap-3">
                <div className="well w-full px-5 py-4">
                  <p className="silk-sm text-fog">{a.layer}</p>
                  <p className="mt-2 text-detail font-medium text-ink">{a.tech}</p>
                  <p className="readout mt-1 text-micro text-clay">{a.host}</p>
                </div>
                {i < flagship.architecture.length - 1 && (
                  <span
                    className="hidden shrink-0 text-line-2 md:block"
                    aria-hidden="true"
                  >
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>

          <p className="mt-5 border-t border-line pt-4 text-micro text-fog">
            Docker Compose for local development · 51 automated pytest tests ·
            Ruff + ESLint · Brevo SMTP email verification ·
            state-machine-enforced request lifecycle
          </p>
        </LabelledPanel>
      </Reveal>

      <Reveal>
        <div className="mt-10 flex flex-wrap gap-3">
          <ExternalLink
            href={flagship.liveUrl}
            variant="primary"
          >
            Live demo
          </ExternalLink>
          <ExternalLink href={flagship.apiDocsUrl}>
            API docs (Swagger)
          </ExternalLink>
          <ExternalLink href={flagship.repoUrl}>Source &amp; README</ExternalLink>
        </div>

        {/* Stated plainly rather than discovered by a user staring at a blank
            tab for a minute — the free tier really does cold-start. */}
        <p className="mt-4 text-micro text-fog">
          Deployed and running right now — the free-tier API cold-starts in
          roughly 50 seconds on the first request.
        </p>
      </Reveal>
    </Section>
  );
}
