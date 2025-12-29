-- Migration: Add webhook event tracking for idempotency
-- Purpose: Prevent duplicate webhook processing
-- Date: 2025-12-28

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL, -- 'stripe', 'anthropic', etc.
  event_id TEXT NOT NULL UNIQUE, -- Unique ID from webhook provider
  event_type TEXT NOT NULL, -- 'customer.subscription.created', etc.
  payload JSONB NOT NULL, -- Full webhook payload
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_provider CHECK (provider IN ('stripe', 'anthropic')),
  INDEX idx_event_id (provider, event_id),
  INDEX idx_created_at (created_at DESC)
);

-- Enable RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage webhook events
CREATE POLICY "Service role can manage webhook events" ON webhook_events
  FOR ALL USING (true);

-- Create index for finding unprocessed events
CREATE INDEX idx_webhook_events_unprocessed ON webhook_events(processed, created_at DESC)
  WHERE NOT processed;
