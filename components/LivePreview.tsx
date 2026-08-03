"use client";

import { useEffect, useRef, useState } from "react";

/**
 * In-page browser for live project links — the Telegram / Claude pattern:
 * a full-height bottom sheet on phones, a centred panel on desktop, with the
 * destination in an iframe and the real tab one tap away.
 *
 * Architecture over ceremony:
 *
 *  - The links stay ordinary <a href target="_blank"> elements marked with
 *    data-preview. This component intercepts them by delegation, so with no
 *    JS, before hydration, or in a reader view, every link still works as a
 *    plain link. The preview is an enhancement, never a dependency.
 *  - Modified clicks (cmd, ctrl, shift, middle) pass through untouched —
 *    the user asked for a tab and gets one.
 *  - Built on native <dialog>: focus trap, Esc-to-close, focus return, and
 *    top-layer stacking come from the platform instead of being reimplemented
 *    badly here.
 *
 * The one thing this cannot promise: a site that sends X-Frame-Options or a
 * frame-ancestors CSP will render the frame blank, and cross-origin nothing
 * here can detect that. Hence the permanent Open ↗ in the header and the
 * plain-words note in the footer rail — the failure mode is explained where
 * it happens, not hidden.
 */
export default function LivePreview() {
  const [target, setTarget] = useState<{ url: string; label: string } | null>(
    null
  );
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = (e.target as Element | null)?.closest?.(
        "a[data-preview]"
      ) as HTMLAnchorElement | null;
      if (!el) return;
      e.preventDefault();
      setTarget({
        url: el.href,
        label:
          el.getAttribute("data-preview-label") || new URL(el.href).hostname,
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Teardown watches the dialog's `open` attribute rather than trusting the
  // close event alone. The event rides the rendering task source, and in a
  // backgrounded or occluded window that queue can be starved indefinitely —
  // measured directly: dialog closed, no close event, ever, even on a
  // pristine test dialog. Left like that, a phone that backgrounds the tab
  // mid-close keeps the previewed site alive behind a closed sheet (its
  // timers and audio too) and never releases the scroll lock. Mutation
  // records ride microtasks, which do not starve, and the attribute flips on
  // every close path there is — Esc, close(), backdrop, form method=dialog.
  // The close listener stays as the ordinary-path fast lane.
  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    const teardown = () => setTarget(null);
    dlg.addEventListener("close", teardown);
    const mo = new MutationObserver(() => {
      if (!dlg.open) teardown();
    });
    mo.observe(dlg, { attributes: true, attributeFilter: ["open"] });
    return () => {
      dlg.removeEventListener("close", teardown);
      mo.disconnect();
    };
  }, []);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (target && !dlg.open) dlg.showModal();
    // <dialog> does not lock the page behind it; without this the sheet and
    // the page scroll together on touch.
    document.documentElement.style.overflow = target ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [target]);

  return (
    <dialog
      ref={ref}
      className="preview-sheet"
      aria-label={target ? `Live preview — ${target.label}` : "Live preview"}
      data-print="hide"
      onClick={(e) => {
        // Only a click on the dialog element itself is the backdrop; anything
        // inside lands on the content wrapper below.
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      {target && (
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center gap-3 border-b border-line bg-panel px-4 py-2">
            <span className="silk-sm min-w-0 flex-1 truncate text-fog">
              {target.label} — {new URL(target.url).hostname}
            </span>
            <a
              href={target.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ctl ctl-sm shrink-0"
            >
              Open <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              className="ctl ctl-sm ctl-quiet shrink-0"
              onClick={() => ref.current?.close()}
            >
              Close
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto bg-white">
            <iframe
              src={target.url}
              title={`Live preview — ${target.label}`}
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="no-referrer"
              allowFullScreen
            />
          </div>

          <p className="border-t border-line bg-panel px-4 py-1.5 text-micro text-fog">
            Blank preview means the site refuses embedding — use Open ↗ for
            the full tab.
          </p>
        </div>
      )}
    </dialog>
  );
}
