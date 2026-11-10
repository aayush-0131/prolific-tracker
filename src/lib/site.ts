/**
 * Single source of truth for the site's name, URL and public copy.
 * Renaming the product or moving to a custom domain should only touch this
 * file (or set NEXT_PUBLIC_SITE_URL in the deployment environment).
 */

export const SITE_NAME = "Prolific Tracker"

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://prolific-tracker-alpha.vercel.app").replace(/\/+$/, "")

export const SITE_TAGLINE = "Free earnings tracker for Prolific participants"

export const SITE_DESCRIPTION =
  "Free earnings tracker for Prolific participants. Upload your Prolific submissions CSV to see your real hourly rate, " +
  "approved and pending earnings in GBP and USD, tax-year totals, and the days and hours you earn best."

export const NOT_AFFILIATED =
  "Prolific Tracker is an independent, community-made tool. It is not affiliated with, endorsed by, or sponsored by Prolific."

/** Shown on the landing page and published as FAQPage structured data and in /llms.txt. */
export const FAQ: { question: string; answer: string }[] = [
  {
    question: "What is Prolific Tracker?",
    answer:
      "A free web app for Prolific participants. You upload the submissions CSV you export from Prolific and it shows your " +
      "earnings, real hourly rate, pending money, calendar, tax-year totals and the times you earn best.",
  },
  {
    question: "How do I export my submissions CSV from Prolific?",
    answer:
      "In Prolific, open the Submissions page and use the option to download your submission history as a CSV file, then " +
      "upload that file on the Upload CSV page. Re-uploading a newer export updates studies whose status changed.",
  },
  {
    question: "Is Prolific Tracker free?",
    answer: "Yes. It is free to use, with no ads.",
  },
  {
    question: "How is my hourly rate calculated?",
    answer:
      "Total money earned divided by total time spent on studies that paid, using the start and completion times in your " +
      "export, converted into your preferred currency. Very short studies don't skew it the way an average of per-study rates does.",
  },
  {
    question: "Does it handle both GBP and USD studies?",
    answer:
      "Yes. Each study keeps the currency it was paid in, totals are shown per currency, and combined totals are converted " +
      "into your preferred currency.",
  },
  {
    question: "Is it affiliated with Prolific?",
    answer: NOT_AFFILIATED,
  },
]

/** Feature list used in structured data and /llms.txt. */
export const FEATURES = [
  "CSV import of the Prolific submissions export, with duplicate detection and status updates on re-upload",
  "Real hourly rate (total earned / time spent)",
  "Native GBP and USD totals plus a combined total in your preferred currency",
  "Approved, pending, screened-out and returned breakdown",
  "Calendar of daily earnings",
  "Tax-year totals, including the UK tax year and the £1,000 trading allowance",
  "Best days and start hours by hourly rate",
  "Weekly earnings goal",
  "CSV export of your data",
]
