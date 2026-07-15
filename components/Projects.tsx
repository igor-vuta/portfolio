import Reveal from "@/components/Reveal";
import { projects } from "@/lib/profile";

export default function Projects() {
  return (
    <section id="projects" className="border-t border-line">
      <div className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-clay">
            Selected work
          </p>
          <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Projects
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.name} delay={i * 90} className="h-full">
              <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-7 transition hover:border-clay/50">
                <h3 className="font-serif text-2xl font-semibold">{p.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-fog">{p.blurb}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-line bg-oat px-3 py-1 text-xs text-fog"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex gap-5 text-sm font-medium">
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-clay transition hover:underline"
                    >
                      Live ↗
                    </a>
                  )}
                  {p.repoUrl && (
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-fog transition hover:text-ink"
                    >
                      Code ↗
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
