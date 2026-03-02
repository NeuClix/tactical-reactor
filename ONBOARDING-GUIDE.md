# Tactical Reactor â New Business Onboarding Guide

## Step 1: Create User Account
1. Go to the Tactical Reactor dashboard
2. Sign up with the business owner's email
3. Note the `user_id` from Supabase Auth â Users

## Step 2: Insert Site Record
Run this SQL in Supabase SQL Editor (replace values):

```sql
INSERT INTO tr_sites (
  user_id,
  slug,
  business_name,
  tagline,
  description,
  industry,
  phone,
  email,
  address_street,
  address_city,
  address_state,
  address_zip,
  primary_color,
  secondary_color,
  accent_color,
  cta_text,
  is_published
) VALUES (
  'USER_UUID_HERE',
  'business-slug',
  'Business Name',
  'Your Tagline Here',
  'Brief description of the business.',
  'roofing',
  '(555) 123-4567',
  'info@business.com',
  '123 Main St',
  'Dallas',
  'TX',
  '75201',
  '#1e3a5f',
  '#d4a843',
  '#2d8b4e',
  'Get a Free Quote',
  true
);
```

## Step 3: Add Services
```sql
INSERT INTO tr_services (site_id, user_id, title, description, icon, sort_order) VALUES
  ('SITE_UUID', 'USER_UUID', 'Roof Repair', 'Emergency and scheduled repairs', 'shield', 0),
  ('SITE_UUID', 'USER_UUID', 'Roof Replacement', 'Full tear-off and replacement', 'award', 1),
  ('SITE_UUID', 'USER_UUID', 'Roof Inspection', 'Free comprehensive inspections', 'star', 2);
```

## Step 4: Add Testimonials
```sql
INSERT INTO tr_testimonials (site_id, user_id, customer_name, customer_location, rating, review_text, sort_order) VALUES
  ('SITE_UUID', 'USER_UUID', 'John D.', 'Dallas, TX', 5, 'Outstanding work! They fixed our roof after the storm in record time.', 0),
  ('SITE_UUID', 'USER_UUID', 'Sarah M.', 'Fort Worth, TX', 5, 'Professional, honest, and fairly priced. Highly recommend.', 1);
```

## Step 5: Verify
- Visit `/site/business-slug` to see the public site
- Have the owner log in at `/dashboard/site-manager` to manage their data
- All changes sync in real-time via Supabase

## Step 6: Custom Domain (Optional)
Add a custom domain via Vercel:
1. Vercel Dashboard â Domains
2. Add `www.business-domain.com`
3. Configure DNS (CNAME â cname.vercel-dns.com)
4. Add rewrite rule: `www.business-domain.com` â `/site/business-slug`
