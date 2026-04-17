import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

function serviceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const { email, password, username } = await request.json();

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3–20 characters: letters, numbers, underscores only." },
      { status: 400 }
    );
  }

  const supabase = serviceClient();

  // Check username availability
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "That username is taken." }, { status: 409 });
  }

  // Create auth user
  const { data, error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // still requires email confirmation
  });

  if (signUpError || !data.user) {
    return NextResponse.json({ error: signUpError?.message ?? "Sign up failed." }, { status: 400 });
  }

  // Upsert profile with username (a trigger may have already created the row)
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: data.user.id, username });

  if (profileError) {
    // Roll back: delete the auth user so they can try again
    await supabase.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ error: "Could not save username. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
