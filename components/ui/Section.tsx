import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION
   One shell for every band on the page, so section boundaries, grid width, and
   anchor offsets are decided once instead of per-component. The previous build
   repeated `mx-auto max-w-6xl scroll-mt-24 px-6 py-24` in four places, and put
   the scroll offset on the wrong element in all four.

   Padding is drawn from the spacing scale: pt-20 (5rem) / pb-24 (6rem).
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
  first = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lede?: string;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={first ? "" : "border-t border-line"}
    >
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-20">
        <Reveal>
          <div className="border-b border-line pb-4">
            <p className="silk text-clay">{eyebrow}</p>
          </div>

          <h2
            id={`${id}-title`}
            className="display mt-8 text-display-md sm:text-display-lg"
          >
            {title}
          </h2>

          {lede && (
            <p className="measure mt-4 text-body-lg text-fog">{lede}</p>
          )}
        </Reveal>

        {children}
      </div>
    </section>
  );
}

/**
 * A labelled sub-area inside a section. The label plate is part of the
 * component rather than an optional extra — an unlabelled panel is exactly the
 * kind of thing this redesign is meant to eliminate.
 */
export function LabelledPanel({
  label,
  note,
  children,
  className = "",
  interactive = false,
}: {
  label: string;
  note?: string;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={`panel ${interactive ? "panel-interactive" : ""} ${className}`}
    >
      <div className="flex items-baseline justify-between gap-4 border-b border-line px-6 py-3">
        <p className="silk text-fog">{label}</p>
        {note && (
          <p className="silk-sm readout shrink-0 text-fog">{note}</p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
