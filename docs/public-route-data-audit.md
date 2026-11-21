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

- [ ] Review/reconcile PR #7 against current `main`; it contains the district, sources, transparency, search/statistics improvements and GIS map. Its latest Vercel check is successful, but the branch still needs review and reconciliation before merge.
- [ ] PR #9 overlaps the map implementation in PR #7. Choose one implementation path after review; neither is merged.
- [ ] PR #10 corrects duplicate municipality suffixes on the index; mobile visual review remains pending.
- [ ] A duplicate municipality suffix was also confirmed in PR #7 search-result labels and fixed on that branch (commit `4681736`); wait for the new preview check.
- [ ] Reconcile the older PR #2 with current `main` before considering it; its current comparison contains stale/obsolete GIS files and is not mergeable.
- [ ] Verify mobile keyboard, screen-reader, responsive map and real search-result behavior after route-batch review.
- [ ] Review administrative-location coverage. The table currently has no published/verified rows; do not infer office coordinates.
- [ ] Review rate limiting/abuse controls for public submissions and document any justified implementation before changing the submission API.
- [ ] After any approved merge, verify production routes, canonical metadata, sitemap, data flow, build and deployment logs.

## Verification limits

- Production custom domain: homepage and `/search` returned HTTP 200; `/map` returned HTTP 404.
- The previous PR #7 build and PR #9 / PR #10 builds are successful. PR #12 security preview is READY. PR #7's search-label fix build is pending; the latest PR #11 documentation-refresh deployment is queued.
- Preview URLs redirect to Vercel SSO from this audit environment, so the latest preview routes could not be independently browser-inspected here.
- This audit is a route/data-flow review, not an independent ground-truth boundary verification or mobile-device test.

## Build and dependency reproducibility

- The repository currently has no `package-lock.json`; `npm ci` fails immediately with the lockfile requirement. Vercel uses `npm install`, so its current builds are not blocked, but dependency resolution is not reproducible.
- The dependency audit found a high-severity PostCSS advisory and one moderate dependency advisory. A focused PostCSS override is proposed in PR #12; sandbox install/lint/typecheck/build/audit passed with zero vulnerabilities, and its Vercel preview is now READY. The override remains unmerged.
- [ ] Add and review a lockfile separately, then verify clean `npm ci` from the committed tree.


## Current follow-up evidence (2026-11-21)

- PR #11's previous documentation preview was READY; the latest documentation refresh commit `e29c73b` is QUEUED. PR #12 PostCSS security preview is READY and its Vercel status is successful.
- PR #7's Vercel check is successful. A search-result display correction (use the stored municipality name without appending a second `পৌরসভা`) was committed to its branch as `4681736cdad4d964bb0c2e7b6f58b45e4543ba35`; preview verification is pending.
- PR #7 and #9 still overlap. No PR was merged and production remains unchanged.
- A local clone/lockfile generation attempt was blocked by DNS resolution for GitHub; a committed lockfile and clean `npm ci` remain unverified.

- PR #7 comparison against current `main`: 68 commits ahead and 1 behind; PR #9: 13 commits ahead and 0 behind. Both contain the map component/page and scope documentation, so they overlap materially.


## Reconciliation snapshot — 2026-11-21 (follow-up)

### Confirmed repository state

- `main` remains at `b7f0c5510c9994dafbfb4fc1fb9d4232a64ea202`; the latest production-target deployment is READY for this commit.
- PR #7 (`feat/public-route-audit-gis-map`) is 68 commits ahead and 1 commit behind `main`, diverged from its older merge base (`337fa6f`), and is currently reported not mergeable. Its map page/component and GIS RPC migration overlap with PR #9. Do not merge until the changes are reconciled.
- PR #9 (`feat/admin-map-no-ward`) is based on current `main`, 13 commits ahead and 0 behind, and reported mergeable. It is a map-only implementation and remains Draft; preview/build review is still required.
- PR #10 (municipality label fix) is 1 commit ahead of current `main`, 0 behind and reported mergeable. Mobile visual review is pending.
- PR #12 (PostCSS override) is 1 commit ahead of current `main`, 0 behind and reported mergeable. Its prior clean-install verification was `npm audit` = 0 vulnerabilities, lint/typecheck/build passed; it remains Draft.
- PR #11 (this audit) is 4 commits ahead of `main`, 0 behind; this documentation-only branch is still Draft.
- PR #2 is 53 commits ahead and 21 behind `main`, diverged and not mergeable. Its patch removes shared header/footer rendering in directory routes; it is stale and must not be merged without a fresh review/reconciliation.

### Search coverage follow-up

- Main search currently omits published/verified ward entities and English/slug matching for administrative entities. A focused Draft PR #13 now adds paginated ward retrieval and search by names/numbers with Bengali numeral normalization, without depending on the unmerged district route.
- PR #13 is based directly on current `main`, 2 commits ahead and 0 behind, and reported mergeable. Vercel Preview build and route smoke checks are pending.
- PR #7 also contains search changes, so its search/map code must be reconciled before it can be merged.

### Live database read-only snapshot

| Table | Total | Published + verified |
|---|---:|---:|
| Districts | 1 | 1 |
| Upazilas | 7 | 7 |
| Unions | 81 | 81 |
| Municipalities | 4 | 4 |
| Wards | 765 | 765 |
| Directory entries | 67 | 67 |
| Census statistics | 129 | 129 |
| Administrative boundaries | 129 | 129 current |
| Administrative locations | 0 | 0 |
| Education institution detail rows | 22 | 22 (linked detail records; parent publication governs public exposure) |

The 129 boundary records are 1 district, 7 upazila, 81 union, 4 municipality and 36 ward. The active public GIS target remains the 93 non-ward boundaries only. No production schema or data writes were performed.

### Reproducibility blocker

- The repository still has no `package-lock.json`; `npm ci` cannot be used as a reproducible install.
- DNS/network access from this audit environment cannot resolve GitHub, preventing a local clone and lockfile generation. Vercel builds can clone and install successfully, but local lint/type/build verification is not available in this environment.
- Vercel build logs continue to report an unknown npm `cache-dir` configuration warning; it is non-fatal and remains to be traced to the project build configuration.
- Production runtime error logs in the recent 30-minute window were empty.

### Next priority

1. Review and reconcile overlapping/stale PR #7 and #9; do not merge either automatically.
2. Verify PR #13's Preview build and search smoke behavior before review.
3. Review PR #10 mobile rendering and PR #12 security override before any merge.
4. Resolve the lockfile/reproducible install issue and the non-fatal npm cache-dir warning.
5. Continue the route-to-database and mobile/accessibility audit; do not create administrative coordinates without verified sources.


### PR #13 build review update

The initial full search-page build for commit `dbddc25` failed the lint gate because the input element had two `aria-label` attributes (`react/jsx-no-duplicate-props`). This was confirmed from Vercel build logs and corrected in commit `7902e9d`. The ward pagination query was also changed to a stable `ward_number,id` ordering in commit `48680d6`. The latest Vercel Preview for `48680d6` is queued; no build-success claim is made until its final logs are available.
\n\n## Current audit refresh — 2026-11-21

- Repository and deployment rechecked: the production deployment is READY at main commit `83f8e59acbde9d5f4b2f10049a20249adbf0d6a2`; the older baseline above is historical, not current.
- PR #7 route/map implementation and PR #10 municipality-label fix are now reflected in production main; the previous route-status statements above are historical and should not be used as the current production snapshot.
- PR #13 ward-search preview is READY, but route/query browser smoke testing and integration review are still outstanding.
- Live Supabase table audit: public tables are RLS-enabled; observed totals include district 1, upazila 7, union 81, municipality 4, wards 765, directory entries 67, education detail 22, census snapshots 129, boundaries 129, submissions 0, administrative locations 0. Row-count metadata is not a substitute for per-record publication verification; public filters remain required.
- Read-only SQL confirmed all seven published/verified upazila rows have 2022 population, household, male and female values and BBS source name/URL plus checked dates. The interactive chart branch uses these fields only; no production database changes were made.
- Production runtime error aggregation for the past 24 hours and production error/fatal logs for the latest 30-minute window returned no errors/log entries.
- Vercel preview SSO protection prevents independent browser inspection from this run environment; chart behavior/build still requires preview verification.
- No production merge or deployment was initiated.


## Branch consolidation update — 2026-11-21

- PR #9 closed as superseded by the merged main map implementation; the current map route/component are more complete.
- PR #13 closed as superseded; main includes the search enhancements and additional district result.
- PR #2 remains open as Draft, 25 commits behind and diverged. Its branch removes shared header/footer; the remaining directory ward-filter behavior requires selective review.
- PR #14 (interactive statistics chart) is the active integration branch. Preview deployment for commit `8c5b50c` reached READY; /statistics and /search returned HTTP 200 through the protected preview fetch. /statistics HTML contains the chart SVG, metric controls, source link and table alternative. Real mobile, screen-reader and interaction testing is still pending.
