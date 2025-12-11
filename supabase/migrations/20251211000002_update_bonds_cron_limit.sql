-- Update sync_bonds_cron function to use limit=5 instead of limit=10
-- This respects OpenFIGI rate limits (6 req/min without API key)
CREATE OR REPLACE FUNCTION sync_bonds_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_url TEXT;
BEGIN
  SELECT value INTO api_url FROM cron_config WHERE key = 'api_base_url';

  -- Sync bonds in batches of 5 (OpenFIGI: 6 req/min limit)
  PERFORM net.http_post(
    url := api_url || '/api/cron/sync-bonds?limit=5',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );

  RAISE NOTICE 'Bonds sync triggered at %', NOW();
END;
$$;
