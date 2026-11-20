# Public website architecture and implementation checklist

Bengali-only, mobile-first public information platform. This document tracks the approved route architecture and implementation progress against the actual repository.

## Route audit (main snapshot: 2026-11-21)
- [x] `/` editorial homepage, search, admin shortcuts, directory and map preview
- [x] `/upazila`, `/upazila/[slug]`, `/upazila/[slug]/[unionSlug]`, union ward route
- [x] `/municipality`, `/municipality/[slug]`, municipality ward route
- [x] `/directory`, category, detail, submission API and submission page
- [x] `/search`, `/statistics`, `/data`
- [x] `/district` — district profile added (branch preview pending)
- [x] `/map` — GIS page and client SVG explorer added; GeoJSON RPC migration must be applied before the feed is available
- [x] `/sources`, `/about`, `/privacy`, `/contact` — concise transparency pages added
- [ ] Route-level error/empty states and accessibility review (custom not-found page added; audit pending)
- [ ] Verify sitemap and mobile navigation coverage after preview

## Data presentation and publication rules
- District → upazila → union / municipality → wards only where the actual published dataset supports them.
- Use only verified and published public records. Do not expose raw submissions, contacts, review statuses, internal fields or credentials.
- Display source, data year, checked date and methodology where available. Missing values are not zero.
- Never sum overlapping administrative levels into district totals.
- Directory coordinates must be validated and verified; don't map guessed coordinates.
- Derived municipal polygons remain explicitly identified; independent official polygon verification is not implied.

## GIS coverage (database audit, 2026-11-21)
- 129 published/verified current boundary rows: district 1, upazila 7, union 81, municipality 4, municipal ward 36.
- Union-ward polygons are not covered. Administrative locations table has no published records.
- RLS on administrative boundaries limits public reads to published + verified rows.
- GIS attribution: ArcGIS Bangladesh CRIIPS, MapServer layers 121/122/123, BBS 2022 attribution. Four municipal polygons are derived from municipal ward geometries.
- The new GeoJSON RPC uses SECURITY INVOKER and relies on existing RLS and verified/published parent filters. It is additive and is not applied to the live database in this batch.

## Roadmap
1. Route audit, navigation, sitemap and this document.
2. Complete data coverage and pagination/filters at every admin level and directory.
3. Area profiles and statistical presentation.
4. GIS map with verified-only GeoJSON, accessible list alternative and coverage gaps.
5. Sources, verification, correction path and update transparency.
6. Search, SEO, canonical/breadcrumbs and sitemap.
7. Responsive/accessibility/performance/security/testing review.

## Quality gates / status
- [x] Inspect main branch tree, routes, shared chrome, data helper, schema, RLS and deployment.
- [x] Add route coverage and transparency page batch on a branch.
- [ ] Apply GeoJSON RPC migration (reviewed, additive; requires database deployment review).
- [ ] Verify preview build, typecheck/lint and routes via Vercel/GitHub checks.
- [ ] Verify map RPC/feature count against live RLS and check mobile interaction.
- [ ] Merge only after preview evidence and build checks pass; then verify production deployment.
