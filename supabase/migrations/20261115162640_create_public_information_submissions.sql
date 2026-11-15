create table if not exists public.information_submissions (
  id uuid primary key default gen_random_uuid(),
  submission_type text not null check (submission_type in ('new_entry', 'correction')),
  directory_entry_id uuid null references public.directory_entries(id) on delete set null,
  category text null check (category is null or category in ('education','health','police','government','business','tourism','transport','community')),
  item_name text not null check (char_length(btrim(item_name)) between 2 and 180),
  submitter_name text null check (submitter_name is null or char_length(submitter_name) <= 100),
  contact text null check (contact is null or char_length(contact) <= 120),
  message text not null check (char_length(btrim(message)) between 10 and 3000),
  source_url text null check (source_url is null or char_length(source_url) <= 500),
  status text not null default 'pending' check (status in ('pending','reviewing','approved','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists information_submissions_status_created_at_idx
  on public.information_submissions (status, created_at desc);

alter table public.information_submissions enable row level security;

revoke all on table public.information_submissions from anon, authenticated;
grant usage on schema public to anon;
grant insert (submission_type, directory_entry_id, category, item_name, submitter_name, contact, message, source_url)
  on table public.information_submissions to anon;

drop policy if exists "Public can submit information for review" on public.information_submissions;
create policy "Public can submit information for review"
  on public.information_submissions
  for insert
  to anon
  with check (status = 'pending');
