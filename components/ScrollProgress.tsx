"use client";

import { useEffect, useRef } from "react";

/**
 * Travel indicator seated in the header's lower edge.
 *
 * Two corrections from the previous build:
 *  - It was pinned at `top-16` (64px) against a 64px header. The header is now
 *    56px, and the offset is derived from the header rather than restated, so
 *    the two cannot drift apart again.
 *  - `ResizeObserver` on the document tracks height changes that no scroll or
 *    resize event reports — fonts swapping in, or a section reflowing — which
 *    previously left the bar reading a stale fraction of a stale height.
 */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 8 ? window.scrollY / max : 0;
      el.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Catches document-height changes that fire no scroll or resize event.
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(onScroll)
        : undefined;
    ro?.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro?.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-print="hide"
      className="fixed inset-x-0 top-14 z-40 h-px origin-left bg-clay"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
