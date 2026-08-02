"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, SrOnly } from "@/components/ui/Control";

type State = "idle" | "copied" | "failed";

/**
 * Copy-to-clipboard control.
 *
 * The previous version called navigator.clipboard.writeText and swallowed every
 * failure in an empty catch — so on a non-secure origin, in a browser that
 * denies the permission, or anywhere the API is absent, pressing it did nothing
 * and said nothing about it. A control that can fail silently is unfinished.
 *
 * What it now covers:
 *  - Clipboard API present and permitted → copies, confirms, self-resets.
 *  - API absent or rejected (http:// origin, denied permission, older Safari)
 *    → falls back to a hidden textarea and execCommand.
 *  - Both routes fail → says so, and puts the address on screen pre-selected so
 *    the user can copy it by hand instead of being left with a dead button.
 *  - Every outcome is announced through a live region, since a purely visual
 *    label swap is invisible to a screen-reader user.
 *  - The reset timer is cleared on unmount, so no setState after teardown.
 */
export default function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<number | undefined>(undefined);
  const fallbackRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== undefined) window.clearTimeout(timer.current);
    };
  }, []);

  const schedule = (next: State) => {
    setState(next);
    if (timer.current !== undefined) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2600);
  };

  /** Pre-Clipboard-API route. Still the only one that works on http:// origins. */
  const legacyCopy = () => {
    const ta = document.createElement("textarea");
    ta.value = email;
    ta.setAttribute("readonly", "");
    // Kept out of view without display:none, which would make it unselectable.
    ta.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  };

  /** Last resort: show the address and select it on the user's behalf. */
  const selectForManualCopy = () => {
    // Runs after the fallback node has been committed to the DOM.
    window.requestAnimationFrame(() => {
      const node = fallbackRef.current;
      if (!node) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });
  };

  const copy = async () => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(email);
        schedule("copied");
        return;
      } catch {
        // Permission denied or insecure context — fall through to the fallback.
      }
    }

    if (legacyCopy()) {
      schedule("copied");
      return;
    }

    schedule("failed");
    selectForManualCopy();
  };

  const label =
    state === "copied"
      ? "Copied"
      : state === "failed"
        ? "Select and copy"
        : "Copy address";

  return (
    <>
      <ActionButton
        onClick={copy}
        className={state === "copied" ? "ctl-ok" : undefined}
        aria-label={`Copy email address ${email} to clipboard`}
      >
        {/* Confirmation mark — never the message itself. */}
        {state === "copied" && (
          <span aria-hidden="true" className="text-[0.9em]">
            ✓
          </span>
        )}
        {label}
      </ActionButton>

      {/* Announced to assistive tech on every outcome. */}
      <span aria-live="polite" role="status">
        <SrOnly>
          {state === "copied"
            ? `${email} copied to clipboard`
            : state === "failed"
              ? `Copying was blocked by the browser. The address ${email} is now selected — copy it manually.`
              : ""}
        </SrOnly>
      </span>

      {/* Rendered only once copying has actually failed. */}
      {state === "failed" && (
        <span
          ref={fallbackRef}
          className="readout select-all self-center text-sm text-clay"
        >
          {email}
        </span>
      )}
    </>
  );
}
