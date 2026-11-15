create index if not exists villages_union_upazila_fk_idx
  on public.villages (union_id, upazila_id);

create index if not exists directory_entries_village_hierarchy_fk_idx
  on public.directory_entries (village_id, upazila_id, union_id);
