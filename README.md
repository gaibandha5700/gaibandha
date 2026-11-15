# গাইবান্ধা — ডিজিটাল জেলা তথ্যভান্ডার

গাইবান্ধা জেলার উপজেলা, শিক্ষা প্রতিষ্ঠান, হাসপাতাল, সরকারি অফিস, ব্যবসা, পরিবহন, দর্শনীয় স্থান ও কমিউনিটি তথ্য এক জায়গায় তুলে ধরার উদ্যোগ।

## Technology
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Supabase (planned: PostgreSQL, Auth, Storage)
- Vercel deployment

## Local development
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables
Set the canonical production origin in Vercel Project Settings → Environment Variables:

```env
NEXT_PUBLIC_SITE_URL=https://YOUR-PRODUCTION-DOMAIN
```

Use the exact preferred HTTPS origin (including `www` only if that is the canonical host). The app can fall back to Vercel's production project URL when this variable is absent.

Supabase integration is not enabled yet. When configured, add these to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Never expose a Supabase service-role key in client-side code.

## Technical SEO
- `src/app/robots.ts` serves `/robots.txt`.
- `src/app/sitemap.ts` serves `/sitemap.xml`.
- `src/app/layout.tsx` defines the Bengali document language, canonical metadata, Open Graph/Twitter metadata, robots directives, and WebSite JSON-LD.
- Only real, public, indexable routes should be added to the sitemap. Do not add admin, API, draft, empty, or duplicate URLs.
- Each future public detail page must have unique useful content, a unique title and description, a self-referencing canonical URL, and appropriate structured data where eligible.

After deployment, verify `/robots.txt` and `/sitemap.xml`, then submit `sitemap.xml` in Google Search Console.

## Project status
The initial responsive Bengali homepage and technical SEO foundation are in place. Directory data, Supabase schema, public detail pages, authentication, and admin workflows are next.

**Data quality:** Public directory entries should be reviewed and verified before publication.


## Supabase database setup

The first database migration is available at:

`supabase/migrations/202611150001_initial_public_directory.sql`

To apply it:
1. Open your Supabase project.
2. Go to **SQL Editor** → **New query**.
3. Copy the complete migration file into the editor and run it.
4. In **Table Editor**, confirm that `upazilas`, `unions`, and `directory_entries` exist.

### Publication and security rules
- New records default to `is_published = false` and `is_verified = false`.
- Anonymous and authenticated visitors can only SELECT records where both flags are true.
- Public INSERT, UPDATE, and DELETE policies are intentionally absent.
- Admin write operations must be implemented behind server-side authentication and authorization.
- Never put the Supabase `service_role` key in a `NEXT_PUBLIC_*` variable or browser code.

### Directory categories
`directory_entries.category` supports: `education`, `health`, `police`, `government`, `business`, `tourism`, `transport`, and `community`.

The migration creates the data foundation only. It does not insert unverified directory data or publish empty detail pages. Public SEO routes and the dynamic sitemap should be connected after the Supabase project credentials are configured and real records are added and verified.
