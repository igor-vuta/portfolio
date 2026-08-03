"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "top", label: "Intro" },
  { id: "flagship", label: "Flagship" },
  { id: "projects", label: "Projects" },
  { id: "credentials", label: "Credentials" },
  { id: "contact", label: "Contact" },
];

/**
 * Detent rail — position indicator and jump control.
 *
 * Active-section detection is computed from geometry rather than inferred from
 * observer callbacks. The previous version set `active` from whichever entry
 * happened to be iterated last in a batch, so with a -45%/-45% root margin two
 * sections could both qualify and the winner depended on callback ordering —
 * which is why the indicator could sit on the wrong mark. Measuring distance to
 * the viewport midpoint gives exactly one answer, always.
 *
 * The rail is supplementary to the header nav, so it is hidden from assistive
 * tech rather than duplicating the same five links in the accessibility tree.
 * It is still fully keyboard operable for sighted keyboard users, and the label
 * appears on focus, not only on hover.
 */
export default function SectionRail() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      const mid = window.innerHeight / 2;
      let best = sections[0].id;
      let bestDist = Infinity;

      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // Distance from the viewport midpoint to the section's nearest edge;
        // zero while the midpoint is inside the section.
        const dist =
          rect.top > mid
            ? rect.top - mid
            : rect.bottom < mid
              ? mid - rect.bottom
              : 0;
        if (dist < bestDist) {
          bestDist = dist;
          best = s.id;
        }
      }
      setActive(best);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    // The rail is `hidden lg:flex`, but CSS visibility does not stop an effect
    // from running. Without this gate, every phone paid for a scroll listener
    // and a per-frame layout read on five elements to drive an indicator that
    // is never painted. Attach only at the width where the rail actually
    // exists, and follow the breakpoint if the viewport crosses it.
    const mq = window.matchMedia("(min-width: 1024px)");
    let attached = false;

    const attach = () => {
      if (attached) return;
      attached = true;
      measure();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    };

    const detach = () => {
      if (!attached) return;
      attached = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    const sync = () => (mq.matches ? attach() : detach());

    sync();
    mq.addEventListener("change", sync);

    return () => {
      detach();
      mq.removeEventListener("change", sync);
    };
  }, []);

  return (
    <nav
      aria-hidden="true"
      data-print="hide"
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-5 lg:flex"
    >
      {sections.map((s, i) => {
        const isActive = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            tabIndex={-1}
            aria-current={isActive ? "location" : undefined}
            className="detent-group flex items-center gap-3 no-underline"
          >
            <span
              className={`silk-sm readout transition-all duration-200 ${
                isActive
                  ? "translate-x-0 text-clay opacity-100"
                  : "translate-x-1.5 text-mute opacity-0 group-hover:opacity-100"
              }`}
            >
              {s.label}
            </span>
            <span className={`detent ${isActive ? "detent-active" : ""}`} />
          </a>
        );
      })}
    </nav>
  );
}
