import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { ALL_PASSAGES } from "@/lib/passages";
import { isUuid } from "@/lib/duel-rematch";
import { summarizeDuel } from "@/lib/duel-share";

export const runtime = "edge";

async function fetchGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
    { headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" } }
  ).then((r) => r.text());

  const url = css.match(/url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error(`Could not find font URL for ${family} ${weight}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

// Parchment palette
const bg = "#E8D0A8";
const textPrimary = "#2C1A08";
const accent = "#7A5030";
const secondary = "#8B6545";

async function loadFonts() {
  const [dmSansRegular, dmSansBold, dmSansBlack, frauncesSemiBold] = await Promise.all([
    fetchGoogleFont("DM Sans", 400),
    fetchGoogleFont("DM Sans", 700),
    fetchGoogleFont("DM Sans", 900),
    fetchGoogleFont("Fraunces", 600),
  ]);
  return [
    { name: "DM Sans", data: dmSansRegular, weight: 400 as const },
    { name: "DM Sans", data: dmSansBold, weight: 700 as const },
    { name: "DM Sans", data: dmSansBlack, weight: 900 as const },
    { name: "Fraunces", data: frauncesSemiBold, weight: 600 as const },
  ];
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  if (searchParams.get("mode") === "duel") {
    return duelImage(searchParams.get("id"));
  }
  const wpm = searchParams.get("wpm") ?? "0";
  const accuracy = searchParams.get("accuracy") ?? "0";
  const time = searchParams.get("time") ?? "0";
  const title = searchParams.get("title") ?? null;
  const author = searchParams.get("author") ?? null;
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const streakParam = searchParams.get("streak");
  const streak = streakParam ? parseInt(streakParam, 10) : null;

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: bg,
          fontFamily: '"DM Sans"',
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 120,
          position: "relative",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: accent,
          }}
        />

        {/* Logo + date */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: textPrimary, fontWeight: 700, fontSize: 72, letterSpacing: "-2px" }}>
            keysmash
          </span>
          <span style={{ color: secondary, fontSize: 40, marginTop: 8 }}>{formattedDate}</span>
          {streak && streak > 0 && (
            <span
              style={{
                color: accent,
                fontWeight: 700,
                fontSize: 32,
                marginTop: 12,
                textTransform: "uppercase",
                letterSpacing: "6px",
              }}
            >
              day {streak}
            </span>
          )}
        </div>

        {/* Score block */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Passage */}
          {title && (
            <div style={{ display: "flex", flexDirection: "column", marginBottom: 72 }}>
              <span
                style={{
                  color: accent,
                  fontSize: 32,
                  textTransform: "uppercase",
                  letterSpacing: "6px",
                  marginBottom: 16,
                }}
              >
                classic passage
              </span>
              <span
                style={{
                  color: textPrimary,
                  fontWeight: 600,
                  fontSize: 52,
                  lineHeight: 1.3,
                  fontFamily: '"Fraunces"',
                }}
              >
                {title}
              </span>
              {author && (
                <span style={{ color: secondary, fontSize: 38, marginTop: 8 }}>{author}</span>
              )}
            </div>
          )}

          {/* WPM hero */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 60 }}>
            <span
              style={{
                color: textPrimary,
                fontWeight: 900,
                fontSize: 320,
                lineHeight: 1,
                letterSpacing: "-12px",
              }}
            >
              {wpm}
            </span>
            <span
              style={{
                color: accent,
                fontWeight: 700,
                fontSize: 72,
                paddingBottom: 40,
              }}
            >
              WPM
            </span>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 80 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: textPrimary, fontWeight: 700, fontSize: 72 }}>{accuracy}%</span>
              <span
                style={{
                  color: secondary,
                  fontSize: 32,
                  textTransform: "uppercase",
                  letterSpacing: "4px",
                  marginTop: 8,
                }}
              >
                accuracy
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: textPrimary, fontWeight: 700, fontSize: 72 }}>{time}s</span>
              <span
                style={{
                  color: secondary,
                  fontSize: 32,
                  textTransform: "uppercase",
                  letterSpacing: "4px",
                  marginTop: 8,
                }}
              >
                time
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <span style={{ color: secondary, fontSize: 40 }}>keysmash.app</span>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts,
    }
  );
}

// Duel share image (PRD §3.5). Scores and names are read from the duel row,
// not from query params, so the image cannot be forged to put words in a
// named user's mouth. Duel rows and profiles are publicly readable; the duel
// id is the same access token as the duel link. No streak on this variant.
async function duelImage(id: string | null) {
  if (!isUuid(id)) return new Response("Invalid duel id", { status: 400 });

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: duel } = await supabase
    .from("duels")
    .select("passage_index, challenger_wpm, challengee_wpm, challenger_user_id, challengee_user_id, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!duel) return new Response("Duel not found", { status: 404 });
  if (duel.challengee_wpm == null) {
    return new Response("Duel not complete", { status: 409 });
  }

  const userIds = [duel.challenger_user_id, duel.challengee_user_id].filter(
    (u): u is string => u != null
  );
  const usernames = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds);
    for (const p of profiles ?? []) usernames.set(p.id, p.username);
  }
  const nameOf = (userId: string | null) =>
    userId ? usernames.get(userId) ?? null : null;

  const summary = summarizeDuel({
    challengerWpm: duel.challenger_wpm,
    challengeeWpm: duel.challengee_wpm,
    challengerUsername: nameOf(duel.challenger_user_id),
    challengeeUsername: nameOf(duel.challengee_user_id),
  });

  const passage = ALL_PASSAGES[duel.passage_index];
  const formattedDate = new Date(duel.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });

  const fonts = await loadFonts();

  const sides = [
    {
      label: summary.challengerLabel,
      wpm: duel.challenger_wpm,
      won: summary.winner === "challenger",
    },
    {
      label: summary.challengeeLabel,
      wpm: duel.challengee_wpm,
      won: summary.winner === "challengee",
    },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: bg,
          fontFamily: '"DM Sans"',
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 120,
          position: "relative",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: accent,
          }}
        />

        {/* Logo + date */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: textPrimary, fontWeight: 700, fontSize: 72, letterSpacing: "-2px" }}>
            keysmash
          </span>
          <span style={{ color: secondary, fontSize: 40, marginTop: 8 }}>{formattedDate}</span>
          <span
            style={{
              color: accent,
              fontWeight: 700,
              fontSize: 32,
              marginTop: 12,
              textTransform: "uppercase",
              letterSpacing: "6px",
            }}
          >
            duel
          </span>
        </div>

        {/* Score block */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {passage && (
            <div style={{ display: "flex", flexDirection: "column", marginBottom: 72 }}>
              <span
                style={{
                  color: textPrimary,
                  fontWeight: 600,
                  fontSize: 52,
                  lineHeight: 1.3,
                  fontFamily: '"Fraunces"',
                }}
              >
                {passage.title}
              </span>
              {passage.author && (
                <span style={{ color: secondary, fontSize: 38, marginTop: 8 }}>{passage.author}</span>
              )}
            </div>
          )}

          {/* Side-by-side WPMs */}
          <div style={{ display: "flex", gap: 48, marginBottom: 72 }}>
            {sides.map((side, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  borderTop: `8px solid ${side.won ? accent : "transparent"}`,
                  paddingTop: 32,
                }}
              >
                <span
                  style={{
                    color: side.won ? textPrimary : secondary,
                    fontWeight: 900,
                    fontSize: 200,
                    lineHeight: 1,
                    letterSpacing: "-8px",
                  }}
                >
                  {side.wpm}
                </span>
                <span
                  style={{
                    color: side.won ? accent : secondary,
                    fontWeight: 700,
                    fontSize: 44,
                    marginTop: 24,
                    maxWidth: 360,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {side.label}
                </span>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <span style={{ color: textPrimary, fontWeight: 700, fontSize: 64, lineHeight: 1.2 }}>
            {summary.verdict}
          </span>
          <span
            style={{
              color: secondary,
              fontSize: 32,
              textTransform: "uppercase",
              letterSpacing: "4px",
              marginTop: 16,
            }}
          >
            words per minute
          </span>
        </div>

        {/* Footer */}
        <span style={{ color: secondary, fontSize: 40 }}>keysmash.app</span>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts,
    }
  );
}
