"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { branches } from "@/lib/routes";

/**
 * The header's branch links, marked with aria-current on the page being
 * read. A client leaf only because it needs the pathname; the rest of the
 * header stays server-rendered.
 *
 * It also closes the phone menu after navigation. The header persists across
 * client-side route changes, so a popover left open would sit over the new
 * page; in-page #links are closed by the head script instead.
 */
export default function NavLinks({ variant }: { variant: "bar" | "sheet" }) {
  const path = usePathname();

  useEffect(() => {
    if (variant !== "sheet") return;
    const menu = document.getElementById("site-menu");
    if (menu?.matches(":popover-open")) menu.hidePopover();
  }, [path, variant]);

  const here = (href: string) => path === href || path === href.replace(/\/$/, "");

  const items = [
    ...branches.map((b) => ({ href: b.href, label: b.nav, page: true })),
    { href: "#contact", label: "Contact", page: false },
  ];

  return (
    <>
      {items.map((l) =>
        l.page ? (
          <Link
            key={l.href}
            href={l.href}
            aria-current={here(l.href) ? "page" : undefined}
            className={variant === "bar" ? "ctl ctl-quiet ctl-sm nav-link" : "menu-link"}
          >
            {l.label}
          </Link>
        ) : (
          <a
            key={l.href}
            href={l.href}
            className={variant === "bar" ? "ctl ctl-quiet ctl-sm nav-link" : "menu-link"}
          >
            {l.label}
          </a>
        )
      )}
    </>
  );
}
