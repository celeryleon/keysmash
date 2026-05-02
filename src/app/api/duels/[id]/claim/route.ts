import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Optional post-hoc claim of a previously-anonymous challengee score.
// PRD §3.2: "After typing, they may optionally claim their score by signing up;
// if they do, their challengee_user_id is set on the duel row."
//
// This route does not verify that the caller was actually the typer — that's
// not knowable on the server. The client gates the UI behind a sessionStorage
// marker set right after the PATCH succeeds, which is the practical limit of
// trust we can offer without persistent anonymous identity (PRD §3.3).
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const { data: duel, error: duelError } = await supabase
    .from("duels")
    .select("challenger_user_id, challengee_user_id, challengee_wpm")
    .eq("id", id)
    .single();

  if (duelError || !duel) {
    return NextResponse.json({ error: "Duel not found" }, { status: 404 });
  }

  if (duel.challengee_wpm == null) {
    return NextResponse.json(
      { error: "Challengee has not played yet" },
      { status: 409 }
    );
  }

  if (duel.challengee_user_id != null) {
    return NextResponse.json(
      { error: "Challengee score already claimed" },
      { status: 409 }
    );
  }

  if (duel.challenger_user_id === user.id) {
    return NextResponse.json(
      { error: "Cannot claim your own duel" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("duels")
    .update({ challengee_user_id: user.id })
    .eq("id", id)
    .is("challengee_user_id", null)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not claim duel" }, { status: 500 });
  }

  return NextResponse.json({ duel: data });
}
