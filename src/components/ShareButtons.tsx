"use client";

import { useState } from "react";

interface ShareButtonsProps {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  passageTitle: string | null;
  passageAuthor: string | null;
  date: string;
  streak?: number;
}

export default function ShareButtons({ wpm, accuracy, timeElapsed, passageTitle, passageAuthor, date, streak }: ShareButtonsProps) {
  const [instaState, setInstaState] = useState<"idle" | "loading" | "done">("idle");

  function buildImageUrl() {
    const params = new URLSearchParams({
      wpm: String(wpm),
      accuracy: String(accuracy),
      time: String(timeElapsed),
      date,
      ...(passageTitle ? { title: passageTitle } : {}),
      ...(passageAuthor ? { author: passageAuthor } : {}),
      ...(streak ? { streak: String(streak) } : {}),
    });
    return `/api/share-image?${params}`;
  }

  async function handleInstagram() {
    setInstaState("loading");
    try {
      const res = await fetch(buildImageUrl());
      const blob = await res.blob();
      const file = new File([blob], "keysmash.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${wpm} WPM on keysmash` });
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "keysmash.png";
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
    const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
    const source = passageTitle
      ? `${passageTitle}${passageAuthor ? ` — ${passageAuthor}` : ""}`
      : "today's passage";
    const text = `keysmash · ${formattedDate}\n${wpm} wpm · ${accuracy}% accuracy\n"${source}"\nkeysmash.app`;
    window.open(`sms:?body=${encodeURIComponent(text)}`);
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={handleInstagram}
        disabled={instaState === "loading"}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)] text-sm text-[var(--foreground)] transition-colors disabled:opacity-50 disabled:cursor-wait"
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
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)] text-sm text-[var(--foreground)] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>text</span>
      </button>
    </div>
  );
}
