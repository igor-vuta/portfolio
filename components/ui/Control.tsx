import type { ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   CONTROLS
   Every interactive element on the site is one of these three. Routing them
   through a single module is what makes completeness enforceable: a new button
   cannot ship without focus, hover, active, disabled, touch, and print
   behaviour, because it inherits them rather than declaring them.
   ═══════════════════════════════════════════════════════════════════════════ */

type Variant = "primary" | "default" | "quiet";
type Size = "md" | "sm";

const variantClass: Record<Variant, string> = {
  primary: "ctl-primary",
  default: "",
  quiet: "ctl-quiet",
};

function classes(variant: Variant, size: Size, extra?: string) {
  return [
    "ctl",
    variantClass[variant],
    size === "sm" ? "ctl-sm" : "",
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Screen-reader-only text. Clipped rather than hidden so it is still read. */
export function SrOnly({ children }: { children: ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

/**
 * A link to somewhere else on this page. Never opens a new tab — in-page
 * navigation that steals a tab is the single most common way portfolio sites
 * break the back button.
 */
export function AnchorLink({
  href,
  children,
  variant = "default",
  size = "md",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return (
    <a href={href} className={classes(variant, size, className)}>
      {children}
      <Glyph d="down" />
    </a>
  );
}

/**
 * A link off-site.
 *
 * - `rel="noopener"` prevents the destination reaching back through
 *   window.opener; `noreferrer` keeps the referrer off third-party analytics.
 * - The new-tab behaviour is announced to screen readers, which otherwise get
 *   no warning that focus is about to leave the document.
 * - The ↗ glyph is decorative and hidden from AT, which would otherwise read
 *   it aloud as "north east arrow".
 * - `printUrl="skip"` suppresses the printed URL where the visible text is
 *   already the address (the email button, for one).
 */
export function ExternalLink({
  href,
  children,
  variant = "default",
  size = "md",
  className,
  printUrl,
  lead,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  printUrl?: "skip";
  /** Rendered before the label — used for the live-status lamp. */
  lead?: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes(variant, size, className)}
      data-print-url={printUrl}
    >
      {lead}
      {children}
      <Glyph d="out" />
      <SrOnly>(opens in a new tab)</SrOnly>
    </a>
  );
}

/** A control that performs an action in-page rather than navigating. */
export function ActionButton({
  onClick,
  children,
  variant = "default",
  size = "md",
  className,
  disabled,
  disabledReason,
  ...rest
}: {
  onClick: () => void;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** When set, the control stays focusable and explains itself to AT. */
  disabled?: boolean;
  disabledReason?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children">) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classes(variant, size, className)}
      aria-disabled={disabled || undefined}
      title={disabled ? disabledReason : undefined}
      {...rest}
    >
      {children}
      {disabled && disabledReason && <SrOnly> — {disabledReason}</SrOnly>}
    </button>
  );
}

/** Directional glyphs. Decorative: never announced, never load-bearing. */
function Glyph({ d }: { d: "out" | "down" }) {
  return (
    <span aria-hidden="true" className="text-[0.9em] leading-none opacity-70">
      {d === "out" ? "↗" : "↓"}
    </span>
  );
}
