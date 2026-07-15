"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "top", label: "Intro" },
  { id: "flagship", label: "Flagship" },
  { id: "projects", label: "Projects" },
  { id: "credentials", label: "Credentials" },
  { id: "contact", label: "Contact" },
];

export default function SectionRail() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex"
    >
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="group flex items-center gap-3"
            aria-current={isActive ? "true" : undefined}
          >
            <span
              className={`text-xs transition-all duration-300 ${
                isActive
                  ? "translate-x-0 text-clay opacity-100"
                  : "translate-x-2 text-fog opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
              }`}
            >
              {s.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? "h-2.5 w-2.5 bg-clay"
                  : "h-2 w-2 bg-ink/20 group-hover:bg-ink/40"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
