import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION
   One shell for every band on the page, so section boundaries, grid width, and
   anchor offsets are decided once instead of per-component. An earlier build
   repeated the same five container utilities in four places, and put the
   scroll offset on an inner wrapper — the wrong element — in all four.

   Note on wording: utility class names are deliberately not spelled out in
   this comment. Tailwind scans source files as plain text, comments included,
   so naming a class here is enough to generate it — the previous version of
   this paragraph shipped a dead scroll-margin rule for exactly that reason.

   Padding is the top of the spacing scale, 6rem each way.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Section({
  id,
  eyebrow,
  title,
  lede,
  plate,
  children,
}: {
  id: string;
  /** A quiet sentence-case line above the title, Apple-style: it names the
      topic in plain words. Deliberately not an uppercase tracked label. */
  eyebrow: string;
  title: string;
  lede?: string;
  /** The chapter's illustration, as a band after the content (see .plate). */
  plate?: Plate;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      {/* No rule between sections: on water, the space between blocks is the
          separator. Six units top and bottom, the largest step on the scale. */}
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="text-body-lg font-medium text-fog">{eyebrow}</p>

          <h2
            id={`${id}-title`}
            className="display mt-3 text-display-lg text-ink sm:text-display-xl"
          >
            {title}
          </h2>

          {lede && (
            <p className="measure mt-6 text-body-lg text-fog">{lede}</p>
          )}
        </Reveal>

        {children}
      </div>
      {plate && <Plate name={plate} band />}
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
  buoy,
}: {
  label: string;
  note?: string;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  /** Floats on the water: bobs, and can be dragged with a mouse. */
  buoy?: "drift";
}) {
  return (
    <div
      data-buoy={buoy}
      className={`panel ${interactive ? "panel-interactive" : ""} ${className}`}
    >
      <div className="flex items-baseline justify-between gap-4 border-b border-line px-6 py-3">
        {/* Sentence case, set as a heading-weight line rather than a mono
            label: the panel's name is its title, and reads like one. */}
        <p className="text-body font-semibold text-ink">{label}</p>
        {note && (
          <p className="readout shrink-0 text-micro text-fog">{note}</p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export type Plate = "optimise" | "systems" | "foundation";

/**
 * A chapter illustration: neurons turning into software, drawn in the same
 * filaments as the caustic light behind the page. Never behind text: either
 * a `band` of its own between sections, or placed by its parent behind
 * something that is not read (the wheel's cards, the contact panel).
 * Decoration only, so hidden from assistive tech; never presented as work.
 */
export function Plate({ name, band = false }: { name: Plate; band?: boolean }) {
  return (
    <div
      className={`plate plate-${name}${band ? " plate-band" : ""}`}
      aria-hidden="true"
      data-print="hide"
    />
  );
}
