-- Add LLM providers table for storing user API configurations
CREATE TABLE IF NOT EXISTS llm_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  api_key TEXT,
  base_url TEXT,
  default_model TEXT,
  enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, provider_id)
);

-- Enable RLS
ALTER TABLE llm_providers ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only manage their own company's providers
CREATE POLICY "llm_providers_select" ON llm_providers 
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

CREATE POLICY "llm_providers_insert" ON llm_providers 
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

CREATE POLICY "llm_providers_update" ON llm_providers 
  FOR UPDATE USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

CREATE POLICY "llm_providers_delete" ON llm_providers 
  FOR DELETE USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_llm_providers_company ON llm_providers(company_id);
CREATE INDEX IF NOT EXISTS idx_llm_providers_default ON llm_providers(company_id, is_default) WHERE is_default = true;

-- Function to ensure only one default provider per company
CREATE OR REPLACE FUNCTION ensure_single_default_provider()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE llm_providers
    SET is_default = false
    WHERE company_id = NEW.company_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single default
DROP TRIGGER IF EXISTS trigger_single_default_provider ON llm_providers;
CREATE TRIGGER trigger_single_default_provider
  BEFORE INSERT OR UPDATE ON llm_providers
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_provider();
