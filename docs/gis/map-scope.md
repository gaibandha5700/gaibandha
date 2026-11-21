# Administrative GIS map scope

**Status:** Active public-map scope, approved product direction (2026-11-21).

## Map layers

The public interactive map is limited to verified and published boundaries at these levels:

| Level | Expected | Current boundary coverage (live audit) |
|---|---:|---:|
| District | 1 | 1 |
| Upazila | 7 | 7 |
| Union | 81 | 81 |
| Municipality | 4 | 4 |
| **Total** | **93** | **93** |

The 36 municipal-ward boundary records remain in the database as source data but are not map layers in the public interactive map. Union-ward GIS acquisition is discontinued as a project requirement.

## Ward records remain available outside GIS

Ward entities, directory records, ward profiles, and ward-level statistics can remain in the database and be shown as lists, text, or profile pages when the data is genuinely sourced, published, and verified. Their existence, publication status, or nine-ward structure is not a claim that GIS polygons or Census figures exist.

## Data and safety rules

- Do not delete or rewrite ward records or their historical GIS research as a consequence of this scope change.
- Do not display or require ward polygon layers, ward polygon coverage matrices, or ward-map controls in the public map.
- The map must show only current, published, verified boundaries and must respect database RLS.
- No missing polygon is to be fabricated or inferred.
- The existing district, upazila, union, and municipality polygons are retained.
- Source provenance, current boundary status, and publication/verification requirements continue to apply.

## Verified database audit (2026-11-21)

The Supabase live audit confirmed 129 current published/verified boundary rows in total: 1 district, 7 upazilas, 81 unions, 4 municipalities, and 36 ward records. The 93 target map boundaries are present with geometry. The remaining 36 ward records are excluded from the interactive map scope, not deleted.

The legacy [union-ward source audit](./union-ward-source-audit.md) and [coverage inventory](./union-ward-coverage.csv) are retained as historical research artifacts, not active completion targets.
