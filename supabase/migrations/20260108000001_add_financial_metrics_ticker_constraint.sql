-- Add unique constraint for ticker-based upserts on financial_metrics
-- Migration: 20260108000001_add_financial_metrics_ticker_constraint.sql

-- Add source column if not exists
ALTER TABLE financial_metrics ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'CALCULATED';

-- Drop existing constraint if it only uses CIK
-- (We need ticker + report_period + period for Yahoo Finance data which may not have CIK)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'financial_metrics_cik_report_period_period_key'
  ) THEN
    ALTER TABLE financial_metrics DROP CONSTRAINT financial_metrics_cik_report_period_period_key;
  END IF;
END $$;

-- Create new unique constraint that supports both CIK and ticker-based upserts
-- Use a unique index instead of constraint for flexibility with NULLs
CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_metrics_ticker_period_unique
ON financial_metrics(ticker, report_period, period)
WHERE ticker IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_metrics_cik_period_unique
ON financial_metrics(cik, report_period, period)
WHERE cik IS NOT NULL;

-- Add comments
COMMENT ON COLUMN financial_metrics.source IS 'Data source: YAHOO_FINANCE, CALCULATED, FINANCIAL_DATASETS';
