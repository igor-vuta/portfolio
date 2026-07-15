"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates the numeric part of a metric string ("+17.5%", "0.069 s", "3,600")
 * from zero when it enters the viewport. Prefix/suffix and formatting are
 * preserved; honours prefers-reduced-motion.
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
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const grouped = num.includes(",");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const fmt = (n: number) =>
      prefix +
      (grouped
        ? Math.round(n).toLocaleString("en-US")
        : n.toFixed(decimals)) +
      suffix;

    setDisplay(fmt(0));

    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          const start = performance.now();
          const dur = 1100;
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(fmt(target * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
            else setDisplay(value);
          };
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return <span ref={ref}>{display}</span>;
}
