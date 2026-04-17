import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const wpm = searchParams.get("wpm") ?? "0";
  const accuracy = searchParams.get("accuracy") ?? "0";
  const time = searchParams.get("time") ?? "0";
  const title = searchParams.get("title") ?? null;
  const author = searchParams.get("author") ?? null;
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const [dmSansRegular, dmSansBold, dmSansBlack, frauncesSemiBold] = await Promise.all([
    fetchGoogleFont("DM Sans", 400),
    fetchGoogleFont("DM Sans", 700),
    fetchGoogleFont("DM Sans", 900),
    fetchGoogleFont("Fraunces", 600),
  ]);

  // Parchment palette
  const bg = "#E8D0A8";
  const textPrimary = "#2C1A08";
  const accent = "#7A5030";
  const secondary = "#8B6545";

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
      fonts: [
        { name: "DM Sans", data: dmSansRegular, weight: 400 },
        { name: "DM Sans", data: dmSansBold, weight: 700 },
        { name: "DM Sans", data: dmSansBlack, weight: 900 },
        { name: "Fraunces", data: frauncesSemiBold, weight: 600 },
      ],
    }
  );
}
