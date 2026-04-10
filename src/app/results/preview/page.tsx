"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import ShareCard from "@/components/ShareCard";

function PreviewContent() {
  const params = useSearchParams();
  const wpm = Number(params.get("wpm") ?? 0);
  const accuracy = Number(params.get("accuracy") ?? 0);
  const time = Number(params.get("time") ?? 0);

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-12 gap-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">nice work</h1>
        <p className="text-[var(--muted)] text-sm">
          sign in to save your scores and track progress over time
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)]">
          <p className="text-[var(--accent)] font-black text-4xl tabular-nums">{wpm}</p>
          <p className="text-[var(--muted)] text-xs mt-1">WPM</p>
        </div>
        <div className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)]">
          <p className="text-white font-bold text-4xl tabular-nums">{accuracy}%</p>
          <p className="text-[var(--muted)] text-xs mt-1">accuracy</p>
        </div>
        <div className="bg-[var(--surface)] rounded-2xl p-5 text-center border border-[var(--border)]">
          <p className="text-white font-bold text-4xl tabular-nums">{time}s</p>
          <p className="text-[var(--muted)] text-xs mt-1">time</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-center text-[var(--muted)] uppercase tracking-widest">
          share your results
        </h2>
        <ShareCard
          wpm={wpm}
          accuracy={accuracy}
          timeElapsed={time}
          passageType="classic"
          passageTitle={null}
          passageAuthor={null}
          date={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="flex justify-center gap-4 text-sm">
        <Link
          href="/auth"
          className="px-5 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-full text-sm hover:bg-[var(--accent-dark)]"
        >
          sign in to save →
        </Link>
        <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)] self-center">
          ← back home
        </Link>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense>
      <PreviewContent />
    </Suspense>
  );
}
