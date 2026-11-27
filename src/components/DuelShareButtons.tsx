"use client";

import { useState } from "react";

interface DuelShareButtonsProps {
  duelId: string;
  verdict: string;
  passageTitle: string | null;
}

// Duel counterpart of ShareButtons (PRD §3.5). The image is rendered from the
// duel row by /api/share-image?mode=duel, so only the id is sent.
export default function DuelShareButtons({
  duelId,
  verdict,
  passageTitle,
}: DuelShareButtonsProps) {
  const [instaState, setInstaState] = useState<"idle" | "loading" | "done">("idle");

  const imageUrl = `/api/share-image?${new URLSearchParams({ mode: "duel", id: duelId })}`;

  async function handleInstagram() {
    setInstaState("loading");
    try {
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error(`share image failed: ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], "keysmash-duel.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `keysmash duel: ${verdict}` });
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "keysmash-duel.png";
        a.click();
        URL.revokeObjectURL(url);
      }
      setInstaState("done");
      setTimeout(() => setInstaState("idle"), 2000);
    } catch {
      setInstaState("idle");
    }
  }

  function handleSMS() {
    const link = `${window.location.origin}/duel/${duelId}`;
    const lines = [
      "keysmash duel",
      verdict,
      ...(passageTitle ? [`"${passageTitle}"`] : []),
      link,
    ];
    window.open(`sms:?body=${encodeURIComponent(lines.join("\n"))}`);
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={handleInstagram}
        disabled={instaState === "loading"}
        className="flex items-center gap-2 tap-target px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)] text-sm text-[var(--foreground)] transition-colors disabled:opacity-50 disabled:cursor-wait"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
        </svg>
        <span>
          {instaState === "loading" ? "generating..." : instaState === "done" ? "saved!" : "instagram"}
        </span>
      </button>

      <button
        onClick={handleSMS}
        className="flex items-center gap-2 tap-target px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)] text-sm text-[var(--foreground)] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>text</span>
      </button>
    </div>
  );
}
