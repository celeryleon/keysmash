import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

export async function POST(request: Request) {
  const { username } = await request.json();

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "No account found with that username." }, { status: 404 });
  }

  // Look up the email from auth.users via admin API
  const { data: { user }, error } = await supabase.auth.admin.getUserById(profile.id);

  if (error || !user?.email) {
    return NextResponse.json({ error: "Could not resolve account." }, { status: 500 });
  }

  return NextResponse.json({ email: user.email });
}
