import type { Metadata } from "next"
import { SITE_NAME } from "@/lib/site"

export const metadata: Metadata = {
  title: "Create a free account",
  description: `Create a free ${SITE_NAME} account and upload your Prolific submissions CSV to track your earnings.`,
  alternates: { canonical: "/register" },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
