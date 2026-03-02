-- ============================================================
-- TACTICAL REACTOR: Site Generator Schema
-- Adds to existing rrstripe Supabase project
-- ============================================================

-- ============================================================
-- 1. TACTICAL REACTOR SITES - Core business data
-- ============================================================
CREATE TABLE IF NOT EXISTS tr_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity
  slug TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  industry TEXT DEFAULT 'general',

  -- Contact
  phone TEXT,
  email TEXT,
  website_url TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  address_country TEXT DEFAULT 'US',

  -- Geo
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  service_radius_miles INTEGER DEFAULT 25,

  -- Hours (JSON: {"mon": {"open": "08:00", "close": "17:00"}, ...})
  business_hours JSONB DEFAULT '{}'::JSONB,

  -- Branding
  logo_url TEXT,
  hero_image_url TEXT,
  primary_color TEXT DEFAULT '#1e40af',
  secondary_color TEXT DEFAULT '#f59e0b',
  accent_color TEXT DEFAULT '#10b981',
  font_family TEXT DEFAULT 'Inter',

  -- Social
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  google_business_url TEXT,
  yelp_url TEXT,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- PWA
  pwa_name TEXT,
  pwa_short_name TEXT,
  pwa_theme_color TEXT DEFAULT '#1e40af',
  pwa_background_color TEXT DEFAULT '#ffffff',

  -- Site settings
  is_published BOOLEAN DEFAULT false,
  show_map BOOLEAN DEFAULT true,
  show_testimonials BOOLEAN DEFAULT true,
  show_contact_form BOOLEAN DEFAULT true,
  cta_text TEXT DEFAULT 'Get a Free Quote',
  cta_phone_text TEXT DEFAULT 'Call Now',

  -- Tracking
  google_analytics_id TEXT,
  facebook_pixel_id TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tr_sites ENABLE ROW LEVEL SECURITY;

-- Owners can manage their own sites
CREATE POLICY "Owners manage own sites"
  ON tr_sites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public can READ published sites (for the public-facing pages)
CREATE POLICY "Public can view published sites"
  ON tr_sites FOR SELECT
  USING (is_published = true);

CREATE INDEX idx_fsites_user ON tr_sites(user_id);
CREATE INDEX idx_fsites_slug ON tr_sites(slug);
CREATE INDEX idx_fsites_published ON tr_sites(is_published);

-- ============================================================
-- 2. TACTICAL REACTOR SERVICES - Services offered
-- ============================================================
CREATE TABLE IF NOT EXISTS tr_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES tr_sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'wrench',
  image_url TEXT,
  price_range TEXT,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tr_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own services"
  ON tr_services FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view services"
  ON tr_services FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tr_sites
    WHERE tr_sites.id = tr_services.site_id
    AND tr_sites.is_published = true
  ));

CREATE INDEX idx_fservices_site ON tr_services(site_id);

-- ============================================================
-- 3. TACTICAL REACTOR TESTIMONIALS - Customer reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS tr_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES tr_sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  customer_name TEXT NOT NULL,
  customer_location TEXT,
  customer_avatar_url TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) DEFAULT 5,
  review_text TEXT NOT NULL,
  service_type TEXT,
  review_date DATE,
  source TEXT DEFAULT 'direct',
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tr_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own testimonials"
  ON tr_testimonials FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view testimonials"
  ON tr_testimonials FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tr_sites
    WHERE tr_sites.id = tr_testimonials.site_id
    AND tr_sites.is_published = true
  ));

CREATE INDEX idx_ftestimonials_site ON tr_testimonials(site_id);

-- ============================================================
-- 4. TACTICAL REACTOR IMAGES - Site gallery
-- ============================================================
CREATE TABLE IF NOT EXISTS tr_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES tr_sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  image_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  category TEXT DEFAULT 'gallery',
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tr_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own images"
  ON tr_images FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view images"
  ON tr_images FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tr_sites
    WHERE tr_sites.id = tr_images.site_id
    AND tr_sites.is_published = true
  ));

CREATE INDEX idx_fimages_site ON tr_images(site_id);

-- ============================================================
-- 5. AUTO-UPDATE TRIGGERS for Tactical Reactor tables
-- ============================================================
CREATE TRIGGER trigger_fsites_updated_at
  BEFORE UPDATE ON tr_sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_fservices_updated_at
  BEFORE UPDATE ON tr_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ftestimonials_updated_at
  BEFORE UPDATE ON tr_testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. SEED DATA - Roof Rescue (first instance)
-- ============================================================
-- NOTE: Run this AFTER creating a user account for the Roof Rescue owner.
-- Replace 'ROOF_RESCUE_USER_ID' with the actual auth.users UUID.
--
-- INSERT INTO tr_sites (
--   user_id, slug, business_name, tagline, description, industry,
--   phone, email, address_street, address_city, address_state, address_zip,
--   primary_color, secondary_color, accent_color,
--   cta_text, is_published
-- ) VALUES (
--   'ROOF_RESCUE_USER_ID',
--   'roof-rescue',
--   'Roof Rescue',
--   'Your Roof''s Best Friend',
--   'Professional roofing services for residential and commercial properties. Emergency repairs, full replacements, and preventive maintenance across the Branson and Southwest Missouri area.',
--   'roofing',
--   '(417) 593-6708',
--   'info@midwestsolarandenergy.com',
--   '16208 MO-13 Box 4',
--   'Branson West',
--   'MO',
--   '65737',
--   '#1e3a5f',
--   '#d4a843',
--   '#2d8b4e',
--   'Get a Free Roof Inspection',
--   true
-- );
