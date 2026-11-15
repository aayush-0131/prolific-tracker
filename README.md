# Prolific Tracker

A free earnings tracker for [Prolific](https://www.prolific.com) participants.

**Live:** [prolific-tracker-alpha.vercel.app](https://prolific-tracker-alpha.vercel.app) · **Try it without an account:** [/demo](https://prolific-tracker-alpha.vercel.app/demo)

Prolific shows a running balance, but not the numbers participants actually care about: real hourly rate, money still pending, earnings by tax year, or which days and hours pay best. Prolific Tracker turns the submissions CSV you export from Prolific into those answers.

## Features

- **CSV import** of your Prolific submissions export. Re-uploading a newer export updates studies whose status changed and skips rows already stored. Files are checked by content, not just extension, so uploads from phones work.
- **Dashboard** with approved and pending totals, an earnings chart, a weekly goal and recent earnings.
- **Real hourly rate** computed from time actually spent on studies.
- **GBP and USD** totals using live exchange rates (cached hourly, with fallbacks).
- **Calendar, analytics and insights** pages: tax-year totals and the days and hours you earn best.
- **Manual entries** for studies not in the export.
- **Demo mode** with generated sample data, so anyone can explore the app without signing up.
- **Accounts** with email and password. Changing your password signs out every other device.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript |
| Data | PostgreSQL via Prisma |
| Auth | NextAuth |
| UI | Tailwind CSS, Radix UI / shadcn components, Recharts |
| Hosting | Vercel |

## Running locally

Requirements: Node.js 20+ and a PostgreSQL database.

```bash
npm ci
# create .env.local first, see below
npx prisma migrate deploy
npm run dev
```

`.env.local` needs:

```
DATABASE_URL=postgresql://user:password@localhost:5432/prolific_tracker
NEXTAUTH_SECRET=<any long random string>
NEXTAUTH_URL=http://localhost:3000
```

Then open <http://localhost:3000>.

## Tests

```bash
npm test             # unit tests (CSV parsing, earning rules, insights, auth, sessions)
npx tsc --noEmit     # type check
npm run lint
```

## Project layout

```
src/app/            routes: landing page, auth, dashboard pages, API routes
src/components/     dashboard widgets, layout, UI primitives
src/lib/            CSV parsing, earning rules, currency, insights, auth
prisma/             database schema and migrations
```

## Disclaimer

Prolific Tracker is an independent, community-made tool. It is not affiliated with, endorsed by, or sponsored by Prolific.
