import Reveal from "@/components/Reveal";
import ProjectRing from "@/components/ProjectRing";
import Section from "@/components/ui/Section";
import { ExternalLink, PageLink } from "@/components/ui/Control";
import { projects, type Project } from "@/lib/profile";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Three rhythms, so the section is not thirteen identical tiles:
 *
 *   1. The flagship, full width: capture on one side, story on the other.
 *   2. The other live projects, on a wheel the reader turns: each card a
 *      desktop and a phone capture of the deployed site.
 *   3. Source-only work as a ledger: rows on hairlines, not a third grid of
 *      floating blocks. No capture exists, so none is faked, and without one
 *      a card was only a box around a paragraph. A private repository states
 *      its status as text rather than a disabled control; its blurb already
 *      offers a walkthrough.
 */
export default function Projects() {
  const live = projects.filter((p) => p.liveUrl && p.shot);
  const [lead] = live;
  const sourceOnly = projects.filter((p) => !live.includes(p));

  return (
    <Section
      id="projects"
      eyebrow="Selected work"
      title="Projects"
      lede="Thirteen projects, the seven you can open and try listed first. Eleven have public source."
    >
      {lead && (
        <Reveal>
          <article
            data-buoy="drift"
            className="panel panel-interactive mt-14 grid overflow-hidden lg:grid-cols-[1.35fr_1fr]"
          >
            <Shot project={lead} />
            <div className="flex flex-col p-6 sm:p-8">
              <h3 className="text-display-md font-semibold text-ink">
                {lead.name}
              </h3>
              <p className="mt-3 flex-1 text-detail text-fog">{lead.blurb}</p>
              <Stack items={lead.stack} />
              <Links project={lead} />
              <div className="mt-4">
                <PageLink href="/intelli-factory/" size="sm" variant="quiet">
                  Case study
                </PageLink>
              </div>
            </div>
          </article>
        </Reveal>
      )}

      <LiveRing />

      <h3 className="mt-24 text-display-md font-semibold text-ink">
        Source and walkthroughs
      </h3>
      <ul className="ledger mt-6">
        {sourceOnly.map((p) => (
          <li key={p.name}>
            <Reveal>
              <article className="ledger-row">
                <h4 className="text-body font-semibold text-ink">{p.name}</h4>
                <div>
                  <p className="measure text-detail text-fog">{p.blurb}</p>
                  <Stack items={p.stack} max={4} className="mt-3" />
                </div>
                <div className="ledger-action flex gap-2">
                  {p.liveUrl && (
                    <ExternalLink href={p.liveUrl} size="sm" preview previewLabel={p.name}>
                      Live
                    </ExternalLink>
                  )}
                  {p.repoUrl ? (
                    <ExternalLink href={p.repoUrl} size="sm">
                      Source
                    </ExternalLink>
                  ) : (
                    !p.liveUrl && <p className="text-micro text-fog">Private repository</p>
                  )}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/**
 * The current: the live projects other than the flagship, on a wheel the
 * reader turns (ProjectRing). Shared by this page and the home page's teaser,
 * so the two can never show different work.
 */
export function LiveRing({
  title = "Live, and yours to try",
}: {
  title?: string;
}) {
  const [, ...rest] = projects.filter((p) => p.liveUrl && p.shot);
  return (
    <ProjectRing
      title={title}
      projects={rest.map((p) => ({ name: p.name, shot: p.shot!, phone: p.phone, liveUrl: p.liveUrl! }))}
      details={rest.map((p) => (
        <article key={p.name} className="wheel-detail-body">
          <h4 className="text-body-lg font-semibold text-ink">{p.name}</h4>
          <p className="measure mt-2 text-detail text-fog">{p.blurb}</p>
          <Stack items={p.stack} max={4} className="mt-4" />
          <Links project={p} />
        </article>
      ))}
    />
  );
}

/** A capture of the deployed site, decorative next to the name it sits by. */
function Shot({ project }: { project: Project }) {
  if (!project.shot) return null;
  return (
    <div className="aspect-[16/10] overflow-hidden border-b border-line bg-well lg:border-b-0">
      <img
        src={`${base}${project.shot}`}
        alt=""
        width={800}
        height={500}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover object-top"
      />
    </div>
  );
}

/* Stack is data, so it is set in the readout face and marked up as a list
   rather than a row of loose spans. */
/* The profile lists each stack most-important first, so a card that has to
   stay short passes max={4}: past four the row became a second paragraph. */
function Stack({
  items,
  max,
  className = "mt-5",
}: {
  items: string[];
  max?: number;
  className?: string;
}) {
  return (
    // translate="no": auto-translate turns "Next.js 14" and "FastAPI" into
    // nonsense, and these are names, not words.
    <ul translate="no" className={`flex flex-wrap gap-1.5 ${className}`}>
      {items.slice(0, max).map((s) => (
        <li key={s} className="well readout px-2 py-1 text-tag text-fog">
          {s}
        </li>
      ))}
    </ul>
  );
}

/** Live and source links for a deployed project's card. */
function Links({ project: p }: { project: Project }) {
  if (!p.liveUrl) return null;

  return (
    <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
      <ExternalLink href={p.liveUrl} size="sm" preview previewLabel={p.name}>
        Live
      </ExternalLink>
      {p.repoUrl && (
        <ExternalLink href={p.repoUrl} size="sm" variant="quiet">
          Source
        </ExternalLink>
      )}
    </div>
  );
}
