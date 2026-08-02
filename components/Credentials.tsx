import Reveal from "@/components/Reveal";
import Section, { LabelledPanel } from "@/components/ui/Section";
import { ExternalLink } from "@/components/ui/Control";
import {
  certifications,
  experience,
  internships,
  skills,
} from "@/lib/profile";

export default function Credentials() {
  return (
    <Section
      id="credentials"
      eyebrow="Experience · Certifications · Skills"
      title="Credentials"
    >
      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {experience.map((job) => (
          <Reveal key={job.company}>
            <LabelledPanel label={job.company} note={job.period}>
              <p className="text-sm font-medium text-clay">{job.role}</p>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-fog">
                {job.points.map((pt) => (
                  <li key={pt} className="flex gap-3">
                    {/* Marker is decorative; the <li> already conveys
                        list membership to assistive tech. */}
                    <span
                      className="mt-2 h-px w-3 shrink-0 bg-line-2"
                      aria-hidden="true"
                    />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </LabelledPanel>
          </Reveal>
        ))}

        <Reveal delay={60}>
          <ul className="flex h-full flex-col gap-4">
            {certifications.map((c) => (
              <li key={c.name} className="panel flex-1 p-5">
                <h3 className="text-sm font-semibold leading-snug">{c.name}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-fog">
                  {c.issuer}
                </p>

                {c.verifyUrl ? (
                  <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <a
                      href={c.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link text-xs font-medium"
                    >
                      Verify credential ↗
                    </a>
                    {c.code && (
                      <span className="readout text-xs text-fog">
                        <span className="silk-sm">CODE</span> {c.code}
                      </span>
                    )}
                  </p>
                ) : (
                  /* Stated, so a missing link reads as a property of the
                     certificate rather than a broken card. */
                  <p className="silk-sm mt-3 text-fog">
                    Certificate of attendance — no online verification
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal>
        <p className="mt-5 text-sm text-fog">{internships}</p>
      </Reveal>

      {/* ── Skills matrix ──────────────────────────────────────────────────
          A definition list, because that is the actual relationship: each
          group heading defines the set beneath it. */}
      <Reveal>
        <LabelledPanel label="Skills" className="mt-16">
          <dl className="space-y-5">
            {skills.map((row) => (
              <div
                key={row.group}
                className="flex flex-col gap-2.5 sm:flex-row sm:items-baseline"
              >
                <dt className="silk-sm w-40 shrink-0 text-fog">{row.group}</dt>
                <dd className="m-0">
                  <ul className="flex flex-wrap gap-1.5">
                    {row.items.map((item) => (
                      <li
                        key={item}
                        className="well readout px-2 py-1 text-[0.6875rem] leading-none text-ink"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </LabelledPanel>
      </Reveal>
    </Section>
  );
}
