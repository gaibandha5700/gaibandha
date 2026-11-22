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


## Current audit refresh — 2026-11-21

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


## Production route smoke — 2026-11-21

- Production deployment is READY on main commit `83f8e59acbde9d5f4b2f10049a20249adbf0d6a2`.
- Protected-fetch smoke checks returned HTTP 200 for `/`, `/statistics`, `/map`, `/search`, and `/sitemap.xml` on `https://amadergaibandha.vercel.app`.
- Route-title checks confirmed the expected Bengali titles for homepage, statistics, map and search. This is an HTTP/render smoke check, not a mobile-device or screen-reader test.


## Current audit — 2026-11-22 (Run 7)

### Current production baseline
- `main` remains at `83f8e59acbde9d5f4b2f10049a20249adbf0d6a2`; the latest production deployment inspected was READY. The custom-domain homepage, `/statistics`, `/map`, and `/search` were fetched successfully (HTTP 200) in this run. This does not prove mobile, keyboard, or screen-reader behavior.
- The active integration branch is PR #14. A ward-level directory category filter and empty-state category submission link were added; its new preview verification is pending.

### Read-only Supabase audit
- Correct project ref: `tpqwauxufaydzhpkuvtk` (`amadergaibandha`, ACTIVE_HEALTHY). No production data or schema writes.
- All 11 public tables have RLS enabled; public read policies scope administrative entities, directory entries, census data, boundaries, and education records to published/verified rows and verified parent entities. Submissions permit public INSERT only with pending status; no public SELECT policy.
- Public verified counts: district 1, upazila 7, union 81, municipality 4, wards 765, directory entries 67, education detail rows 22, census statistics 129, boundaries 129, administrative locations 0.
- Directory-entry assignment coverage: 37 union-linked, 7 municipality-linked, 4 ward-linked; 0 coordinate pairs. All 67 have source URLs; category distribution is education 22, health 43, government 2.
- Security/health advisors returned no lints. Performance advisor reported 8 unused indexes; no cleanup attempted. RLS remains unchanged.

### Branch reconciliation
- PR #14 remains the active integration branch; at the preview-test snapshot it was 14 commits ahead/0 behind main (docs updates follow).
- PR #2 (`feat/public-directory-data-integration`) was 53 commits ahead/25 behind, diverged, Draft and not mergeable; it removes shared header/footer on several pages. Its useful ward-filter behavior was extracted and verified on PR #14; PR #2 is now closed (not merged) and its branch is preserved.
- Production/main promotion remains gated; no production merge or deployment was made.

### Verification limits and next step
- Preview commit `a4b7d16` reached READY; compilation, lint/type checks, and static generation 184/184 succeeded.
- Preview HTTP 200: `/directory/health` area+ward 5 (hospital found), `/directory/government` area+ward 6 (health office found), `/directory/education` same filter (empty state + submission CTA), area-only health filter, `/statistics` (SVG + metric controls), `/search`, `/map`, `/sitemap.xml`, `/robots.txt`.
- The first code preview returned 500 for municipality filters. Vercel logs confirmed UUID parsing error from `area.slice(12)` including the colon. Both municipality filter sites were corrected to `slice(13)`; the new preview tests passed.
- Production `main` still has the old municipality-filter bug: an upazila-only health query finds the hospital, but adding the municipality filter returns no result (HTTP 200). The fix remains in PR #14 only.
- Keyboard navigation, real mobile viewport and screen-reader testing remain pending.


## Preview verification and branch consolidation — 2026-11-22

- PR #14 is the sole active integration PR; it now includes the statistics chart, category ward filters, empty-state CTA and municipality-prefix fix. Preview commit `a4b7d16` is READY; static generation 184/184, compilation, lint/type checks and route smoke tests passed.
- PR #2 closed as superseded after the useful ward-filter behavior was extracted and verified. Its branch is preserved; no merge or deletion.
- No production merge or deployment. `main` remains at the verified production baseline until explicit authorization.
- Remaining verification: keyboard-only interaction, real mobile viewport, screen reader, reduced motion and touch-target audit.


## Full branch review — 2026-11-22

- PR #14 is the only open PR and active integration branch (16 commits ahead, 0 behind main at this snapshot). It remains Draft; production merge/deployment is not authorized.
- PRs #4/#5/#6/#7/#8/#10/#11/#12 are merged and their work is represented on main; #12's PostCSS override is already present in main's package.json. No duplicate merge was needed.
- PR #1 was closed and superseded by #4; PR #9 was closed as redundant with #7; PR #13 was closed as superseded by the current search implementation; PR #2 was closed after its ward-filter feature was selectively extracted and preview-tested. Their branch refs remain preserved.
- All remaining refs were compared to main. No other open PR or verified unique, safe change was selected for this integration batch. No branch was deleted or rewritten.


## Run 7 — current production and integration evidence (2026-11-22)

- Production routes rechecked through Vercel protected fetch: homepage, statistics, search, map and health-directory category returned HTTP 200. This was server-rendered smoke testing, not device/browser interaction testing.
- Production main still has the earlier municipality-area UUID parsing bug: a filtered /directory/health request returned HTTP 200 but the empty-state HTML, while Vercel's aggregated runtime error showed 7 UUID parse failures for the leading colon in the UUID. The corrected slice(13) code remains in PR #14; no production merge was made.
- PR #14 preview (latest inspected commit before the new label fix) returned HTTP 200 for a Gaibandha municipality ward-5 health filter and included the 250-bed General Hospital. The area dropdown was visibly duplicated: the database name already ends with পৌরসভা, and the formatter appends another suffix.
- [x] UI formatter corrected on the PR #14 branch to normalize municipality suffixes before display; next preview must be checked.
- Supabase read-only inspection confirmed all four published municipalities include the পৌরসভা suffix in name_bn; the duplicate label is a UI formatting issue, not bad source data.
- Production runtime logs for the latest 30-minute window returned no records. The 24-hour error aggregation still contains the earlier 7 UUID failures; this is historical aggregation, not proof of a new error in the last hour.
- Current schema/advisors read: 11 public tables, RLS enabled; security/health lint lists empty; performance advisor shows 8 unused-index notices only. No SQL writes, data changes or index removals.
- Verification limitation: Vercel Hobby runtime log retention prevented wider historical log queries. Full real-device, screen-reader and keyboard-only testing remain outstanding.

### Roadmap / acceptance criteria
- [ ] New preview READY after suffix patch.
- [ ] Area options display exactly one পৌরসভা suffix; preserve upazila context.
- [ ] Municipality-area and exact ward filter return the same verified directory result as the earlier passing preview.
- [ ] Empty-state and clear-filter controls remain usable, and filtered URLs remain noindex.
- [ ] No production merge/deployment without explicit authorization.


### Preview verification update — 2026-11-22

- [x] Code preview commit 366f593 is READY and returns HTTP 200 for health ward 5 (the 250-bed General Hospital), government ward 6 (Sadar Upazila Health Office), education empty state with category-specific CTA, area-only health, statistics, search, map, sitemap and robots.
- [x] The municipality option shows exactly one suffix and upazila context. Ward filters remain exact, filtered pages render noindex, and the tested results are consistent with read-only published/verified database records.
- The active branch was rebased onto main commit 2b0382de by resetting the ref after creating archive branch `archive/pr14-head-20261122`, then selectively restoring the five PR files. Compare now reports 5 commits ahead and 0 behind; the PR was reopened and remains Draft.
- Latest reconciled preview commit 42f94 is queued. Final preview verification including the 150×62 header logo inherited from main remains pending.

## Run 8 — accessibility CSS improvement (2026-11-22)

- Added visible `:focus-visible` outlines across interactive elements and a contrasting footer variant.
- Expanded `prefers-reduced-motion` to reduce animation, transition and smooth-scroll behavior site-wide.
- Preview commit `c208249` is READY; compilation, lint/type checks and static generation (184/184) passed. Browser route inspection is blocked by Preview SSO. Keyboard-only, mobile viewport and screen-reader testing remain pending; local browser testing was unavailable. No production promotion.




## Run 10 — CSV export verification and current state (2026-11-22)

- Fixed CSV download lifecycle: the object URL is now revoked after a 1-second delay rather than immediately after the synthetic click.
- Local jsdom harness PASS: download button/filename, UTF-8 BOM, formula-leading text protection, source URL and delayed object-URL cleanup.
- Latest code Preview for commit `f8d20ce` is READY; Vercel build completed. Local lint and typecheck also passed after the fix. Preview routes remain SSO-protected from this audit environment.
- Earlier clean sandbox `npm ci`, build (184/184 static pages), lint/typecheck and `npm audit` (0 vulnerabilities) passed using the generated temporary lockfile and existing public Supabase environment values. The lockfile was not committed; reproducibility remains an open priority.
- Production route smoke: `/`, `/statistics`, `/search`, `/map`, `/robots.txt`, `/sitemap.xml`, `/directory/health`, `/district`, `/data` and `/sources` all returned HTTP 200.
- Production runtime error/log queries for the last 30 minutes returned no errors and no logs. The 24-hour error aggregation still contains seven historical municipality UUID-parsing errors; the fix is in PR #14 and is not in production.
- Branch review: PR #14 is the sole open integration PR (Draft). No stale branch was deleted; closed/superseded work remains preserved. No production merge or deployment.
- Remaining P1/P2 work: commit a lockfile after review, real mobile/keyboard/screen-reader testing, protected-preview route inspection, and DGHS facility source cross-check (no bulk import or inferred coordinates).


## Run 7 — 2026-11-22 keyboard-accessible chart scroll and fresh evidence

- [x] The statistics comparison chart's horizontal overflow region now has a keyboard focus target and Bengali region label, so keyboard users can focus the chart viewport and scroll horizontally. Commit: `6b84337`.
- [ ] Verify the new code preview build and keyboard interaction; deployment was BUILDING at the time of this record.
- Current production baseline: `main` at `2b0382de0e920e5fe4cabe84246e050814dd3242`; its production deployment is READY.
- Production runtime logs for the last 30 minutes returned no entries. The 24-hour error aggregation still reports seven historic UUID parsing errors from 2026-11-21 18:38–18:39 UTC; the invalid value included the leading colon in `municipality:`. The corrected `slice(13)` code is in PR #14 only and has not been promoted.
- Read-only Supabase audit reconfirmed project `tpqwauxufaydzhpkuvtk` is ACTIVE_HEALTHY, 11/11 public tables have RLS, published/verified totals: district 1, upazila 7, union 81, municipality 4, wards 765, directory entries 67, census statistics 129, boundaries 129, administrative locations 0, education records 22.
- Preview SSO and external DNS access from the run environment prevented direct browser route inspection and a local clone. The local clone attempt failed with DNS resolution for `github.com`; no local clean build is claimed.
- No schema/data write, branch deletion, production merge or production deployment.

### Acceptance criteria
- [ ] READY Vercel preview for `6b84337` (or a newer branch commit).
- [ ] Keyboard Tab can focus the chart scroll region and arrow/page scrolling can reach the chart's right edge.
- [ ] Chart labels, accessible SVG title/description and data-table alternative remain available.
- [ ] No regressions in metric switches or CSV download.


## Current snapshot refresh — 2026-11-22

- Current production main: 2b0382de0e920e5fe4cabe84246e050814dd3242 (logo-size commit). Previous snapshots above are historical; they do not describe current route status.
- Production HTTP checks: /, /statistics, /map, /robots.txt, and /sitemap.xml returned 200. Production HTML is accessible through Vercel deployment-aware fetch despite preview protection.
- Confirmed SEO defect: /statistics, /map, and the directory-category preview were inheriting the global homepage Open Graph title/description and root og:url; route-specific canonical/title did not correct social metadata. PR #14 now contains page-specific OG/Twitter metadata for statistics, map, district and category routes; it awaits Preview verification.
- Read-only Supabase snapshot: district 1, upazila 7, union 81, municipality 4, wards 765, directory entries 67, education details 22, census statistics 129, administrative boundaries 129, administrative locations 0, submissions 0. These are table totals; public filters remain publication/verification dependent.
- Published/verified source coverage: education 22/22, health 43/43, government 2/2 with source URL and source-check date; Census 2022 129/129 with population, households, source URL and checked date.
- RLS is enabled on all 11 public tables. Security and health advisor lints: 0. Performance advisor: 8 INFO unused-index notices; no index removal was performed. Public submission policy is INSERT-only with pending status; no public SELECT policy was found in the policy snapshot.
- Vercel production error aggregation: 7 historical UUID parsing errors on /directory/[category] (first 2026-11-21 18:38:35Z, last 18:39:02Z); last 30-minute production runtime log window was empty. The slice(13) correction remains in PR #14, not production.
- Branch consolidation: 16 refs total. Only PR #14 is open; it is Draft, Vercel status success, and 25 commits ahead/0 behind main at the snapshot. Other branch heads are divergent/stale and preserved; no branch deletion or production promotion was performed.
- Next: verify new social metadata in the READY Preview, continue mobile/keyboard/screen-reader testing, and cross-check the 43 health entries against the official DGHS Facility Registry without bulk-importing unverified data.


## Branch consolidation addendum — 2026-11-22

- Closed PR #13 was reviewed against main and PR #14. The ward search feature, Bengali-digit normalization and parent-aware ward result UI are already implemented on main; the old PR branch is not copied wholesale.
- Selectively incorporated its deterministic ward pagination tie-breaker into PR #14: ward_number.asc,id.asc. This stabilizes PostgREST page boundaries when the same ward_number occurs under different parents.
- PR #1/#2/#9 are closed unmerged and their relevant header, directory/filter, district/GIS content is either superseded by merged main work or partially included in PR #14; their divergent heads remain preserved. No branch deletion was performed.


## Run 11 — shareable statistics chart links
- Added `metric` query parameter support in the statistics chart, allowing population (clean default), households, male and female comparisons to be shared and restored on load.
- Metric changes synchronize the URL without a reload and preserve other query parameters and hash. Added clipboard copy and accessible status/selectable fallback.
- Code commit: c34217e; preview verification pending. No production merge/deployment.
