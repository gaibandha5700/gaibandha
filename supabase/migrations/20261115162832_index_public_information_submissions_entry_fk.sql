create index if not exists information_submissions_directory_entry_id_idx on public.information_submissions (directory_entry_id) where directory_entry_id is not null;
