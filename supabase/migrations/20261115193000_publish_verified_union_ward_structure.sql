-- Publish the legally established Union Parishad ward-number structure.
-- This verifies only that each Union has nine general-member wards under section 3(1).
-- It does not claim that ward boundaries, village allocations or ward-level census values
-- have been independently verified; that limitation remains explicit in source_note.
begin;

update public.wards
set
  is_verified = true,
  is_published = true,
  published_at = coalesce(published_at, now()),
  source_name = 'স্থানীয় সরকার (ইউনিয়ন পরিষদ) আইন, ২০০৯ — ধারা ৩',
  source_url = 'https://bdlaws.minlaw.gov.bd/act-1027/act-chapter-print-2253.html',
  source_checked_at = now(),
  source_note = 'আইনের ধারা ৩(১) অনুযায়ী ইউনিয়নকে সাধারণ সদস্য নির্বাচনের জন্য ৯টি ওয়ার্ডে বিভক্ত করতে হয়। এই রেকর্ড ওয়ার্ড নম্বরের কাঠামোগত অস্তিত্ব নিশ্চিত করে; স্থানীয় সীমানা, অন্তর্ভুক্ত গ্রাম/মহল্লা ও ওয়ার্ডভিত্তিক Census পরিসংখ্যান আলাদাভাবে সরকারি নথি দিয়ে যাচাই করতে হবে।'
where union_id is not null;

-- New records are publication-ready by default, but remain hidden until verified.
-- Public RLS policies still require BOTH is_published and is_verified.
alter table public.districts alter column is_published set default true;
alter table public.upazilas alter column is_published set default true;
alter table public.unions alter column is_published set default true;
alter table public.municipalities alter column is_published set default true;
alter table public.wards alter column is_published set default true;
alter table public.directory_entries alter column is_published set default true;

commit;
