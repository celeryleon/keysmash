// Throwaway mockup page — delete before shipping

export default function ShareMockupPage() {
  const wpm = 87;
  const accuracy = 96;
  const timeElapsed = 38;
  const passageTitle = "If—";
  const passageAuthor = "Rudyard Kipling";
  const date = "April 15, 2026";

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-10 py-16 px-6 bg-[var(--background)]">
      <p className="text-xs text-[var(--muted)] uppercase tracking-widest">share card mockup</p>

      <div className="flex flex-col items-center gap-3">
        <p className="text-xs text-[var(--muted)]">story (9:16)</p>
        <div
          style={{
            width: 270,
            height: 480,
            background: "#E8D0A8",
            fontFamily: "var(--font-dm-sans)",
            borderRadius: 16,
            overflow: "hidden",
            position: "relative",
            padding: 32,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#7A5030" }} />

          <div>
            <p style={{ color: "#2C1A08", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>
              keysmash
            </p>
            <p style={{ color: "#8B6545", fontSize: 11, marginTop: 2 }}>{date}</p>
          </div>

          <div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: "#7A5030", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                classic passage
              </p>
              <p style={{ color: "#2C1A08", fontWeight: 600, fontSize: 13, lineHeight: 1.4, fontFamily: "var(--font-fraunces)" }}>
                {passageTitle}
              </p>
              <p style={{ color: "#8B6545", fontSize: 11, marginTop: 2 }}>{passageAuthor}</p>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 16 }}>
              <span style={{ color: "#2C1A08", fontWeight: 900, fontSize: 80, lineHeight: 1, letterSpacing: "-0.04em" }}>
                {wpm}
              </span>
              <span style={{ color: "#7A5030", fontWeight: 700, fontSize: 18, paddingBottom: 10 }}>
                WPM
              </span>
            </div>

            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <p style={{ color: "#2C1A08", fontWeight: 700, fontSize: 18 }}>{accuracy}%</p>
                <p style={{ color: "#8B6545", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>accuracy</p>
              </div>
              <div>
                <p style={{ color: "#2C1A08", fontWeight: 700, fontSize: 18 }}>{timeElapsed}s</p>
                <p style={{ color: "#8B6545", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>time</p>
              </div>
            </div>
          </div>

          <p style={{ color: "#8B6545", fontSize: 11 }}>keysmash.app</p>
        </div>
      </div>

    </div>
  );
}
