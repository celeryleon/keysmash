import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Same-origin only — reject `?next=//evil.com` and absolute URLs that would
// otherwise turn the callback into an open redirect.
function safeNext(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/auth?error=invalid_link", url.origin));
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
