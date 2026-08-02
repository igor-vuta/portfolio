"use client";

import { useEffect, useRef } from "react";

/**
 * Travel indicator seated in the header's lower edge.
 *
 * Scroll-linked, so it is desktop-only: below 768px the bar is not rendered
 * and no listener is attached. See the effect for why the CSS alone is not
 * enough.
 *
 * Two corrections from the previous build:
 *  - It was pinned at `top-16` (64px) against a 64px header. Both now read
 *    --header-h, so the bar is seated on the header's edge by construction
 *    and the two cannot drift apart again.
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

    // Catches document-height changes that fire no scroll or resize event.
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(onScroll)
        : undefined;

    // The bar is `hidden md:block`, but CSS visibility does not stop an effect
    // from running: every phone was paying for a scroll listener, a resize
    // listener, a ResizeObserver on the document, and a per-frame layout read
    // of scrollHeight — to drive one pixel that is never painted at that
    // width. scrollHeight in particular forces layout on a document this long.
    //
    // Same 768px threshold as the grid loop in the head script, so all
    // scroll-linked work on the page starts and stops at one breakpoint
    // rather than each feature picking its own.
    const wide = window.matchMedia("(min-width: 768px)");
    let attached = false;

    const attach = () => {
      if (attached) return;
      attached = true;
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      ro?.observe(document.documentElement);
    };

    const detach = () => {
      if (!attached) return;
      attached = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro?.disconnect();
    };

    const sync = () => (wide.matches ? attach() : detach());

    sync();
    wide.addEventListener("change", sync);

    return () => {
      detach();
      wide.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-print="hide"
      className="fixed inset-x-0 top-[var(--header-h)] z-40 hidden h-px origin-left bg-clay md:block"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
