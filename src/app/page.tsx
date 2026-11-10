import Link from "next/link"
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
} from "lucide-react"
import { FAQ, NOT_AFFILIATED, SITE_NAME } from "@/lib/site"

// Server-rendered so search engines, AI crawlers and link previews see the full
// page. Signed-in visitors are redirected to /dashboard by src/proxy.ts.
export default function LandingPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            100% Free • No Ads
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Track Your Prolific Earnings
            <br />
            <span className="text-primary">in Seconds, Not Spreadsheets</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your Prolific submissions CSV and get instant insights into your earnings,
            real hourly rate, and study patterns. Built by a Prolific participant, for Prolific participants.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/register">
                Get Started Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/demo">
                Try the Demo
              </Link>
            </Button>
          </div>

          <p className="text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>

          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Try the demo without signing up
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Track Prolific Earnings
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Instant CSV Import</h3>
              <p className="text-muted-foreground text-sm">
                Upload your Prolific submissions export. Duplicates are skipped, and re-uploading a newer
                export updates studies that were approved or got a bonus since.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Real Hourly Rate &amp; Analytics</h3>
              <p className="text-muted-foreground text-sm">
                See what you actually earn per hour, your earning trends, and which days and hours pay best.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Calendar View</h3>
              <p className="text-muted-foreground text-sm">
                See your earnings day by day and spot your most productive days at a glance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Weekly Goals</h3>
              <p className="text-muted-foreground text-sm">
                Set a weekly earnings target and track your progress towards it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">GBP &amp; USD, Done Right</h3>
              <p className="text-muted-foreground text-sm">
                Pound and dollar studies are kept in their own currency, with a combined total in the currency you choose.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Private</h3>
              <p className="text-muted-foreground text-sm">
                Passwords are hashed, your data is only visible to you, and we never sell data or show ads.
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
              Why Prolific Participants Use {SITE_NAME}
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Know Your Real Hourly Rate</h3>
                  <p className="text-muted-foreground">
                    Total earned divided by the time you actually spent, including screen-outs, instead of an average of advertised rates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Tax-Year Totals</h3>
                  <p className="text-muted-foreground">
                    Totals for the UK (6 April) or calendar tax year, a UK £1,000 trading-allowance tracker,
                    and a CSV export of all your data.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Works on Any Device</h3>
                  <p className="text-muted-foreground">
                    Your data lives in your account, so it&apos;s the same on your phone and your laptop.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Built by a Prolific Participant</h3>
                  <p className="text-muted-foreground">
                    I got tired of tracking in spreadsheets, so I built this. If it helps you, consider buying me a coffee ☕
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQ.map(({ question, answer }) => (
              <div key={question}>
                <h3 className="font-semibold text-lg mb-1">{question}</h3>
                <p className="text-muted-foreground">{answer}</p>
              </div>
            ))}
          </div>
        </div>
        <script
          type="application/ld+json"
          // Static, developer-written FAQ content from src/lib/site.ts (no user input).
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Stop Guessing About Your Earnings?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Upload your Prolific CSV and see where your money and time really go.
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/register">
              <Zap className="mr-2 h-5 w-5" />
              Start Tracking Free
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Takes 30 seconds • No credit card
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              Made with ❤️ by a Prolific participant •{" "}
              <a href="https://ko-fi.com/chillguy24951" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Buy me a coffee
              </a>
            </p>
            <p className="text-xs">{NOT_AFFILIATED}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
