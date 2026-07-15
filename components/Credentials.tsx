import Reveal from "@/components/Reveal";
import { certifications, experience, internships, skills } from "@/lib/profile";

export default function Credentials() {
  return (
    <section id="credentials" className="border-t border-line">
      <div className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-clay">
            Experience · Certifications · Skills
          </p>
          <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Credentials
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {experience.map((job) => (
            <Reveal key={job.company}>
              <article className="h-full rounded-2xl border border-line bg-card p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-serif text-2xl font-semibold">{job.company}</h3>
                  <p className="text-xs text-fog">{job.period}</p>
                </div>
                <p className="mt-1 text-sm font-medium text-clay">{job.role}</p>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-fog">
                  {job.points.map((pt) => (
                    <li key={pt} className="flex gap-2">
                      <span className="text-clay" aria-hidden="true">
                        —
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
          <Reveal delay={110}>
            <div className="flex h-full flex-col justify-between gap-4">
              {certifications.map((c) => (
                <article key={c.name} className="rounded-2xl border border-line bg-card p-6">
                  <h3 className="font-serif text-lg font-semibold leading-snug">{c.name}</h3>
                  <p className="mt-1 text-xs text-fog">{c.issuer}</p>
                  {c.verifyUrl && (
                    <p className="mt-3 text-xs">
                      <a
                        href={c.verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-clay transition hover:underline"
                      >
                        Verify credential ↗
                      </a>
                      {c.code && <span className="ml-2 text-fog">code: {c.code}</span>}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal>
          <p className="mt-5 text-sm text-fog">{internships}</p>
        </Reveal>

        <Reveal>
          <div className="mt-14 space-y-5 rounded-2xl border border-line bg-card p-8">
            {skills.map((row) => (
              <div key={row.group} className="flex flex-col gap-2 sm:flex-row sm:items-baseline">
                <p className="w-44 shrink-0 text-xs font-medium uppercase tracking-wider text-fog">
                  {row.group}
                </p>
                <div className="flex flex-wrap gap-2">
                  {row.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-line bg-oat px-3 py-1 text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
