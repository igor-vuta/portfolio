import Reveal from "@/components/Reveal";
import Section from "@/components/ui/Section";
import { ExternalLink } from "@/components/ui/Control";
import {
  certifications,
  experience,
  internships,
  skills,
} from "@/lib/profile";

/**
 * The logbook. Roles and internships hang off one depth line, in the order
 * the profile gives them (the development role leads), each marked with its
 * period. Certificates and skills follow as ledgers on hairlines.
 *
 * It replaced a carousel of equal panels: three and four entries of very
 * different length left half-empty cards, and the chapter had the same shape
 * as every other one on the page. Nothing here floats; the line is the dive.
 */

/**
 * Shared by the Experience page and the home page's teaser. The teaser is
 * compact: period, organisation, role, and the headline figure where there is
 * one, without the bullet points.
 */
type Entry = {
  org: string;
  period: string;
  title: string;
  context?: string;
  metric?: { value: string; label: string };
  points: string[];
};

export function Logbook({ compact = false }: { compact?: boolean }) {
  const entries: Entry[] = [
    ...experience.map((job) => ({
      org: job.company,
      period: job.period,
      title: job.role,
      metric: job.metric,
      points: job.points.filter((pt) => pt !== job.metric?.source),
    })),
    ...internships.items.map((it) => ({
      org: it.org,
      period: it.period,
      title: "Internship",
      context: it.context,
      points: [it.point],
    })),
  ];

  return (
    <ol className="divelog mt-12">
      {entries.map((e) => (
        <li key={e.org} className="divelog-entry">
          <p className="divelog-when readout text-micro text-fog">{e.period}</p>
          <Reveal>
            <h3 className="text-body-lg font-semibold text-ink">{e.org}</h3>
            <p className="mt-1 text-detail font-medium text-clay">{e.title}</p>
            {e.context && (
              <p className="mt-1 text-micro text-fog">{e.context}</p>
            )}
            {e.metric && (
              <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="readout text-metric font-medium text-ink">
                  {e.metric.value}
                </span>
                <span className="text-detail text-fog">{e.metric.label}</span>
              </p>
            )}
            {!compact && (
              <ul className="measure mt-4 space-y-2.5 text-detail text-fog">
                {e.points.map((pt) => (
                  <li key={pt} className="flex gap-3">
                    {/* Marker is decorative; the <li> already conveys list
                        membership to assistive tech. */}
                    <span
                      className="mt-2 h-px w-3 shrink-0 bg-line-2"
                      aria-hidden="true"
                    />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

export default function Credentials() {
  return (
    <Section
      id="credentials"
      eyebrow="Roles, internships, certifications and skills"
      title="Experience &amp; Credentials"
    >
      <Logbook />

      <h3 className="mt-16 text-display-md font-semibold text-ink">
        Certificates
      </h3>
      <ul className="ledger mt-6">
        {certifications.map((c) => (
          <li key={c.name}>
            <Reveal>
              <article className="ledger-row">
                <h4 className="text-body font-semibold text-ink">{c.name}</h4>
                <p className="text-detail text-fog">
                  {c.issuer}
                  {c.code && (
                    <span className="readout ml-3 whitespace-nowrap text-micro" translate="no">
                      <span className="silk-sm">CODE</span> {c.code}
                    </span>
                  )}
                </p>
                <div className="ledger-action">
                  {c.verifyUrl ? (
                    <ExternalLink href={c.verifyUrl} size="sm">
                      Verify
                    </ExternalLink>
                  ) : (
                    /* Stated, so a missing link reads as a property of the
                       certificate rather than a broken row. */
                    <p className="text-micro text-fog">No online verification</p>
                  )}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>

      {/* ── Skills matrix ──────────────────────────────────────────────────
          A definition list, because that is the actual relationship: each
          group heading defines the set beneath it. Set as a mono line per
          group rather than a chip per item: forty-odd chips in wells read as
          texture, not as a list anyone would scan. */}
      <h3 className="mt-16 text-display-md font-semibold text-ink">Skills</h3>
      <Reveal>
        <dl className="ledger mt-6">
          {skills.map((row) => (
            <div key={row.group} className="ledger-row">
              <dt className="text-body font-semibold text-ink">{row.group}</dt>
              <dd className="m-0 md:col-span-2">
                <ul translate="no" className="readout flex flex-wrap gap-x-2 gap-y-1 text-detail text-fog">
                  {row.items.map((item, i) => (
                    <li key={item}>
                      {item}
                      {i < row.items.length - 1 && (
                        <span aria-hidden="true" className="ml-2 text-mute">·</span>
                      )}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  );
}
