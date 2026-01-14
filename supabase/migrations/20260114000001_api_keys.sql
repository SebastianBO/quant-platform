-- API Keys table for developer access
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  use_case TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of the API key
  key_prefix TEXT NOT NULL, -- First 10 chars for identification (e.g., "lc_abc123")
  tier TEXT NOT NULL DEFAULT 'free', -- free, basic, pro, enterprise
  daily_limit INTEGER NOT NULL DEFAULT 100,
  monthly_limit INTEGER, -- NULL means unlimited
  requests_today INTEGER NOT NULL DEFAULT 0,
  requests_this_month INTEGER NOT NULL DEFAULT 0,
  last_request_at TIMESTAMPTZ,
  last_reset_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_email ON api_keys(email);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_tier ON api_keys(tier);

-- Function to reset daily request counts at midnight
CREATE OR REPLACE FUNCTION reset_daily_api_requests()
RETURNS void AS $$
BEGIN
  UPDATE api_keys
  SET requests_today = 0,
      last_reset_at = now()
  WHERE last_reset_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- API request log for analytics
CREATE TABLE IF NOT EXISTS api_request_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  ticker TEXT, -- Extracted from request for analytics
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_api_request_log_key_id ON api_request_log(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_request_log_created_at ON api_request_log(created_at);
CREATE INDEX IF NOT EXISTS idx_api_request_log_endpoint ON api_request_log(endpoint);

-- RLS policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_log ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can manage api_keys" ON api_keys
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage api_request_log" ON api_request_log
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comment for documentation
COMMENT ON TABLE api_keys IS 'Developer API keys for programmatic access to Lician financial data';
COMMENT ON TABLE api_request_log IS 'Log of all API requests for analytics and rate limiting';
