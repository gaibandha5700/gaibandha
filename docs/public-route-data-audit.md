# Public route and database alignment audit

**Audit date:** 2026-11-21  
**Baseline:** `main` at `b7f0c5510c9994dafbfb4fc1fb9d4232a64ea202`  
**Scope:** Bengali public site only; no production writes.

This is an evidence snapshot of the production branch and live database. Route changes in open pull requests are not counted as implemented on `main`.

## Route-to-data coverage

| Route | Main status | Data flow / source | Findings |
|---|---|---|---|
| `/` | Implemented | Verified/published upazilas, unions, municipalities and directory entries | No district profile or interactive map on production branch |
| `/upazila`, `/upazila/[slug]` | Implemented | Upazilas and their published/verified census fields | Existing route family |
| `/upazila/[slug]/[unionSlug]` | Implemented | Parent upazila, union census fields, published/verified wards and directory entries | Existing route family |
| `/upazila/[slug]/[unionSlug]/ward/[wardNumber]` | Implemented | Exact ward record, parent checks, census/source fields and related public entries | Ward URLs are not currently submitted in sitemap |
| `/municipality`, `/municipality/[slug]` | Implemented | Published/verified municipalities, wards and census fields | Index appends `পৌরসভা` even when `name_bn` already includes it; PR #10 fixes this |
| `/municipality/[slug]/ward/[wardNumber]` | Implemented | Exact municipal ward, parent municipality and related public entries | Ward URLs are not currently submitted in sitemap |
| `/directory`, category and detail routes | Implemented | `directory_entries`, `education_institutions`; verified/published filters | Paginated full-directory helper exists |
| `/search` | Implemented, incomplete | Directory entries, upazilas, unions and municipalities | Current main search does not include district/ward entities, English/slug matching or Bengali/Arabic digit normalization; PR #7 addresses this |
| `/statistics` | Implemented, partial | Denormalized 2022 fields on upazila/union/municipality records | Main page does not display the available municipal-ward census rows; PR #7 adds ward-table coverage |
| `/data` | Implemented | Public verified directory catalog | Existing catalog route |
| `/submit`, `/api/submissions` | Implemented | Public INSERT-only submission workflow | Submissions remain pending; no raw submission data is publicly read |
| `/district`, `/map`, `/sources`, `/about`, `/privacy`, `/contact` | Not present on production `main` | Added in PR #7 | Production `/map` currently returns 404; PR #7 preview is READY |

## Live data snapshot

Read-only Supabase audit; counts are limited to public verified/published records where applicable.

| Entity / data | Count |
|---|---:|
| District | 1 |
| Upazilas | 7 |
| Unions | 81 |
| Municipalities | 4 |
| Published/verified ward entities | 765 |
| Published/verified directory entries | 67 |
| Published/verified census snapshots | 129 |
| Current published/verified boundary records | 129 |
| Published/verified administrative locations | 0 |

Boundary records: district 1, upazila 7, union 81, municipality 4 and ward 36. The approved map scope is the first four levels only: **93 boundaries**. Ward polygons remain excluded from GIS.

Census snapshot coverage: district 1, upazila 7, union 81, municipality 4 and municipal ward 36. Union-ward census coverage is not established by this count.

## RLS and publication checks

- `directory_entries`: public SELECT is limited to published/verified rows and verified/published parent administrative entities.
- `wards`: public SELECT is limited to published/verified wards with verified/published parent entities.
- `census_statistics`, `administrative_boundaries`, `administrative_locations`: public SELECT policies require published + verified.
- `education_institutions`: public SELECT is scoped through a published/verified education directory entry.
- `information_submissions`: public INSERT is allowed only with pending status; there is no public SELECT policy in this audit.
- No production schema, data or RLS changes were made.

## Prioritized follow-up

- [ ] Review/reconcile PR #7 against current `main`; it contains the district, sources, transparency, search/statistics improvements and GIS map batch.
- [ ] Review the PR #7 map implementation alongside PR #9; they overlap. Keep only one map implementation path to avoid duplicate work.
- [ ] Review and merge the small municipality-label fix (PR #10) only after the preview review; do not merge without authorization.
- [ ] Reconcile the older PR #2 with current `main` before considering it; its current comparison contains stale/obsolete GIS files and is not mergeable.
- [ ] Verify mobile keyboard, screen-reader, responsive map and real search-result behavior after route-batch review.
- [ ] Review administrative-location coverage. The table currently has no published/verified rows; do not infer office coordinates.
- [ ] Review rate limiting/abuse controls for public submissions and document any justified implementation before changing the submission API.
- [ ] After any approved merge, verify production routes, canonical metadata, sitemap, data flow, build and deployment logs.

## Verification limits

- Production custom domain: homepage and `/search` returned HTTP 200; `/map` returned HTTP 404.
- Latest PR #7 and PR #9 Vercel checks are successful; PR #10 Vercel check is successful.
- Preview URLs redirect to Vercel SSO from this audit environment, so the latest preview routes could not be independently browser-inspected here.
- This audit is a route/data-flow review, not an independent ground-truth boundary verification or mobile-device test.
