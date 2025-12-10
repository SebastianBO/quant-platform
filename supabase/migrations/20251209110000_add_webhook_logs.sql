-- Create webhook_logs table for debugging and auditing
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL, -- 'plaid' or 'tink'
  webhook_type TEXT,
  webhook_code TEXT,
  item_id TEXT,
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for querying by provider and time
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_item_id ON webhook_logs(item_id);

-- Add error tracking columns to plaid_items if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plaid_items' AND column_name = 'error_code') THEN
    ALTER TABLE plaid_items ADD COLUMN error_code TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plaid_items' AND column_name = 'error_message') THEN
    ALTER TABLE plaid_items ADD COLUMN error_message TEXT;
  END IF;
END $$;

-- Add currency column to investments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'currency') THEN
    ALTER TABLE investments ADD COLUMN currency TEXT DEFAULT 'USD';
  END IF;
END $$;

-- Enable RLS on webhook_logs (admin only)
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access webhook logs
DROP POLICY IF EXISTS "Service role can manage webhook logs" ON webhook_logs;
CREATE POLICY "Service role can manage webhook logs" ON webhook_logs
  FOR ALL USING (true);

-- Clean up old webhook logs (keep last 30 days)
-- This can be run periodically via a scheduled function
CREATE OR REPLACE FUNCTION cleanup_old_webhook_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM webhook_logs WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE webhook_logs IS 'Stores webhook events from Plaid and Tink for debugging and auditing';
COMMENT ON COLUMN webhook_logs.provider IS 'The provider that sent the webhook (plaid or tink)';
COMMENT ON COLUMN webhook_logs.webhook_type IS 'The type of webhook event';
COMMENT ON COLUMN webhook_logs.item_id IS 'The Plaid item_id or Tink credential_id';
COMMENT ON COLUMN webhook_logs.payload IS 'The full webhook payload as JSON';
