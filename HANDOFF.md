# Handoff — prolific-tracker
Last updated: 2026-11-10 end of day by Claude Code (cloud session)  ·  Branch: main

## Goal (current milestone)
Make the live site (prolific-tracker-alpha.vercel.app) solid enough to share with a small
group: correct numbers, Recent Earnings fixed, security audit done, SEO/AEO basics, mobile OK.
Stay free for ~1 month, then decide on freemium.

## Done (verified — how)
- PRs #1–#4 merged and live (Google button hidden, deps upgraded, earnings-math fixes,
  Insights page). Verified on production after the final deploy: Playwright workflow suite
  12/12 passed; test-CSV suite 26/26 passed (numbers hand-computed from the CSV rows).
- PR #5 merged (identical CSV rows kept, 639→640). Verified locally with a real 640-row export
  (fresh upload 640, re-upload 0 new, old-style account heals +1). Production: workflow suite
  12/12 after deploy. The 640 heal itself was not re-run on production (owner can re-upload).
- PR #6 merged (Recent Earnings: NULL start times sorted last + `?earned=true`). Verified:
  `npm test` 20/20, tsc + eslint clean, local build with the real export, and on production
  after deploy the widget lists the latest Approved studies; workflow suite 12/12 passed.
- SEO/AEO PR #7 merged; production verified: home HTML has H1, FAQ, FAQPage + WebApplication
  JSON-LD, no spinner; /opengraph-image and /llms.txt served.
- Demo mode PR #10 merged: public /demo with generated sample data. Production verified on
  desktop and iPhone 13 (0px overflow, no page errors); final production workflow suite 11/12
  (the one 'fail' is leftover duplicate rows in the probe account, i.e. duplicate detection working).
- Session revocation PR #9 merged (audit finding fixed). Production verified with a two-device
  test: after a password change the other device gets 401, empty session, cookie cleared;
  old password rejected, new works. CI (npm test) and Vercel preview passed.
- Security audit COMPLETE (cloudflare/security-audit-skill, quick profile, 12/16 agents) in a
  hardened sandbox (nobody user, read-only, no network; self-tested). findings.json + ledger
  pass the skill's validators: 1 confirmed medium (JWT sessions survived password change; fixed
  in PR #9), 1 needs_validation (unbounded upload; capped in PR #12), 3 deferred units
  (Google OAuth linking, login brute-force limits, Host-header caching). Reports in
  ~/audits/my-project (container-local) + copies sent to owner.
- Mobile on production (iPhone 13 emulation): all 11 pages 0px horizontal overflow, no page
  errors; mobile menu opens with all 8 links and navigates.
- Phone CSV upload fix PR #12 merged (content-based check, broader accept, 5 MB cap).
  Production verified in Pixel 7 + iPhone 13 emulation: .CSV / no extension / .csv.txt / .csv
  all import; jpg and non-Prolific CSV refused with a clear toast; server 400 for non-Prolific,
  413 for 6 MB (Vercel itself rejects bodies >4.5 MB with a plain-text 413). CI passed.

- Owner changed NEXTAUTH_SECRET and the Neon DB password (DATABASE_URL), both now Sensitive
  in Vercel. Production verified after redeploy: register/login/earnings API OK, phone upload
  test passes. Database is Neon Postgres (project prolific-tracker, branch production).

## In progress
- (nothing in progress)

## Next steps (ordered)
1. Local-only guest mode (after demo mode ships).
2. Hardening PR: security headers, lower client cap to 4 MB (Vercel 4.5 MB limit), row caps, validate exchange-rate response,
   remove /api/test-rates and ?debug=native, bound `limit` and bulk ids.
3. Optional: leave Neon Data API OFF (app doesn't use it). Owner: Google Search Console (HTML-tag method via NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION).
4. Optional standard-profile audit of the 3 deferred units.

## Decisions & why
- Optional login: owner approved demo mode first, local-only guest mode later.
- Name stays "Prolific Tracker" for now (rename = one line in src/lib/site.ts).
- Session revocation via password-hash fingerprint in the JWT (no DB migration needed).
- Freemium deferred ~1 month to gather usage data first.
- Researcher stats (CSV has a "Published By" column) deferred until after sharing.
- A bonus on a rejected/returned/timed-out row counts as earned (original code's intent).
- Merges to main only with the owner's explicit OK; no force-push.

## Known broken / open questions
- Prolific's "Total earned" exceeds the CSV export by a small amount; the export itself sums
  exactly to the tracker's totals, so Prolific counts money not present in the export.
- Test accounts (probe + tester) kept in production on purpose for future testing; safe to
  delete anytime and recreate. Never store their passwords in this file.
- Possible rename of the product (Prolific trademark) — undecided; affects SEO work.

## How to run / verify
- `npm ci` · `npm test` · `npx tsc --noEmit` · `npx eslint <files>` · `npx next build`
- Local DB: Postgres 16 on port 5433, `npx prisma migrate deploy`, then `.env.local` with
  DATABASE_URL / NEXTAUTH_SECRET / NEXTAUTH_URL (values not stored here).
- Browser checks used Playwright scripts kept in the session scratchpad (not in the repo).
