"use client";

import { useState } from "react";

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — fall through silently
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`rounded-full border px-6 py-3 text-sm font-medium transition ${
        copied
          ? "border-clay text-clay"
          : "border-cream/25 text-cream hover:border-clay hover:text-clay"
      }`}
    >
      {copied ? "Copied ✓" : "Copy email"}
    </button>
  );
}
