"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";

interface ShareCardProps {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  passageType: "ai" | "classic";
  passageTitle: string | null;
  passageAuthor: string | null;
  date: string;
}

export default function ShareCard({
  wpm,
  accuracy,
  timeElapsed,
  passageType,
  passageTitle,
  passageAuthor,
  date,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shared, setShared] = useState(false);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const typeLabel = passageType === "ai" ? "AI passage" : "Classic passage";
  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const shareText = `keysmash · ${formattedDate}\n${typeLabel}: ${passageTitle ?? "Untitled"}\n\n${wpm} WPM · ${accuracy}% accuracy · ${timeElapsed}s\n\nkeysmash.app`;

  async function downloadImage() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0d0d0d",
        scale: 3, // crisp on retina
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `keysmash-${date}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  async function shareText_() {
    setCopying(true);
    try {
      if (canShare) {
        await navigator.share({ text: shareText });
        setShared(true);
      } else {
        await navigator.clipboard.writeText(shareText);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // User cancelled share
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* The shareable card — 9:16 ratio for IG stories */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          style={{ width: 360, height: 640 }}
          className="relative flex flex-col justify-between bg-[#0d0d0d] rounded-2xl overflow-hidden p-10 shrink-0"
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#e8ff57]" />

          {/* Logo */}
          <div>
            <p className="text-[#e8ff57] font-bold text-2xl tracking-tight">keysmash</p>
            <p className="text-[#6b7280] text-sm mt-1">{formattedDate}</p>
          </div>

          {/* Main score */}
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[#6b7280] text-xs uppercase tracking-widest">{typeLabel}</p>
              <p className="text-white font-semibold text-base leading-snug">
                {passageTitle ?? "Untitled"}
                {passageAuthor && (
                  <span className="text-[#6b7280] font-normal"> — {passageAuthor}</span>
                )}
              </p>
            </div>

            <div className="flex items-end gap-3 pt-4">
              <span className="text-[#e8ff57] font-black text-8xl leading-none tabular-nums">
                {wpm}
              </span>
              <span className="text-[#6b7280] text-2xl pb-3 font-semibold">WPM</span>
            </div>

            <div className="flex gap-6 pt-2">
              <div>
                <p className="text-white font-bold text-xl tabular-nums">{accuracy}%</p>
                <p className="text-[#6b7280] text-xs">accuracy</p>
              </div>
              <div>
                <p className="text-white font-bold text-xl tabular-nums">{timeElapsed}s</p>
                <p className="text-[#6b7280] text-xs">time</p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <p className="text-[#6b7280] text-sm">keysmash.app</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={downloadImage}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-full text-sm font-medium hover:border-[var(--accent)]/50 disabled:opacity-50"
        >
          {downloading ? "saving..." : "save image"}
          <span className="text-xs text-[var(--muted)]">(for IG story)</span>
        </button>

        <button
          onClick={shareText_}
          disabled={copying}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-full text-sm font-semibold hover:bg-[var(--accent-dark)] disabled:opacity-50"
        >
          {shared ? "copied!" : copying ? "..." : canShare ? "share" : "copy text"}
        </button>
      </div>

      <p className="text-center text-xs text-[var(--muted)]">
        save the image and upload to your story, or copy the text to share anywhere
      </p>
    </div>
  );
}
