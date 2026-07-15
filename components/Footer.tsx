import Reveal from "@/components/Reveal";
import { identity } from "@/lib/profile";

export default function Footer() {
  return (
    <footer id="contact" className="bg-coal text-cream">
      <div className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-clay">Contact</p>
          <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-6xl">
            Let&apos;s build something.
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-cream/70">
            {identity.availability}. The fastest way to reach me is email — I reply quickly.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={`mailto:${identity.email}`}
              className="rounded-full bg-cream px-6 py-3 text-sm font-medium text-coal transition hover:bg-clay hover:text-cream"
            >
              {identity.email}
            </a>
            <a
              href={identity.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-cream/25 px-6 py-3 text-sm font-medium transition hover:border-clay hover:text-clay"
            >
              GitHub ↗
            </a>
            <a
              href={identity.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-cream/25 px-6 py-3 text-sm font-medium transition hover:border-clay hover:text-clay"
            >
              LinkedIn ↗
            </a>
          </div>
        </Reveal>
        <div className="mt-20 flex flex-col justify-between gap-3 border-t border-cream/15 pt-6 text-xs text-cream/60 sm:flex-row">
          <p>© 2026 Igor Vuta · {identity.location}</p>
          <p>
            Built with Next.js, TypeScript &amp; Tailwind CSS — statically exported.{" "}
            <a
              href={`${identity.github}/portfolio`}
              target="_blank"
              rel="noreferrer"
              className="text-clay transition hover:underline"
            >
              View source ↗
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
