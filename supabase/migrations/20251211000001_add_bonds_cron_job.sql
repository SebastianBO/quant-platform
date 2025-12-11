-- Add cron job for syncing corporate bonds data
-- Bonds don't change frequently, so weekly sync is sufficient

-- Function to sync bonds data via HTTP
CREATE OR REPLACE FUNCTION sync_bonds_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_url TEXT;
BEGIN
  SELECT value INTO api_url FROM cron_config WHERE key = 'api_base_url';

  -- Sync bonds in batches of 10 (rate limited by OpenFIGI)
  PERFORM net.http_post(
    url := api_url || '/api/cron/sync-bonds?limit=10',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );

  RAISE NOTICE 'Bonds sync triggered at %', NOW();
END;
$$;

-- Schedule bonds sync: Weekly on Sunday at 3:00 AM UTC
-- Bond data doesn't change frequently, so weekly is sufficient
SELECT cron.schedule(
  'sync-bonds-weekly',
  '0 3 * * 0',
  $$SELECT sync_bonds_cron()$$
);

-- Also add a daily job that syncs a few tickers to keep data fresh
-- This runs at 7:00 AM UTC daily
SELECT cron.schedule(
  'sync-bonds-daily-batch',
  '0 7 * * *',
  $$SELECT sync_bonds_cron()$$
);

COMMENT ON FUNCTION sync_bonds_cron IS 'Triggers sync of corporate bonds data from OpenFIGI';
