import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { validateScore } from "@/lib/score-validation";
import { computeNextStreak } from "@/lib/streak";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { passage_id, wpm, accuracy, time_elapsed } = body;

  if (!passage_id || wpm == null || accuracy == null || time_elapsed == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Fetch passage to validate score against actual content length and to
  // key the streak update off the passage's date.
  const { data: passage, error: passageError } = await supabase
    .from("passages")
    .select("content, date")
    .eq("id", passage_id)
    .single();

  if (passageError || !passage) {
    return NextResponse.json({ error: "Passage not found" }, { status: 404 });
  }

  const validation = validateScore({
    wpm,
    timeElapsed: time_elapsed,
    charsTyped: passage.content.length,
    accuracy,
  });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("attempts")
    .insert({
      user_id: user.id,
      passage_id,
      wpm,
      accuracy,
      time_elapsed,
    })
    .select("*")
    .single();

  if (error) {
    // Unique constraint violation = already attempted today
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already attempted today" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update streak off the passage's date. Failure here doesn't fail the
  // request — the attempt is saved, and the streak self-heals on the next
  // attempt by reading the same lastAttemptDate. See PRD §3.4.
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_attempt_date")
    .eq("id", user.id)
    .single();

  if (profile) {
    const next = computeNextStreak(passage.date, {
      currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak,
      lastAttemptDate: profile.last_attempt_date,
    });

    await supabase
      .from("profiles")
      .update({
        current_streak: next.currentStreak,
        longest_streak: next.longestStreak,
        last_attempt_date: next.lastAttemptDate,
      })
      .eq("id", user.id);
  }

  return NextResponse.json({ attempt: data });
}

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("attempts")
    .select(`
      *,
      passages (id, date, type, title, author)
    `)
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attempts: data });
}
