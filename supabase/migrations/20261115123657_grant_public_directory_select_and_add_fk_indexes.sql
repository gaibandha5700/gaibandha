-- Keep public directory reads compatible with RLS and index composite foreign keys.
grant select on table public.districts, public.municipalities to anon, authenticated;

create index if not exists directory_entries_municipality_upazila_idx
  on public.directory_entries (municipality_id, upazila_id);

create index if not exists directory_entries_municipality_ward_idx
  on public.directory_entries (municipality_ward_id, municipality_id);
