import Link from "next/link";
import Reveal from "@/components/Reveal";
import { branches } from "@/lib/routes";

/**
 * The relay: where the dive forks. Instead of one long scroll, the reader
 * picks a route: one of the site's branches.
 *
 * On the home page it follows the stage with every route; at the foot of a
 * branch it offers the others plus the way back to the surface, so no page
 * is a dead end and none has to be reached by scrolling past the rest.
 *
 * Three doors everywhere: all three branches on the home page; on a branch,
 * the other two and the way back. Doors are floating blocks like everything
 * else on the water.
 */
export default function Relay({
  current,
  title = "Choose your route",
  lede = "The whole dive, or straight to what you came for.",
}: {
  /** The branch being read, left out of its own relay. */
  current?: string;
  title?: string;
  lede?: string;
}) {
  const doors = branches.filter((b) => b.href !== current);

  return (
    <section aria-labelledby="relay-title" className="relay">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <h2
            id="relay-title"
            className="display text-display-md text-ink sm:text-display-lg"
          >
            {title}
          </h2>
          <p className="measure mt-4 text-body-lg text-fog">{lede}</p>
        </Reveal>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {doors.map((b) => (
            <li key={b.href} className="h-full">
              <Link href={b.href} data-buoy="drift" className="door">
                <span className="door-kicker">{b.nav}</span>
                <span className="door-title">{b.title}</span>
                <span className="door-body">{b.body}</span>
                <span className="door-go" aria-hidden="true">
                  Go →
                </span>
              </Link>
            </li>
          ))}

          {current && (
            <li className="h-full">
              <Link href="/" data-buoy="drift" className="door">
                <span className="door-kicker">Home</span>
                <span className="door-title">Back to the surface</span>
                <span className="door-body">
                  The tablet, the current, and the logbook, from the top.
                </span>
                <span className="door-go" aria-hidden="true">
                  Surface ↑
                </span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
