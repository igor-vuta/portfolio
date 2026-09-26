"use client";

import { Children, useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * A horizontal carousel built on native scrolling, not a scripted track.
 *
 * The slides sit in an overflow-x scroller with scroll-snap, so everything
 * the platform already does keeps working: trackpad and touch swipes,
 * momentum, and focus. Tabbing to a link in an off-screen slide scrolls it
 * into view by itself, which a transform-driven track cannot do. On top:
 *
 *  - Prev / next buttons that move one slide, disabled at either end. The
 *    ends are found by IntersectionObservers on the first and last slide,
 *    not by a scroll listener.
 *  - Arrow keys when the track has focus.
 *  - Mouse drag. The track follows the hand with snapping suspended, then
 *    the release velocity is carried into a smooth scroll and snap settles
 *    the slide. The click that ends a drag is swallowed, so a dragged card
 *    never also opens its link.
 *
 * The look lives in CSS per variant: `coverflow` starts at the column and
 * runs off the right edge of the screen, turning slides away only as they
 * enter or leave; `log` stays inside the column and dims clipped slides. Both are view timelines on the track (see
 * CAROUSELS in globals.css), so the visual response to position is
 * compositor-driven and costs no script.
 *
 * Announced as a carousel with "n of N" slides (the APG pattern), with the
 * buttons pointing at the track they control.
 */
export default function Carousel({
  label,
  variant,
  heading,
  children,
}: {
  label: string;
  variant: "coverflow" | "log";
  /** Set on the same row as the controls, the way Apple pairs a carousel's
      title with its buttons, so the two read as one header. */
  heading?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const slides = Children.toArray(children);

  // Ends: observe the first and last slide against the track.
  useEffect(() => {
    const el = track.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const first = el.firstElementChild;
    const last = el.lastElementChild;
    if (!first || !last) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === first) setAtStart(e.intersectionRatio > 0.9);
          if (e.target === last) setAtEnd(e.intersectionRatio > 0.9);
        }
      },
      { root: el, threshold: [0, 0.9, 1] }
    );
    io.observe(first);
    io.observe(last);
    return () => io.disconnect();
  }, []);

  // Mouse drag with a carried release.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let startX = 0;
    let startLeft = 0;
    let lastX = 0;
    let lastT = 0;
    let v = 0;
    let dragging = false;
    let pressed = false;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if ((e.target as Element).closest("a, button")) return;
      pressed = true;
      startX = lastX = e.clientX;
      startLeft = el.scrollLeft;
      lastT = performance.now();
      v = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!pressed) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 5) return;
        dragging = true;
        el.classList.add("is-dragging");
        el.setPointerCapture(e.pointerId);
      }
      el.scrollLeft = startLeft - dx;
      const now = performance.now();
      v = v * 0.6 + ((e.clientX - lastX) / Math.max(8, now - lastT)) * 0.4;
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = () => {
      if (!pressed) return;
      pressed = false;
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      // Carry the throw, then let snap choose the slide it lands on.
      const carried = performance.now() - lastT < 80 ? -v * 320 : 0;
      el.scrollBy({ left: carried, behavior: "smooth" });
      const swallow = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => removeEventListener("click", swallow, true), 0);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    const slide = el?.firstElementChild as HTMLElement | null;
    if (!el || !slide) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (slide.offsetWidth + gap), behavior: "smooth" });
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={`carousel carousel-${variant}`}
    >
      <div className="carousel-bar">
        {heading ?? (
          <div className="carousel-progress" aria-hidden="true">
            <span />
          </div>
        )}
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="ctl ctl-sm"
            aria-controls={id}
            aria-label={`Previous: ${label}`}
            disabled={atStart}
            onClick={() => step(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className="ctl ctl-sm"
            aria-controls={id}
            aria-label={`Next: ${label}`}
            disabled={atEnd}
            onClick={() => step(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <ul
        id={id}
        ref={track}
        className="carousel-track"
        tabIndex={0}
        aria-label={`${label}, use the arrow keys to move`}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
      >
        {slides.map((slide, i) => (
          <li
            key={i}
            className="carousel-slide"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
          >
            {slide}
          </li>
        ))}
      </ul>

      {heading && (
        <div className="carousel-progress carousel-progress-below" aria-hidden="true">
          <span />
        </div>
      )}
    </section>
  );
}
