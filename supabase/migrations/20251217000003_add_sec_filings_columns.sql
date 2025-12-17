-- Add remaining columns to sec_filings table

DO $$
BEGIN
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
END $$;

-- Create index on filing_url
CREATE INDEX IF NOT EXISTS idx_filings_url ON sec_filings(filing_url);
