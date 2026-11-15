create index if not exists mouzas_union_upazila_fk_idx
  on public.mouzas (union_id, upazila_id);

create index if not exists villages_mauza_hierarchy_fk_idx
  on public.villages (mauza_id, upazila_id, union_id);
