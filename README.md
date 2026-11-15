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
