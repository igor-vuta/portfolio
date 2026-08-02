import Reveal from "@/components/Reveal";
import CopyEmail from "@/components/CopyEmail";
import { ExternalLink } from "@/components/ui/Control";
import { identity } from "@/lib/profile";

export default function Footer() {
  return (
    <footer
      id="contact"
      aria-labelledby="contact-title"
      className="on-coal bg-coal text-cream"
    >
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <Reveal>
          <div className="border-b border-cream/15 pb-4">
            <p className="silk text-clay-soft">Contact</p>
          </div>

          <h2 id="contact-title" className="display mt-8 text-display-md sm:text-display-lg">
            Let&apos;s build something.
          </h2>

          <p className="measure mt-5 text-cream/70">
            {identity.availability}. The fastest way to reach me is email — I
            reply quickly.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            {/* mailto is a link, not an action — it must stay a link so it can
                be opened in a new tab, copied, or dragged. */}
            <a
              href={`mailto:${identity.email}`}
              className="ctl ctl-primary readout"
              data-print-url="skip"
            >
              {identity.email}
            </a>
            <CopyEmail email={identity.email} />
            <ExternalLink href={identity.github}>GitHub</ExternalLink>
            <ExternalLink href={identity.linkedin}>LinkedIn</ExternalLink>
          </div>
        </Reveal>

        {/* ── Chassis plate ───────────────────────────────────────────────── */}
        <div className="mt-20 flex flex-col justify-between gap-4 border-t border-cream/15 pt-6 text-micro text-cream/55 sm:flex-row">
          <p className="readout">
            © {new Date().getFullYear()} {identity.name} · {identity.location}
          </p>
          <p>
            Built with Next.js, TypeScript &amp; Tailwind CSS — statically
            exported.{" "}
            <a
              href="https://github.com/igor-vuta/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              View source ↗
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
