-- Add biotech sync state columns to sync_state table
-- Supports incremental discovery and trial syncing

-- Add columns if they don't exist
DO $$
BEGIN
  -- Add biotech-specific columns to sync_state
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sync_state' AND column_name = 'last_discovery_offset') THEN
    ALTER TABLE sync_state ADD COLUMN last_discovery_offset INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sync_state' AND column_name = 'last_trial_sync_batch') THEN
    ALTER TABLE sync_state ADD COLUMN last_trial_sync_batch INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sync_state' AND column_name = 'last_run_at') THEN
    ALTER TABLE sync_state ADD COLUMN last_run_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create biotech sync log view for easy monitoring
CREATE OR REPLACE VIEW biotech_sync_status AS
SELECT
  (SELECT COUNT(*) FROM biotech_company_mapping) as total_companies,
  (SELECT COUNT(DISTINCT ticker) FROM clinical_trials) as companies_with_trials,
  (SELECT COUNT(*) FROM clinical_trials) as total_trials,
  (SELECT COUNT(*) FROM clinical_trials WHERE overall_status IN ('RECRUITING', 'ACTIVE_NOT_RECRUITING', 'ENROLLING_BY_INVITATION')) as active_trials,
  (SELECT COUNT(*) FROM clinical_trials WHERE phase = 'PHASE3') as phase3_trials,
  (SELECT COUNT(*) FROM biotech_catalysts WHERE outcome = 'PENDING') as pending_catalysts,
  (SELECT COUNT(*) FROM biotech_catalysts WHERE expected_date <= CURRENT_DATE + INTERVAL '90 days' AND outcome = 'PENDING') as imminent_catalysts,
  (SELECT MAX(updated_at) FROM clinical_trials) as last_trial_update,
  (SELECT last_run_at FROM sync_state WHERE sync_type = 'biotech') as last_sync_run;

-- Grant access to view
GRANT SELECT ON biotech_sync_status TO anon, authenticated;
