#!/usr/bin/env node
// Backward-compatible entry point. The maintained importer uses the secure
// PostGIS RPC so GeoJSON is converted to EPSG:4326 geometry server-side.
import "./import-gaibandha-boundaries-v2.mjs";
