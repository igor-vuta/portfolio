import type { CSSProperties } from "react";
import Reveal from "@/components/Reveal";
import LiveDevice from "@/components/LiveDevice";
import Stage3D from "@/components/Stage3D";
import { flagship, identity, projects } from "@/lib/profile";
import { AnchorLink, ExternalLink, SrOnly } from "@/components/ui/Control";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Opening stage.
 *
 * A pinned, dark scene: the flagship running on a tablet that starts lying
 * back on the "table" and rolls up to face the reader as they scroll, while
 * the other live projects drift out from behind it into orbit. The device and
 * the cards are real captures of the deployed sites, not drawn UI.
 *
 * All motion is CSS scroll-driven animation (see STAGE in globals.css): no
 * bundle cost, compositor-only, and exactly tied to scroll position. The
 * markup below is laid out as a complete static composition first; pinning
 * and the roll are layered on only where the browser supports view timelines
 * and the reader has not asked for reduced motion.
 *
 * The specification plate follows the stage unchanged: status, work rights,
 * degree, location. It is what a recruiter opens a portfolio to find.
 */

/* Where each orbiting card settles once the device is upright: offset from
   the stage centre, tilt, and scale. The flight out to it is derived in CSS
   (scale and swing around the stage centre), so only the destination is
   data. `front` cards pass over the device, the rest behind it, which is what
   sells the depth without a 3D context.

   Passed as --d* ("desktop") rather than the names CSS reads: an inline
   custom property outranks every stylesheet rule, so the mobile positions in
   CSS could never override it. The stylesheet maps --d* onto the working
   names, and the mobile query remaps them. */
const flights: { to: [string, string, string, number]; front?: boolean }[] = [
  { to: ["-35vw", "-21vh", "-6deg", 0.92] },
  { to: ["-37vw", "14vh", "4deg", 1], front: true },
  { to: ["34vw", "-23vh", "5deg", 0.9] },
  { to: ["37vw", "9vh", "-4deg", 1.04], front: true },
  { to: ["27vw", "31vh", "3deg", 0.82], front: true },
];

function flightStyle(i: number): CSSProperties {
  const [x, y, r, s] = flights[i].to;
  return { "--dx1": x, "--dy1": y, "--dr1": r, "--ds1": s } as CSSProperties;
}

export default function Hero() {
  const plate = [
    { k: "Role", v: identity.role },
    { k: "Location", v: identity.location },
    { k: "Degree", v: identity.degree },
    { k: "Stack", v: identity.stackLine },
  ];

  const lead = projects.find((p) => p.name === flagship.name);
  const orbit = projects
    .filter((p) => p.shot && p.liveUrl && p.name !== flagship.name)
    .slice(0, flights.length);

  return (
    <section id="top" aria-labelledby="hero-title">
      <div className="stage">
        <div className="stage-frame">
          {/* Copy comes first in the DOM so the h1 opens the document for
              assistive tech; it is stacked above the scene visually. */}
          <div className="stage-copy">
            <div className="mx-auto max-w-6xl px-6">
              <p className="text-body-lg font-medium text-fog">
                {identity.name}, {identity.role}
              </p>

              <h1
                id="hero-title"
                className="display mt-3 max-w-3xl text-display-lg text-cream sm:text-display-xl"
              >
                Software that ships, with{" "}
                <span className="text-clay-soft">numbers</span> to prove it.
              </h1>

              <p className="measure mt-5 text-body-lg text-fog">
                {identity.pitch}
              </p>

              {/* GitHub is already the header's primary action; repeating it
                  here would be the same intent twice in one viewport. */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <AnchorLink href="#flagship" variant="primary">
                  Explore Intelli-Factory
                </AnchorLink>
                <ExternalLink href={identity.linkedin}>LinkedIn</ExternalLink>
              </div>
            </div>
          </div>

          <div className="stage-scene">
            <Stage3D />
            <ul className="stage-orbit" aria-label="More live projects">
              {orbit.map((p, i) => (
                <li
                  key={p.name}
                  className={`stage-card ${flights[i].front ? "is-front" : ""}`}
                  style={flightStyle(i)}
                >
                  <span className="stage-card-fly">
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="stage-card-link"
                    data-preview=""
                    data-preview-label={p.name}
                  >
                    <span className="stage-card-body">
                      <img
                        src={`${base}${p.shot}`}
                        alt=""
                        width={800}
                        height={500}
                        loading="eager"
                        decoding="async"
                      />
                      <span className="stage-card-name">
                        {p.name}
                        <span aria-hidden="true" className="opacity-70">
                          ↗
                        </span>
                      </span>
                    </span>
                    <SrOnly>(opens a live preview)</SrOnly>
                  </a>
                  </span>
                </li>
              ))}
            </ul>

            {lead?.shot && (
              <figure className="stage-device">
                <span className="device-shadow" aria-hidden="true" />
                <LiveDevice
                  name={flagship.name}
                  tagline={flagship.tagline}
                  shot={`${base}${lead.shot}`}
                  alt={`${flagship.name}, the live landing page: supply-chain matching across customers, manufacturers and logistics.`}
                  liveUrl={flagship.liveUrl}
                />
              </figure>
            )}
          </div>
        </div>
      </div>

      {/* ── Specification plate ─────────────────────────────────────────── */}
      <div className="stage-tail">
        <div className="mx-auto max-w-6xl px-6 pb-20">
          <Reveal>
            <dl data-buoy="drift" className="panel grid grid-cols-1 gap-px overflow-hidden bg-line sm:grid-cols-2">
              {plate.map((row) => (
                <div key={row.k} className="bg-panel px-5 py-4">
                  <dt className="silk-sm text-fog">{row.k}</dt>
                  <dd className="mt-2 text-detail text-ink">{row.v}</dd>
                </div>
              ))}

              {/* Availability spans the full width: it is the one line a
                  recruiter is actually scanning for. */}
              <div className="bg-panel px-5 py-4 sm:col-span-2">
                <dt className="silk-sm text-fog">Availability</dt>
                <dd className="mt-2 text-detail text-ink">
                  {identity.availability}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
