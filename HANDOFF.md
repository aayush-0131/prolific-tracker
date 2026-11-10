# Handoff — prolific-tracker
Last updated: 2026-11-10 ~14:40 UTC by Claude Code (cloud session)  ·  Branch: feat/seo-aeo

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
- Security audit (cloudflare/security-audit-skill, quick profile, budget 16 agents):
  Phase 1 done — 4 of 16 agents spent; architecture.md written; coverage-ledger.json seeded
  with 10 units (5 planned hunters) and passes the skill's validate-coverage-ledger.cjs.
- Audit sandbox hardened (tools in ~/audits/my-project/tools). Verified by an in-sandbox
  self-test: runs as nobody with no capabilities, read-only mounts verified (fails closed),
  no external network/DNS, host sockets hidden, cgroup memory cap kills a memory hog,
  file-size cap holds, target unit tests 19/19 inside the sandbox.
- Audit Phase 2 hunter wave done (9 of 16 agents spent): 10/10 ledger units closed — 8 covered,
  2 candidates; ledger re-validated after each result. Candidates (not yet findings):
  password change doesn't invalidate JWT sessions; unbounded CSV upload work.
- SEO/AEO (branch feat/seo-aeo, not merged). Verified on a local production build: home HTML
  now has the H1/content/FAQ (live site serves only a spinner), FAQPage + WebApplication
  JSON-LD in server HTML, per-route canonicals for /, /login, /register; app pages noindex;
  signed-in / /login /register -> 307 /dashboard; robots.txt, sitemap, /llms.txt, 1200x630
  OG image and apple-icon all served. tsc + eslint clean.

## In progress
- Audit Phase 2 final coverage critic (1 agent), then Phase 3 verifiers (1 per candidate).
  Audit files live in ~/audits/my-project (container-local, outside the repo; NOT durable).

## Next steps (ordered)
1. Critic + verifiers; validate findings.json / ledger with the skill's validators; write
   REPORT.md / FINDINGS-DETAIL.md / NEEDS-VALIDATION.md.
2. Open the SEO/AEO PR (ask before merging); fix confirmed security findings in separate PRs.
3. Mobile check of every page on production (Insights already verified: no overflow).
4. Owner: Google Search Console (HTML-tag method via NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION).

## Decisions & why
- Login stays for now; "try with demo data" first, local-only guest mode later (owner undecided).
- Freemium deferred ~1 month to gather usage data first.
- Researcher stats (CSV has a "Published By" column) deferred until after sharing.
- A bonus on a rejected/returned/timed-out row counts as earned (original code's intent).
- Merges to main only with the owner's explicit OK; no force-push.

## Known broken / open questions
- Prolific's "Total earned" exceeds the CSV export by a small amount; the export itself sums
  exactly to the tracker's totals, so Prolific counts money not present in the export.
- Two throwaway test accounts exist in production (owner will delete them).
- Possible rename of the product (Prolific trademark) — undecided; affects SEO work.

## How to run / verify
- `npm ci` · `npm test` · `npx tsc --noEmit` · `npx eslint <files>` · `npx next build`
- Local DB: Postgres 16 on port 5433, `npx prisma migrate deploy`, then `.env.local` with
  DATABASE_URL / NEXTAUTH_SECRET / NEXTAUTH_URL (values not stored here).
- Browser checks used Playwright scripts kept in the session scratchpad (not in the repo).
