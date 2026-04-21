"use client";

import { useState } from "react";

interface ChallengeButtonProps {
  passageId: string;
}

export default function ChallengeButton({ passageId }: ChallengeButtonProps) {
  const [state, setState] = useState<"idle" | "done">("idle");

  async function handleCopy() {
    const url = `${window.location.origin}/type/${passageId}`;
    try {
      await navigator.clipboard.writeText(url);
      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("idle");
    }
  }

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)] text-sm text-[var(--foreground)] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span>{state === "done" ? "copied!" : "copy link"}</span>
      </button>
    </div>
  );
}
