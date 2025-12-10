-- Additional Cron Jobs for Complete Financial Data Coverage
-- Adds 13F, Insider Trading, Short Volume automation

-- Job 4: 13F Institutional Holdings Sync (daily at 6am UTC)
-- Syncs 13F filings which are updated quarterly
SELECT cron.schedule(
  'sync-13f-holdings',
  '0 6 * * *',  -- Daily at 6am UTC
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/admin/sync/financials',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"type": "13f", "limit": 50}'::jsonb
  );
  $$
);

-- Job 5: Insider Trading Sync (every 30 minutes during market hours)
-- Form 4 filings can come in frequently
SELECT cron.schedule(
  'sync-insider-trades',
  '*/30 14-21 * * 1-5',  -- Every 30 min, 9am-4pm EST (14-21 UTC), Mon-Fri
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/admin/sync/financials',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"type": "insider", "limit": 100}'::jsonb
  );
  $$
);

-- Job 6: Short Volume Sync (daily at 7pm UTC / 2pm EST after FINRA publishes)
SELECT cron.schedule(
  'sync-short-volume',
  '0 19 * * 1-5',  -- Daily at 7pm UTC (2pm EST), Mon-Fri
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/short-volume/backfill',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"days": 1}'::jsonb
  );
  $$
);

-- Job 7: Stock Prices Snapshot Update (every 15 min during market hours)
-- Updates real-time price snapshots
SELECT cron.schedule(
  'sync-price-snapshots',
  '*/15 14-21 * * 1-5',  -- Every 15 min, 9am-4pm EST, Mon-Fri
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/prices/sync',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"mode": "snapshot", "limit": 100}'::jsonb
  );
  $$
);

-- Create comprehensive cron monitoring view
DROP VIEW IF EXISTS public.cron_job_status;
CREATE VIEW public.cron_job_status AS
SELECT
  j.jobid,
  j.jobname,
  j.schedule,
  j.active,
  CASE
    WHEN j.jobname = 'bulk-financial-sync' THEN 'Financial Statements (10-K/10-Q)'
    WHEN j.jobname = 'watch-sec-filings' THEN 'SEC Filing Detection'
    WHEN j.jobname = 'priority-ticker-refresh' THEN 'Top 100 Stocks Refresh'
    WHEN j.jobname = 'sync-13f-holdings' THEN '13F Institutional Holdings'
    WHEN j.jobname = 'sync-insider-trades' THEN 'Form 4 Insider Trading'
    WHEN j.jobname = 'sync-short-volume' THEN 'FINRA Short Volume'
    WHEN j.jobname = 'sync-price-snapshots' THEN 'Real-time Price Snapshots'
    ELSE 'Unknown'
  END as description,
  s.last_run_status,
  s.last_run_time,
  s.last_error_message
FROM cron.job j
LEFT JOIN (
  SELECT DISTINCT ON (jobid)
    jobid,
    status as last_run_status,
    start_time as last_run_time,
    return_message as last_error_message
  FROM cron.job_run_details
  ORDER BY jobid, start_time DESC
) s ON j.jobid = s.jobid
WHERE j.jobname IN (
  'bulk-financial-sync',
  'watch-sec-filings',
  'priority-ticker-refresh',
  'sync-13f-holdings',
  'sync-insider-trades',
  'sync-short-volume',
  'sync-price-snapshots'
)
ORDER BY j.jobname;

GRANT SELECT ON public.cron_job_status TO authenticated;

-- Create data freshness monitoring table
CREATE TABLE IF NOT EXISTS public.data_freshness (
  id SERIAL PRIMARY KEY,
  data_type VARCHAR(50) NOT NULL UNIQUE,
  table_name VARCHAR(100) NOT NULL,
  last_sync TIMESTAMPTZ,
  record_count BIGINT DEFAULT 0,
  latest_data_date DATE,
  sync_status VARCHAR(20) DEFAULT 'unknown',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed freshness tracking
INSERT INTO public.data_freshness (data_type, table_name) VALUES
  ('financial_statements', 'income_statements'),
  ('balance_sheets', 'balance_sheets'),
  ('cash_flows', 'cash_flow_statements'),
  ('insider_trades', 'insider_trades'),
  ('institutional_holdings', 'institutional_holdings'),
  ('short_volume', 'short_volume'),
  ('stock_prices', 'stock_prices_snapshot'),
  ('sec_filings', 'sec_filings')
ON CONFLICT (data_type) DO NOTHING;

-- Function to update freshness metrics
CREATE OR REPLACE FUNCTION update_data_freshness()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update income_statements freshness
  UPDATE data_freshness SET
    record_count = (SELECT COUNT(*) FROM income_statements),
    latest_data_date = (SELECT MAX(report_period) FROM income_statements),
    last_sync = (SELECT MAX(updated_at) FROM income_statements),
    sync_status = 'active',
    updated_at = NOW()
  WHERE data_type = 'financial_statements';

  -- Update insider_trades freshness
  UPDATE data_freshness SET
    record_count = (SELECT COUNT(*) FROM insider_trades),
    latest_data_date = (SELECT MAX(transaction_date) FROM insider_trades),
    last_sync = (SELECT MAX(created_at) FROM insider_trades),
    sync_status = 'active',
    updated_at = NOW()
  WHERE data_type = 'insider_trades';

  -- Update short_volume freshness
  UPDATE data_freshness SET
    record_count = (SELECT COUNT(*) FROM short_volume),
    latest_data_date = (SELECT MAX(trade_date) FROM short_volume),
    last_sync = (SELECT MAX(created_at) FROM short_volume),
    sync_status = 'active',
    updated_at = NOW()
  WHERE data_type = 'short_volume';

  -- Update stock_prices freshness
  UPDATE data_freshness SET
    record_count = (SELECT COUNT(*) FROM stock_prices_snapshot),
    latest_data_date = (SELECT MAX(date) FROM stock_prices_snapshot),
    last_sync = (SELECT MAX(updated_at) FROM stock_prices_snapshot),
    sync_status = 'active',
    updated_at = NOW()
  WHERE data_type = 'stock_prices';
END;
$$;

-- Schedule freshness update every hour
SELECT cron.schedule(
  'update-data-freshness',
  '0 * * * *',  -- Every hour
  'SELECT update_data_freshness()'
);

COMMENT ON VIEW public.cron_job_status IS 'Monitor all financial data sync cron jobs';
COMMENT ON TABLE public.data_freshness IS 'Track data freshness across all financial data types';
