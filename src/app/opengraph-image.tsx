import { ImageResponse } from "next/og";

// Dynamically generated social preview image (1200x630) used for Open Graph
// and Twitter cards. Avoids shipping a binary asset while guaranteeing a
// branded, on-theme preview when links are shared.
export const runtime = "edge";
export const alt = "Harsh Rai — Frontend Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          padding: "80px",
          backgroundImage:
            "radial-gradient(ellipse 50% 50% at 30% 40%, rgba(212,168,67,0.18), transparent 70%)",
        }}
      >
        <div
          style={{
            color: "#d4a843",
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          Frontend Developer
        </div>
        <div
          style={{
            color: "#ffffff",
            fontSize: 110,
            fontWeight: 700,
            marginTop: 16,
          }}
        >
          Harsh Rai
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 34,
            marginTop: 24,
            maxWidth: 900,
          }}
        >
          Immersive, high-performance web experiences with React, Next.js &amp;
          WebGL.
        </div>
      </div>
    ),
    { ...size }
  );
}
