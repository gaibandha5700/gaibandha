alter table public.municipalities
  add constraint municipalities_id_upazila_unique unique (id, upazila_id);

alter table public.municipality_wards
  add constraint municipality_wards_id_municipality_unique unique (id, municipality_id);

alter table public.directory_entries
  add column municipality_id uuid,
  add column municipality_ward_id uuid,
  add constraint directory_entries_municipality_upazila_fk
    foreign key (municipality_id, upazila_id)
    references public.municipalities (id, upazila_id)
    on delete restrict,
  add constraint directory_entries_municipality_ward_fk
    foreign key (municipality_ward_id, municipality_id)
    references public.municipality_wards (id, municipality_id)
    on delete set null (municipality_ward_id),
  add constraint directory_entries_union_municipality_exclusive
    check (union_id is null or municipality_id is null),
  add constraint directory_entries_ward_requires_municipality
    check (municipality_ward_id is null or municipality_id is not null);

create index directory_entries_municipality_id_idx
  on public.directory_entries (municipality_id)
  where municipality_id is not null;
create index directory_entries_municipality_ward_id_idx
  on public.directory_entries (municipality_ward_id)
  where municipality_ward_id is not null;

drop policy if exists "Public can read published verified directory entries"
  on public.directory_entries;

create policy "Public can read published verified directory entries"
on public.directory_entries
for select
to anon, authenticated
using (
  is_published = true
  and is_verified = true
  and (
    upazila_id is null
    or exists (
      select 1 from public.upazilas u
      where u.id = directory_entries.upazila_id
        and u.is_published = true and u.is_verified = true
    )
  )
  and (
    union_id is null
    or exists (
      select 1 from public.unions un
      where un.id = directory_entries.union_id
        and un.is_published = true and un.is_verified = true
    )
  )
  and (
    municipality_id is null
    or exists (
      select 1
      from public.municipalities m
      join public.upazilas u on u.id = m.upazila_id
      join public.districts d on d.id = u.district_id
      where m.id = directory_entries.municipality_id
        and m.upazila_id = directory_entries.upazila_id
        and m.is_published = true and m.is_verified = true
        and u.is_published = true and u.is_verified = true
        and d.is_published = true and d.is_verified = true
    )
  )
  and (
    municipality_ward_id is null
    or exists (
      select 1
      from public.municipality_wards mw
      join public.municipalities m on m.id = mw.municipality_id
      join public.upazilas u on u.id = m.upazila_id
      join public.districts d on d.id = u.district_id
      where mw.id = directory_entries.municipality_ward_id
        and mw.municipality_id = directory_entries.municipality_id
        and mw.is_published = true and mw.is_verified = true
        and m.is_published = true and m.is_verified = true
        and u.is_published = true and u.is_verified = true
        and d.is_published = true and d.is_verified = true
    )
  )
);
