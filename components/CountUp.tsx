"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates the numeric part of a metric string ("+17.5%", "0.069 s", "3,600")
 * up from zero when it scrolls into view.
 *
 * Correctness constraints, which matter more here than the animation does —
 * these are the headline benchmark figures, so a wrong or stuck number is worse
 * than no animation at all:
 *
 *  - The final value is what renders on the server and what the DOM settles on.
 *    Zeroing happens only once we know the observer is live, so the number can
 *    never be left reading "0" if the observer never fires. The previous build
 *    zeroed unconditionally in the effect, which stranded any metric that never
 *    hit the 40% threshold — reachable on a short viewport.
 *  - A timeout completes the animation regardless, for the same reason.
 *  - Screen readers get the real value throughout: the animating text is
 *    aria-hidden and the true figure sits alongside it, so AT never announces a
 *    stream of intermediate numbers.
 *  - Reduced motion skips straight to the value.
 *  - Non-numeric strings pass through untouched.
 */
export default function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = value.match(/^([^0-9]*)([0-9][0-9.,]*)(.*)$/);
    if (!match) return;

    const [, prefix, num, suffix] = match;
    const target = parseFloat(num.replace(/,/g, ""));
    if (!Number.isFinite(target)) return;

    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const grouped = num.includes(",");

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);
      return;
    }

    const fmt = (n: number) =>
      prefix +
      (grouped ? Math.round(n).toLocaleString("en-GB") : n.toFixed(decimals)) +
      suffix;

    let raf = 0;
    let timer: number | undefined;
    let started = false;

    const settle = () => {
      cancelAnimationFrame(raf);
      setDisplay(value);
    };

    const run = () => {
      if (started) return;
      started = true;
      observer.disconnect();

      const start = performance.now();
      const dur = 1100;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(fmt(target * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
        else settle();
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          // Only now is it safe to show zero — the run to the real value has
          // begun in the same frame.
          setDisplay(fmt(0));
          run();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    // If the element is never observed as intersecting, show the true value.
    timer = window.setTimeout(() => {
      if (!started) settle();
    }, 4000);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [value]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {display}
      </span>
      {/* The unchanging, authoritative figure for assistive tech. */}
      <span className="sr-only">
        {value}
      </span>
    </>
  );
}
