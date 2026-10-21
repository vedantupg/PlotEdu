# PlotEdu — infrastructure setup

Run once, in order. Every step that needs a login is marked **(you)**; everything else is scripted.
Target: Supabase + Vercel in **Mumbai** (`ap-south-1` / `bom1`) for low latency to students in Maharashtra.

## 0. Prerequisites

- Node 22+ (`.nvmrc`), `npm install` in `web/`.
- Supabase CLI is a dev dependency: use `npx supabase …` (no global install).
- `gh` and `vercel` CLIs (already on this machine).

## 1. GitHub repository

```bash
gh auth login                                   # (you) once
gh repo create plotedu --private --source=. --remote=origin --push
```

CI (`.github/workflows/ci.yml`) runs typecheck, lint, tests and a build on every PR and push to `main`.

## 2. Supabase project

1. **(you)** Create a project at supabase.com → region **South Asia (Mumbai)**, plan Free to start
   (upgrade to Pro before launch for daily backups — PRD §9). Save the database password.
2. Link and push schema + seed:

   ```bash
   npx supabase login                            # (you) once
   npm run db:link -- --project-ref <project-ref>
   npm run db:push                               # migrations + supabase/seed.sql
   npm run db:types                              # optional: generated DB types
   ```

3. Dashboard → **Authentication → URL configuration**
   - Site URL: `https://plotedu.in` (use the Vercel URL until the domain is live)
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://plotedu.in/auth/callback`,
     `https://*-<vercel-team>.vercel.app/auth/callback`

## 3. Google sign-in (students)

1. **(you)** Google Cloud Console → new project **PlotEdu**.
2. OAuth consent screen → External → app name PlotEdu, support email, authorized domain `plotedu.in`,
   scopes **openid, email, profile only** (no verification needed for these).
3. Credentials → OAuth client ID → Web application
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Supabase → Authentication → Providers → Google → paste client ID + secret → enable.

The Calendar scope for Kajal is a **separate** OAuth client added in Phase 3; submit it for
verification early (PRD risk table).

## 4. Vercel

```bash
vercel login                                    # (you) once
vercel link                                     # create project "plotedu", root = web/
vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
vercel env add SUPABASE_SERVICE_ROLE_KEY production preview      # never development
vercel env add NEXT_PUBLIC_SITE_URL production                     # https://plotedu.in
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard for a preview deploy per PR.
Production refuses to start without Supabase env (see `instrumentation.ts`), so it can never
silently serve demo data.

## 5. First admin

Sign in once with Kajal's Google account, then in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where email = '<kajal@…>';
```

## 6. Verify

- `GET /api/health` → `{ "ok": true, "mode": "live", "db": "ok" }`
- Sign in → onboarding → apply → approve in SQL (`select public.decide_enrollment(...)` as admin,
  or the Admin console once built) → dashboard unlocks.

## 7. Domain and email (Phase 3, but start DNS now)

- **(you)** Buy `plotedu.in` (+ `plotedu.com` redirect). Add to Vercel → set DNS records it shows.
- Resend: add domain `plotedu.in`, add its SPF, DKIM and DMARC records **before the first send**.

## Environment variables

| Name                                        | Where         | Notes                                       |
| ------------------------------------------- | ------------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                  | all           | Project URL                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`             | all           | Public anon key; RLS protects data          |
| `SUPABASE_SERVICE_ROLE_KEY`                 | prod, preview | Server only: downloads, cron, calendar sync |
| `NEXT_PUBLIC_SITE_URL`                      | prod          | Canonical URL for OAuth, emails, sitemap    |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | prod          | Phase 3 — Calendar connection               |
| `RESEND_API_KEY`                            | prod          | Phase 3 — email                             |
| `CRON_SECRET`                               | prod          | Phase 3 — protects `/api/cron/*`            |
