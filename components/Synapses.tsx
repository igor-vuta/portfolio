"use client";

import { useEffect } from "react";

/**
 * Mounts the synapse layer (lib/synapses): the live neural web over the
 * water that lights around the pointer and carries signals to the cards.
 * Loaded after the page is idle, and never under reduced motion, where the
 * page is meant to hold still.
 */
export default function Synapses() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    idle(() => {
      void import("@/lib/synapses").then(({ mountSynapses }) => {
        if (!cancelled) destroy = mountSynapses();
      });
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);
  return null;
}
