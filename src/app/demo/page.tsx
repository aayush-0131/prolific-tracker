import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DemoDashboard } from "@/components/demo/DemoDashboard"
import { NOT_AFFILIATED, SITE_NAME } from "@/lib/site"

export const metadata: Metadata = {
  title: "Live demo with sample data",
  description: `Try ${SITE_NAME} without an account: see the dashboard, real hourly rate, tax-year totals and best times to work, using sample Prolific data.`,
  alternates: { canonical: "/demo" },
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">P</span>
            <span className="hidden sm:inline">{SITE_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link href="/login">Sign in</Link></Button>
            <Button asChild size="sm"><Link href="/register">Create free account</Link></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900" role="note">
          <strong>You&apos;re looking at sample data.</strong> Nothing here is real or saved. Create a free account and
          upload your Prolific submissions CSV to see the same views for your own earnings.
        </div>
        <div>
          <h1 className="text-3xl font-bold">Demo dashboard</h1>
          <p className="text-muted-foreground">
            What {SITE_NAME} shows after you upload your Prolific CSV: totals, your real hourly rate, recent paid studies,
            tax-year totals and the days and hours you earn best.
          </p>
        </div>
        <DemoDashboard />
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-lg font-medium">Ready to see your own numbers?</p>
          <Button asChild size="lg"><Link href="/register">Create a free account</Link></Button>
          <p className="text-xs text-muted-foreground">{NOT_AFFILIATED}</p>
        </div>
      </main>
    </div>
  )
}
