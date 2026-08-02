import { identity } from "@/lib/profile";
import { ExternalLink } from "@/components/ui/Control";

const links = [
  { href: "#flagship", label: "Flagship" },
  { href: "#projects", label: "Projects" },
  { href: "#credentials", label: "Credentials" },
  { href: "#contact", label: "Contact" },
];

/**
 * Fixed faceplate.
 *
 * The previous header hid the section links entirely below `sm`, leaving phone
 * users with no in-page navigation at all — the one place it matters most,
 * since the page is long and scrolling was the only alternative. They now
 * survive as a horizontally scrollable strip: no hamburger, no disclosure
 * state, no JS, and the whole set stays one tap away.
 */
export default function Nav() {
  return (
    <header
      data-print="hide"
      className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ground/92 backdrop-blur-md"
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[var(--header-h)] max-w-6xl items-center gap-4 px-6"
      >
        {/* Identification plate. */}
        <a
          href="#top"
          className="flex shrink-0 items-baseline gap-2.5 no-underline"
        >
          <span className="text-body font-semibold tracking-tight text-ink">
            {identity.name}
          </span>
        </a>

        {/* Scrollable on narrow viewports rather than removed. */}
        <div className="scrollbar-none min-w-0 flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-end gap-0.5">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="ctl ctl-quiet ctl-sm shrink-0"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <ExternalLink
          href={identity.github}
          variant="primary"
          size="sm"
          className="shrink-0"
        >
          GitHub
        </ExternalLink>
      </nav>
    </header>
  );
}
