-- Fix sec_filings table schema - add all needed columns

DO $$
BEGIN
  -- Add accession_number column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'accession_number') THEN
    ALTER TABLE sec_filings ADD COLUMN accession_number VARCHAR(25);
  END IF;

  -- Add filing_url column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'filing_url') THEN
    ALTER TABLE sec_filings ADD COLUMN filing_url TEXT;
  END IF;

  -- Add items column if missing (for 8-K items)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'items') THEN
    ALTER TABLE sec_filings ADD COLUMN items TEXT[];
  END IF;

  -- Add description column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'description') THEN
    ALTER TABLE sec_filings ADD COLUMN description TEXT;
  END IF;

  -- Add company_name column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'company_name') THEN
    ALTER TABLE sec_filings ADD COLUMN company_name VARCHAR(200);
  END IF;

  -- Add synced_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sec_filings' AND column_name = 'synced_at') THEN
    ALTER TABLE sec_filings ADD COLUMN synced_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add unique constraint on accession_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'sec_filings'
    AND constraint_type = 'UNIQUE'
    AND constraint_name = 'sec_filings_accession_number_key'
  ) THEN
    ALTER TABLE sec_filings ADD CONSTRAINT sec_filings_accession_number_key UNIQUE (accession_number);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_filings_accession ON sec_filings(accession_number);
CREATE INDEX IF NOT EXISTS idx_filings_url ON sec_filings(filing_url);

-- Log migration
INSERT INTO cron_job_log (job_name, status, details)
VALUES (
  'migration-fix-sec-filings-schema',
  'completed',
  jsonb_build_object(
    'message', 'Added missing columns to sec_filings (accession_number, filing_url, items, description, company_name, synced_at)',
    'version', '20251217000002'
  )
);
