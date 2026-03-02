# Tactical Reactor â Tactical Reactor Site Generator

## Overview
Template-based site generator that creates free, SEO/geo-optimized single-page PWA websites for local businesses. Site owners authenticate via Supabase and update their info in real-time.

## Architecture

### Stack
- **Frontend:** Next.js 15 + React 19 + Tailwind CSS
- **Backend:** Supabase (Auth, Database, Storage, Realtime)
- **Deployment:** Vercel
- **First Instance:** Roof Rescue (roofing)

### How It Works
1. Each business gets a record in `tr_sites` table
2. The Next.js app uses dynamic routing: `/site/[slug]`
3. All site data comes from Supabase (nothing hardcoded)
4. Owners log in via Supabase Auth and edit their data through `/dashboard/site-manager`
5. Changes reflect instantly via Supabase Realtime subscriptions

### URL Structure
- `/site/roof-rescue` â Public-facing site
- `/dashboard/site-manager` â Owner dashboard (authenticated)
- `/site/[slug]` â Dynamic route for any business

### Supabase Tables (New)
- `tr_sites` â Core business data (name, address, phone, hours, etc.)
- `tr_services` â Services offered by each business
- `tr_testimonials` â Customer testimonials
- `tr_images` â Image gallery / hero images
- Reuses existing `auth.users` for authentication

### SEO/Geo Features
- Schema.org LocalBusiness JSON-LD
- Open Graph + Twitter Card meta tags
- Geo meta tags (latitude, longitude)
- Canonical URLs
- Mobile-first responsive design
- PWA manifest + service worker

### Template Sections (anchor nav)
1. Hero (business name, tagline, CTA)
2. Services (list with icons/descriptions)
3. About (story, USPs)
4. Testimonials (customer reviews)
5. Contact (phone, email, hours, form)
6. Map (embedded Google Maps)
7. Footer (social links, legal)
