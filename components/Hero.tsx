import Reveal from "@/components/Reveal";
import { identity } from "@/lib/profile";
import { AnchorLink, ExternalLink } from "@/components/ui/Control";

/**
 * Opening panel.
 *
 * The two floating blobs are gone. They carried no information, moved
 * continuously for the entire time the page was open, and were the only
 * elements on the site that existed purely as texture — which is precisely what
 * this redesign is meant to remove.
 *
 * What replaces them is a specification plate: the facts a recruiter opens a
 * portfolio to find — status, work rights, degree, location — set as a legible
 * data block instead of buried in a run-on sentence at the bottom of the fold.
 */
export default function Hero() {
  const plate = [
    { k: "Role", v: identity.role },
    { k: "Location", v: identity.location },
    { k: "Degree", v: identity.degree },
    { k: "Stack", v: identity.stackLine },
  ];

  return (
    <section id="top" aria-labelledby="hero-title">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-28 sm:pt-36">
        <Reveal>
          <p className="silk text-fog">
            {identity.name} — {identity.role}
          </p>
        </Reveal>

        <Reveal delay={60}>
          <h1
            id="hero-title"
            className="display mt-6 max-w-4xl text-display-lg sm:text-display-xl"
          >
            Software that ships — with{" "}
            <span className="text-clay">numbers</span> to prove it.
          </h1>
        </Reveal>

        <Reveal delay={120}>
          <p className="measure mt-8 text-lg leading-relaxed text-fog">
            {identity.summary}
          </p>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <AnchorLink href="#flagship" variant="primary">
              Explore Intelli-Factory
            </AnchorLink>
            <ExternalLink href={identity.github}>GitHub</ExternalLink>
            <ExternalLink href={identity.linkedin}>LinkedIn</ExternalLink>
          </div>
        </Reveal>

        {/* ── Specification plate ─────────────────────────────────────────── */}
        <Reveal delay={240}>
          <dl className="panel mt-14 grid grid-cols-1 gap-px overflow-hidden bg-line sm:grid-cols-2">
            {plate.map((row) => (
              <div key={row.k} className="bg-panel px-5 py-4">
                <dt className="silk-sm text-fog">{row.k}</dt>
                <dd className="mt-2 text-sm leading-snug text-ink">{row.v}</dd>
              </div>
            ))}

            {/* Availability spans the full width — it is the one line a
                recruiter is actually scanning for, and the lamp is paired with
                text so the status never depends on colour alone. */}
            <div className="bg-panel px-5 py-4 sm:col-span-2">
              <dt className="silk-sm text-fog">Availability</dt>
              <dd className="mt-2 text-sm leading-snug text-ink">
                {identity.availability}
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
