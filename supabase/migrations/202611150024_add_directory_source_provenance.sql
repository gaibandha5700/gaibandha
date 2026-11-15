alter table public.directory_entries
  add column official_code text,
  add column source_name text,
  add column source_url text,
  add column source_checked_at timestamptz,
  add column source_note text;

update public.directory_entries
set municipality_id='67e55c5e-36e7-4877-a555-9885dfd7e2f3',
    municipality_ward_id='b814f05d-aef1-4d3d-a644-c058b8566956',
    official_code='10001254',
    source_name='DGHS Facility Registry',
    source_url='https://hrm.dghs.gov.bd/public/facility-registry/facilities/1248/profile?tab=detailed-information',
    source_checked_at=now()
where id='4ce9fb12-2dd4-4d8d-842f-9ad1ce876ca3';

update public.directory_entries
set municipality_id='67e55c5e-36e7-4877-a555-9885dfd7e2f3',
    municipality_ward_id='cd19b941-2960-430f-9103-503598abe89e',
    official_code='10001253',
    source_name='DGHS Facility Registry',
    source_url='https://hrm.dghs.gov.bd/public/facility-registry/reports/organization-list',
    source_checked_at=now(),
    source_note='DGHS report lists Gaibandha Civil Surgeon Office under Gaibandha Paurashava, Urban Ward No-04.'
where id='85678f51-57f3-42f8-b4f8-998fd63286de';

insert into public.directory_entries
(category,upazila_id,municipality_id,municipality_ward_id,name_bn,name_en,slug,summary,address,phone,email,official_code,source_name,source_url,source_checked_at,source_note,is_published,is_verified,published_at)
values
('government',
 '95b9d4a4-0699-475a-b672-f83d20ada8ed',
 '67e55c5e-36e7-4877-a555-9885dfd7e2f3',
 '89e70a05-5e2a-4239-858c-7bdbeb5d5e23',
 'গাইবান্ধা সদর উপজেলা স্বাস্থ্য অফিস',
 'Gaibandha (Sadar) Upazila Health Office',
 'gaibandha-sadar-upazila-health-office',
 'উপজেলা পর্যায়ের স্বাস্থ্য প্রশাসনিক দপ্তর',
 'খা পাড়া, গাইবান্ধা সদর, গাইবান্ধা',
 '054161576',
 'gaibandhasadar@uhfpo.dghs.gov.bd',
 '10001252',
 'DGHS Facility Registry',
 'https://hrm.dghs.gov.bd/public/facility-registry/facilities/1246/profile?tab=detailed-information',
 now(),
 'DGHS lists this office in Gaibandha Paurashava, Urban Ward No-06.',
 true,true,now())
on conflict (category,slug) do nothing;
