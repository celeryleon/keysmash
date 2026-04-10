import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
