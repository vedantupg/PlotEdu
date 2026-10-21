# PlotEdu Platform — PRD & Technical Spec

Oct 19, 2026 · @Vedant

## 1. Vision, goals and success metrics

PlotEdu ships a lean, branded learning platform by the November 2026 UDCPR batch, built on a multi-course foundation so course two needs no rebuild.

**Vision.** The place where Maharashtra's architects, graduates and development-control professionals learn the industry the way it actually works: plot first, regulation second, design third. Every screen teaches. Every interaction respects the learner's time.

**Problem.** Today a cohort runs on scattered tools: a Meet link in WhatsApp, PDFs in Drive, doubts lost in group chats. Kajal manages enrolment, payments, notes and schedules by hand. Students lose the thread between sessions. Nothing compounds into a brand.

**Primary user.** Kajal (Admin). Every operational task she does today must be one screen away in the Admin Console.

### Goals

| #   | Goal                                    | v1 measure                                                                                             |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| G1  | Run the November batch fully on PlotEdu | 25 of 25 selected students active on platform in week 1                                                |
| G2  | Zero-friction class access              | Student reaches the live Meet from the dashboard in 1 tap; attendance logged for at least 90% of joins |
| G3  | Kajal runs operations from one console  | Approve, schedule, upload, announce without leaving Admin; no task needs Supabase or code              |
| G4  | Doubts get answered in public           | At least 80% of forum threads marked resolved within 48 hours                                          |
| G5  | Visitors convert to waitlist            | Waitlist sign-ups for batch 2 tracked from launch; free glossary and free notes as the funnel          |
| G6  | Brand that feels premium                | Lighthouse 90+ performance and accessibility on mobile; design consistent with launch posters          |

### Non-goals for v1

- On-platform payments (offline now; Razorpay later, schema ready).
- Hosting video lectures or self-paced courses. Classes stay live on Google Meet.
- Native mobile apps. The web app is mobile-first and installable as a PWA later.
- FSI / setback / parking calculator and certificates (roadmap, section 3).
- Marathi or Hindi content (i18n-ready structure only).

## 2. Users, roles and permissions

Three assignable roles (Admin, Professor, Student) sit on top of two automatic states (Visitor, Applicant), so anyone with a Google account gets value, and only selected students unlock the batch.

| Who                                        | How they get here                                          | What they experience                                                                              |
| ------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Visitor                                    | Not signed in                                              | Marketing site, course page, glossary, free notes preview                                         |
| Member (Applicant / Waitlisted / Rejected) | Signed in with Google; role = student, no active enrolment | Glossary, free notes, read-only forum, batch application status, join waitlist                    |
| Student                                    | Admin approves their batch application                     | Full dashboard, next-session card, paid notes for their batch, forum posting, quizzes, attendance |
| Professor                                  | Admin assigns the role (guest lecturer)                    | Answer and resolve forum threads, view enrolled student list for assigned batches                 |
| Admin                                      | Seeded (Kajal); can promote others                         | Everything, from one Admin Console                                                                |

**Key rule.** A rejected applicant is never locked out. They keep member access and can apply to the next batch.

### Permissions matrix

| Capability                                                    | Visitor        | Member | Student                         | Professor        | Admin |
| ------------------------------------------------------------- | -------------- | ------ | ------------------------------- | ---------------- | ----- |
| Browse public pages + glossary                                | Yes            | Yes    | Yes                             | Yes              | Yes   |
| Download free notes                                           | Sign-in prompt | Yes    | Yes                             | Yes              | Yes   |
| Download paid notes                                           | No             | No     | Own batch only                  | Assigned batches | Yes   |
| Apply to a batch / join waitlist                              | Sign-in prompt | Yes    | Yes                             | No               | No    |
| See next session + Meet link                                  | No             | No     | Own batch                       | Assigned batches | Yes   |
| Read forum                                                    | Public threads | Yes    | Yes                             | Yes              | Yes   |
| Post / reply / upvote in forum                                | No             | No     | Yes                             | Yes              | Yes   |
| Post anonymously                                              | No             | No     | Yes (identity visible to Admin) | No               | No    |
| Mark answer resolved                                          | No             | No     | Own thread only                 | Yes              | Yes   |
| Pin, lock, delete posts                                       | No             | No     | No                              | No               | Yes   |
| Take quizzes                                                  | No             | No     | Yes                             | Preview          | Yes   |
| View student list                                             | No             | No     | No                              | Assigned batches | Yes   |
| Create sessions, upload notes, approve students, manage roles | No             | No     | No                              | No               | Yes   |

Professors are scoped by a `batch_staff` assignment, not a global flag, so a guest lecturer only sees the batch they teach.

## 3. Scope: what ships when

v1 ships what the November batch cannot run without; everything else is designed into the schema now and built after the batch starts.

| Capability                                            | v1 — November batch       | v1.5 — during batch 1       | v2 — batch 2 and beyond                  |
| ----------------------------------------------------- | ------------------------- | --------------------------- | ---------------------------------------- |
| Google sign-in, profiles, roles                       | Yes                       |                             |                                          |
| Batch application + Admin approval + waitlist         | Yes                       |                             | Bulk actions, email templates            |
| Student dashboard + live next-session card            | Yes                       |                             |                                          |
| Sessions with auto-created Calendar event + Meet link | Yes                       |                             | Recurring schedules                      |
| Email reminders (24h, 1h)                             | Yes                       |                             | WhatsApp reminders                       |
| Attendance (logged on Join click)                     | Yes                       | Admin manual override       | Attendance-based unlocks                 |
| Notes library, free vs paid access                    | Yes                       | Per-student overrides       | Watermarked downloads (decision pending) |
| Forum by module, upvotes, anonymous, resolve          | Yes                       | Mentions, notifications     | Search, reputation                       |
| Glossary of planning terms                            | Yes                       | Linked from notes + forum   | Marathi terms                            |
| Quizzes per module                                    | Engine + UI               | Results analytics for Admin | Adaptive review                          |
| Admin Console                                         | Yes                       | Analytics tab               | Multi-admin audit log UI                 |
| Payments                                              | Offline, Admin marks paid |                             | Razorpay checkout                        |
| FSI / setback / parking calculator                    |                           |                             | Yes                                      |
| Completion certificates (verifiable ID)               |                           | Yes, end of batch 1         |                                          |
| Multiple courses visible in UI                        | Schema only               |                             | Yes                                      |

**Content dependency.** Quizzes and glossary ship as features in v1, but their value depends on Kajal authoring questions and terms. The Admin Console makes this a 2-minute-per-item task; the build does not wait on content.

## 4. Feature specifications

Eight features make up v1; each one below states what the user sees, the rules, and the edge cases that decide the build.

### 4.1 Sign-in and enrolment

- Google sign-in only (Supabase Auth, Google provider). First sign-in creates a `profile` with role `student` and no enrolment.
- Onboarding asks 3 things in one screen: full name (prefilled from Google), college or firm, city. Skippable, but required before applying to a batch.
- **Apply to batch:** member picks an open batch, confirms details, submits. Status: `applied` → `approved` / `rejected` / `waitlisted`.
- Approval emails the student and flips their dashboard live instantly. Rejection is soft: a kind email, waitlist offer, and member access stays.
- Payment status is separate from approval: `unpaid` / `paid` / `waived`, set by Admin. Paid notes require `approved` AND (`paid` OR `waived`). This rule is configurable per batch (`require_payment_for_notes`).
- Batch capacity (25) is enforced on approval, not application. Admin sees "23 of 25 seats filled".

### 4.2 Student dashboard

The dashboard answers one question in under 2 seconds: **what do I do next?**

- **Next Session card (hero).** Title, module tag, date and time in IST, agenda (3–5 bullet points), professor, live countdown (days, hours, minutes, seconds), Join button.
- **Card states:** more than 24h away → countdown + "Add to calendar"; under 15 min → card glows saffron, Join button activates; live → "Live now" pulse, Join; ended → shows recording link if attached and "Notes for this session"; no upcoming session → "Next session will be announced" + last session recap.
- Countdown is computed client-side from a server timestamp, rerendered every second, and resynced on tab focus so a sleeping phone never shows a stale clock.
- **Below the hero:** this week's sessions, latest notes for the batch, unresolved forum threads from my batch, quiz due, course progress (sessions attended / total).
- **Term of the day** from the glossary, so every visit teaches one thing even if the student only came for the link.

### 4.3 Sessions and Google Meet automation

- Admin creates a session: batch, title, module, agenda, start time, duration, professor (optional), visibility.
- On save, the server creates a Google Calendar event on Kajal's connected calendar with `conferenceData.createRequest` (Meet), invites all approved students of the batch as guests, and stores `calendar_event_id` + `meet_url`.
- Editing time or agenda updates the Calendar event; cancelling sends a cancellation and marks the card "Cancelled".
- Fallback: if the Google connection fails or expires, Admin can paste a Meet link manually; a banner in Admin says "Reconnect Google Calendar".
- **Join flow:** student taps Join → `/s/[sessionId]/join` logs attendance (`joined_at`) → redirects to the Meet URL. The Meet link is never shown to non-enrolled users.
- Attendance = logged Join click within session window (from 15 min before to end). Admin can override per student (v1.5).
- **Reminders:** email at 24h and 1h before start, sent by a scheduled job; one email per student per reminder, idempotent.

### 4.4 Notes library

- Admin uploads PDF (also DOCX, PPTX, images) with: title, module, linked session (optional), description, access level.
- **Access levels:** `public` (anyone, even signed out) · `members` (any signed-in user) · `batch` (approved students of chosen batches, payment rule applied) · `staff` (Admin + Professors).
- Free notes = `public` or `members`. Paid notes = `batch`. Changing access is one dropdown in Admin; takes effect immediately.
- Files live in a private Supabase Storage bucket. Downloads go through a server route that checks access, logs the download, and returns a short-lived signed URL (60 seconds).
- Locked notes stay visible as titles with a lock and a reason ("Enrolled students only — apply for the next batch"), which turns the library into a funnel.
- Watermarking is designed as a pluggable step in the download route (stamp name + email on every page); off until decided.

### 4.5 Discussion forum

- Categories = course modules (Foundation, UDCPR, Practical Planning, Professional Practice) + General. A thread can link to a session or a glossary term.
- Thread: title, body (Markdown with image upload), optional anonymous toggle. Anonymous posts show "Anonymous student" to everyone except Admin.
- Replies, upvotes on threads and replies (one per user), sort by Newest, Top, Unresolved.
- Professor or Admin can mark a reply as **Accepted answer**; the thread turns resolved and the answer is pinned under the question. The original poster can also accept.
- Visibility: forum readable by all signed-in members; posting by Students, Professors, Admin. Batch-private threads are an optional flag.
- Moderation (Admin): pin, lock, edit, delete, reveal anonymous author. Every moderation action is logged.
- Realtime: new replies appear live via Supabase Realtime; no refresh.

### 4.6 Glossary

- Searchable, A–Z, filterable by module. Each term: name, short definition (1–2 lines), full explanation, example, related terms, source reference (UDCPR clause / Act).
- Public and indexable by search engines: the main SEO surface of PlotEdu.
- Terms auto-link inside notes descriptions and forum posts (hover card on desktop, tap sheet on mobile).

### 4.7 Quizzes

- Per module, authored in Admin: multiple-choice questions with 2–4 options, one correct, explanation shown after answering.
- Student flow: one question per screen, instant feedback, score at end, retake allowed; best score saved.
- Admin sees completion rate and the 3 most-missed questions per quiz (v1.5).

### 4.8 Admin Console

One route (`/admin`) with a left rail on desktop and a bottom sheet on mobile. The **Today** tab answers "what needs me?": pending applications, unresolved threads older than 24h, next session status, failed emails.

| Tab                  | Kajal can                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------- |
| Today                | See pending approvals, unanswered doubts, next session, alerts                           |
| Courses and batches  | Create course, batch (dates, capacity, payment rule), open or close applications         |
| People               | Search users, approve/reject/waitlist, mark paid, change role, assign professor to batch |
| Sessions             | Create/edit/cancel, auto Meet link, view attendance per session                          |
| Notes                | Upload, set access, link to session, see download counts                                 |
| Forum                | Moderate, pin, resolve, reveal anonymous                                                 |
| Glossary and quizzes | Add/edit terms and questions                                                             |
| Announcements        | Post a banner to a batch or everyone, optional email                                     |
| Settings             | Google Calendar connection, email sender, branding text                                  |

Every list supports search, filter and bulk select; every destructive action asks once and can be undone for 10 seconds.

## 5. Information architecture and key flows

Five primary destinations, identical on every device: Home, Sessions, Notes, Forum, Glossary. Admin is a sixth, visible only to Admins.

### Navigation

- **Mobile:** bottom tab bar with 5 icons + labels (Home, Sessions, Notes, Forum, Glossary). Profile and Admin sit behind the avatar in the top bar. Thumb-reachable Join button on the session card.
- **Desktop:** slim left rail with the same 5 items, avatar at bottom, Admin above it. Content max-width 1120 px; reading surfaces (notes, threads, glossary) max 720 px.
- **Command palette** (Ctrl/Cmd + K, search icon on mobile): jump to any session, note, thread or glossary term.
- Signed-out visitors see a marketing top bar: Course, Glossary, Free notes, Sign in.

### Routes

| Route                                          | Who                                    | Purpose                                            |
| ---------------------------------------------- | -------------------------------------- | -------------------------------------------------- |
| `/`                                            | Public                                 | Landing: PlotEdu, current course, next batch, CTA  |
| `/courses/[slug]`                              | Public                                 | Course page: modules, outcomes, batch dates, apply |
| `/glossary`, `/glossary/[term]`                | Public                                 | Searchable terms, SEO pages                        |
| `/home`                                        | Signed in                              | Dashboard (student) or status page (member)        |
| `/sessions`, `/sessions/[id]`                  | Student+                               | Schedule, agenda, recording, notes                 |
| `/s/[id]/join`                                 | Student+                               | Log attendance, redirect to Meet                   |
| `/notes`                                       | Signed in (public subset for visitors) | Library with filters and lock states               |
| `/forum`, `/forum/[category]`, `/forum/t/[id]` | Signed in                              | Discussion                                         |
| `/quiz/[id]`                                   | Student                                | Module quiz                                        |
| `/apply/[batchId]`                             | Signed in                              | Batch application                                  |
| `/admin/*`                                     | Admin                                  | Console tabs                                       |

### Flow 1 — Visitor to student

1. Visitor lands on `/` from Instagram or WhatsApp.
2. Reads course page, browses glossary, downloads a free note (sign-in prompt).
3. Signs in with Google, completes 3-field onboarding.
4. Applies to the November batch. Sees "Application received" status card on `/home`.
5. Kajal approves in Admin → student gets email, dashboard unlocks, Calendar invites arrive for all scheduled sessions.
6. Rejected or over capacity → waitlisted, keeps member access, notified when batch 2 opens.

### Flow 2 — Class day

1. 24h reminder email with agenda and a link to the dashboard (not the raw Meet link).
2. 1h reminder.
3. Student opens `/home`; card turns saffron 15 minutes before; taps Join → attendance logged → Meet opens.
4. After class: Kajal uploads notes linked to the session; card switches to "Notes for this session".

### Flow 3 — Doubt to resolution

1. Student posts in Forum → UDCPR category, anonymously.
2. Kajal sees it in Admin → Today ("2 doubts older than 24h").
3. A professor replies; Kajal marks it Accepted; thread turns resolved; student is notified.

## 6. Brand and design system

The platform extends the launch posters into a product system: a drafting-table identity, where every screen feels like a well-dimensioned plan sheet, not a template.

### Concept: "The Plan Sheet"

The posters already carry the idea: a navy blueprint grid, a plot boundary with saffron corner markers, monospaced survey labels ("PLOT NO. 01"). The product turns these from decoration into **function**:

- **Plot-frame corners** mark the one thing that matters on a screen: the next-session card, the active quiz question, an accepted answer. Never more than one framed element per view.
- **Mono survey labels** carry metadata: `MODULE 02 · FSI`, `SESSION 04 · 22 OCT · 7:00 PM IST`, `NOTE · PDF · 2.4 MB`.
- **The grid** is visible only on hero surfaces (landing, dashboard top, empty states), faint enough to never fight text.
- **Dimension lines** (thin lines with end ticks) replace generic progress bars: course progress reads like a measured plot edge.

### Tokens

| Token                    | Dark (default)    | Light (reading mode) | Use                      |
| ------------------------ | ----------------- | -------------------- | ------------------------ |
| `--ink` / background     | Navy #0F1A2B      | Paper #F5F1E8        | Page                     |
| `--surface`              | #15233A           | #FFFFFF              | Cards                    |
| `--text`                 | Cream #F3EEE3     | Navy #0F1A2B         | Body                     |
| `--muted`                | #9AA8BE           | #5B6779              | Labels, metadata         |
| `--accent`               | Saffron #F2A626   | Deep saffron #C77F0A | CTAs, frames, live state |
| `--line`                 | #24344F           | #DDD5C4              | Grid, borders            |
| `--success` / `--danger` | #4CB782 / #E5664F | #2E8A5F / #C2412D    | Resolved, errors         |

Colours are sampled from the posters; final hex values to be confirmed against source files. Saffron is reserved for action and "now". It never decorates.

### Type

- **Display:** heavy grotesk matching the poster wordmark (candidates: Archivo Black / Archivo ExtraBold, or the poster's original font if licensed). Headlines only.
- **Text:** a highly legible sans (Inter or Geist) at 16 px base, 1.6 line height for reading surfaces.
- **Mono:** JetBrains Mono or IBM Plex Mono, uppercase, +12% letter-spacing, for survey labels only.

### Light reading mode

Navy is right for brand moments but tiring for 20-page notes and long threads. Users get a toggle (System / Dark / Light); reading surfaces default to the system preference.

### Motion

- 150–220 ms ease-out on state changes; nothing animates longer than 400 ms.
- The countdown ticks digits with a short vertical roll; the 15-minute "go time" state draws the plot-frame corners in.
- Respects `prefers-reduced-motion` everywhere.

### UX principles

1. **Next action first.** Every page leads with the one thing the user should do now.
2. **Every second teaches.** Empty states, loading states and 404s each show a glossary term or a planning fact instead of a spinner and a shrug.
3. **Locked, not hidden.** Paid content is visible with a reason and a path to unlock.
4. **One tap to class.** Join is never more than one tap from opening the app.
5. **Plain words.** No jargon in UI chrome; jargon lives in the glossary, linked.
6. **Mobile is the primary device.** Every screen designed at 375 px first, then scaled up. Touch targets at least 44 px.

### Component kit

shadcn/ui primitives (Radix) restyled to the tokens above; no default shadcn look survives. Core custom components: PlotFrame, SurveyLabel, DimensionProgress, SessionCard, Countdown, LockedItem, TermLink, ThreadCard, AdminTable.

### Visual craft: the "4K feel"

Premium comes from sharpness, precision and depth built in code, not from stock imagery; photos are the exception, not the system.

**Built in code**

- **Everything vector.** Plot frames, grid, dimension lines, icons and illustrations are SVG or CSS, crisp on retina phones and 4K monitors at any zoom.
- **Hairline precision.** True 1 px borders, 0.5 px rules on high-density screens, spacing locked to a 4 px grid, optical alignment on icons and numerals.
- **Depth without gloss.** Navy surfaces in 3–4 elevation steps with faint inner borders and a subtle film-grain texture. Saffron glow only on live states. No heavy drop shadows or decorative gradients.
- **Type as the hero.** Variable fonts, tight headline tracking, tabular numerals for countdowns and calculations so digits never jitter.
- **Purposeful motion.** Countdown digits roll, plot-frame corners draw in as class approaches, route transitions under 300 ms, all disabled under reduced motion.
- **Custom icon set.** About 20 line glyphs in one stroke weight (plot, road, setback, FSI, permit, NOC, session, note, doubt…), replacing generic icon packs.

**Visuals that teach**

| Where                      | Visual                                                                           | What it teaches                                        |
| -------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Landing hero               | Animated line-art plot: road widens, setbacks appear, buildable footprint fills  | The course's core idea: regulations shape the building |
| Glossary terms             | Small SVG explainer per key term (FSI, setback, TDR, building envelope)          | The concept at a glance                                |
| Empty and loading states   | Rotating term-of-the-day card with a mini diagram                                | Every second teaches                                   |
| Notes and course pages     | Real artefacts where licensing allows: DP map excerpts, sample sanction drawings | Authentic practice, not stock                          |
| About page, session recaps | Photography only here (Kajal, class moments), served as AVIF via `next/image`    | Trust and community                                    |
| Social shares              | Auto-generated Open Graph cards in the poster style                              | Brand consistency outside the site                     |

**Rules.** No stock photography. No AI-generated imagery of buildings or people. Every illustration uses the brand tokens and the line-art plan-sheet style.

## 7. Technical architecture

Next.js on Vercel, Supabase for data, auth, storage and realtime, and two Google integrations kept on the server. One repo, one deploy, no servers to babysit.

&#91;embedded content: system architecture · browser, Vercel server, 3 services\]

The browser talks to Vercel for everything except live forum updates, which stream directly from Supabase Realtime under the same RLS rules.

### Stack

| Layer             | Choice                                                           | Why                                                         |
| ----------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| Framework         | Next.js (App Router, React Server Components, TypeScript strict) | Server-rendered SEO pages + app shell in one codebase       |
| Hosting           | Vercel                                                           | Preview deploy per PR, edge caching, cron                   |
| Database          | Supabase Postgres                                                | Relational model, Row Level Security, SQL migrations        |
| Auth              | Supabase Auth, Google provider                                   | One-tap Google sign-in; session cookies via `@supabase/ssr` |
| Files             | Supabase Storage, private buckets                                | Signed URLs, access checked server-side                     |
| Realtime          | Supabase Realtime                                                | Live forum replies, live session status                     |
| Calendar + Meet   | Google Calendar API v3, OAuth for Kajal's account only           | Auto-create events with Meet links                          |
| Email             | Resend + React Email, sent from `notify@plotedu.in`              | Reminders, approvals, announcements                         |
| Jobs              | Vercel Cron (every 5 min) hitting a protected route              | Reminder dispatch, retry failed emails                      |
| UI                | Tailwind CSS + shadcn/ui (restyled) + Framer Motion              | Speed with a custom look                                    |
| Validation        | Zod on every server action                                       | One schema for forms and API                                |
| Monitoring        | Sentry + Vercel Analytics                                        | Errors and Web Vitals                                       |
| Product analytics | PostHog (EU or US cloud)                                         | Funnels: visit → sign-in → apply → attend                   |

### Auth and the Google split

- **Student sign-in** requests only `openid email profile`. No sensitive scopes, so no Google verification delay for students.
- **Calendar connection** is a separate OAuth flow in Admin → Settings, requesting `https://www.googleapis.com/auth/calendar.events`, used only by Kajal. Refresh token encrypted at rest (pgsodium / Vault) in `integrations`.
- Google Cloud project: OAuth consent screen with authorized domain `plotedu.in`; submit for verification of the Calendar scope before launch.

### Server boundaries

- All writes go through Next.js Server Actions or Route Handlers using the user's Supabase session, so RLS enforces permissions in the database, not only in UI code.
- The service-role key is used only in three server routes: Calendar sync, cron reminders, signed-URL issue for downloads.
- No Google tokens or service keys ever reach the browser.

### Folder sketch

```
app/
  (marketing)/  page, courses/[slug], glossary/
  (app)/        home, sessions, notes, forum, quiz, apply
  admin/        today, batches, people, sessions, notes, forum, content, settings
  api/          cron/reminders, notes/[id]/download, google/oauth, s/[id]/join
lib/            supabase/, google/, email/, auth/guards.ts
components/     brand/ (PlotFrame, SurveyLabel…), ui/, features/
supabase/       migrations/, seed.sql, policies/
```

## 8. Data model and access rules

Course → Batch → Session is the spine; every permission resolves through `enrollments` (students) or `batch_staff` (professors), enforced by Postgres Row Level Security.

### Tables

| Table                                        | Key columns                                                                                                                                                                                                          | Notes                                               |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `profiles`                                   | id (= auth.users.id), full\_name, email, avatar\_url, role (`admin` / `professor` / `student`), college\_or\_firm, city, locale, created\_at                                                                         | One per user; role is global                        |
| `courses`                                    | id, slug, title, subtitle, description, status (`draft` / `live` / `archived`)                                                                                                                                       | Multi-course from day one                           |
| `modules`                                    | id, course\_id, order, title, slug                                                                                                                                                                                   | Foundation, UDCPR, Practical, Professional Practice |
| `batches`                                    | id, course\_id, name, starts\_on, ends\_on, capacity, applications\_open, require\_payment\_for\_notes                                                                                                               | "November 2026" batch, capacity 25                  |
| `enrollments`                                | id, batch\_id, user\_id, status (`applied` / `approved` / `rejected` / `waitlisted` / `withdrawn`), payment\_status (`unpaid` / `paid` / `waived`), applied\_at, decided\_at, decided\_by                            | Unique (batch\_id, user\_id)                        |
| `batch_staff`                                | batch\_id, user\_id, role (`professor`)                                                                                                                                                                              | Scopes guest lecturers                              |
| `sessions`                                   | id, batch\_id, module\_id, title, agenda (jsonb list), starts\_at (timestamptz), duration\_min, professor\_id, status (`scheduled` / `live` / `ended` / `cancelled`), meet\_url, calendar\_event\_id, recording\_url | Times stored UTC, shown IST                         |
| `attendance`                                 | session\_id, user\_id, joined\_at, source (`click` / `manual`)                                                                                                                                                       | Primary key (session\_id, user\_id)                 |
| `notes`                                      | id, course\_id, module\_id, session\_id?, title, description, storage\_path, mime, size\_bytes, access (`public` / `members` / `batch` / `staff`), published                                                         | Paid = `batch`                                      |
| `note_batches`                               | note\_id, batch\_id                                                                                                                                                                                                  | Which batches unlock a `batch` note                 |
| `note_downloads`                             | note\_id, user\_id, at, ip\_hash                                                                                                                                                                                     | Audit + counts                                      |
| `forum_categories`                           | id, course\_id, module\_id?, name, order                                                                                                                                                                             |                                                     |
| `threads`                                    | id, category\_id, author\_id, is\_anonymous, title, body\_md, session\_id?, term\_id?, batch\_id? (private), status (`open` / `resolved` / `locked`), pinned, accepted\_post\_id, created\_at                        |                                                     |
| `posts`                                      | id, thread\_id, author\_id, body\_md, created\_at, edited\_at, deleted\_at                                                                                                                                           | Replies                                             |
| `votes`                                      | user\_id, target\_type (`thread` / `post`), target\_id, created\_at                                                                                                                                                  | Unique per user per target                          |
| `glossary_terms`                             | id, slug, term, short\_def, body\_md, example\_md, source\_ref, module\_id?, related (uuid\[\])                                                                                                                      | Public                                              |
| `quizzes`, `quiz_questions`, `quiz_attempts` | quiz per module; question with options jsonb + correct index + explanation; attempt with answers + score                                                                                                             | Best score derived                                  |
| `announcements`                              | id, audience (`all` / batch\_id), title, body, email\_sent, starts\_at, ends\_at                                                                                                                                     | Banner + optional email                             |
| `email_jobs`                                 | id, kind, user\_id, session\_id?, send\_at, sent\_at, status, error                                                                                                                                                  | Idempotent reminders                                |
| `integrations`                               | provider (`google_calendar`), owner\_id, refresh\_token (encrypted), calendar\_id, status                                                                                                                            | Kajal's Calendar link                               |
| `audit_log`                                  | actor\_id, action, entity, entity\_id, meta jsonb, at                                                                                                                                                                | Every Admin and moderation action                   |
| `payments` (v2)                              | enrollment\_id, provider, amount\_paise, status, provider\_ref                                                                                                                                                       | Razorpay-ready; unused in v1                        |

### Access rules (RLS)

- Helper SQL functions: `is_admin()`, `is_approved_student(batch_id)`, `is_batch_staff(batch_id)`, `can_access_note(note_id)`.
- `sessions`: readable by approved students of the batch, its staff and Admin. `meet_url` is excluded from any view a non-enrolled user can reach.
- `notes`: metadata of published notes readable by everyone (so locked items can show); the file itself only through the download route, which calls `can_access_note`.
- `can_access_note` = access is `public` · or `members` and signed in · or `batch` and the user has an `approved` enrolment in a linked batch (and payment `paid`/`waived` when the batch requires it) · or `staff` and the user is Admin/Professor · or the user is Admin.
- `threads` / `posts`: readable by signed-in users (batch-private threads by that batch only); insert by students, professors, Admin; `author_id` hidden on anonymous threads by a view that returns null unless `is_admin()`.
- Everything under `/admin` is checked twice: route guard in Next.js middleware and RLS in Postgres.

## 9. Non-functional requirements

The bar: fast on a mid-range Android over Indian 4G, accessible, private by default, and observable from day one.

| Area           | Requirement                                                                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance    | LCP under 2.5 s and INP under 200 ms on a mid-range Android over 4G; dashboard JS under 150 KB gzipped; images via `next/image`; fonts self-hosted and subset              |
| Responsiveness | Designed at 375 px first; tested at 360, 390, 768, 1024, 1440 px; no horizontal scroll; 44 px touch targets                                                                |
| Accessibility  | WCAG 2.2 AA; contrast checked for saffron on navy and on paper; full keyboard support; countdown announced politely (once a minute) to screen readers, not every second    |
| Security       | RLS on every table; service key server-only; signed URLs expire in 60 s; rate limits on apply, post, vote and download routes; CSP headers; Google refresh token encrypted |
| Privacy        | Collect only name, email, college/firm, city; privacy policy and terms pages at launch; user can delete account (posts anonymised, not removed)                            |
| Reliability    | Reminder jobs idempotent and retried; Calendar failures fall back to manual Meet link; daily Supabase backups (Pro plan)                                                   |
| Time zones     | Store UTC, display IST (Asia/Kolkata) always for this course, with the viewer's local time shown in brackets if different                                                  |
| SEO            | Server-rendered course, glossary and public notes pages; Open Graph images in the poster style; sitemap.xml; schema.org `Course` and `DefinedTerm` markup                  |
| Analytics      | PostHog events: `signed_in`, `applied`, `approved`, `joined_session`, `downloaded_note`, `posted_thread`, `answer_accepted`, `quiz_completed`, `waitlist_joined`           |
| i18n           | All UI strings in message files (`next-intl`), English only at launch; content tables carry a `locale` column                                                              |
| Observability  | Sentry for errors, Vercel logs, Admin Today tab shows failed emails and Calendar sync errors                                                                               |

### Running cost (estimate)

| Service           | Plan                                                 | Approx. monthly        |
| ----------------- | ---------------------------------------------------- | ---------------------- |
| Vercel            | Hobby at launch; Pro (\~$20) once commercial traffic | $0–20                  |
| Supabase          | Free to start; Pro (\~$25) before launch for backups | $25                    |
| Resend            | Free tier covers \~3,000 emails/month                | $0                     |
| Domain plotedu.in | Yearly                                               | \~₹70/month equivalent |
| PostHog, Sentry   | Free tiers                                           | $0                     |

Prices are approximate and should be checked at signup.

## 10. Delivery plan, open decisions and risks

Four build weeks get v1 to a soft launch by 15 November; the plan assumes the batch starts on or after 16 November (exact date to be confirmed).

&#91;embedded content: v1 build plan · 4 weeks to soft launch\]

Each week ends with a working preview deploy Kajal can click through; week 4 is a closed beta with 3–5 friendly students before the batch opens.

### Open decisions

- [ ] Exact November batch start date and class timings (drives Calendar setup and the content deadline).
- [ ] Buy `plotedu.in` (and `plotedu.com` as a redirect) this week; Resend and Google verification both need it.
- [ ] Watermark paid PDFs with student name + email: yes or no.
- [ ] Display font: license the poster font or switch to Archivo.
- [ ] Is the forum visible to all signed-in members, or should some threads default to batch-private?
- [ ] Who besides Kajal gets Admin (V as technical admin?).
- [ ] Recording policy: will sessions be recorded and linked after class?

### Risks

| Risk                                                              | Likelihood | Impact                     | Mitigation                                                                                                          |
| ----------------------------------------------------------------- | ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Google Calendar scope verification takes longer than the timeline | Medium     | Auto Meet links delayed    | Ship with manual Meet-link fallback; Kajal added as a test user meanwhile                                           |
| Four weeks is tight for one developer                             | High       | v1 slips past batch start  | Cut order: quizzes UI → glossary auto-linking → realtime forum. Never cut: login, dashboard, sessions, notes, Admin |
| Content not ready (glossary, quizzes, notes)                      | Medium     | Empty-feeling platform     | Seed 30 glossary terms and module 1 notes before launch; Admin forms built first                                    |
| Paid notes forwarded on WhatsApp                                  | High       | Lost value of paid content | Signed URLs + download logs now; watermarking switch ready                                                          |
| Students miss the Join card and use old Meet links                | Low        | Attendance gaps            | Calendar invites point to the dashboard; Admin manual attendance in v1.5                                            |
| Email lands in spam                                               | Medium     | Missed classes             | SPF, DKIM, DMARC on plotedu.in before first send                                                                    |
