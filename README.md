# Arivio

Arivio is building the Airbnb for events: planners create an event, compare nearby venues and providers, build a quote cart, request quotes, and eventually book.

## Run Locally

Use the Windows launcher:

```cmd
start-dev.cmd
```

Or run:

```cmd
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

## Supabase Setup

The app is wired for Supabase, but you still need to create the Supabase project and add keys locally.

1. Create a Supabase project at `https://supabase.com`.
2. Open Project Settings -> API.
3. Copy:
   - Project URL
   - anon public key
4. Create `.env.local` in this folder:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

5. In Supabase, open SQL Editor.
6. Paste and run:

```text
supabase/schema.sql
```

7. Restart the dev server.

Once configured, these flows can persist data:

- `/auth/signup`
- `/auth/login`
- `/plan`
- `/account`
- `/events/[id]`
- `/vendor/onboarding`

## Current Backend Scope

Implemented:

- Supabase client helpers
- Database schema
- Auth pages
- Profile creation
- Saved events
- Account dashboard
- Event detail page
- Vendor onboarding starter flow

Not implemented yet:

- Stripe payments
- Google Maps API
- Real geocoding
- Real drive-time API
- File uploads
- Production admin dashboard
