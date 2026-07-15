import { identity } from "@/lib/profile";

const links = [
  { href: "#flagship", label: "Flagship" },
  { href: "#projects", label: "Projects" },
  { href: "#credentials", label: "Credentials" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-ink/75 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="font-semibold tracking-tight">
          Igor Vuta
        </a>
        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden rounded-lg px-3 py-2 text-sm text-fog transition hover:text-snow sm:block"
            >
              {l.label}
            </a>
          ))}
          <a
            href={identity.github}
            target="_blank"
            rel="noreferrer"
            className="ml-2 rounded-lg border border-line px-3 py-2 text-sm text-snow transition hover:border-accent/60 hover:text-amber"
          >
            GitHub ↗
          </a>
        </div>
      </nav>
    </header>
  );
}
