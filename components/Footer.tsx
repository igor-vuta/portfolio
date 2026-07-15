import Reveal from "@/components/Reveal";
import { identity } from "@/lib/profile";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-line/60 bg-panel/40">
      <div className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Contact</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
            Let&apos;s build something.
          </h2>
          <p className="mt-4 max-w-xl text-fog">
            {identity.availability}. The fastest way to reach me is email — I reply quickly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${identity.email}`}
              className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-ink transition hover:bg-amber"
            >
              {identity.email}
            </a>
            <a
              href={identity.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line px-5 py-3 text-sm font-medium transition hover:border-accent/60 hover:text-amber"
            >
              GitHub ↗
            </a>
            <a
              href={identity.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line px-5 py-3 text-sm font-medium transition hover:border-accent/60 hover:text-amber"
            >
              LinkedIn ↗
            </a>
          </div>
        </Reveal>
        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-line/60 pt-6 text-xs text-fog sm:flex-row">
          <p>© 2026 Igor Vuta · {identity.location}</p>
          <p>
            Built with Next.js, TypeScript & Tailwind CSS — statically exported.{" "}
            <a
              href={`${identity.github}/portfolio`}
              target="_blank"
              rel="noreferrer"
              className="text-amber transition hover:text-accent"
            >
              View source ↗
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
