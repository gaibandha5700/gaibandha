# গাইবান্ধা প্রশাসনিক GIS সীমানা আমদানি

## উৎস

- ArcGIS Bangladesh CRIIPS — BBS 2022 District Boundary (Layer 121)
- ArcGIS Bangladesh CRIIPS — BBS 2022 Upazila Boundary (Layer 122)
- ArcGIS Bangladesh CRIIPS — BBS 2022 Union Boundary (Layer 123)
- LGED GIS Portal: https://gis.lged.gov.bd/
- LGED GIS resources: https://oldweb.lged.gov.bd/UnitResources.aspx?UnitID=5

ArcGIS service-এ District, Upazila এবং Union boundary layer আছে। Union layer-এ Municipal field-ও রয়েছে, তাই চারটি পৌরসভার polygon পাওয়া গেলে আলাদা municipality entity হিসেবে map করা হয়।

## নিরাপত্তা

- Script default-এ **dry-run** করে; database write করে না।
- শুধু `--apply` দিলে import হবে।
- আমদানি করা সব geometry `is_published=false` এবং `is_verified=false` থাকবে।
- সরকারি LGED/BBS GIS source-এর সঙ্গে cross-check না করা পর্যন্ত public website-এ দেখানো যাবে না।
- Ward boundary এই তিনটি layer-এ নেই; তাই ward geometry import করা হয় না।
- Feature count, entity-name match, parent-upazila match এবং Bangladesh coordinate extent validation ব্যর্থ হলে কোনো write হবে না।

## চালানোর নিয়ম

প্রকল্পের root directory-তে:

```bash
export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

node scripts/import-gaibandha-boundaries.mjs
```

Dry-run-এ ১ জেলা, ৭ উপজেলা, ৮১ ইউনিয়ন ও ৪ পৌরসভার geometry match হতে হবে।

সব count ও match ঠিক থাকলে:

```bash
node scripts/import-gaibandha-boundaries.mjs --apply
```

Service-role key কখনো GitHub-এ commit করবেন না। Import শেষে Supabase-এ row count ও geometry validity যাচাই করতে হবে।
