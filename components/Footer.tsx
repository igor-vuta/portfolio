import Reveal from "@/components/Reveal";
import CopyEmail from "@/components/CopyEmail";
import { DownloadLink, ExternalLink } from "@/components/ui/Control";
import { identity } from "@/lib/profile";

export default function Footer() {
  return (
    <footer
      id="contact"
      aria-labelledby="contact-title"
      className="text-cream"
    >
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-24">
        <Reveal>
          {/* The last block on the water, floating like the rest. */}
          <div data-buoy="drift" className="panel p-8 sm:p-12">
          <p className="text-body-lg font-medium text-fog">Contact</p>

          <h2
            id="contact-title"
            className="display mt-3 text-display-lg text-ink sm:text-display-xl"
          >
            Let&apos;s build something.
          </h2>

          <p className="measure mt-6 text-body-lg text-fog">
            {identity.availability}. The fastest way to reach me is email; I
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
            <DownloadLink href={identity.cv}>Download CV</DownloadLink>
            <ExternalLink href={identity.github}>GitHub</ExternalLink>
            <ExternalLink href={identity.linkedin}>LinkedIn</ExternalLink>
          </div>
          </div>
        </Reveal>

        {/* ── Chassis plate ───────────────────────────────────────────────── */}
        <div className="mt-20 flex flex-col justify-between gap-4 border-t border-line pt-6 text-micro text-fog sm:flex-row">
          <p className="readout">
            © {new Date().getFullYear()} {identity.name} · {identity.location}
          </p>
          {/* The one manual way to the TL;DR, kept quiet on purpose: it is
              mostly a reward for readers who race down the page. */}
          <p>
            In a hurry?{" "}
            <button type="button" popoverTarget="tldr" className="link">
              Read the TL;DR
            </button>
          </p>
          <p>
            Built with Next.js, TypeScript and Tailwind CSS, statically
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
