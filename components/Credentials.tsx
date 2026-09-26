import Reveal from "@/components/Reveal";
import Carousel from "@/components/Carousel";
import Section, { LabelledPanel } from "@/components/ui/Section";
import {
  certifications,
  experience,
  internships,
  skills,
} from "@/lib/profile";

/**
 * The logbook. Roles and internships read as entries in one carousel, in
 * the order the profile gives them (the development role leads), each with
 * its period as the entry's heading line. Certificates follow as one full
 * row of three, then the skills matrix.
 */
/**
 * Roles and internships as one carousel of entries. Shared by the
 * Experience page and the home page's teaser.
 */
export function Logbook() {
  const entries = [
    ...experience.map((job) => ({
      key: job.company,
      org: job.company,
      period: job.period,
      title: job.role,
      context: undefined as string | undefined,
      points: job.points,
    })),
    ...internships.items.map((it) => ({
      key: it.org,
      org: it.org,
      period: it.period,
      title: "Internship",
      context: it.context,
      points: [it.point],
    })),
  ];

  return (
    <Carousel label="Logbook" variant="log">
        {entries.map((e) => (
          <article key={e.key} className="panel bob flex h-full flex-col p-6">
            <p className="readout text-micro text-fog">{e.period}</p>
            <h3 className="mt-3 text-body-lg font-semibold text-ink">{e.org}</h3>
            <p className="mt-1 text-detail font-medium text-clay">{e.title}</p>
            {e.context && (
              <p className="mt-1 text-micro text-fog">{e.context}</p>
            )}
            <ul className="mt-4 space-y-2.5 text-detail text-fog">
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
          </article>
        ))}
      </Carousel>
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

      <ul className="mt-16 grid gap-5 md:grid-cols-3">
        {certifications.map((c, i) => (
          <li key={c.name} className="h-full">
            <Reveal delay={i * 60} className="h-full">
              <div data-buoy="drift" className="panel flex h-full flex-col p-5">
                <h3 className="text-detail font-semibold">{c.name}</h3>
                <p className="mt-1.5 flex-1 text-micro text-fog">{c.issuer}</p>

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
                      <span className="readout text-micro text-fog" translate="no">
                        <span className="silk-sm">CODE</span> {c.code}
                      </span>
                    )}
                  </p>
                ) : (
                  /* Stated, so a missing link reads as a property of the
                     certificate rather than a broken card. */
                  <p className="mt-3 text-micro text-fog">
                    Certificate of attendance, no online verification
                  </p>
                )}
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      {/* ── Skills matrix ──────────────────────────────────────────────────
          A definition list, because that is the actual relationship: each
          group heading defines the set beneath it. */}
      <Reveal>
        <LabelledPanel label="Skills" className="mt-16" buoy="drift">
          <dl className="space-y-5">
            {skills.map((row) => (
              <div
                key={row.group}
                className="flex flex-col gap-2.5 sm:flex-row sm:items-baseline"
              >
                <dt className="silk-sm w-40 shrink-0 text-fog">{row.group}</dt>
                <dd className="m-0">
                  <ul translate="no" className="flex flex-wrap gap-1.5">
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
