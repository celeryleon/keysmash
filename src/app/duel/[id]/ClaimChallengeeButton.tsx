"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  readPendingClaim,
  clearPendingClaim,
  writePendingClaim,
} from "@/lib/duel-handoff";

interface Props {
  duelId: string;
  isSignedIn: boolean;
}

// sessionStorage isn't reactive, but useSyncExternalStore is the React-
// blessed way to read external state during render without tripping the
// "no setState in effect" rule. Subscribe is a no-op since same-tab writes
// don't fire storage events.
function useHasClaimMarker(duelId: string): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => readPendingClaim()?.duelId === duelId,
    () => false
  );
}

// Renders only when this viewer just typed the challengee score (their
// session has the marker). Two responsibilities:
//   1. Show a CTA that bounces them through /auth?next=/duel/[id]?claim=1.
//   2. On return with ?claim=1, drain the marker and POST the claim.
export default function ClaimChallengeeButton({ duelId, isSignedIn }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isClaimResume = searchParams.get("claim") === "1";

  const hasMarker = useHasClaimMarker(duelId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isClaimResume) return;
    const pending = readPendingClaim();
    if (pending?.duelId !== duelId) {
      router.replace(`/duel/${duelId}`);
      return;
    }
    if (!isSignedIn) {
      // Session didn't survive the round-trip — re-stash and bounce.
      router.push(`/auth?next=/duel/${duelId}?claim=1`);
      return;
    }

    // Defer the actual fetch + setState off the effect's sync path.
    queueMicrotask(() => {
      setSubmitting(true);
      void (async () => {
        const res = await fetch(`/api/duels/${duelId}/claim`, {
          method: "POST",
        });
        if (res.ok) {
          clearPendingClaim();
          // Refreshing will re-render the server component, which now sees
          // challengee_user_id set and hides the claim CTA.
          router.replace(`/duel/${duelId}`);
          router.refresh();
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Could not claim duel");
          setSubmitting(false);
        }
      })();
    });
  }, [isClaimResume, isSignedIn, duelId, router]);

  if (!hasMarker && !isClaimResume) return null;

  if (submitting) {
    return (
      <p className="text-center text-sm text-[var(--muted)]">claiming...</p>
    );
  }

  const goClaim = () => {
    writePendingClaim({ duelId });
    router.push(`/auth?next=/duel/${duelId}?claim=1`);
  };

  return (
    <div className="w-full space-y-2">
      <button
        onClick={goClaim}
        className="w-full px-5 py-3 rounded-xl border border-[var(--accent)] text-[var(--accent)] font-semibold text-sm hover:bg-[var(--accent)]/10 transition-colors"
      >
        claim this score
      </button>
      <p className="text-center text-xs text-[var(--muted)]">
        sign up to add this duel to your history
      </p>
      {error && (
        <p className="text-center text-[var(--error)] text-sm">{error}</p>
      )}
    </div>
  );
}
