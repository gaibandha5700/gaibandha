# Gaibandha Union-Ward Polygon Source Audit

**Audit date:** 2026-11-21  
**Database:** `tpqwauxufaydzhpkuvtk` (read-only audit)  
**Scope:** 81 unions × 9 administrative wards = 729 expected union-ward polygon features.

## Database coverage

- `wards`: **729/729 union ward entity rows**; every union has ward numbers 1–9.
- Current `administrative_boundaries` rows keyed by union-ward `ward_id`: **0/729**.
- The 36 current ward polygons in the boundary table are municipality wards, not union wards.
- The 129 current published/verified boundary rows audited separately cover district/upazila/union and municipal wards; they do not represent the 729 union wards.
- This inventory proves database entity coverage only. It does **not** prove polygon coverage or the independently sourced existence of every ward polygon.

The per-ward tracking inventory is in [union-ward-coverage.csv](./union-ward-coverage.csv). It was generated from the live database IDs, parent relationships, ward numbers and boundary counts. Every row is currently marked `missing`.

## Sources investigated

| Source | Relevant scope / evidence | Union-ward polygon finding | Status |
|---|---|---|---|
| ArcGIS Bangladesh CRIIPS (BBS 2022 attribution), MapServer layers 121–123 | District, upazila, union and municipal-ward boundaries; Layer 123 contains union polygons and municipal wards | Layer 123 does not supply 729 rural union-ward polygons; existing importer intentionally imports only 79 name-matched unions and 36 municipal wards | **Insufficient** |
| Bangladesh OCHA COD-AB / HDX | Administrative boundaries up to upazila (ADM3); union level in other sources/catalogues | No rural union-ward polygon layer found in the reviewed catalogue/source descriptions | **Insufficient** |
| geoBoundaries Bangladesh ADM levels | ADM0–ADM4 available; ADM4 references union/municipality geography in reviewed datasets | No Gaibandha rural union-ward layer identified | **Insufficient** |
| LGED GIS Portal | Union/upazila base maps, roads and infrastructure; published portal and maps reviewed | Public map products found at union/upazila scale; no reusable vector layer of the nine rural union-ward polygons located. Some LGED map sheets state internal-use/non-authoritative restrictions | **Candidate, not located** |
| DGHS EPI geo-enabled microplanning | Field/crowd-mapped service-delivery geography | The documented system uses **3 operational wards per union**, each subdivided into sub-blocks. These are not the 9 Union Parishad wards in this project and cannot be substituted. Public methodology describes georeferencing/digitization and cross-checking; downloadable Gaibandha ward vectors were not found | **Not equivalent / no usable export found** |
| BBS Community Report: Gaibandha (2011) and BBS geocode references | Census geocode and community-level tables, including urban ward and community records | Reviewed search excerpts show municipality ward data and village/community tables; no rural union-ward boundary vectors or reliable village-to-nine-ward crosswalk located | **Insufficient** |
| DPHE geocode/location list (published PDF, 2024) | District/upazila/union/village listing; municipal ward entries appear in the hybrid Union/Ward field | It provides location/geocode listings, not rural union-ward polygons; village records alone cannot define boundaries without an evidenced ward crosswalk | **Insufficient** |
| DLRS Integrated Online Map Purchase System | Official CS, SA, RS, BRS and BDS mouza/cadastral map sheets | Mouza polygons/maps are not Union Parishad ward polygons. No evidenced ward-to-mouza crosswalk was found; tracing mouza boundaries as ward lines would be unjustified | **Potential evidence only; paid and not equivalent** |
| Gaibandha Municipality GIS/ArcGIS ward services and SFD/CWIS reports | Nine municipal wards and municipal geography | Urban municipal wards only; not union wards | **Not equivalent** |
| OpenStreetMap / Overpass | Potential volunteer-mapped boundaries | No Gaibandha rural union-ward layer surfaced in the search. Direct Overpass query was not completed because the runtime network/DNS was unavailable | **Unverified candidate** |

## Source references

- CRIIPS service: https://www.arcgisbd.com/server/rest/services/ADB005/CRIIPS/MapServer
- OCHA COD-AB catalogue: https://data.humdata.org/dataset/cod-ab-bgd
- LGED GIS portal: https://gis.lged.gov.bd/
- LGED map/resources: https://oldweb.lged.gov.bd/UnitResources.aspx?UnitID=5
- DGHS EPI GIS methodology: https://gisdashboard.dghs.gov.bd/gis-methodology
- BBS Gaibandha Community Report search/access: https://www.bbs.gov.bd/
- DPHE geocode PDF (source list): https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-dphe/2024/12/7756ba0ce2e2429e9b2b55ec171b6886.pdf
- DLRS map purchase portal: https://map.settlement.gov.bd/

## Exact blocker

No source discovered or acquired in this run supplies a complete, reusable, defensible vector layer of **the 9 administrative Union Parishad ward boundaries for all 81 Gaibandha unions**. Existing union polygons, municipal wards, EPI's 3 operational wards, village lists, cadastral mouza maps, ward-member lists and project locations are not interchangeable with these polygons.

## Required evidence to proceed

Any source package must provide one of:

1. actual vector ward polygons with ward number and parent-union identity; or
2. source ward maps with documented scale/coordinate control and explicit ward boundary lines, accompanied by evidence tying the map to the current union and ward numbering; or
3. an authoritative crosswalk of village/mouza extents to Union Parishad ward numbers **plus** sourced village/mouza polygon geometry whose use is permitted and whose dissolve relationship is evidenced.

A source package should include source URL, publisher, edition/date, license/terms, acquisition date, and parent/ward crosswalk. The staged file must be validated and remain unpublished/unverified until reviewed. Do not split union polygons, infer boundaries from centroids, create Voronoi lines, or substitute EPI service areas.

## Next acquisition targets

- Request ward-boundary GIS/vector files or scanned ward maps from BBS, LGED GIS Unit, Gaibandha District/Upazila offices and the relevant Union Parishads.
- Investigate whether BBS Census 2022 enumeration-area/mouza data includes a documented crosswalk to the nine Union Parishad wards.
- Check DLRS mouza-map availability/terms and seek a documented ward-to-mouza crosswalk before considering any derived dissolve.
- Investigate OSM/other community sources when network access is available, but treat any found polygons as independently mapped and unverified until reviewed.


## Additional official Union map candidate located

- **Mohdipur Union (Palashbari), National Portal map page**, last updated 18 October 2016: https://mohdipurup.gaibandha.gov.bd/pages/static-pages/69772bbbc4774958d7c0c21c
- Published map image: https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mohdipurup-gaibandha/2024/12/5e2284a26f1e4d53969637213056e090.jpg
- The scanned map shows colored internal regions and locality labels. The page calls it a union map, but the reviewed image does **not** identify the colors with ward numbers or provide coordinate control/scale. It is therefore a candidate for evidence review only, not a polygon source ready to digitize/import.
- Other National Portal union pages expose “মানচিত্রে ইউনিয়ন” and ward-based population pages. These may be useful acquisition targets, but map images and ward population/village tables must not be assumed to be spatially aligned or to define ward boundaries. Each map would need source-specific review, an evidenced ward crosswalk, georeferencing evidence, and validation before any digitization.
- Example ward table found: Sreepur Union (2014) lists ward numbers and villages, but its historical village crosswalk is not proof of current boundary lines: https://sreepurup.gaibandha.gov.bd/pages/static-pages/ওয়ার্ড-ভিত্তিক-লোক-সংখ্যা-1c6543-69770476c4774958d7bf634e
