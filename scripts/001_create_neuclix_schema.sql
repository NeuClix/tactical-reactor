-- NeuClix Database Schema
-- Multi-tenant AI Marketing Platform

-- ============================================
-- COMPANIES TABLE (Each user = one company account)
-- ============================================
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Company',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Subscription info
  subscription_tier text default 'free' check (subscription_tier in ('free', 'starter', 'pro', 'enterprise')),
  subscription_status text default 'active' check (subscription_status in ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  
  -- Credits for a la carte purchases
  credits_balance integer default 0,
  
  unique(user_id)
);

alter table public.companies enable row level security;

create policy "companies_select_own" on public.companies for select using (auth.uid() = user_id);
create policy "companies_insert_own" on public.companies for insert with check (auth.uid() = user_id);
create policy "companies_update_own" on public.companies for update using (auth.uid() = user_id);
create policy "companies_delete_own" on public.companies for delete using (auth.uid() = user_id);

-- ============================================
-- BRAND PROFILES TABLE (Premium feature - multiple profiles per company)
-- ============================================
create table if not exists public.brand_profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null default 'Default Profile',
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Brand Strategy Settings
  gtm_id text,
  core_keywords text,
  company_info text,
  brand_voice text,
  target_audience text,
  value_propositions text,
  competitors text,
  
  -- Visual Guidelines
  primary_color text,
  secondary_color text,
  logo_url text,
  
  -- AI Instructions
  custom_ai_instructions text
);

alter table public.brand_profiles enable row level security;

create policy "brand_profiles_select" on public.brand_profiles for select 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "brand_profiles_insert" on public.brand_profiles for insert 
  with check (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "brand_profiles_update" on public.brand_profiles for update 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "brand_profiles_delete" on public.brand_profiles for delete 
  using (company_id in (select id from public.companies where user_id = auth.uid()));

-- ============================================
-- CONTENT TABLE (Content Hub - generated articles, posts, etc.)
-- ============================================
create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid references public.brand_profiles(id) on delete set null,
  
  title text not null,
  content_type text not null check (content_type in ('article', 'blog_post', 'social_post', 'email', 'ad_copy', 'meta_description', 'other')),
  body text,
  meta_title text,
  meta_description text,
  keywords text,
  status text default 'draft' check (status in ('draft', 'published', 'scheduled', 'archived')),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz,
  scheduled_for timestamptz
);

alter table public.content enable row level security;

create policy "content_select" on public.content for select 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "content_insert" on public.content for insert 
  with check (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "content_update" on public.content for update 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "content_delete" on public.content for delete 
  using (company_id in (select id from public.companies where user_id = auth.uid()));

-- ============================================
-- MEDIA TABLE (Media Hub - generated images, assets)
-- ============================================
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid references public.brand_profiles(id) on delete set null,
  
  name text not null,
  media_type text not null check (media_type in ('image', 'video', 'audio', 'document')),
  url text not null,
  thumbnail_url text,
  prompt text, -- AI generation prompt if applicable
  alt_text text,
  file_size integer,
  
  created_at timestamptz default now()
);

alter table public.media enable row level security;

create policy "media_select" on public.media for select 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "media_insert" on public.media for insert 
  with check (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "media_update" on public.media for update 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "media_delete" on public.media for delete 
  using (company_id in (select id from public.companies where user_id = auth.uid()));

-- ============================================
-- LEADS TABLE (Gen Hub - lead generation)
-- ============================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  
  name text,
  email text,
  phone text,
  company_name text,
  job_title text,
  linkedin_url text,
  website text,
  industry text,
  
  source text, -- where the lead came from
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes text,
  score integer default 0,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.leads enable row level security;

create policy "leads_select" on public.leads for select 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "leads_insert" on public.leads for insert 
  with check (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "leads_update" on public.leads for update 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "leads_delete" on public.leads for delete 
  using (company_id in (select id from public.companies where user_id = auth.uid()));

-- ============================================
-- CALENDAR ITEMS TABLE (Distribution Hub - content calendar)
-- ============================================
create table if not exists public.calendar_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  content_id uuid references public.content(id) on delete set null,
  
  title text not null,
  description text,
  scheduled_date date not null,
  scheduled_time time,
  platform text, -- facebook, twitter, linkedin, etc.
  status text default 'scheduled' check (status in ('scheduled', 'published', 'failed', 'canceled')),
  
  created_at timestamptz default now()
);

alter table public.calendar_items enable row level security;

create policy "calendar_items_select" on public.calendar_items for select 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "calendar_items_insert" on public.calendar_items for insert 
  with check (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "calendar_items_update" on public.calendar_items for update 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "calendar_items_delete" on public.calendar_items for delete 
  using (company_id in (select id from public.companies where user_id = auth.uid()));

-- ============================================
-- CONNECTIONS TABLE (Connection Hub - platform integrations)
-- ============================================
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  
  platform text not null, -- facebook, twitter, linkedin, wordpress, hubspot, etc.
  is_connected boolean default false,
  access_token text, -- encrypted in production
  refresh_token text,
  expires_at timestamptz,
  account_name text,
  account_id text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  unique(company_id, platform)
);

alter table public.connections enable row level security;

create policy "connections_select" on public.connections for select 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "connections_insert" on public.connections for insert 
  with check (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "connections_update" on public.connections for update 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "connections_delete" on public.connections for delete 
  using (company_id in (select id from public.companies where user_id = auth.uid()));

-- ============================================
-- INTEL REPORTS TABLE (Intel Hub - competitor analysis, SEO audits)
-- ============================================
create table if not exists public.intel_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid references public.brand_profiles(id) on delete set null,
  
  report_type text not null check (report_type in ('competitor_analysis', 'seo_audit', 'content_gap', 'keyword_research')),
  title text not null,
  data jsonb, -- flexible JSON for different report types
  
  created_at timestamptz default now()
);

alter table public.intel_reports enable row level security;

create policy "intel_reports_select" on public.intel_reports for select 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "intel_reports_insert" on public.intel_reports for insert 
  with check (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "intel_reports_update" on public.intel_reports for update 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "intel_reports_delete" on public.intel_reports for delete 
  using (company_id in (select id from public.companies where user_id = auth.uid()));

-- ============================================
-- CREDIT TRANSACTIONS TABLE (A la carte purchases)
-- ============================================
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  
  amount integer not null, -- positive for purchases, negative for usage
  transaction_type text not null check (transaction_type in ('purchase', 'usage', 'bonus', 'refund')),
  description text,
  stripe_payment_intent_id text,
  
  created_at timestamptz default now()
);

alter table public.credit_transactions enable row level security;

create policy "credit_transactions_select" on public.credit_transactions for select 
  using (company_id in (select id from public.companies where user_id = auth.uid()));
create policy "credit_transactions_insert" on public.credit_transactions for insert 
  with check (company_id in (select id from public.companies where user_id = auth.uid()));

-- ============================================
-- TRIGGER: Auto-create company and default profile on user signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id uuid;
begin
  -- Create company for the new user
  insert into public.companies (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'company_name', 'My Company'))
  returning id into new_company_id;
  
  -- Create default brand profile for the company
  insert into public.brand_profiles (company_id, name, is_default)
  values (new_company_id, 'Default Profile', true);
  
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- INDEXES for better query performance
-- ============================================
create index if not exists idx_companies_user_id on public.companies(user_id);
create index if not exists idx_brand_profiles_company_id on public.brand_profiles(company_id);
create index if not exists idx_content_company_id on public.content(company_id);
create index if not exists idx_content_status on public.content(status);
create index if not exists idx_media_company_id on public.media(company_id);
create index if not exists idx_leads_company_id on public.leads(company_id);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_calendar_items_company_id on public.calendar_items(company_id);
create index if not exists idx_calendar_items_scheduled_date on public.calendar_items(scheduled_date);
create index if not exists idx_connections_company_id on public.connections(company_id);
create index if not exists idx_intel_reports_company_id on public.intel_reports(company_id);
create index if not exists idx_credit_transactions_company_id on public.credit_transactions(company_id);
