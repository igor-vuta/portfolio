import Link from "next/link";
import { identity } from "@/lib/profile";
import { ExternalLink } from "@/components/ui/Control";
import AudioToggle from "@/components/AudioToggle";
import MotionToggle from "@/components/MotionToggle";
import NavLinks from "@/components/NavLinks";

/**
 * Fixed faceplate, and the one home for page controls.
 *
 * Sound and motion used to float bottom-right as fixed buttons. On a phone
 * that meant two squares sitting over whatever paragraph was scrolling past;
 * seated here they cover nothing.
 *
 * The links are the site's branches (lib/routes) plus Contact, which is on
 * every page. Below md they move into a native popover: a <button
 * popovertarget> and a [popover] element, so the platform supplies the
 * open/close state, Esc, light dismiss, and top-layer stacking with no
 * script. The previous horizontally scrolling strip fitted about two and a
 * half links beside the name and GitHub, and a clipped "E" at the edge read
 * as broken rather than scrollable. An in-page link inside the sheet closes
 * it (see the head script), so the jump is never hidden behind it.
 */
export default function Nav() {
  return (
    <header
      data-print="hide"
      className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ground/92 backdrop-blur-md"
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[var(--header-h)] max-w-6xl items-center gap-2 px-6"
      >
        {/* Identification plate. */}
        {/* Identification plate, and the way back to the surface from any
            branch. */}
        <Link href="/" className="mr-auto flex shrink-0 items-baseline no-underline">
          <span className="text-body font-semibold tracking-tight text-ink">
            {identity.name}
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          <NavLinks variant="bar" />
        </div>

        <div className="flex items-center gap-1.5 md:ml-2">
          <MotionToggle />
          <AudioToggle />
        </div>

        {/* Breakpoint visibility lives on wrappers, never on the controls:
            .ctl sets display in unlayered CSS, which outranks Tailwind's
            layered `hidden` utilities, so on the control itself they lose. */}
        <div className="ml-1 hidden shrink-0 md:block">
          <ExternalLink href={identity.github} variant="primary" size="sm">
            GitHub
          </ExternalLink>
        </div>

        <div className="ml-1 md:hidden">
          <button type="button" popoverTarget="site-menu" className="ctl ctl-sm">
            Menu
          </button>
        </div>
      </nav>

      <div
        id="site-menu"
        popover="auto"
        aria-label="Menu"
        className="menu-sheet"
      >
        <nav aria-label="Sections" className="flex flex-col gap-1">
          <NavLinks variant="sheet" />
        </nav>
        <div className="mt-4 border-t border-line pt-4">
          <ExternalLink href={identity.github} variant="primary" className="w-full">
            GitHub
          </ExternalLink>
        </div>
      </div>
    </header>
  );
}
