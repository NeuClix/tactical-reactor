-- Add subscriptions table for Stripe integration
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  credits_remaining INTEGER DEFAULT 100,
  credits_reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on company_id (one subscription per company)
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_company_id_idx ON public.subscriptions(company_id);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "subscriptions_update_own" ON public.subscriptions
  FOR UPDATE USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Create default subscription for existing companies
INSERT INTO public.subscriptions (company_id, plan_id, status, credits_remaining)
SELECT id, 'free', 'active', 100
FROM public.companies
WHERE id NOT IN (SELECT company_id FROM public.subscriptions)
ON CONFLICT (company_id) DO NOTHING;

-- Function to create default subscription on company creation
CREATE OR REPLACE FUNCTION public.handle_new_company_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (company_id, plan_id, status, credits_remaining)
  VALUES (NEW.id, 'free', 'active', 100)
  ON CONFLICT (company_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to auto-create subscription
DROP TRIGGER IF EXISTS on_company_created_subscription ON public.companies;
CREATE TRIGGER on_company_created_subscription
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_company_subscription();
