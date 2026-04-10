"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TypingArea from "@/components/TypingArea";
import type { Passage } from "@/lib/supabase/types";

export default function TypePage() {
  const { passageId } = useParams<{ passageId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      // Check auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Load passage
      const { data, error } = await supabase
        .from("passages")
        .select("*")
        .eq("id", passageId)
        .single();

      if (error || !data) {
        setError("Passage not found.");
        setLoading(false);
        return;
      }

      // If logged in, check if already attempted
      if (user) {
        const { data: existing } = await supabase
          .from("attempts")
          .select("id")
          .eq("user_id", user.id)
          .eq("passage_id", passageId)
          .maybeSingle();

        if (existing) {
          router.replace(`/results/${existing.id}`);
          return;
        }
      }

      setPassage(data);
      setLoading(false);
    }

    load();
  }, [passageId]);

  const handleComplete = useCallback(
    async (wpm: number, accuracy: number, timeElapsed: number) => {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Not logged in — show results without saving
        router.push(
          `/results/preview?wpm=${wpm}&accuracy=${accuracy}&time=${timeElapsed}&passageId=${passageId}`
        );
        return;
      }

      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage_id: passageId,
          wpm,
          accuracy,
          time_elapsed: timeElapsed,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/results/${data.attempt.id}`);
      } else {
        // Fallback — show results without persistence
        router.push(
          `/results/preview?wpm=${wpm}&accuracy=${accuracy}&time=${timeElapsed}&passageId=${passageId}`
        );
      }
    },
    [passageId, router, supabase]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
        loading...
      </div>
    );
  }

  if (error || !passage) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
        {error ?? "Something went wrong."}
      </div>
    );
  }

  const typeLabel = passage.type === "ai" ? "AI-generated" : "Classic";

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-6 py-12 gap-10">
      {/* Passage info */}
      <div className="space-y-1">
        <p className="text-xs text-[var(--muted)] uppercase tracking-widest">
          {typeLabel}
        </p>
        <h1 className="text-2xl font-bold">
          {passage.title ?? "Untitled"}
          {passage.author && (
            <span className="text-[var(--muted)] font-normal text-xl">
              {" "}
              — {passage.author}
            </span>
          )}
        </h1>
        <p className="text-xs text-[var(--muted)]">
          {passage.content.split(" ").length} words ·{" "}
          {passage.content.length} characters
        </p>
      </div>

      {/* Typing area */}
      <TypingArea passage={passage.content} onComplete={handleComplete} />

      {saving && (
        <p className="text-center text-sm text-[var(--muted)]">saving results...</p>
      )}
    </div>
  );
}
