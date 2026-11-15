alter table public.directory_entries
  drop constraint if exists directory_entries_village_hierarchy_fk;

drop index if exists public.directory_entries_village_hierarchy_fk_idx;

alter table public.directory_entries
  drop column if exists village_id;

drop table if exists public.villages;
drop table if exists public.mouzas;
