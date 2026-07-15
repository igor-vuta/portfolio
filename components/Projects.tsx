import Reveal from "@/components/Reveal";
import { projects } from "@/lib/profile";

export default function Projects() {
  return (
    <section id="projects" className="border-t border-line/60 bg-panel/40">
      <div className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Selected work
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Projects</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {projects.map((p, i) => (
            <Reveal key={p.name} delay={i * 110} className="h-full">
              <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-6 transition hover:border-accent/50">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-fog">{p.blurb}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-fog"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex gap-4 text-sm font-medium">
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber transition hover:text-accent"
                    >
                      Live ↗
                    </a>
                  )}
                  {p.repoUrl && (
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-fog transition hover:text-snow"
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
