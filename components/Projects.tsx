import Reveal from "@/components/Reveal";
import Carousel from "@/components/Carousel";
import Section from "@/components/ui/Section";
import { ExternalLink, PageLink } from "@/components/ui/Control";
import { projects, type Project } from "@/lib/profile";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Three rhythms, so the section is not thirteen identical tiles:
 *
 *   1. The flagship, full width: capture on one side, story on the other.
 *   2. The other live projects, a coverflow carousel: each led by a
 *      capture of the deployed site, drifting past like a current.
 *   3. Source-only work, compact: no capture exists, so none is faked.
 *
 * The source-only grid is 3 columns at desktop and 2 at tablet, and holds 6,
 * so every row is full at both. Every block floats.
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

      <LiveCarousel />

      <h3 className="mt-24 text-display-md font-semibold text-ink">
        Source and walkthroughs
      </h3>
      <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sourceOnly.map((p, i) => (
          <li key={p.name} className="h-full">
            <Reveal delay={(i % 3) * 60} className="h-full">
              <article
                data-buoy="drift"
                className="panel panel-interactive flex h-full flex-col p-6"
              >
                <h4 className="text-body font-semibold text-ink">{p.name}</h4>
                <p className="mt-2 flex-1 text-detail text-fog">{p.blurb}</p>
                <Stack items={p.stack} />
                <Links project={p} />
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/**
 * The current: the live projects other than the flagship, drifting past as
 * a coverflow. Shared by this page and the home page's teaser, so the two
 * can never show different work.
 *
 * Carousel cards float but are not buoys: in a carousel a mouse drag scrolls
 * the track, so the card must not also be picked up.
 */
export function LiveCarousel({
  title = "Live, and yours to try",
}: {
  title?: string;
}) {
  const [, ...rest] = projects.filter((p) => p.liveUrl && p.shot);
  return (
    <Carousel
      label="Live projects"
      variant="coverflow"
      heading={<h3 className="text-display-md font-semibold text-ink">{title}</h3>}
    >
      {rest.map((p) => (
        <article
          key={p.name}
          className="panel panel-interactive bob flex h-full flex-col overflow-hidden"
        >
          <Shot project={p} />
          <div className="flex flex-1 flex-col p-6">
            <h4 className="text-body-lg font-semibold text-ink">{p.name}</h4>
            <p className="mt-2 flex-1 text-detail text-fog">{p.blurb}</p>
            <Stack items={p.stack} />
            <Links project={p} />
          </div>
        </article>
      ))}
    </Carousel>
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
function Stack({ items }: { items: string[] }) {
  return (
    // translate="no": auto-translate turns "Next.js 14" and "FastAPI" into
    // nonsense, and these are names, not words.
    <ul translate="no" className="mt-5 flex flex-wrap gap-1.5">
      {items.map((s) => (
        <li key={s} className="well readout px-2 py-1 text-tag text-fog">
          {s}
        </li>
      ))}
    </ul>
  );
}

function Links({ project: p }: { project: Project }) {
  // Source-only work states its status as a line of text, not a disabled
  // button: six greyed-out controls in one grid read as six broken things.
  // Private repositories already say "walkthrough on request" in the blurb.
  if (!p.liveUrl) {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-5">
        {p.repoUrl && (
          <ExternalLink href={p.repoUrl} size="sm">
            Source
          </ExternalLink>
        )}
        <p className="text-micro text-fog">
          {p.repoUrl ? "Source only, no live deployment" : "Private repository"}
        </p>
      </div>
    );
  }

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
