"use client";

import { useState } from "react";

interface ShareButtonsProps {
  wpm: number;
  accuracy: number;
  passageTitle: string | null;
  passageAuthor: string | null;
  date: string;
}

function shareText(wpm: number, accuracy: number, passageTitle: string | null, passageAuthor: string | null, date: string) {
  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const source = passageTitle
    ? `${passageTitle}${passageAuthor ? ` — ${passageAuthor}` : ""}`
    : "today's passage";
  return `keysmash · ${formattedDate}\n${wpm} wpm · ${accuracy}% accuracy\n"${source}"\nkeysmash.app`;
}

export default function ShareButtons({ wpm, accuracy, passageTitle, passageAuthor, date }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const text = shareText(wpm, accuracy, passageTitle, passageAuthor, date);

  async function handleInstagram() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSMS() {
    window.open(`sms:?body=${encodeURIComponent(text)}`);
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={handleInstagram}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)] text-sm text-[var(--foreground)] transition-colors"
      >
        {/* Instagram icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
        </svg>
        <span>{copied ? "copied!" : "instagram"}</span>
      </button>

      <button
        onClick={handleSMS}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)] text-sm text-[var(--foreground)] transition-colors"
      >
        {/* Message bubble icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>text</span>
      </button>
    </div>
  );
}
