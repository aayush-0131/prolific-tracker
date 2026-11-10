import type { Metadata } from "next"
import { SITE_NAME } from "@/lib/site"

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${SITE_NAME} to see your Prolific earnings, hourly rate and tax-year totals.`,
  alternates: { canonical: "/login" },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
