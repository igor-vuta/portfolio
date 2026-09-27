import Reveal from "@/components/Reveal";
import Section from "@/components/ui/Section";
import { LiveRing } from "@/components/Projects";
import { Logbook } from "@/components/Credentials";
import { ExternalLink, PageLink } from "@/components/ui/Control";
import { flagship } from "@/lib/profile";

/**
 * The home page's chapters, condensed. Each keeps its original section id,
 * so #flagship, #projects, #credentials and the depth gauge still land, and
 * each ends in a branch: the full chapter on its own page.
 */

export function FlagshipTeaser() {
  // The three figures that carry the claim: better, faster, and at scale.
  const headline = [flagship.metrics[0], flagship.metrics[1], flagship.metrics[5]];

  return (
    <Section
      id="flagship"
      plate="optimise"
      eyebrow={flagship.eyebrow}
      title={flagship.name}
      lede={flagship.tagline}
    >
      {/* Unboxed on purpose: it follows the relay's three doors, and a second
          row of three floating blocks read as the same section twice. The
          figures carry it alone. */}
      <Reveal>
        <ul className="mt-12 grid gap-8 border-t border-line pt-8 md:grid-cols-3">
          {headline.map((m) => (
            <li key={m.label}>
              <p className="readout text-display-lg font-medium text-ink">{m.value}</p>
              <p className="mt-2 text-detail text-fog">{m.label}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <PageLink href="/intelli-factory/" variant="primary">
            Read the case study
          </PageLink>
          <ExternalLink href={flagship.liveUrl} preview previewLabel={flagship.name}>
            Live demo
          </ExternalLink>
        </div>
      </Reveal>
    </Section>
  );
}

export function ProjectsTeaser() {
  return (
    <Section
      id="projects"
      eyebrow="Selected work"
      title="Projects"
      lede="Six more you can open and try, drifting past below. All thirteen, with source, are on their own page."
    >
      <LiveRing />
      <Reveal>
        <div className="mt-10">
          <PageLink href="/projects/">All 13 projects</PageLink>
        </div>
      </Reveal>
    </Section>
  );
}

export function ExperienceTeaser() {
  return (
    <Section
      id="credentials"
      eyebrow="Roles and internships"
      title="Logbook"
      lede="Commercial Python work, operations, and two internships. Certificates and the full skills matrix have their own page."
    >
      <Logbook compact />
      <Reveal>
        <div className="mt-10">
          <PageLink href="/experience/">Certificates and skills</PageLink>
        </div>
      </Reveal>
    </Section>
  );
}
