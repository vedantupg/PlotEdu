# PlotEdu

Lean, branded learning platform for the November 2026 UDCPR batch. Spec: `../PlotEdu Platform — PRD & Technical Spec.md`.

Next.js 16 (App Router, TS strict) · Supabase (Postgres + RLS, Auth, Storage, Realtime) · Tailwind v4 · Vercel.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Without Supabase env vars the app runs in **demo mode**: public pages use the seed content in
`lib/content/`, and app pages show sample data as an approved student. Preview states on `/home`:
`?demo=go` (15-min window), `?demo=live`, `?demo=ended`, and `?demo=member` (applicant view).

## Connect Supabase

Full runbook (GitHub, Supabase, Google OAuth, Vercel, domain): **[SETUP.md](SETUP.md)**. Short version:

1. Create a project; copy `.env.example` to `.env.local` and fill the keys.
2. Apply `supabase/migrations/*.sql` (`supabase db push`, or paste into the SQL editor).
3. `npm run db:seed:gen` regenerates `supabase/seed.sql` from `lib/content/`; run it after the migration.
4. Auth → Providers → Google: enable, add the OAuth client. Redirect URL: `<site>/auth/callback`.
5. Make Kajal admin after her first sign-in:
   `update profiles set role = 'admin' where email = '<kajal@…>';`

## Scripts

| Script                       | Purpose                                                          |
| ---------------------------- | ---------------------------------------------------------------- |
| `npm run dev` / `build`      | Dev server / production build                                    |
| `npm test`                   | Vitest unit tests (session states, IST time, note access, utils) |
| `npm run typecheck` / `lint` | `tsc --noEmit` / ESLint                                          |
| `npm run db:seed:gen`        | Regenerate `supabase/seed.sql` from TypeScript content           |

## Architecture notes

- **Permissions live in Postgres.** RLS on every table; helpers `is_admin()`, `is_approved_student()`,
  `is_batch_staff()`, `can_access_note()`. UI checks (`lib/access.ts`) only decide how locks render.
- **Meet links never reach the client.** `sessions.meet_url` is column-revoked; `/s/[id]/join` calls
  `join_session()`, which logs attendance inside the window (15 min before → end) and returns the URL.
- **Capacity is enforced on approval** in `decide_enrollment()` with a row lock on the batch.
- **Forum anonymity is enforced in SQL**: base tables are not readable; `forum_threads` / `forum_posts`
  views null out authors for everyone but Admin. Writes will go through RPCs (phase 4).
- **Quiz answers stay server-side**: `correct_index` is column-revoked; `answer_quiz_question()` grades.
- **Service-role key** is used only in: note download signing, cron reminders, calendar sync.
- **Downloads**: `/api/notes/[id]/download` → `can_access_note()` as the viewer → 60 s signed URL → logged.
- `cacheComponents` is off: app routes are per-user dynamic; public pages (landing, course, glossary)
  are static/ISR and read Supabase with a cookie-less anon client.
- Next 16 renamed middleware to `proxy.ts` (session refresh + optimistic sign-in redirect).

## Design system ("The Plan Sheet")

Tokens and type scale live in `app/globals.css`.

- **Type**: Archivo (variable, _expanded_ `wdth` axis — the poster voice) for display; Instrument Sans for UI
  and body; Newsreader serif for leads and definitions (reference-book register); IBM Plex Mono for survey
  metadata only. Utilities: `display-1…4`, `display-caps`, `lead`, `survey`.
- **Theme**: one theme for the whole app. Dark (brand default) / Light / System, under the avatar menu.
- **Shape**: soft radii for interactive UI (`--radius-control` 10px, `--radius-card` 14px); the PlotFrame
  stays sharp — it is the plot boundary, max one per view.
- **Grid**: landing hero only, masked to fade out.
- **Primitives**: `components/ui/` — Button/ButtonLink/ButtonAnchor, ChipLink/ChipButton, PageHeader,
  SectionHeading, Sep. Every page header uses PageHeader.
- Deviation from PRD: `--accent-ink` (#8F5A00) for saffron _text_ in light mode, since #C77F0A on paper is
  ~2.9:1 and fails WCAG AA. Fills keep the PRD hex with navy text (~5.3:1).

## Build plan

| Phase           | Scope                                                                                                                                                                                        | Status   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1 Foundation    | Schema + RLS + RPCs, seed, Google auth, onboarding, apply, landing, course, glossary, app shell, dashboard (all card states), sessions, notes library + locks, join + download routes, tests | **Done** |
| 2 Admin Console | Today, People (approve/reject/waitlist, mark paid, roles), Batches, Sessions CRUD, Notes upload + access, Glossary editor, Announcements, audit log, 10 s undo                               | Next     |
| 3 Integrations  | Google Calendar OAuth (Kajal) + Meet auto-create/update/cancel, manual Meet fallback, Resend + React Email, Vercel Cron 24h/1h reminders (idempotent `email_jobs`), approval emails          |          |
| 4 Engagement    | Forum (RPC writes, upvotes, anonymous, accept answer, moderation, Realtime), quizzes, command palette, glossary auto-linking                                                                 |          |
| 5 Hardening     | Rate limits, CSP, Sentry, PostHog events, OG images, Lighthouse 90+, a11y pass, closed beta                                                                                                  |          |
