-- Fix insider trades and 8-K cron jobs
-- Also add missing columns to sec_filings table

-- ============================================================================
-- ADD MISSING COLUMNS TO SEC_FILINGS
-- ============================================================================

DO $$
BEGIN
  -- Add description column for 8-K item descriptions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'description') THEN
    ALTER TABLE sec_filings ADD COLUMN description TEXT;
  END IF;

  -- Add company_name column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'company_name') THEN
    ALTER TABLE sec_filings ADD COLUMN company_name VARCHAR(200);
  END IF;

  -- Add synced_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'synced_at') THEN
    ALTER TABLE sec_filings ADD COLUMN synced_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ============================================================================
-- ADD MISSING TABLES FOR INSIDER TRADES
-- ============================================================================

-- Insiders reference table
CREATE TABLE IF NOT EXISTS insiders (
  id BIGSERIAL PRIMARY KEY,
  cik VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  normalized_name VARCHAR(200),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form 4 filings table (tracks processed filings)
CREATE TABLE IF NOT EXISTS form4_filings (
  id BIGSERIAL PRIMARY KEY,
  accession_number VARCHAR(25) UNIQUE NOT NULL,
  insider_cik VARCHAR(10),
  insider_name VARCHAR(200),
  company_cik VARCHAR(10),
  company_name VARCHAR(200),
  ticker VARCHAR(20),
  filing_date DATE,
  is_director BOOLEAN DEFAULT FALSE,
  is_officer BOOLEAN DEFAULT FALSE,
  is_ten_percent_owner BOOLEAN DEFAULT FALSE,
  is_other BOOLEAN DEFAULT FALSE,
  officer_title VARCHAR(200),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to insider_trades if they don't exist
DO $$
BEGIN
  -- Add filing_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insider_trades' AND column_name = 'filing_id') THEN
    ALTER TABLE insider_trades ADD COLUMN filing_id BIGINT;
  END IF;

  -- Add insider_cik
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insider_trades' AND column_name = 'insider_cik') THEN
    ALTER TABLE insider_trades ADD COLUMN insider_cik VARCHAR(10);
  END IF;

  -- Add company_cik
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insider_trades' AND column_name = 'company_cik') THEN
    ALTER TABLE insider_trades ADD COLUMN company_cik VARCHAR(10);
  END IF;

  -- Add transaction_code
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insider_trades' AND column_name = 'transaction_code') THEN
    ALTER TABLE insider_trades ADD COLUMN transaction_code VARCHAR(5);
  END IF;

  -- Add transaction_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insider_trades' AND column_name = 'transaction_type') THEN
    ALTER TABLE insider_trades ADD COLUMN transaction_type VARCHAR(50);
  END IF;

  -- Add acquired_disposed_code
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insider_trades' AND column_name = 'acquired_disposed_code') THEN
    ALTER TABLE insider_trades ADD COLUMN acquired_disposed_code VARCHAR(1);
  END IF;

  -- Add ownership_nature
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insider_trades' AND column_name = 'ownership_nature') THEN
    ALTER TABLE insider_trades ADD COLUMN ownership_nature VARCHAR(1);
  END IF;

  -- Add accession_number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insider_trades' AND column_name = 'accession_number') THEN
    ALTER TABLE insider_trades ADD COLUMN accession_number VARCHAR(25);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_insider_trades_ticker ON insider_trades(ticker);
CREATE INDEX IF NOT EXISTS idx_insider_trades_filing_date ON insider_trades(filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_insider_trades_ticker_date ON insider_trades(ticker, filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_form4_filings_ticker ON form4_filings(ticker);
CREATE INDEX IF NOT EXISTS idx_form4_filings_company_cik ON form4_filings(company_cik);

-- Sync log table for insider trades
CREATE TABLE IF NOT EXISTS insider_sync_log (
  id BIGSERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  filings_processed INT DEFAULT 0,
  trades_created INT DEFAULT 0,
  error_count INT DEFAULT 0,
  error_message TEXT,
  parameters JSONB
);

-- ============================================================================
-- FIX CRON JOBS
-- ============================================================================

-- Remove old broken sync-insider-trades-v2 that points to wrong endpoint
SELECT cron.unschedule('sync-insider-trades-v2')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-insider-trades-v2');

-- Create new insider trades sync job pointing to correct endpoint
-- Runs at 3:00 PM UTC on weekdays (after market hours for most insider filings)
SELECT cron.schedule(
  'sync-insider-trades-daily',
  '0 15 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/cron/sync-insider-trades?limit=30',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Create 8-K filings sync job
-- Runs every 2 hours to catch material events (8-K are time-sensitive)
SELECT cron.schedule(
  'sync-8k-filings',
  '15 */2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://lician.com/api/cron/sync-8k-filings?priority=true',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- ============================================================================
-- LOG MIGRATION
-- ============================================================================

INSERT INTO cron_job_log (job_name, status, details)
VALUES (
  'migration-fix-insider-8k-jobs',
  'completed',
  jsonb_build_object(
    'message', 'Fixed insider trades sync and added 8-K filings sync',
    'jobs_created', ARRAY['sync-insider-trades-daily', 'sync-8k-filings'],
    'jobs_removed', ARRAY['sync-insider-trades-v2'],
    'tables_updated', ARRAY['sec_filings', 'insider_trades', 'form4_filings', 'insiders'],
    'version', '20251217000001'
  )
);
