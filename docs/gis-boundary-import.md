# গাইবান্ধা প্রশাসনিক GIS সীমানা আমদানি

## উৎস ও coverage

- ArcGIS Bangladesh CRIIPS — BBS 2022 District Boundary (Layer 121)
- ArcGIS Bangladesh CRIIPS — BBS 2022 Upazila Boundary (Layer 122)
- ArcGIS Bangladesh CRIIPS — BBS 2022 Union Boundary (Layer 123)
- LGED GIS Portal: https://gis.lged.gov.bd/
- LGED GIS resources: https://oldweb.lged.gov.bd/UnitResources.aspx?UnitID=5

Layer 123-এ ৮১টি ইউনিয়ন polygon এবং চার পৌরসভার ৩৬টি ওয়ার্ড polygon রয়েছে। `Municipal` field দিয়ে পৌর ওয়ার্ড শনাক্ত করে `UnName` থেকে ওয়ার্ড নম্বর মিলিয়ে import করা হয়; পৌরসভার আলাদা parent polygon তৈরি করা হয় না।

এই ArcGIS service-এ BBS 2022 লেবেল থাকলেও এটি BBS/LGED-এর নিজস্ব hosted service নয়। তাই imported rows যাচাই ও প্রকাশের আগে সরকারি উৎসের সঙ্গে cross-check আবশ্যক।

## প্রত্যাশিত ও unresolved feature

- জেলা: ১
- উপজেলা: ৭
- মেলানো ইউনিয়ন: ৭৯
- পৌর ওয়ার্ড: ৩৬
- মোট importable boundary: ১২৩

দুটি ইউনিয়নের নাম source ও database-এ আলাদা বানানে এসেছে: Sadullapur-এর `Dhaperhat` বনাম `Daperhat`, এবং Sundarganj-এর `Chhaparhati` বনাম `Chhapahati`। নির্ভরযোগ্য geo-code crosswalk ছাড়া এই দুটি feature অনুমান করে যুক্ত করা হয় না; importer এগুলো unresolved হিসেবে রিপোর্ট করে।

এই source-এ ৭২৯টি ইউনিয়ন ওয়ার্ডের boundary নেই। সেগুলো আমদানি করা হয় না।

## নিরাপত্তা ও যাচাই

- Importer default-এ **dry-run**; কোনো database write করে না।
- শুধু `--apply` দিলে Supabase-এর service-role-only RPC দিয়ে geometry লেখা হয়।
- RPC GeoJSON-কে PostGIS MultiPolygon, EPSG:4326-এ রূপান্তর করে এবং geometry validity পরীক্ষা করে।
- সব imported row `is_published=false`, `is_verified=false` থাকে।
- জেলা/উপজেলা/ইউনিয়ন/ওয়ার্ড entity matching ব্যর্থ হলে import থেমে যায়।
- একই entity-এর duplicate boundary শনাক্ত হলে import থেমে যায়।
- Source attribution ও administrative match-এর human review ছাড়া publish করা যাবে না।

## চালানোর নিয়ম

প্রকল্পের root directory-তে:

```bash
export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

node scripts/import-gaibandha-boundaries-v2.mjs
```

Dry-run-এর matched count ঠিক থাকলে:

```bash
node scripts/import-gaibandha-boundaries-v2.mjs --apply
```

পুরোনো `scripts/import-gaibandha-boundaries.mjs` path-টিও compatibility entry point হিসেবে v2 importer চালায়। Service-role key কখনো GitHub-এ commit করবেন না।
