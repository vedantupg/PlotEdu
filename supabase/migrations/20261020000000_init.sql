-- PlotEdu v1 schema.
-- Spine: courses -> batches -> sessions. Every permission resolves through
-- enrollments (students) or batch_staff (professors), enforced by RLS.
-- Times are stored as timestamptz (UTC) and displayed in Asia/Kolkata.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'professor', 'student');
create type public.course_status as enum ('draft', 'live', 'archived');
create type public.enrollment_status as enum ('applied', 'approved', 'rejected', 'waitlisted', 'withdrawn');
create type public.payment_status as enum ('unpaid', 'paid', 'waived');
create type public.session_status as enum ('scheduled', 'live', 'ended', 'cancelled');
create type public.attendance_source as enum ('click', 'manual');
create type public.note_access as enum ('public', 'members', 'batch', 'staff');
create type public.thread_status as enum ('open', 'resolved', 'locked');
create type public.vote_target as enum ('thread', 'post');
create type public.email_status as enum ('pending', 'sent', 'failed', 'skipped');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  avatar_url text,
  role public.user_role not null default 'student',
  college_or_firm text,
  city text,
  locale text not null default 'en',
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  status public.course_status not null default 'draft',
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  "order" int not null,
  title text not null,
  slug text not null,
  summary text,
  unique (course_id, slug),
  unique (course_id, "order")
);

create table public.batches (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  name text not null,
  starts_on date,
  ends_on date,
  capacity int not null default 25 check (capacity > 0),
  applications_open boolean not null default false,
  require_payment_for_notes boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.enrollment_status not null default 'applied',
  payment_status public.payment_status not null default 'unpaid',
  applied_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references public.profiles (id),
  unique (batch_id, user_id)
);
create index enrollments_user_idx on public.enrollments (user_id);

create table public.batch_staff (
  batch_id uuid not null references public.batches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.user_role not null default 'professor',
  primary key (batch_id, user_id)
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  module_id uuid references public.modules (id) on delete set null,
  title text not null,
  agenda jsonb not null default '[]'::jsonb check (jsonb_typeof(agenda) = 'array'),
  starts_at timestamptz not null,
  duration_min int not null default 90 check (duration_min between 15 and 480),
  professor_id uuid references public.profiles (id) on delete set null,
  status public.session_status not null default 'scheduled',
  meet_url text,
  calendar_event_id text,
  recording_url text,
  created_at timestamptz not null default now()
);
create index sessions_batch_start_idx on public.sessions (batch_id, starts_at);

create table public.attendance (
  session_id uuid not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  source public.attendance_source not null default 'click',
  primary key (session_id, user_id)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  module_id uuid references public.modules (id) on delete set null,
  session_id uuid references public.sessions (id) on delete set null,
  title text not null,
  description text,
  storage_path text not null,
  mime text not null,
  size_bytes bigint not null default 0,
  access public.note_access not null default 'batch',
  published boolean not null default false,
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

create table public.note_batches (
  note_id uuid not null references public.notes (id) on delete cascade,
  batch_id uuid not null references public.batches (id) on delete cascade,
  primary key (note_id, batch_id)
);

create table public.note_downloads (
  id bigint generated always as identity primary key,
  note_id uuid not null references public.notes (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  at timestamptz not null default now(),
  ip_hash text
);
create index note_downloads_note_idx on public.note_downloads (note_id);

create table public.glossary_terms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  term text not null,
  short_def text not null,
  body_md text,
  example_md text,
  source_ref text,
  module_id uuid references public.modules (id) on delete set null,
  related uuid[] not null default '{}',
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

create table public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  module_id uuid references public.modules (id) on delete set null,
  slug text not null,
  name text not null,
  "order" int not null default 0,
  unique (course_id, slug)
);

create table public.threads (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.forum_categories (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  is_anonymous boolean not null default false,
  title text not null check (char_length(title) between 5 and 200),
  body_md text not null check (char_length(body_md) between 1 and 20000),
  session_id uuid references public.sessions (id) on delete set null,
  term_id uuid references public.glossary_terms (id) on delete set null,
  batch_id uuid references public.batches (id) on delete cascade, -- non-null = batch-private
  status public.thread_status not null default 'open',
  pinned boolean not null default false,
  accepted_post_id uuid,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index threads_category_idx on public.threads (category_id, created_at desc);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  is_anonymous boolean not null default false,
  body_md text not null check (char_length(body_md) between 1 and 20000),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);
create index posts_thread_idx on public.posts (thread_id, created_at);

alter table public.threads
  add constraint threads_accepted_post_fk
  foreign key (accepted_post_id) references public.posts (id) on delete set null;

create table public.votes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.vote_target not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  "order" int not null default 0,
  prompt text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 4),
  correct_index int not null check (correct_index >= 0 and correct_index < 4),
  explanation text
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  answers jsonb not null default '[]'::jsonb,
  score int not null default 0,
  total int not null default 0,
  completed_at timestamptz not null default now()
);
create index quiz_attempts_user_idx on public.quiz_attempts (user_id, quiz_id);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches (id) on delete cascade, -- null = everyone
  title text not null,
  body text,
  email_sent boolean not null default false,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.email_jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  user_id uuid references public.profiles (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete cascade,
  send_at timestamptz not null,
  sent_at timestamptz,
  status public.email_status not null default 'pending',
  attempts int not null default 0,
  error text,
  -- Idempotency: one email per (kind, user, session).
  unique nulls not distinct (kind, user_id, session_id)
);
create index email_jobs_due_idx on public.email_jobs (status, send_at);

create table public.integrations (
  provider text primary key check (provider in ('google_calendar')),
  owner_id uuid references public.profiles (id) on delete set null,
  refresh_token_secret_id uuid, -- id in vault.secrets; token never stored in plain text
  calendar_id text,
  status text not null default 'disconnected',
  updated_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);

-- v2: Razorpay. Unused in v1.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  provider text not null,
  amount_paise bigint not null,
  status text not null,
  provider_ref text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper functions (security definer so policies can call them without recursion)
-- ---------------------------------------------------------------------------
create or replace function public.current_role_name()
returns public.user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false) $$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce((select role in ('admin', 'professor') from public.profiles where id = auth.uid()), false) $$;

create or replace function public.is_approved_student(p_batch_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.enrollments
    where batch_id = p_batch_id and user_id = auth.uid() and status = 'approved'
  )
$$;

create or replace function public.is_batch_staff(p_batch_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.batch_staff where batch_id = p_batch_id and user_id = auth.uid()
  )
$$;

create or replace function public.can_see_batch(p_batch_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$ select public.is_admin() or public.is_batch_staff(p_batch_id) or public.is_approved_student(p_batch_id) $$;

-- can_access_note: the single source of truth for the file itself.
create or replace function public.can_access_note(p_note_id uuid)
returns boolean
language plpgsql stable security definer set search_path = public
as $$
declare
  v_access public.note_access;
  v_published boolean;
begin
  select access, published into v_access, v_published from public.notes where id = p_note_id;
  if not found then
    return false;
  end if;
  if public.is_admin() then
    return true;
  end if;
  if not v_published then
    return false;
  end if;

  return case v_access
    when 'public' then true
    when 'members' then auth.uid() is not null
    when 'staff' then public.is_staff()
    when 'batch' then exists (
      select 1
      from public.note_batches nb
      join public.batches b on b.id = nb.batch_id
      left join public.enrollments e
        on e.batch_id = nb.batch_id and e.user_id = auth.uid() and e.status = 'approved'
      where nb.note_id = p_note_id
        and (
          public.is_batch_staff(nb.batch_id)
          or (
            e.id is not null
            and (not b.require_payment_for_notes or e.payment_status in ('paid', 'waived'))
          )
        )
    )
  end;
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Create a profile on first Google sign-in.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only admins (or the service role) may change a role or email.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.email is distinct from old.email)
     and not public.is_admin()
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role'
     and auth.uid() is not null then
    raise exception 'Only an admin can change role or email' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.batches enable row level security;
alter table public.enrollments enable row level security;
alter table public.batch_staff enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.notes enable row level security;
alter table public.note_batches enable row level security;
alter table public.note_downloads enable row level security;
alter table public.glossary_terms enable row level security;
alter table public.forum_categories enable row level security;
alter table public.threads enable row level security;
alter table public.posts enable row level security;
alter table public.votes enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.announcements enable row level security;
alter table public.email_jobs enable row level security;
alter table public.integrations enable row level security;
alter table public.audit_log enable row level security;
alter table public.payments enable row level security;

-- profiles
create policy profiles_select_self on public.profiles for select using (id = auth.uid());
create policy profiles_select_admin on public.profiles for select using (public.is_admin());
create policy profiles_select_staff_roster on public.profiles for select using (
  exists (
    select 1 from public.enrollments e
    where e.user_id = profiles.id and public.is_batch_staff(e.batch_id)
  )
);
create policy profiles_update_self on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles for update using (public.is_admin());

-- Public catalogue: courses, modules, batches, glossary, forum categories
create policy courses_read on public.courses for select using (status <> 'draft' or public.is_admin());
create policy courses_admin on public.courses for all using (public.is_admin()) with check (public.is_admin());
create policy modules_read on public.modules for select using (true);
create policy modules_admin on public.modules for all using (public.is_admin()) with check (public.is_admin());
create policy batches_read on public.batches for select using (true);
create policy batches_admin on public.batches for all using (public.is_admin()) with check (public.is_admin());
create policy glossary_read on public.glossary_terms for select using (true);
create policy glossary_admin on public.glossary_terms for all using (public.is_admin()) with check (public.is_admin());
create policy forum_categories_read on public.forum_categories for select using (true);
create policy forum_categories_admin on public.forum_categories for all using (public.is_admin()) with check (public.is_admin());

-- enrollments: students apply for themselves; decisions go through decide_enrollment()
create policy enrollments_select_own on public.enrollments for select using (user_id = auth.uid());
create policy enrollments_select_staff on public.enrollments for select using (public.is_admin() or public.is_batch_staff(batch_id));
create policy enrollments_admin on public.enrollments for all using (public.is_admin()) with check (public.is_admin());

-- batch_staff
create policy batch_staff_read on public.batch_staff for select using (user_id = auth.uid() or public.is_admin());
create policy batch_staff_admin on public.batch_staff for all using (public.is_admin()) with check (public.is_admin());

-- sessions (meet_url is additionally column-revoked below)
create policy sessions_read on public.sessions for select using (public.can_see_batch(batch_id));
create policy sessions_admin on public.sessions for all using (public.is_admin()) with check (public.is_admin());

-- attendance
create policy attendance_read_own on public.attendance for select using (user_id = auth.uid());
create policy attendance_read_staff on public.attendance for select using (
  public.is_admin()
  or exists (select 1 from public.sessions s where s.id = attendance.session_id and public.is_batch_staff(s.batch_id))
);
create policy attendance_admin on public.attendance for all using (public.is_admin()) with check (public.is_admin());

-- notes: metadata of published notes is public so locked items can render.
create policy notes_read on public.notes for select using (published or public.is_admin());
create policy notes_admin on public.notes for all using (public.is_admin()) with check (public.is_admin());
create policy note_batches_read on public.note_batches for select using (true);
create policy note_batches_admin on public.note_batches for all using (public.is_admin()) with check (public.is_admin());
create policy note_downloads_admin on public.note_downloads for select using (public.is_admin());

-- forum base tables: reads go through masked views, writes through RPCs.
create policy threads_admin on public.threads for all using (public.is_admin()) with check (public.is_admin());
create policy posts_admin on public.posts for all using (public.is_admin()) with check (public.is_admin());
create policy votes_read_own on public.votes for select using (user_id = auth.uid());

-- quizzes
create policy quizzes_read on public.quizzes for select using (published or public.is_admin());
create policy quizzes_admin on public.quizzes for all using (public.is_admin()) with check (public.is_admin());
create policy quiz_questions_read on public.quiz_questions for select using (
  exists (select 1 from public.quizzes q where q.id = quiz_id and (q.published or public.is_admin()))
);
create policy quiz_questions_admin on public.quiz_questions for all using (public.is_admin()) with check (public.is_admin());
create policy quiz_attempts_own on public.quiz_attempts for select using (user_id = auth.uid() or public.is_admin());

-- announcements
create policy announcements_read on public.announcements for select using (
  public.is_admin()
  or (
    starts_at <= now() and (ends_at is null or ends_at > now())
    and (batch_id is null or public.can_see_batch(batch_id))
  )
);
create policy announcements_admin on public.announcements for all using (public.is_admin()) with check (public.is_admin());

-- operational tables: admin read only; writes by service role / definer functions
create policy email_jobs_admin on public.email_jobs for select using (public.is_admin());
create policy integrations_admin on public.integrations for select using (public.is_admin());
create policy audit_log_admin on public.audit_log for select using (public.is_admin());
create policy payments_admin on public.payments for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Column-level privileges
-- ---------------------------------------------------------------------------
-- The Meet link is never selectable by clients; join_session() returns it after logging attendance.
revoke select on public.sessions from anon, authenticated;
grant select (
  id, batch_id, module_id, title, agenda, starts_at, duration_min, professor_id,
  status, calendar_event_id, recording_url, created_at
) on public.sessions to authenticated;

-- Correct answers stay server-side until a question is answered via answer_quiz_question().
revoke select on public.quiz_questions from anon, authenticated;
grant select (id, quiz_id, "order", prompt, options) on public.quiz_questions to authenticated;

-- Forum base tables are not directly readable; see views below.
revoke select on public.threads, public.posts from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Forum views: mask anonymous authors for everyone except Admin (and the author).
-- These run with owner rights, so visibility is re-implemented in WHERE.
-- ---------------------------------------------------------------------------
create or replace view public.forum_threads as
select
  t.id, t.category_id, t.title, t.body_md, t.session_id, t.term_id, t.batch_id,
  t.status, t.pinned, t.accepted_post_id, t.created_at, t.is_anonymous,
  case when not t.is_anonymous or public.is_admin() or t.author_id = auth.uid() then t.author_id end as author_id,
  case when not t.is_anonymous or public.is_admin() then p.full_name end as author_name,
  case when not t.is_anonymous or public.is_admin() then p.avatar_url end as author_avatar,
  case when not t.is_anonymous or public.is_admin() then p.role end as author_role,
  (t.author_id = auth.uid()) as is_mine,
  (select count(*) from public.votes v where v.target_type = 'thread' and v.target_id = t.id) as upvotes,
  (select count(*) from public.posts x where x.thread_id = t.id and x.deleted_at is null) as reply_count,
  exists (select 1 from public.votes v where v.target_type = 'thread' and v.target_id = t.id and v.user_id = auth.uid()) as voted
from public.threads t
left join public.profiles p on p.id = t.author_id
where t.deleted_at is null
  and auth.uid() is not null
  and (t.batch_id is null or public.can_see_batch(t.batch_id));

create or replace view public.forum_posts as
select
  x.id, x.thread_id, x.body_md, x.created_at, x.edited_at, x.is_anonymous,
  case when not x.is_anonymous or public.is_admin() or x.author_id = auth.uid() then x.author_id end as author_id,
  case when not x.is_anonymous or public.is_admin() then p.full_name end as author_name,
  case when not x.is_anonymous or public.is_admin() then p.avatar_url end as author_avatar,
  case when not x.is_anonymous or public.is_admin() then p.role end as author_role,
  (x.author_id = auth.uid()) as is_mine,
  (select count(*) from public.votes v where v.target_type = 'post' and v.target_id = x.id) as upvotes,
  exists (select 1 from public.votes v where v.target_type = 'post' and v.target_id = x.id and v.user_id = auth.uid()) as voted
from public.posts x
join public.threads t on t.id = x.thread_id
left join public.profiles p on p.id = x.author_id
where x.deleted_at is null and t.deleted_at is null
  and auth.uid() is not null
  and (t.batch_id is null or public.can_see_batch(t.batch_id));

grant select on public.forum_threads, public.forum_posts to authenticated;

-- Public-safe staff names (no email) so students can see who teaches a session.
create or replace view public.staff_directory as
select id, full_name, avatar_url, role from public.profiles where role in ('admin', 'professor');
grant select on public.staff_directory to authenticated;

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------
create or replace function public.write_audit(p_action text, p_entity text, p_entity_id text, p_meta jsonb default '{}'::jsonb)
returns void
language sql security definer set search_path = public
as $$ insert into public.audit_log (actor_id, action, entity, entity_id, meta) values (auth.uid(), p_action, p_entity, p_entity_id, p_meta) $$;
revoke execute on function public.write_audit(text, text, text, jsonb) from public, anon, authenticated;

-- Apply to a batch. Requires onboarding; idempotent for re-applies after rejection/withdrawal.
create or replace function public.apply_to_batch(p_batch_id uuid)
returns public.enrollments
language plpgsql security definer set search_path = public
as $$
declare
  v_profile public.profiles;
  v_batch public.batches;
  v_row public.enrollments;
begin
  if auth.uid() is null then
    raise exception 'Sign in to apply' using errcode = '42501';
  end if;
  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile.role <> 'student' then
    raise exception 'Only student accounts can apply' using errcode = '42501';
  end if;
  if v_profile.full_name is null or v_profile.college_or_firm is null or v_profile.city is null then
    raise exception 'Complete your profile before applying' using errcode = 'P0001';
  end if;
  select * into v_batch from public.batches where id = p_batch_id;
  if not found or not v_batch.applications_open then
    raise exception 'Applications for this batch are closed' using errcode = 'P0001';
  end if;

  insert into public.enrollments (batch_id, user_id)
  values (p_batch_id, auth.uid())
  on conflict (batch_id, user_id) do update
    set status = 'applied', applied_at = now(), decided_at = null, decided_by = null
    where public.enrollments.status in ('rejected', 'withdrawn')
  returning * into v_row;

  if v_row.id is null then
    select * into v_row from public.enrollments where batch_id = p_batch_id and user_id = auth.uid();
  end if;
  return v_row;
end;
$$;

-- Admin decision. Capacity is enforced on approval (row lock on the batch).
create or replace function public.decide_enrollment(p_enrollment_id uuid, p_status public.enrollment_status)
returns public.enrollments
language plpgsql security definer set search_path = public
as $$
declare
  v_row public.enrollments;
  v_capacity int;
  v_approved int;
begin
  if not public.is_admin() then
    raise exception 'Admin only' using errcode = '42501';
  end if;
  if p_status not in ('approved', 'rejected', 'waitlisted') then
    raise exception 'Invalid decision %', p_status using errcode = 'P0001';
  end if;

  select * into v_row from public.enrollments where id = p_enrollment_id for update;
  if not found then
    raise exception 'Enrollment not found' using errcode = 'P0002';
  end if;

  if p_status = 'approved' and v_row.status <> 'approved' then
    select capacity into v_capacity from public.batches where id = v_row.batch_id for update;
    select count(*) into v_approved from public.enrollments where batch_id = v_row.batch_id and status = 'approved';
    if v_approved >= v_capacity then
      raise exception 'Batch is full (% of % seats filled)', v_approved, v_capacity using errcode = 'P0001';
    end if;
  end if;

  update public.enrollments
    set status = p_status, decided_at = now(), decided_by = auth.uid()
    where id = p_enrollment_id
    returning * into v_row;

  perform public.write_audit('enrollment.' || p_status::text, 'enrollments', p_enrollment_id::text, '{}'::jsonb);
  return v_row;
end;
$$;

-- Join flow: verify membership, log attendance inside the window, return the Meet link.
-- Window = 15 minutes before start until the end of the session.
create or replace function public.join_session(p_session_id uuid)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_s public.sessions;
  v_now timestamptz := now();
  v_is_student boolean;
begin
  if auth.uid() is null then
    return jsonb_build_object('status', 'unauthenticated');
  end if;
  select * into v_s from public.sessions where id = p_session_id;
  if not found or not public.can_see_batch(v_s.batch_id) then
    return jsonb_build_object('status', 'forbidden');
  end if;
  if v_s.status = 'cancelled' then
    return jsonb_build_object('status', 'cancelled');
  end if;

  v_is_student := public.is_approved_student(v_s.batch_id);

  if v_is_student then
    if v_now < v_s.starts_at - interval '15 minutes' then
      return jsonb_build_object('status', 'too_early', 'starts_at', v_s.starts_at);
    end if;
    if v_now > v_s.starts_at + make_interval(mins => v_s.duration_min) then
      return jsonb_build_object('status', 'ended');
    end if;
    insert into public.attendance (session_id, user_id, source)
    values (p_session_id, auth.uid(), 'click')
    on conflict (session_id, user_id) do nothing;
  end if;

  if v_s.meet_url is null then
    return jsonb_build_object('status', 'no_link');
  end if;
  return jsonb_build_object('status', 'ok', 'url', v_s.meet_url);
end;
$$;

-- Quiz: check one answer without exposing correct_index up front.
create or replace function public.answer_quiz_question(p_question_id uuid, p_choice int)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_q public.quiz_questions;
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;
  select qq.* into v_q
  from public.quiz_questions qq join public.quizzes q on q.id = qq.quiz_id
  where qq.id = p_question_id and (q.published or public.is_admin());
  if not found then
    raise exception 'Question not found' using errcode = 'P0002';
  end if;
  return jsonb_build_object(
    'correct', v_q.correct_index = p_choice,
    'correct_index', v_q.correct_index,
    'explanation', v_q.explanation
  );
end;
$$;

-- Default execute privileges: RPCs callable by signed-in users only.
revoke execute on function public.apply_to_batch(uuid) from public, anon;
revoke execute on function public.decide_enrollment(uuid, public.enrollment_status) from public, anon;
revoke execute on function public.join_session(uuid) from public, anon;
revoke execute on function public.answer_quiz_question(uuid, int) from public, anon;
grant execute on function public.apply_to_batch(uuid) to authenticated;
grant execute on function public.decide_enrollment(uuid, public.enrollment_status) to authenticated;
grant execute on function public.join_session(uuid) to authenticated;
grant execute on function public.answer_quiz_question(uuid, int) to authenticated;
-- can_access_note must be callable signed out (public notes).
grant execute on function public.can_access_note(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: private bucket for notes. No client policies: downloads are signed server-side.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('notes', 'notes', false)
on conflict (id) do nothing;
