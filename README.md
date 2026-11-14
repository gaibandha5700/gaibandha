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
Supabase integration is not enabled yet. When configured, add these to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Never expose a Supabase service-role key in client-side code.

## Project status
The initial responsive Bengali homepage and framework scaffold are in place. Directory data, Supabase schema, authentication, admin workflows, and production SEO metadata are next.

**Data quality:** Public directory entries should be reviewed and verified before publication.