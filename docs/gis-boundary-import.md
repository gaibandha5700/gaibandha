# গাইবান্ধা প্রশাসনিক GIS সীমানা আমদানি

## উৎস

- ArcGIS Bangladesh CRIIPS — BBS 2022 District Boundary (Layer 121)
- ArcGIS Bangladesh CRIIPS — BBS 2022 Upazila Boundary (Layer 122)
- ArcGIS Bangladesh CRIIPS — BBS 2022 Union Boundary (Layer 123)
- LGED GIS Portal: https://gis.lged.gov.bd/
- LGED GIS resources: https://oldweb.lged.gov.bd/UnitResources.aspx?UnitID=5

ArcGIS service-এর BBS 2022-লেবেলযুক্ত District, Upazila ও Union boundary layer ব্যবহার করা হয়। Union layer-এ Municipality field থাকলে পৌরসভার polygon আলাদা entity হিসেবে map করা হয়। এই ArcGIS service-কে সরকারি LGED/BBS-hosted authoritative source হিসেবে ধরে নেওয়া হচ্ছে না।

## নিরাপত্তা ও যাচাই

- Importer default-এ **dry-run**; কোনো database write করে না।
- শুধু `--apply` দিলে Supabase-এর service-role-only RPC দিয়ে geometry লেখা হয়।
- RPC GeoJSON-কে PostGIS MultiPolygon, EPSG:4326-এ রূপান্তর করে এবং geometry validity পরীক্ষা করে।
- সব imported row `is_published=false`, `is_verified=false` থাকবে।
- সরকারি LGED/BBS GIS source-এর সঙ্গে cross-check না হওয়া পর্যন্ত public website-এ দেখানো যাবে না।
- Ward boundary এই তিনটি layer-এ নেই; তাই ৭৬৫টি ward-এর boundary এখানে আমদানি করা হয় না।
- এই source থেকে প্রত্যাশিত feature count: জেলা ১, উপজেলা ৭, ইউনিয়ন ৮১ (মোট ৮৯)। পৌরসভা ৪টির polygon এই তিনটি BBS layer-এ নিশ্চিত নয়; LGED বা অন্য যাচাইকৃত source না পাওয়া পর্যন্ত সেগুলো বাদ থাকবে।
- ইউনিয়ন matching-এ parent upazila-ও যাচাই করা হয়; একই নামে একাধিক ইউনিয়ন থাকলেও ভুল entity-তে যুক্ত হবে না।

## চালানোর নিয়ম

প্রকল্পের root directory-তে:

```bash
export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

node scripts/import-gaibandha-boundaries-v2.mjs
```

Dry-run-এ সব feature count ও নামের matching ঠিক থাকলে:

```bash
node scripts/import-gaibandha-boundaries-v2.mjs --apply
```

পুরোনো `scripts/import-gaibandha-boundaries.mjs` path-টিও compatibility entry point হিসেবে v2 importer চালায়।

Service-role key কখনো GitHub-এ commit করবেন না। Import শেষে row count, publication flags এবং geometry validity পুনরায় যাচাই করতে হবে। Source attribution ও administrative match-এর human review ছাড়া publish করা যাবে না।
