# Public website architecture and implementation checklist

Bengali-only, mobile-first public information platform. This document tracks the approved route architecture and implementation progress against the actual repository.

## Route audit (main snapshot: 2026-11-21)
- [x] `/` editorial homepage, search, admin shortcuts, directory and actual published district-boundary SVG preview; recent verified/public directory updates (source-check date where present, otherwise record update date)
- [x] `/upazila`, `/upazila/[slug]`, `/upazila/[slug]/[unionSlug]`, union ward route
- [x] `/municipality`, `/municipality/[slug]`, municipality ward route
- [x] `/directory`, category, detail, submission API and submission page
- [x] `/search`, `/statistics`, `/data`
- [x] `/district` — district profile added (preview build READY; latest route HTTP probes remain blocked by preview protection)
- [x] `/map` — GIS page and client SVG explorer added; additive GeoJSON RPC migration is applied and tested under `anon`; zoom/reset, bounded pointer pan and keyboard pan added
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
- The new GeoJSON RPC uses SECURITY INVOKER and relies on existing RLS and verified/published parent filters. It was applied as an additive migration on 2026-11-21 and tested as `anon`; 129 FeatureCollection entries were returned with complete geometry/profile links. GeoJSON tolerance was benchmarked under `anon`: 0.0005 reduced payload to 593,335 bytes (~50% smaller than 0.00015 at 1,173,215 bytes) without reducing feature count; the page uses 0.0005. The preview for commit `2cb80a2` returned `/map` HTTP 200 with the SVG, no fallback, and a ~404 KB HTML response (7 upazila paths on the initial layer). Preview `/map` was built before the migration, so its cached fallback must be refreshed by a new deployment.

## Homepage coverage (2026-11-21)
- The homepage now renders the actual published district boundary geometry from the public GeoJSON feed as a server-rendered SVG preview, rather than a decorative contour graphic. It retains a clearly labelled fallback if the geometry is unavailable.
- The homepage lists the three most recently updated public, verified directory entries. It distinguishes source-check dates from record-update dates and does not label record edits as verification.
- The GeoJSON feed is server-fetched and cached; it is not placed in the browser client bundle. This preview reuses the existing RPC and adds no database migration.

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
- [x] Apply GeoJSON RPC migration (additive; applied 2026-11-21 and tested under the anon role).
- [x] Verify Vercel build, typecheck and generated route output: commit `39611f7` is READY; the build compiled, checked types and generated 184/184 pages. The route table includes `/map`, `/district`, `/sources`, `/about`, `/privacy`, `/contact`, `/statistics`, `/search`, and `/directory`. Direct HTTP probes of the latest preview are blocked by Vercel preview protection; earlier HTTP probes predate the pan commit.
- [ ] Visual mobile viewport audit (not available in this run; static responsive-code review only).
- [ ] Verify homepage SVG preview and recent-update section in a new READY preview; geometry fetch is server-side and uses the existing RPC.
- [x] Verify map RPC/feature count under anon RLS: 129 geometries, no missing geometry/profile URL; levels 1/7/81/4/36.
- [x] Add keyboard-friendly zoom slider, explicit zoom-in/zoom-out buttons and a full-map reset control.
- [x] Implement pointer-based pan when zoomed above 1×, with drag selection suppression and bounded pan; keyboard Enter/Space selection remains.
- [x] Add bounded arrow-key panning when a map feature is focused and zoom exceeds 1× (new commit; preview build pending).
- [ ] Check interactive map pan/selection and arrow-key panning on a real mobile viewport and screen reader. Pointer-pan JSX fragment fix (`b42db49`) preview build is READY; latest route HTTP probes and real-device checks remain pending.
- [ ] Merge after the latest keyboard-pan preview build, mobile viewport and screen-reader audit; then verify production deployment.
