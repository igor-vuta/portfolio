import Link from "next/link";
import { experience, flagship, identity } from "@/lib/profile";
import { DownloadLink, ExternalLink } from "@/components/ui/Control";

export { default as TlDrWatch } from "@/components/TlDrWatch";

/**
 * The 60-second version: the facts a recruiter opens a portfolio to find,
 * on one card.
 *
 * A native [popover], centred in the top layer over any page, closing with
 * Esc or a click outside. It is mostly a reward for skimmers: TlDrWatch
 * opens it, once per session, for a reader who races to the bottom of a
 * page, since someone skimming that fast was looking for exactly this. The
 * only manual way in is a quiet line in the footer.
 *
 * Every fact is read from lib/profile, so the summary cannot drift from the
 * page it summarises.
 */
export default function TlDr() {
  const role = experience[0];
  const lead = flagship.metrics[0];
  const runs = flagship.metrics[5];

  const facts = [
    { k: "Availability", v: identity.availability },
    { k: "Degree", v: identity.degree },
    {
      k: "Flagship",
      v: `${flagship.name}: ${lead.value} ${lead.label}, over ${runs.value} ${runs.label}. Deployed on Vercel, Render and Aiven.`,
    },
    { k: "Commercial", v: `${role.role} at ${role.company}. ${role.metric?.source ?? role.points[0]}.` },
    { k: "Stack", v: identity.stackLine },
    { k: "Based in", v: identity.location },
  ];

  return (
    <div
      id="tldr"
      popover="auto"
      role="dialog"
      aria-labelledby="tldr-title"
      data-print="hide"
      className="tldr"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {/* Two kickers, one shown: TlDrWatch marks the card
              data-reason="fast" when it opens it for a reader racing down the
              page, so the card says why it appeared. Opened from the footer,
              it simply introduces itself. */}
          <p className="text-body-lg font-medium text-clay">
            <span className="tldr-fast">Scrolling too fast? Here is the short version.</span>
            <span className="tldr-calm">The 60-second version</span>
          </p>
          <h2 id="tldr-title" className="display mt-2 text-display-lg text-ink">
            TL;DR
          </h2>
          <p className="mt-1 text-body-lg text-fog">
            {identity.name}, {identity.role}
          </p>
        </div>
        <button
          type="button"
          popoverTarget="tldr"
          popoverTargetAction="hide"
          className="ctl ctl-sm ctl-quiet shrink-0"
        >
          Close
        </button>
      </div>

      <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {facts.map((f) => (
          <div key={f.k}>
            <dt className="silk-sm text-fog">{f.k}</dt>
            <dd className="mt-1.5 text-detail text-ink">{f.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <a
          href={`mailto:${identity.email}`}
          className="ctl ctl-primary readout"
          data-print-url="skip"
        >
          {identity.email}
        </a>
        <DownloadLink href={identity.cv}>Download CV (PDF, 1 page)</DownloadLink>
        <Link href="/intelli-factory/" className="ctl">
          Read the case study
        </Link>
        <ExternalLink href={identity.linkedin} variant="quiet">
          LinkedIn
        </ExternalLink>
      </div>
    </div>
  );
}
