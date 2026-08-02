import Reveal from "@/components/Reveal";
import Section from "@/components/ui/Section";
import { ExternalLink } from "@/components/ui/Control";
import { projects } from "@/lib/profile";

export default function Projects() {
  return (
    <Section
      id="projects"
      eyebrow="Selected work"
      title="Projects"
      lede="Six shipped projects, each with a live deployment and readable source."
    >
      <ul className="mt-12 grid gap-5 md:grid-cols-2">
        {/* The list item is the grid cell directly — `display: contents` would
            drop it from the accessibility tree in some browsers. */}
        {projects.map((p, i) => (
          <li key={p.name} className="h-full">
            <Reveal delay={i * 60} className="h-full">
              <article className="panel panel-interactive flex h-full flex-col">
                <div className="border-b border-line px-6 py-3">
                  <h3 className="text-base font-semibold tracking-tight">
                    {p.name}
                  </h3>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="flex-1 text-sm leading-relaxed text-fog">
                    {p.blurb}
                  </p>

                  {/* Stack is data, so it is set in the readout face and
                      marked up as a list rather than a row of loose spans. */}
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <li
                        key={s}
                        className="well readout px-2 py-1 text-[0.6875rem] leading-none text-fog"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
                    {p.liveUrl ? (
                      <ExternalLink href={p.liveUrl} size="sm">
                        Live
                      </ExternalLink>
                    ) : (
                      /* Absence is stated rather than left as a silent gap, so
                         the two cards without a deployment don't read as an
                         oversight. Focusable, and it explains itself to AT. */
                      <span
                        className="ctl ctl-sm"
                        aria-disabled="true"
                        tabIndex={0}
                      >
                        No live deployment
                      </span>
                    )}

                    {p.repoUrl && (
                      <ExternalLink href={p.repoUrl} size="sm" variant="quiet">
                        Source
                      </ExternalLink>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
