# Handoff — prolific-tracker
Last updated: 2026-11-10 ~12:50 UTC by Claude Code (cloud session)  ·  Branch: fix/recent-earnings (PR #6)

## Goal (current milestone)
Make the live site (prolific-tracker-alpha.vercel.app) solid enough to share with a small
group: correct numbers, Recent Earnings fixed, security audit done, SEO/AEO basics, mobile OK.
Stay free for ~1 month, then decide on freemium.

## Done (verified — how)
- PRs #1–#4 merged and live (Google button hidden, deps upgraded, earnings-math fixes,
  Insights page). Verified on production after the final deploy: Playwright workflow suite
  12/12 passed; test-CSV suite 26/26 passed (numbers hand-computed from the CSV rows).
- PR #5 merged (identical CSV rows kept, 639→640). Verified locally with a real 640-row export
  (fresh upload 640, re-upload 0 new, old-style account heals +1). Vercel production build
  status = success. Live behaviour NOT re-checked after this deploy (see In progress).
- Recent Earnings fix committed (branch fix/recent-earnings, PR #6): NULL start times sorted
  last + `?earned=true` filter. Verified: `npm test` 20/20, `tsc --noEmit` clean, eslint clean,
  local production build with the real export shows the latest approved studies first.
- Security audit (cloudflare/security-audit-skill, quick profile, budget 16 agents):
  Phase 1 reconnaissance done — 4 of 16 agents spent; reports returned (not yet written to files).

## In progress
- PR #6: waiting for Vercel preview build, then merge (owner approved deploying this fix),
  then re-check production (Recent Earnings + workflow suite; also covers PR #5).
- Security audit Phase 1 wrap-up: write architecture.md + coverage-ledger.json to
  ~/audits/my-project (container-local, outside the repo; NOT durable across sessions).
  Sandbox runner must be hardened first: recon found it runs as root (needs privilege drop,
  fail-closed read-only check, size-limited scratch). Until then: source-only review.

## Next steps (ordered)
1. Merge PR #6 after preview passes; verify production.
2. Harden sandbox; seed ledger; run hunter wave (~5 agents), critic, verifiers; validate
   with the skill's validators; write REPORT.md / FINDINGS-DETAIL.md / NEEDS-VALIDATION.md.
3. Fix confirmed security findings in separate PRs (ask before merging).
4. SEO/AEO: llms.txt, FAQ + FAQPage JSON-LD, Open Graph image (layout references a missing
   og-image.png), central site-name/URL config to make a rename cheap.
5. Mobile check of every page on production (Insights already verified: no overflow).

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
