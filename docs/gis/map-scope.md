# Public administrative GIS map scope

**Approved scope:** 2026-11-21

## Interactive map layers

The public map is limited to current, published and verified administrative boundaries:

| Level | Expected |
|---|---:|
| District | 1 |
| Upazila | 7 |
| Union | 81 |
| Municipality | 4 |
| **Total** | **93** |

All ward-level GIS layers (union wards and municipal wards) are excluded. The existing 36 ward-boundary records and ward entities are retained in the database; they are not map layers. Union-ward polygon acquisition and the 729-ward polygon coverage target are discontinued.

Ward-level directory records, profiles or sourced statistics may still appear in text/list/profile pages when verified and published. This does not imply ward polygon or Census coverage.

## Data flow and quality

- The public GeoJSON RPC remains read-only and relies on existing RLS and publication/verification filters.
- The map page filters the RPC response to the four supported levels before passing it to the interactive client.
- No geometry is fabricated or inferred.
- Four municipality polygons are derived from municipal-ward geometry aggregation; independent official boundary validation is not claimed.
- No production database records or schema were changed for this scope update.

## Accessibility

The map includes keyboard-selectable features, keyboard panning when zoomed, zoom/reset controls, an accessible selected-area panel and a text/list alternative.
