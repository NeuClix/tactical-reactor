-- Platform Connections Table
-- Stores OAuth tokens and API keys for connected platforms

-- Drop existing table if it exists (for development)
DROP TABLE IF EXISTS public.platform_connections CASCADE;

-- Create platform connections table
CREATE TABLE IF NOT EXISTS public.platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_user_id TEXT,
  platform_username TEXT,
  platform_page_id TEXT, -- For Facebook/Instagram pages, LinkedIn company pages
  platform_page_name TEXT,
  access_token TEXT, -- Encrypted in application layer
  refresh_token TEXT, -- Encrypted in application layer
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_publish_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one connection per platform per page/account per company
  UNIQUE(company_id, platform, platform_user_id, platform_page_id)
);

-- Create indexes
CREATE INDEX idx_platform_connections_company ON public.platform_connections(company_id);
CREATE INDEX idx_platform_connections_platform ON public.platform_connections(platform);
CREATE INDEX idx_platform_connections_active ON public.platform_connections(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "platform_connections_select" ON public.platform_connections
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "platform_connections_insert" ON public.platform_connections
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "platform_connections_update" ON public.platform_connections
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "platform_connections_delete" ON public.platform_connections
  FOR DELETE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- Scheduled Posts Table (for Distribution Hub)
DROP TABLE IF EXISTS public.scheduled_posts CASCADE;

CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  content_type TEXT DEFAULT 'text', -- text, image, video, link, carousel
  media_urls TEXT[],
  link_url TEXT,
  platforms TEXT[] NOT NULL,
  platform_specific_content JSONB DEFAULT '{}', -- Different content per platform
  scheduled_at TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft', -- draft, scheduled, publishing, published, failed, cancelled
  publish_results JSONB DEFAULT '{}', -- Results from each platform
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_scheduled_posts_company ON public.scheduled_posts(company_id);
CREATE INDEX idx_scheduled_posts_status ON public.scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_scheduled_at ON public.scheduled_posts(scheduled_at);
CREATE INDEX idx_scheduled_posts_platforms ON public.scheduled_posts USING GIN(platforms);

-- Enable RLS
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "scheduled_posts_select" ON public.scheduled_posts
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "scheduled_posts_insert" ON public.scheduled_posts
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "scheduled_posts_update" ON public.scheduled_posts
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "scheduled_posts_delete" ON public.scheduled_posts
  FOR DELETE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- Published Posts Log (track what was published where)
DROP TABLE IF EXISTS public.publish_log CASCADE;

CREATE TABLE IF NOT EXISTS public.publish_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  scheduled_post_id UUID REFERENCES public.scheduled_posts(id) ON DELETE SET NULL,
  connection_id UUID REFERENCES public.platform_connections(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  platform_post_id TEXT, -- ID of the post on the platform
  platform_url TEXT, -- URL to the published post
  status TEXT DEFAULT 'pending', -- pending, success, failed
  error_message TEXT,
  metrics JSONB DEFAULT '{}', -- impressions, likes, shares, etc.
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.publish_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "publish_log_select" ON public.publish_log
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "publish_log_insert" ON public.publish_log
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_platform_connections_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_platform_connections_timestamp
  BEFORE UPDATE ON public.platform_connections
  FOR EACH ROW EXECUTE FUNCTION update_platform_connections_timestamp();

CREATE TRIGGER update_scheduled_posts_timestamp
  BEFORE UPDATE ON public.scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION update_platform_connections_timestamp();
