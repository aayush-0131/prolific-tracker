import { ImageResponse } from "next/og"
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site"

// Social preview image (Open Graph / X), generated at build time.
export const alt = `${SITE_NAME} - ${SITE_TAGLINE}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "48px" }}>
          <div
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "48px",
              background: "#111827",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "56px",
              fontWeight: 700,
            }}
          >
            P
          </div>
          <div style={{ fontSize: "52px", fontWeight: 700, color: "#111827" }}>{SITE_NAME}</div>
        </div>
        <div style={{ fontSize: "68px", fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>
          Track your Prolific earnings
        </div>
        <div style={{ fontSize: "68px", fontWeight: 800, color: "#2563eb", lineHeight: 1.1 }}>
          in seconds, not spreadsheets
        </div>
        <div style={{ marginTop: "40px", fontSize: "32px", color: "#4b5563" }}>
          Real hourly rate · GBP &amp; USD · Tax-year totals · Free
        </div>
      </div>
    ),
    { ...size }
  )
}
