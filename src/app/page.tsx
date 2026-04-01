"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Upload,
  BarChart3,
  Calendar,
  Target,
  Lock,
  Zap,
  CheckCircle,
  TrendingUp,
  Clock,
  Loader2
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    setIsLoading(false)

    // Redirect if already logged in
    if (session) {
      router.push("/dashboard")
    }
  }, [session, status, router])

  if (isLoading || (status === "loading")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Don't show landing page if user is logged in
  if (session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            100% Free • No Ads • No BS
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Track Your Prolific Earnings
            <br />
            <span className="text-primary">in Seconds, Not Spreadsheets</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your Prolific CSV and get instant insights into your earnings,
            hourly rates, and study patterns. The tracker built by researchers, for researchers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/register">
                Get Started Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Takes 30 seconds to set up
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Track Earnings
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Instant CSV Import</h3>
              <p className="text-muted-foreground text-sm">
                Drag & drop your Prolific CSV export. We'll import everything in seconds with smart duplicate detection.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground text-sm">
                See your REAL hourly rate, earning trends, and study breakdowns. Know which studies pay best.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Calendar View</h3>
              <p className="text-muted-foreground text-sm">
                Visualize your earnings by day. Spot patterns and find your most productive days at a glance.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Weekly Goals</h3>
              <p className="text-muted-foreground text-sm">
                Set earnings targets and track progress. Stay motivated with visual goal tracking.
              </p>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Status Breakdown</h3>
              <p className="text-muted-foreground text-sm">
                Track approved, pending, and returned studies. Know exactly where your money is.
              </p>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Private & Secure</h3>
              <p className="text-muted-foreground text-sm">
                Your data is encrypted and never shared. We don't sell data or show ads. Ever.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Researchers Love ProlificTracker
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Know Your REAL Hourly Rate</h3>
                  <p className="text-muted-foreground">
                    Most trackers lie. We calculate your actual hourly rate including screened-out studies and time spent.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Tax-Ready Reports</h3>
                  <p className="text-muted-foreground">
                    Support for UK (April) and US (January) tax years. Export clean CSV files for your accountant.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Multi-Device Sync</h3>
                  <p className="text-muted-foreground">
                    Access your data from any device. No more lost spreadsheets or USB drives.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Built by a Prolific User</h3>
                  <p className="text-muted-foreground">
                    I got tired of Excel tracking, so I built this. If it helps you, consider buying me a coffee ☕
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Stop Guessing About Your Earnings?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of Prolific researchers tracking their earnings smarter.
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/register">
              <Zap className="mr-2 h-5 w-5" />
              Start Tracking Free
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Takes 30 seconds • No credit card • Cancel anytime (it's free forever!)
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Made with ❤️ by a Prolific researcher •{" "}
              <a href="https://ko-fi.com/prolifictracker" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Buy me a coffee
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
