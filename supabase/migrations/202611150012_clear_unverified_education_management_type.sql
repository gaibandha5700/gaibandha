-- BANBEIS EIIN presence alone does not prove private management.
-- Keep management type unknown until an authoritative source confirms it.
update public.education_institutions
set management_type = null
where eiin is not null and management_type = 'private';
