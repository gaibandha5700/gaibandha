alter table public.directory_entries
  add constraint directory_entries_union_upazila_fk
  foreign key (union_id, upazila_id)
  references public.unions (id, upazila_id)
  on delete set null (union_id);

create index if not exists directory_entries_union_upazila_fk_idx
  on public.directory_entries (union_id, upazila_id);
