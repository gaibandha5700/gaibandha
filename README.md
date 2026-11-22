# আমাদের গাইবান্ধা — ডিজিটাল জেলা তথ্যভান্ডার

গাইবান্ধা জেলার উপজেলা, ইউনিয়ন, পৌরসভা, ওয়ার্ড, শিক্ষা প্রতিষ্ঠান, স্বাস্থ্যসেবা, সরকারি অফিস, স্থানীয় ব্যবসা, দর্শনীয় স্থান ও অন্যান্য যাচাইকৃত তথ্যের পাবলিক তথ্যভান্ডার।

## Technology
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Supabase (existing PostgreSQL database and public read integration)
- Vercel deployment

## Local development
```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Dependency management and CI
- Commit `package-lock.json` with dependency changes.
- Use `npm install` when adding or updating dependencies locally, then review and commit the lockfile.
- Use `npm ci` for clean, reproducible installs (CI and fresh local setup).
- GitHub Actions runs lint, TypeScript checks and regression tests on pull requests and main pushes. Vercel validates the production build.

## Environment variables
Set the canonical production origin in Vercel Project Settings → Environment Variables:

```env
NEXT_PUBLIC_SITE_URL=https://YOUR-PRODUCTION-DOMAIN
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Use the exact preferred HTTPS origin (including `www` only if that is the canonical host). The app falls back to the configured production project URL when this variable is absent.

The public website reads published and verified records from the existing Supabase project using the anon key and Row Level Security. Never expose a Supabase service-role key in a `NEXT_PUBLIC_*` variable or browser code. Do not recreate the database or reapply historical migrations to an already populated project.

## Public data and publication
- Public pages must only expose records that are both `is_published = true` and `is_verified = true`.
- Keep source names, source URLs, and source-check dates with factual records wherever available.
- Admin writes must remain behind authenticated, authorized server-side workflows.
- Do not publish placeholder, draft, duplicate, or thin-content pages just to increase URL counts.

## Technical SEO
- `src/app/robots.ts` serves `/robots.txt`.
- `src/app/sitemap.ts` serves `/sitemap.xml` and includes only public, verified, indexable pages.
- Sitemap directory records are paginated to avoid omitting records beyond a single API response.
- Search results and filtered directory views are not indexable; their canonical points to the clean category URL.
- Ward detail pages remain crawlable through parent-page links but are excluded from indexing until they contain sufficient unique information.
- `src/app/layout.tsx` defines Bengali document language, global metadata, Open Graph/Twitter metadata, robots directives, and WebSite JSON-LD.
- Detail pages should have unique titles, descriptions, canonical URLs, useful visible content, source attribution, and appropriate structured data where eligible.

After deployment:
1. Verify `/robots.txt` and `/sitemap.xml` return HTTP 200.
2. Confirm sitemap URLs use the canonical HTTPS host and return indexable pages.
3. Submit `https://YOUR-PRODUCTION-DOMAIN/sitemap.xml` in Google Search Console.
4. Monitor Page indexing, Sitemaps, Core Web Vitals, and Search results reports.

## Content strategy
Create substantive district information pages (history, heritage, geography, rivers, tourism, culture, economy, education, and public services) only when the content can be supported by reliable sources and kept current. Do not invent historical or statistical facts.

## Administrative map scope
- Interactive map layers: district, upazila, union and municipality only.
- Ward records remain available outside the map where sourced and verified; ward GIS layers are not a project requirement.
- The map client receives only the four supported administrative levels.

## Data quality
Public directory records should be reviewed and verified before publication. Search visibility is a result of useful, accurate, accessible content; metadata and sitemap inclusion alone do not guarantee indexing.
