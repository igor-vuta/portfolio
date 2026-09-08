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
      eyebrow="Roles · Internships · Certifications · Skills"
      title="Experience &amp; Credentials"
    >
      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {experience.map((job) => (
          <Reveal key={job.company}>
            <LabelledPanel label={job.company} note={job.period}>
              <p className="text-detail font-medium text-clay">{job.role}</p>
              <ul className="mt-4 space-y-2.5 text-detail text-fog">
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

        {/* Internships sit in the grid beside the roles above rather than as a
            single line under the certificates. They are work history, and the
            previous footnote treatment put them below an unrelated column. */}
        <Reveal delay={60}>
          <LabelledPanel label="Internships" note={internships.note}>
            <ul className="space-y-5">
              {internships.items.map((it) => (
                <li key={it.org}>
                  <p className="text-detail font-medium text-clay">
                    {it.org}
                    <span className="ml-2 text-micro text-fog">
                      {it.period}
                    </span>
                  </p>
                  <p className="silk-sm mt-1 text-fog">{it.context}</p>
                  <p className="mt-2 text-detail text-fog">{it.point}</p>
                </li>
              ))}
            </ul>
          </LabelledPanel>
        </Reveal>

        <Reveal delay={120}>
          <ul className="flex h-full flex-col gap-4">
            {certifications.map((c) => (
              <li key={c.name} className="panel flex-1 p-5">
                <h3 className="text-detail font-semibold">{c.name}</h3>
                <p className="mt-1.5 text-micro text-fog">
                  {c.issuer}
                </p>

                {c.verifyUrl ? (
                  <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <a
                      href={c.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link text-micro font-medium"
                    >
                      Verify credential ↗
                    </a>
                    {c.code && (
                      <span className="readout text-micro text-fog">
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
                        className="well readout px-2 py-1 text-tag text-ink"
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
