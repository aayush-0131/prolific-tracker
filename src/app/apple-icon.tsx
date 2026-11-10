import { ImageResponse } from "next/og"

// Home-screen icon for iOS (replaces the missing /apple-touch-icon.png).
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#111827",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "112px",
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        P
      </div>
    ),
    { ...size }
  )
}
