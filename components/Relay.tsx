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
 * On the home page: three doors, floating blocks like everything else on the
 * water. On a branch: a route strip of the other two and the way back.
 */
export default function Relay({
  current,
  title = "Choose your route",
  lede = "The whole dive, or straight to what you came for.",
}: {
  /** The branch being read, left out of its own relay. */
  current?: string;
  title?: string;
  /** Shown with the doors only; the route strip on a branch has no lede. */
  lede?: string;
}) {
  const doors = branches.filter((b) => b.href !== current);

  // At the foot of a branch the relay is a route strip rather than three more
  // panels: the contact block follows directly, and two stacked rows of
  // identical floating blocks read as one repeated ending, not two things.
  const routes = current
    ? [
        ...doors.map((b) => ({ href: b.href, kicker: b.nav, title: b.title, go: "→" })),
        { href: "/", kicker: "Home", title: "Back to the surface", go: "↑" },
      ]
    : [];

  return (
    <section aria-labelledby="relay-title" className="relay">
      <div className={`mx-auto max-w-6xl px-6 ${current ? "pt-16" : "py-24"}`}>
        {current ? (
          <>
            <h2 id="relay-title" className="text-body-lg font-medium text-fog">
              {title}
            </h2>
            <ul className="ledger routes mt-4">
              {routes.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="route">
                    <span className="route-kicker">{r.kicker}</span>
                    <span className="route-title">{r.title}</span>
                    <span className="route-go" aria-hidden="true">
                      {r.go}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
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
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
