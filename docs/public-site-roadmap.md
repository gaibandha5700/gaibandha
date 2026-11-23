# Public website architecture and implementation checklist

Bengali-only, mobile-first public information platform. This document tracks the approved route architecture and implementation progress against the actual repository.

## Route audit (main snapshot: 2026-11-21)
- [x] `/` editorial homepage, search, admin shortcuts, directory and actual published district-boundary SVG preview; recent verified/public directory updates (source-check date where present, otherwise record update date)
- [x] `/upazila`, `/upazila/[slug]`, `/upazila/[slug]/[unionSlug]`, union ward route
- [x] `/municipality`, `/municipality/[slug]`, municipality ward route
- [x] `/directory`, category, detail, submission API and submission page
- [x] `/search` now searches published/verified district, upazila, union, municipality, union-ward, municipal-ward and directory records (paginated ward fetch; new preview build pending). `/statistics` (municipal-ward census tables now added; union-ward census coverage remains unavailable), `/data`
- [x] `/district` — district profile added (preview build READY; latest route HTTP probes remain blocked by preview protection)
- [x] `/map` — GIS page and accessible SVG explorer added; active map layers are district, upazila, union and municipality only; zoom/reset, bounded pointer pan, keyboard pan and list alternative added
- [x] `/sources`, `/about`, `/privacy`, `/contact` — concise transparency pages added
- [ ] Route-level empty states and accessibility review (custom not-found page added; shared error boundaries implemented on Run 21)
- [ ] Verify sitemap and mobile navigation coverage after preview
- [x] Search matches administrative names in Bengali/English and normalizes Bengali/Arabic digits; numeric ward queries use exact number matches

## Data presentation and publication rules
- District → upazila → union / municipality on the interactive map only. Ward data may remain in sourced text/profile pages; ward GIS is not a map layer.
- Use only verified and published public records. Do not expose raw submissions, contacts, review statuses, internal fields or credentials.
- Display source, data year, checked date and methodology where available. Missing values are not zero.
- Never sum overlapping administrative levels into district totals.
- Directory coordinates must be validated and verified; don't map guessed coordinates.
- Derived municipal polygons remain explicitly identified; independent official polygon verification is not implied.

## GIS coverage (database audit, 2026-11-21)
- 129 published/verified current boundary rows: district 1, upazila 7, union 81, municipality 4, ward 36. The interactive map uses the 93 non-ward boundaries only.
- Ward polygons are excluded from the map. Union-ward GIS acquisition is not a completion requirement. Administrative locations table has no published records.
- RLS on administrative boundaries limits public reads to published + verified rows.
- GIS attribution: ArcGIS Bangladesh CRIIPS, MapServer layers 121/122/123, BBS 2022 attribution. Four municipal polygons are derived from municipal ward geometries.
- The new GeoJSON RPC uses SECURITY INVOKER and relies on existing RLS and verified/published parent filters. It was applied as an additive migration on 2026-11-21 and tested as `anon`; 129 FeatureCollection entries were returned with complete geometry/profile links. GeoJSON tolerance was benchmarked under `anon`: 0.0005 reduced payload to 593,335 bytes (~50% smaller than 0.00015 at 1,173,215 bytes) without reducing feature count; the page uses 0.0005. The preview for commit `2cb80a2` returned `/map` HTTP 200 with the SVG, no fallback, and a ~404 KB HTML response (7 upazila paths on the initial layer). Preview `/map` was built before the migration, so its cached fallback must be refreshed by a new deployment.

## Statistical coverage (2026-11-21)
- The statistics page now includes published/verified municipal-ward census tables (36 ward records) with source links and checked-date labels where available. It explicitly states that union-ward census values are not available and that ward/municipality totals are not added to higher-level totals.
- Current `census_statistics` coverage: district 1, upazila 7, union 81, municipality 4, municipal wards 36 (129 records total). The `wards` table contains 765 published/verified administrative ward records; union-ward census data is not present in the census-statistics coverage.

## Homepage coverage (2026-11-21)
- The homepage now renders the actual published district boundary geometry from the public GeoJSON feed as a server-rendered SVG preview, rather than a decorative contour graphic. It retains a clearly labelled fallback if the geometry is unavailable.
- The homepage lists the three most recently updated public, verified directory entries. It distinguishes source-check dates from record-update dates and does not label record edits as verification.
- The GeoJSON feed is server-fetched and cached; it is not placed in the browser client bundle. This preview reuses the existing RPC and adds no database migration.

## Roadmap
1. Route audit, navigation, sitemap and this document.
2. Unified search coverage across published/verified administrative and directory records; verify Bengali and Arabic numeral queries.
3. Complete data coverage and pagination/filters at every admin level and directory.
4. Area profiles and statistical presentation.
5. GIS map with verified-only GeoJSON, district/upazila/union/municipality layers only, accessible list alternative and coverage gaps.
6. Sources, verification, correction path and update transparency.
7. Search, SEO, canonical/breadcrumbs and sitemap.
8. Responsive/accessibility/performance/security/testing review.

## Search refinement (2026-11-21)
- Search matching now normalizes Bengali numerals to Arabic for text matching and includes English administrative names/slugs for upazilas, unions, municipalities, wards, and directory records. Pure numeric ward queries match the exact ward number rather than substring values. The updated preview build is pending verification.

## Quality gates / status
- [x] Approved map scope excludes all ward GIS layers; server-side page filtering limits client map data to district, upazila, union and municipality features.
- [x] Static SVG accessibility review: interactive map features are contained in a labelled group (not flattened under image semantics); selected-area panel uses a polite live region. Real screen-reader/mobile-device testing remains pending.
- [x] Inspect main branch tree, routes, shared chrome, data helper, schema, RLS and deployment.
- [x] Add route coverage and transparency page batch on a branch.
- [x] Apply GeoJSON RPC migration (additive; applied 2026-11-21 and tested under the anon role).
- [x] Verify Vercel build, typecheck and generated route output: commit `39611f7` is READY; the build compiled, checked types and generated 184/184 pages. The route table includes `/map`, `/district`, `/sources`, `/about`, `/privacy`, `/contact`, `/statistics`, `/search`, and `/directory`. Direct HTTP probes of the latest preview are blocked by Vercel preview protection; earlier HTTP probes predate the pan commit.
- [ ] Visual mobile viewport audit (not available in this run; static responsive-code review only).
- [ ] Verify homepage SVG preview, recent-update section and municipal-ward statistics tables in a new READY preview; geometry fetch is server-side and uses the existing RPC.
- [x] Verify map RPC/feature count under anon RLS: 129 geometries, no missing geometry/profile URL; levels 1/7/81/4/36.
- [x] Add keyboard-friendly zoom slider, explicit zoom-in/zoom-out buttons and a full-map reset control.
- [x] Implement pointer-based pan when zoomed above 1×, with drag selection suppression and bounded pan; keyboard Enter/Space selection remains.
- [x] Add bounded arrow-key panning when a map feature is focused and zoom exceeds 1× (new commit; preview build pending).
- [ ] Check interactive map pan/selection and arrow-key panning on a real mobile viewport and screen reader. Pointer-pan JSX fragment fix (`b42db49`) preview build is READY; latest route HTTP probes and real-device checks remain pending.
- [ ] Merge after the latest keyboard-pan preview build, mobile viewport and screen-reader audit; then verify production deployment.


## Latest preview audit (2026-11-21)
- Vercel preview for the current GIS/route branch is READY; the map, district, statistics, homepage, data, sources, about, privacy, and contact routes were directly fetched with HTTP 200.
- Canonical URLs were confirmed in rendered HTML for homepage, district, map, statistics, data, sources, about, privacy, and contact. Search remains intentionally noindex/follow.
- The preview sitemap returned 174 URLs and `/robots.txt` returned HTTP 200. This is a route/sitemap smoke check, not a query-by-query search or mobile-device audit.
- Preview `/map` returned HTTP 200 with the SVG map. Production on `main` (commit `b7f0c551`) still returns HTTP 404 for `/map` because the map/route batch is not merged.
- The PR branch is 66 commits ahead and 1 commit behind `main`; GitHub reports it mergeable. Update/review the branch against current main before merging. No merge or production deployment was performed.
- Real-device/mobile, screen-reader, keyboard interaction, live search-result smoke tests, and independent official boundary validation remain outstanding.


## Continuous feature roadmap and changelog — 2026-11-21

### Delivered in this development batch
- [x] Interactive upazila comparison chart on `/statistics`: users can switch among population, households, male and female totals; the chart sorts descending and includes an accessible data-table alternative. Values are sourced from existing published/verified 2022 upazila fields; no database writes or new dependencies.
- Source link is drawn from the existing BBS source metadata. Missing values remain excluded from the chart, not converted to zero.
- This implementation is in a preview branch; it is not production.

### Prioritized ongoing feature backlog
1. **P1 — Search quality and coverage:** validate the ward-search preview against current main; test Bengali/English names, slug, numeral normalization, pagination and exact ward-number matching. Search-page union and municipality data now use batched, paginated fetches (PR #30 merged; Preview `/search` returned HTTP 200).
2. **P1 — Responsive/accessibility verification:** test search, chart, map, tables and navigation with keyboard, screen reader and real mobile viewports; correct contrast, focus, overflow and touch targets.
3. **P1 — Data transparency:** audit source/checked dates and coverage indicators across statistics, area profiles and directory entries; distinguish unavailable data from zero.
4. **P2 — Statistical exploration:** add comparison filters/drill-down only where source fields and complete coverage support them; consider district-to-upazila, union and municipality comparisons without summing overlapping totals.
5. **P2 — Directory enhancements:** improve category/location filtering, result sorting and empty states; measure performance and keep publication filters intact.
6. **P2 — Submission trust & safety:** review abuse prevention, validation, rate limiting and correction workflow; do not expose pending submissions or submitter contacts.
7. **P2 — Search/SEO/route audit:** verify canonical metadata, indexability, sitemap, breadcrumbs, internal linking and route-level empty/error states.
8. **P3 — Reproducible builds:** resolve the missing lockfile and npm cache configuration warning, then validate clean install/build in an environment with network access.
9. **P3 — Performance:** evaluate route payloads, caching, images, map payload and Core Web Vitals with actual measurements before optimizing.

### Roadmap maintenance rules
- Each run re-evaluates priorities against current evidence and marks items complete only after code and verification.
- Avoid speculative features or features requiring unsupported/incomplete data.
- Consolidate active work into the integration branch; keep production/main promotion gated by explicit authorization.


## Branch consolidation review — 2026-11-21

- [x] PR #7 route/map work and PR #10 label fix are on current main; no production promotion was made in this batch.
- [x] Close PR #9 as superseded by the merged main map implementation; its map page/component are older and main is more complete.
- [x] Close PR #13 as superseded; current main already includes published/verified ward search, numeral normalization, stable pagination, English/slug matches and district matching.
- [ ] PR #2 is draft and diverged (25 commits behind); its directory-page patch removes shared header/footer. Preserve the remaining potentially useful ward-filter behavior for a selective review, not wholesale merge.
- [ ] PR #14 is the current integration branch for this statistics upgrade; preview is READY and HTTP 200 smoke checks were completed for /statistics and /search. Responsive/device interaction testing remains pending.


## Run 7 — 2026-11-22: directory ward-filter upgrade

### Delivered on the active integration branch
- [x] Added a ward selector to directory category pages. Selecting a union/municipality exposes its published, verified ward options; the selected `ward_id` filters results exactly. Filtered URLs remain noindex, and empty results now link to a category-specific submission.
- [x] Selectively extracted this useful behavior from draft PR #2; its wholesale branch remains rejected because it diverges and removes the shared site chrome from multiple pages.
- [x] Preview build READY for commit `a4b7d16`; compilation, lint/type checks, static generation (184/184) and route smoke checks passed. Keyboard and real-device testing remain pending.

### Fresh database coverage audit
- Project ref corrected to `tpqwauxufaydzhpkuvtk` (the previously recorded ID was one character too long).
- 67 published/verified directory entries: 22 education, 43 health and 2 government entries; all 67 have a source URL.
- 37 entries have union assignment, 7 municipality assignment and 4 ward assignment; none have validated coordinates. Directory GIS remains unsupported until coordinates are sourced and verified.
- Public verified administrative coverage: district 1, upazila 7, union 81, municipality 4, wards 765; 129 census-statistics records and 129 boundary records. Administrative-location records remain 0.
- Supabase security and health advisors reported no lints. Performance advisor reported 8 unused indexes (informational only; no indexes removed). No schema/data writes were made.

### Next priorities
1. **P1 — Preview verification:** [x] test `/directory/health` and `/directory/government` area/ward filters, `/directory/education` empty-state CTA, statistics, search, map, sitemap and robots. [ ] Keyboard, narrow viewport and screen-reader tests remain.
2. **P1 — Accessibility/mobile audit:** real viewport, focus order, labels, touch targets, reduced-motion and screen-reader behavior for chart, map and navigation.
3. **P2 — Data coverage:** identify authoritative coordinate sources for public directory records and administrative locations; avoid guessed points.
4. **P2 — Submission trust:** validate rate limiting and spam protection for public submissions.
5. **P3 — Reproducible dependency install:** review and add a lockfile, then run clean install/build/audit.

### Branch/PR record
- PR #14 remains the single active integration branch; new work is added there. Production/main promotion is not authorized.
- PR #2 was closed (not merged) after the useful ward-filter behavior was selectively extracted into PR #14 and preview-verified; its branch remains preserved. The 53-ahead/25-behind divergent branch was not merged wholesale.
- Other branch refs remain preserved; no branch deletion or production merge/deployment occurred.


### Preview verification follow-up — 2026-11-22
- [x] `/directory/health` municipality ward 5 returns the 250-bed Gaibandha General Hospital.
- [x] `/directory/government` municipality ward 6 returns the Gaibandha Sadar Upazila Health Office.
- [x] `/directory/education` with the same ward filter returns the empty state and category-specific submission link.
- [x] Area-only municipality filtering returns the health entry. The initial preview exposed a confirmed bug: `slice(12)` left the colon in the UUID. The prefix is 13 characters; both municipality filter sites now use `slice(13)`.
- [x] `/statistics`, `/search`, `/map`, `/sitemap.xml`, and `/robots.txt` returned HTTP 200 on the READY preview. Chart HTML contains SVG and all four metric controls.
- [ ] Keyboard navigation, real mobile viewport and screen-reader interaction remain unverified.


## Branch audit — 2026-11-22

- **PR #14** is the only open PR and the active integration branch (16 commits ahead/0 behind main). It remains Draft; no production promotion.
- **Merged and already represented on main:** PR #4 (editorial homepage/shared chrome), #5 (statistics/data catalog), #6 (build fix), #7 (district/transparency/GIS/search/map), #8 (union-ward source audit; still 0/729 union-ward polygon coverage), #10 (municipality labels), #11 (route/data audit), and #12 (PostCSS security override). The PostCSS override is already in main; no duplicate extraction.
- **Closed/superseded:** PR #1 (header/footer, superseded by #4), #9 (map implementation superseded by #7), #13 (search coverage already in main), and #2 (ward filter selectively extracted and preview-tested; branch preserved). No branch deleted.
- **Other refs preserved:** stale branches were compared with main; no additional active PR or verified unique implementation was identified to merge this run. Preserve all refs rather than force-delete or rewrite them.
- One active development branch is maintained; old branch refs remain archival. No production merge/deployment was performed.


## Feature discovery — official health-directory coverage

- **P2 idea/ready for research:** cross-check the 43 existing health-directory entries against the Ministry of Health/DGHS Facility Registry. The registry is an authoritative discovery source, but records must be individually reconciled, source-linked and verified before any additions; do not bulk-import or infer coordinates.
- **Dependencies/constraints:** existing publication/verification workflow, source provenance, duplicate handling and privacy review. This is coverage research only; no data write was made in this run.


## Directory filter label refinement — 2026-11-22

- [x] Remove repeated `পৌরসভা` suffix from directory area options when the verified municipality name already contains it. Keep one suffix and the upazila context.
- Confirmed root cause in the current published municipality data: all four municipality names already include `পৌরসভা`, while the directory filter formatter adds the suffix again.
- This UI-only change is in PR #14; no data/schema change. Preview verification is pending after the commit.
- [ready] Cross-check the 43 published health directory records against the official DGHS Facility Registry, using source identifiers and location context; only propose corrections or additions with traceable evidence. Do not bulk-import or replace records automatically.

### Next highest priorities
1. P1: keyboard/touch/reduced-motion/accessibility audit of directory filters and the map/statistics controls.
2. P1: verify search, area and exact ward filters on the newest PR preview after this patch.
3. P2: source-coverage review for health records using the official DGHS registry; keep corrections reviewable and avoid duplicate records.


### Preview verification update — 2026-11-22

- [x] Preview commit 366f593 reached READY. HTTP 200 checks passed for the municipality area-only health filter, exact ward-5 health filter (250-bed General Hospital), ward-6 government filter (Sadar Upazila Health Office), education empty-state + submission CTA, statistics chart, search, map, sitemap and robots.
- [x] Area option rendered as `গাইবান্ধা পৌরসভা · গাইবান্ধা সদর` (one suffix, context preserved); filtered directory URLs are noindex.
- The active branch was reconciled against current main and archived the previous head. The latest post-reconciliation preview commit 42f94 is queued; its deployment must be checked separately.

## Run 8 — global keyboard focus and motion preferences

- [ready] Added a consistent high-visibility focus ring for links, buttons, form controls, summaries and tabindex elements; footer uses a contrasting focus ring on its dark background.
- [ready] Expanded reduced-motion handling to all animations, transitions and smooth scrolling, while retaining the existing navigation motion override.
- Preview commit `c208249` is READY; compilation, lint/type checks and static generation (184/184) passed. Vercel Preview SSO blocks browser route inspection. Keyboard-only, mobile viewport and assistive-technology testing remain pending. No data/schema change.




## Run 10 — CSV export verification and current state (2026-11-22)

- Fixed CSV download lifecycle: the object URL is now revoked after a 1-second delay rather than immediately after the synthetic click.
- Local jsdom harness PASS: download button/filename, UTF-8 BOM, formula-leading text protection, source URL and delayed object-URL cleanup.
- Latest code Preview for commit `f8d20ce` is READY; Vercel build completed. Local lint and typecheck also passed after the fix. Preview routes remain SSO-protected from this audit environment.
- Earlier clean sandbox `npm ci`, build (184/184 static pages), lint/typecheck and `npm audit` (0 vulnerabilities) passed using the generated temporary lockfile and existing public Supabase environment values. The lockfile was not committed; reproducibility remains an open priority.
- Production route smoke: `/`, `/statistics`, `/search`, `/map`, `/robots.txt`, `/sitemap.xml`, `/directory/health`, `/district`, `/data` and `/sources` all returned HTTP 200.
- Production runtime error/log queries for the last 30 minutes returned no errors and no logs. The 24-hour error aggregation still contains seven historical municipality UUID-parsing errors; the fix is in PR #14 and is not in production.
- Branch review: PR #14 is the sole open integration PR (Draft). No stale branch was deleted; closed/superseded work remains preserved. No production merge or deployment.
- Remaining P1/P2 work: commit a lockfile after review, real mobile/keyboard/screen-reader testing, protected-preview route inspection, and DGHS facility source cross-check (no bulk import or inferred coordinates).


## Run 7 — 2026-11-22: keyboard access to the chart scroll region

- [in progress] Added a labelled, keyboard-focusable region around the horizontal-scroll SVG chart (`src/components/statistics-comparison.tsx`, commit `6b84337`). The region now has `role=region`, a Bengali `aria-label` and `tabIndex=0`.
- [ ] Verify the new Vercel preview, keyboard scrolling, chart description and data-table alternative before marking this item complete.

### Updated priorities
1. **P1 — Accessibility verification:** test keyboard focus and horizontal scroll for the statistics chart, then mobile viewport, screen-reader and navigation checks.
2. **P1 — Production directory UUID fix:** keep the verified `slice(13)` correction in PR #14; production main still has the historic defect. Do not promote without authorization.
3. **P2 — DGHS source cross-check:** compare the 43 health-directory entries with the official facility registry; record mismatches and source provenance only, no bulk import.
4. **P3 — Reproducible install:** package-lock remains absent. A local Git clone was blocked by DNS resolution; clean lockfile generation and npm-ci verification remain blocked until network access is available.


## Run 8 — 2026-11-22: page-specific social metadata

- Confirmed production HTML for /statistics, /map, and the directory-category preview inherited the homepage Open Graph title/description and root URL despite route-specific titles and canonical links.
- Implemented route-specific Open Graph and Twitter titles, descriptions and URLs for /statistics, /map, /district, and dynamic directory category pages in the integration branch. Filtered directory URLs still use the clean category URL for canonical/social URL and retain noindex.
- Acceptance: Preview HTML must show each route's own social title/description and absolute URL resolved from metadataBase; canonical remains unchanged; filtered category views stay noindex.
- Production route checks: homepage, statistics, map, robots.txt and sitemap.xml returned HTTP 200. Preview SSO was bypassed through the deployment-aware fetch path for HTML checks.
- Live data audit: 67/67 published/verified directory entries have source URL and source-check date (22 education, 43 health, 2 government); 129/129 verified census rows have population, households, source URL and checked date; 11/11 public tables have RLS enabled. Security/health advisors are clear; performance advisor reports 8 informational unused-index findings.
- Branch audit: 16 refs total (main plus 15 other refs); PR #14 is the only open PR and remains the sole active integration branch, 25 commits ahead/0 behind before this run. Older divergent refs were preserved, not deleted.
- Remaining SEO scope: audit dynamic detail pages, search/submit metadata, directory index, upazila/municipality index, and other static pages for route-specific social metadata.


## Run 8 consolidation — stable public ward pagination

- Reviewed closed PR #13 against main and the active integration branch. Its ward-search coverage and Bengali/Arabic digit handling are already present in the current main implementation; its older search page is not copied because main also contains the district result and richer existing UI.
- Selectively adopted the remaining useful query change: deterministic ordering for paginated public wards by ward_number, then id (ward_number.asc,id.asc). This prevents equal ward numbers across different administrative parents from changing page boundaries or producing unstable pagination.
- PR #13 remains closed and its branch is preserved; this change is recorded on the single active integration branch.


## Run 11 — shareable chart selection (2026-11-22)
- Added URL-backed metric selection to the interactive upazila comparison chart. The selected metric is represented by a `metric` query parameter (population remains the clean default); opening a shared link restores the chosen comparison and preserves other URL parameters/hash.
- Added a copy-share-link action with an accessible status message and selectable fallback URL if clipboard access is unavailable.
- Scope is client-side only: no schema, data, new dependency or production write.
- Acceptance: direct links for households/male/female restore the selected metric, switching metrics updates the URL without reload, unrelated query parameters and hash remain intact, and clipboard failure exposes a selectable link.
- Preview/build and browser interaction verification are pending for this commit; mark complete only after READY preview and tests.
- Next: verify query initialization/synchronization and clipboard fallback in a browser; continue mobile/keyboard/screen-reader audit.

## Run 12 — 2026-11-22: share-link and CSV export regression coverage

- Extracted statistics URL and CSV serialization into a small dependency-free helper so the existing share/export behavior can be tested directly.
- Added a built-in Node test suite for metric URL synchronization, clean default links, absolute share links, CSV BOM/provenance, quoting and formula-injection protection after whitespace/control characters.
- CSV formula protection now applies to string values only (numeric values remain numbers) and guards formula-leading strings after whitespace; embedded quotes, commas and line breaks remain quoted.
- Acceptance checks: `npm run test` runs the seven tests; Next build/type/lint and preview are still required for the integrated branch.
- No database writes, schema changes, new dependency or production promotion. Browser SSO/mobile/keyboard tests remain outstanding.


## Run 13 — automated quality gate (2026-11-22)

- Added `.github/workflows/quality-checks.yml` on the active integration branch. Pull requests targeting `main`, pushes to `main` or this integration branch, and manual runs execute dependency installation, ESLint, TypeScript checks and the Node regression tests.
- This adds CI coverage for the existing statistics share/CSV helper tests without exposing Supabase secrets or touching production data.
- CI uses `npm install` because the repository still has no committed lockfile. Reproducible `npm ci` remains a separate backlog item and this workflow does not claim to verify a clean lockfile install.
- The production build remains delegated to Vercel Preview for each branch commit; the CI workflow deliberately avoids build-time Supabase access.

### Next priorities
1. Check the actual Actions run result for this workflow and fix failures.
2. Browser-level test chart metric switching, share-link copy/fallback and CSV download; preview SSO/browser inspection is still a blocker.
3. Keyboard, mobile viewport, screen-reader and reduced-motion review.
4. Add a lockfile only after a real dependency-resolved generation and clean-install test.
5. Cross-check the remaining published/verified health directory records against DGHS, without bulk data changes.


### Directory filter input guard — 2026-11-22
- Added a shared parser for union/municipality area query values that requires the exact prefix and canonical UUID before any ward/database lookup. Invalid filters return an empty result instead of issuing a malformed UUID query.
- Regression tests cover both prefix lengths, empty selection, unknown prefixes and malformed UUIDs. Local lint, type-check, 12 tests and build (184/184) passed; remote CI/Preview verification pending.
- Lockfile generation and clean install/build were verified locally, but the sandbox cannot push to GitHub without credentials; the lockfile transfer remains deferred and CI still uses `npm install`.


### Directory area-filter guard — verified 2026-11-22
- Remote CI run #9 succeeded for commit `510210e`; lint, TypeScript and regression checks passed.
- Vercel Preview is READY for `510210e`; the build generated 184/184 static pages.
- Preview HTTP smoke checks returned 200 for `/statistics`, a valid municipality-filtered health directory route, and a malformed municipality-filter route. Both filtered routes remain noindex with the clean category canonical; no UUID/PostgREST error appears in the HTML.
- Local Node 22/npm 10.9.11 verification also passed lint, type-check, 12 regression tests, build (184/184) and `npm audit` (0 vulnerabilities).
- The lockfile remains uncommitted: generated and clean-install tested locally, but sandbox Git push was unavailable without GitHub credentials. CI still uses `npm install`; reproducibility is a remaining backlog item.

### Branch review — 2026-11-22
- Repository inventory: 16 refs including main; PR #14 is the only open PR. PRs #1–13 are closed and unmerged; their branches are preserved rather than deleted.
- Active integration branch compares 43 commits ahead and 0 behind main. Old branch comparisons show divergence; no destructive cleanup or production promotion was attempted.
- Next: browser-level keyboard/mobile/screen-reader testing; lockfile transfer/reproducible CI install; full DGHS cross-check of 43 health entries.


## Run 14 — directory filter context validation (2026-11-22)
- Validate area query selections against the actual union/municipality options loaded for the selected upazila; syntactically valid UUIDs alone are not sufficient.
- Ignore stale or mismatched area filters and stale ward filters instead of silently returning a misleading empty list. Render an accessible status explanation and reset the affected select to its neutral value.
- Added four focused Node regression tests for cross-upazila area mismatches and ward context.
- Acceptance: matching area + ward remain effective; area from another upazila and ward without its parent area are ignored; no database query is introduced by validation; public entries remain published/verified-only.
- Preview, GitHub CI and build verification pending. No schema or production changes.
- Next priorities: committed dependency lockfile/clean install, device + keyboard + screen-reader review, and full DGHS cross-check of 43 health records.


### Run 14 CI correction
- GitHub Actions run #19 failed TypeScript validation: the existing .d.mts declaration did not expose the two new helper exports. The runtime helper and nine focused tests passed in a local Node test harness, but the TypeScript declaration was incomplete.
- Updated src/lib/directory-area-filter.d.mts to declare both exports and their return types. The follow-up CI and Vercel Preview are pending; completion remains unverified until those checks finish.


## Run 14 — Verification complete (2026-11-22)
- Directory area and ward context guard implemented: a UUID-valid area must also be present in the options for the selected upazila; a ward must belong to the selected area's verified/published ward list. Stale/mismatched selections are ignored with an accessible Bengali status and neutral select values.
- Local Node regression harness: **16/16 tests passed** (9 directory-area/context tests and 7 statistics export/share tests).
- GitHub Actions #23: **SUCCESS** on commit `98ce7a77db5f6a3f6cfd50d887df9c92c0cf514f` (install, lint, TypeScript and regression tests). The earlier #19 type declaration failure was corrected.
- Vercel Preview commit `98ce7a7`: **READY**; Next.js build completed and generated **184/184** pages. Browser route inspection remains blocked by Preview SSO, so keyboard/mobile/screen-reader and direct filter-interaction tests remain outstanding.
- PR #14 was subsequently merged to `main` after verification. Divergent historical branches remain preserved; no branch deletion or production promotion.
- Production is still on main commit `2b0382de`. No database writes, schema changes or migrations. Current audit: 11/11 public tables RLS-enabled; security/health advisors 0 lints; performance 8 INFO unused-index findings.


## Run 16 — Shared accessible breadcrumbs (2026-11-22)
- Consolidated repeated breadcrumb markup into `src/components/breadcrumbs.tsx` with consistent Bengali navigation semantics, keyboard-visible focus styling, responsive wrapping, and a current-page marker.
- Added Schema.org `BreadcrumbList` JSON-LD using the configured canonical site URL.
- Reused the component across district, informational, search, directory, upazila, union, and municipality index/detail pages (17 routes).
- No database/schema changes. Existing data and publication rules remain unchanged.
- PR #15 (reproducible `npm ci` lockfile workflow) was verified: GitHub Actions quality run #27 SUCCESS and Vercel Preview READY; merged to main as commit `30f2dfcbc1fcadf255c3029350735baf4e4609be`.
- PR #14 statistics and directory filter integration was merged to main as `e3be35b`; current production deployment for that commit is READY.
- Supabase audit: 11 public tables with RLS enabled; security and health advisors report no findings. Eight unused-index notices are INFO only and were not acted on.
- The new breadcrumb branch awaits CI and Vercel Preview validation. Browser/device, screen-reader and direct visual testing remain limited by preview access.
- Historical branches with divergent/unmerged work are preserved; no destructive cleanup or schema/data changes were performed.


## Run 17 — Independent site chrome and public-data freshness (2026-11-22)
- Split shared brand logo, header, and footer into independently maintained modules; kept `site-chrome.tsx` as a compatibility barrel so existing route imports remain stable.
- Replaced the footer's generic tagline on the copyright row with the timestamp of the latest update across published/verified public records. The timestamp aggregation reads only update timestamps, uses existing Supabase REST/RLS, and caches for one hour.
- Footer date/time is rendered in Bengali for the Bangladesh timezone. If the timestamp cannot be retrieved, the footer falls back to a non-claiming unavailable message.
- No schema, migration, or production data changes. Preview/CI validation pending.
- Branch: `refactor/split-site-chrome-2026-11-22`.

## Run 18 — Active primary navigation state (2026-11-22)
- Extracted the primary navigation items and submission link into a shared configuration.
- Introduced a route-matching helper that normalizes trailing slashes and matches section routes by path segment.
- Split active-state rendering into a client component while keeping the site header and logo as server components.
- Added `aria-current="page"` to active links in desktop and mobile navigation and restrained visual highlighting using existing styles.
- Added regression tests for exact routes, nested routes, root matching, segment boundaries and trailing-slash normalization.
- No database/schema/data changes or new dependencies.
- Preview and remote CI verification pending.

### Next priorities
1. Verify active-route state on representative desktop/mobile pages, including nested directory and administrative routes.
2. Continue accessible navigation, keyboard and small-screen QA.
3. Review footer freshness behavior and production build after this integration.


## Run 19 — Skip navigation (2026-11-22)
- Added a keyboard-visible skip link in the shared header that moves focus past the topbar and primary navigation to the page-content anchor.
- The shared anchor is inserted immediately after the header so route pages can reuse the behavior without per-page markup changes.
- Focus styling uses the existing high-contrast focus-ring rule; the skip link remains visually hidden until keyboard focus.
- No database/schema changes, data writes, or dependencies.
- CI and Preview validation pending; verify focus/scroll behavior on desktop and narrow viewports.


## Run 21 — Bengali error recovery boundaries (2026-11-22)

- Added shared, accessible Bengali error fallback with a retry action and home link; it does not expose raw exception details.
- Added App Router segment error and root-layout error boundaries, reusing the fallback and retaining Bengali document language.
- Added contract regression tests for accessibility semantics, recovery actions, reuse and root document markup.
- No database/schema/data changes, dependencies or production writes. CI and Preview validation pending.


## Run 22 — Actionable search empty state (2026-11-22)

- Replaced the plain zero-result message on `/search` with a labelled, mobile-friendly guidance panel.
- Added spelling/short-name and Bengali/English search tips, shortcuts to upazila, municipality and directory indexes, and a new-information submission CTA. The CTA reminds contributors that submissions are checked before publication.
- Added static contract regression tests for the labelled state and recovery links.
- No database/schema/data changes, dependencies or production writes. GitHub CI and Vercel Preview validation pending.

## Run 23 — Sitemap content freshness (2026-11-22)

- Replaced synthetic sitemap-generation timestamps with source-backed update dates for the homepage, upazila, union, municipality and verified directory index/detail URLs.
- Static routes without a reliable source timestamp omit lastModified; malformed timestamps are also omitted.
- Added shared date validation and regression tests for latest-date selection, invalid/empty dates and input immutability.
- No database/schema/data changes or dependencies. Preview verification pending.


## Run 24 — Keyboard guidance for the statistics chart (2026-11-23)
- Linked the focusable horizontal-scroll chart region to concise Bengali keyboard instructions via `aria-describedby`.
- Kept the native disclosure and semantic table as the data alternative.
- Reworked regression assertions to check JSX attributes independently, avoiding unescaped curly-brace regex syntax that caused the CI test failure.
- No database/schema/data changes or dependencies. Keyboard, mobile and screen-reader testing remains pending.

## Run 25 — Administrative map accessibility contract tests (2026-11-23)
- Added regression coverage for the map layer/zoom control labels, SVG group instructions, keyboard-operable boundary paths, zoomed arrow-key panning, selected-area live region and alternative area list.
- Tests verify source-level accessibility contracts only; browser, screen-reader and real-device interaction testing remain separate validation.
- No map behavior, database, dependencies or production data changed.


## Run 28 — Sitemap administrative-data batching (2026-11-23)
- Reused the published/verified paginated union and municipality batch helpers in `/sitemap.xml`, replacing the per-upazila fetch loop (14 requests for the current seven upazilas) with two batch-query streams.
- Grouped fetched records by parent upazila while preserving URL generation and record-level/index-level `lastModified` behavior.
- Added source-contract regression coverage for batched helper use and parent grouping; no sitemap URL policy, publication filter, database schema, data, or dependencies changed.
- PR #30 search batching was merged after CI and its Preview `/search` route returned HTTP 200.


## Run 29 — Reject non-object JSON submissions (2026-11-23)
- The public submission route now rejects JSON primitives, `null`, and arrays with a Bengali HTTP 400 response before accessing submission fields; previously the route assumed a record and could throw on valid non-object JSON.
- Added a pure JSON-object guard and dependency-free tests. No schema, RLS, data, dependencies, or publication rules changed.
- GitHub CI and Vercel Preview are required. Submission-validation PRs #28 and #29 are being selectively consolidated into a single shared client/server validation PR.


## Run 30 — Skip search data reads on the empty search landing (2026-11-23)
- The `/search` page now leaves all directory collections empty until a non-empty normalized query is supplied, avoiding five Supabase data reads when users first open search without entering a term.
- Search result behavior and existing verified/public filters remain unchanged for non-empty queries. Added source-contract regression coverage for the guard.
- No database/schema/data changes, dependencies or publication rules changed.
- CI and Preview validation pending.


## Run 31 — Consolidate client/server submission validation (2026-11-23)
- Consolidates the client form UX and server-side validation from PRs #28 and #29 into one shared Unicode code-point validator, retaining the already-merged non-object JSON guard.
- The form normalizes before POST, shows code-point counts and precise min/max errors, and removes browser UTF-16 maxLength limits that could disagree with code-point validation.
- The API rejects invalid/oversized names (2–180) and details (10–3,000) without truncating them. No schema, RLS, data, dependencies or publication changes.
- Adds helper boundary/non-string tests and source-contract coverage for the form and API route. Preview and full CI verification pending.


## Run 32 — Batch statistics page data fetches (2026-11-23)
- Replaced per-upazila union and municipality requests plus per-municipality ward requests on `/statistics` with four parallel bounded data streams: upazilas, all published/verified unions, all published/verified municipalities and published/verified municipal wards.
- Added a reusable paginated municipal-ward helper and grouped fetched records by their parent IDs to preserve the existing display hierarchy and data filters.
- For the current dataset, the statistics page reduces the initial data-fetch streams from 19 requests to 4 (approximately 79% fewer); the page remains cached/revalidated as before.
- Added source-contract regression coverage. No schema, RLS, data, publication rules, dependencies or census calculations changed.
- Preview and production route verification pending.


## Run 33 — Batch directory data reads for sitemap (2026-11-23)
- Replaced the sitemap's per-category directory fetch loop with the existing bounded, paginated `getAllDirectoryEntries()` helper and grouped results by category in memory.
- The live dataset currently has 67 published/verified records (22 education, 43 health, 2 government); this reduces the sitemap directory read from eight category requests to one page request (87.5% fewer), while retaining pagination for larger datasets.
- Preserved detail/category URL generation, category-only inclusion when records exist, source-backed `lastModified`, and the public/verified query filters.
- Added source-contract regression tests for the batch helper, pagination, grouping, and date/URL generation. No schema, RLS, data, publication rules or dependencies changed.
- CI and Preview verification pending.


## Exact ward-number search optimization (2026-11-23)
- Numeric-only search queries now fetch published/verified ward rows by the exact ward number instead of loading the entire ward search dataset. Text queries continue using the full bounded public ward search fetch.
- Live database audit on 2026-11-23 found 765 published/verified wards across numbers 1–9 (85 per number); the exact-number path reduces ward rows fetched for a numeric search from 765 to 85 (~88.9%) while preserving RLS and publication filters.
- Added regression contracts for exact-number filtering, input validation and pagination. No database schema/data changes.


## Run 34 — Live source-coverage transparency (2026-11-23)
- Added a live coverage snapshot to `/sources` for the published/verified census and directory source metadata, showing record counts, source-URL coverage, checked-date coverage, latest source-check date, and census-level/directory-category breakdowns.
- Uses bounded pagination and only minimal source metadata fields; no names, contact details, submission data, or unpublished records are fetched for the snapshot.
- The page remains readable when either dataset snapshot is temporarily unavailable and retains the static source/coverage policy content.
- Live Supabase audit: 129 census records and 67 directory records have source URLs and checked dates (full coverage). Latest checks were 2026-11-16 for census and 2026-11-15 for directory; the UI derives these values at runtime rather than hardcoding them.
- No schema, RLS, database data, publication rules, dependencies, or production writes changed.
- CI, Vercel Preview and production route verification pending.


## Run 34 — Classification correction (2026-11-23)
- The production source-coverage snapshot initially grouped the 36 ward-linked census records under “other” because `census_statistics.ward_id` does not populate its own municipality/union parent fields.
- Live read-only SQL join confirmed all 36 linked ward records are municipal wards (`wards.municipality_id` populated); no union-ward census records are present.
- The source metadata fetch now uses the existing PostgREST `ward_id → wards` relationship to read only the linked ward’s municipality/union classification and labels the records correctly. No database writes or schema changes.
