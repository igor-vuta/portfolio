"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Entrance animation wrapper.
 *
 * Failure modes this handles, in the order they bite in practice:
 *
 *  1. No JS / bundle blocked — hiding is gated on `.js` (set by an inline
 *     script in <head>), so without scripting nothing is ever hidden. The
 *     previous build hid every wrapper in plain CSS and revealed it from an
 *     effect, which rendered the whole page blank if the bundle failed to load.
 *  2. Already on screen at mount — shown synchronously; waiting on the observer
 *     during hydration risks a visible gap above the fold.
 *  3. IntersectionObserver unsupported — shown immediately.
 *  4. Observer never fires — a timeout reveals the element regardless. An
 *     element inside an `overflow: hidden` parent, or one that never reaches
 *     the threshold on a short viewport, would otherwise stay hidden forever.
 *  5. Reduced motion — resolved in CSS so the resting state holds even before
 *     this effect runs.
 */
type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export default function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer: number | undefined;
    let observer: IntersectionObserver | undefined;

    const show = () => {
      el.style.animationDelay = `${delay}ms`;
      el.classList.add("is-in");
      observer?.disconnect();
      if (timer !== undefined) window.clearTimeout(timer);
    };

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      show();
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      show();
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) show();
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    observer.observe(el);

    // Safety net: content is never permitted to stay hidden indefinitely.
    timer = window.setTimeout(show, 4000);

    return () => {
      observer?.disconnect();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
