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
- [ ] Route-level error/empty states and accessibility review (custom not-found page added; audit pending)
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
- Search matching now normalizes Bengali numerals to Arabic for text matching and includes English administrative names/slugs for upazilas, unions, municipalities, wards, and directory records. Pure numeric ward queries match the exact ward number rather than substring values. The updated preview build is pending verification.\n\n## Quality gates / status
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
\n\n## Continuous feature roadmap and changelog — 2026-11-21\n\n### Delivered in this development batch\n- [x] Interactive upazila comparison chart on `/statistics`: users can switch among population, households, male and female totals; the chart sorts descending and includes an accessible data-table alternative. Values are sourced from existing published/verified 2022 upazila fields; no database writes or new dependencies.\n- Source link is drawn from the existing BBS source metadata. Missing values remain excluded from the chart, not converted to zero.\n- This implementation is in a preview branch; it is not production.\n\n### Prioritized ongoing feature backlog\n1. **P1 — Search quality and coverage:** validate the ward-search preview against current main; test Bengali/English names, slug, numeral normalization, pagination and exact ward-number matching.\n2. **P1 — Responsive/accessibility verification:** test search, chart, map, tables and navigation with keyboard, screen reader and real mobile viewports; correct contrast, focus, overflow and touch targets.\n3. **P1 — Data transparency:** audit source/checked dates and coverage indicators across statistics, area profiles and directory entries; distinguish unavailable data from zero.\n4. **P2 — Statistical exploration:** add comparison filters/drill-down only where source fields and complete coverage support them; consider district-to-upazila, union and municipality comparisons without summing overlapping totals.\n5. **P2 — Directory enhancements:** improve category/location filtering, result sorting and empty states; measure performance and keep publication filters intact.\n6. **P2 — Submission trust & safety:** review abuse prevention, validation, rate limiting and correction workflow; do not expose pending submissions or submitter contacts.\n7. **P2 — Search/SEO/route audit:** verify canonical metadata, indexability, sitemap, breadcrumbs, internal linking and route-level empty/error states.\n8. **P3 — Reproducible builds:** resolve the missing lockfile and npm cache configuration warning, then validate clean install/build in an environment with network access.\n9. **P3 — Performance:** evaluate route payloads, caching, images, map payload and Core Web Vitals with actual measurements before optimizing.\n\n### Roadmap maintenance rules\n- Each run re-evaluates priorities against current evidence and marks items complete only after code and verification.\n- Avoid speculative features or features requiring unsupported/incomplete data.\n- Consolidate active work into the integration branch; keep production/main promotion gated by explicit authorization.\n