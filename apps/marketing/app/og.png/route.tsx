import { ImageResponse } from "next/og";

export const dynamic = "force-static";

const LOGO = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#ffffff"/><path d="M9.5 8.5h10.5M9.5 16h8.5M9.5 23.5h10.5M9.5 8.5v15" stroke="#4F46E5" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M21.2 12.2c1.15 1.15 1.85 2.7 1.85 4.3s-.7 3.15-1.85 4.3" stroke="#4F46E5" stroke-width="1.85" stroke-linecap="round" fill="none"/><path d="M24.1 10c1.85 1.85 2.95 4.3 2.95 6.95S25.95 21.1 24.1 23" stroke="#4F46E5" stroke-width="1.85" stroke-linecap="round" fill="none" opacity=".55"/></svg>`,
).toString("base64")}`;

const SKILLS = ["Speaking", "Listening", "Reading", "Writing", "Mini-games"];

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: "#ffffff",
          backgroundImage: "linear-gradient(135deg, #312E81 0%, #4F46E5 55%, #7C3AED 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
          <img src={LOGO} width={72} height={72} alt="" />
          <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>EngliTutor</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            Your AI English Tutor
          </span>
          <span style={{ fontSize: 32, opacity: 0.85, maxWidth: 900 }}>
            Practice speaking every day and get instant, friendly feedback.
          </span>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {SKILLS.map((skill) => (
            <span
              key={skill}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                fontSize: 24,
                backgroundColor: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
