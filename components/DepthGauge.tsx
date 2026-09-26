"use client";

import { useEffect, useState, type CSSProperties } from "react";

/**
 * The depth gauge: the page's plot device. Reading down the page is a dive,
 * and this is the instrument on the right-hand edge that says how deep.
 *
 * Replaces the detent rail, and moves its per-frame work off the main thread:
 *
 *  - The marker and the depth readout are driven by CSS on the root scroll
 *    timeline (see `.gauge-*` in globals.css). The readout is a registered
 *    integer custom property rendered through a CSS counter, so "24 m" ticks
 *    as you scroll with no script at all.
 *  - Chapter marks sit at each section's real position in the document, so
 *    the marker passes a mark exactly as that section arrives. Positions are
 *    measured once, then again only when the document changes size; never
 *    per scroll frame.
 *  - The active chapter comes from an IntersectionObserver on a band across
 *    the viewport's middle: it fires on crossings, not on every frame.
 *
 * Supplementary to the header nav, so it is hidden from assistive tech rather
 * than duplicating five links in the accessibility tree; still usable with a
 * mouse, and shown only from 1440px, the first width where the gutter beside
 * the content column can hold it without touching a block.
 */
const chapters = [
  { id: "top", label: "Surface" },
  { id: "flagship", label: "Shallows" },
  { id: "projects", label: "The current" },
  { id: "credentials", label: "Logbook" },
  { id: "contact", label: "Seabed" },
];

/** Metres at the bottom of the page. The readout animates 0 → this. */
const FLOOR = 64;

export default function DepthGauge() {
  const [active, setActive] = useState("top");
  const [marks, setMarks] = useState<number[]>(() => chapters.map((_, i) => i / (chapters.length - 1)));

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 90rem)");
    let ro: ResizeObserver | undefined;
    let io: IntersectionObserver | undefined;

    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      setMarks(
        chapters.map(({ id }) => {
          const el = document.getElementById(id);
          if (!el) return 0;
          // Where the scroll position will be when this section reaches the
          // top, as a fraction of the whole dive.
          const top = el.getBoundingClientRect().top + scrollY - innerHeight * 0.3;
          return Math.min(1, Math.max(0, top / max));
        })
      );
    };

    const attach = () => {
      measure();
      ro = new ResizeObserver(measure);
      ro.observe(document.body);
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
        },
        { rootMargin: "-45% 0px -45% 0px" }
      );
      for (const { id } of chapters) {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      }
    };
    const detach = () => {
      ro?.disconnect();
      io?.disconnect();
    };
    const sync = () => {
      detach();
      if (mq.matches) attach();
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      detach();
      mq.removeEventListener("change", sync);
    };
  }, []);

  return (
    <nav aria-hidden="true" data-print="hide" className="gauge">
      <div className="gauge-track">
        {chapters.map((c, i) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            tabIndex={-1}
            className={`gauge-mark ${active === c.id ? "is-active" : ""}`}
            style={{ "--at": marks[i] } as CSSProperties}
          >
            <span className="gauge-label">{c.label}</span>
            <span className="gauge-depth readout">
              {Math.round(marks[i] * FLOOR)} m
            </span>
          </a>
        ))}
        {/* The diver carries the chapter it is in: one label, always beside
            the marker, instead of five labels competing with the content. */}
        <span className="gauge-marker">
          <span className="gauge-readout">
            <span className="gauge-count readout" />
            <span className="gauge-chapter">
              {chapters.find((c) => c.id === active)?.label}
            </span>
          </span>
        </span>
      </div>
    </nav>
  );
}
