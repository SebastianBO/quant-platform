-- Sync Queue System
-- Works without pg_cron by using database triggers + webhook

-- Track sync state
CREATE TABLE IF NOT EXISTS sync_state (
  id SERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL UNIQUE,
  current_offset INT DEFAULT 0,
  total_companies INT DEFAULT 10196,
  companies_synced INT DEFAULT 0,
  is_running BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  last_batch_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Initialize
INSERT INTO sync_state (sync_type, current_offset, companies_synced)
VALUES ('financials', 0, 0)
ON CONFLICT (sync_type) DO NOTHING;

-- Queue for pending company syncs (for new filings)
CREATE TABLE IF NOT EXISTS sync_queue (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(20) NOT NULL,
  cik VARCHAR(10),
  priority INT DEFAULT 0, -- Higher = more urgent
  reason VARCHAR(50), -- 'new_filing', 'initial_sync', 'refresh'
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  UNIQUE(ticker, status) -- Prevent duplicate pending entries
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status, priority DESC, queued_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_ticker ON sync_queue(ticker);

-- Function to queue a company for sync (called when new filing detected)
CREATE OR REPLACE FUNCTION queue_company_sync(
  p_ticker VARCHAR(20),
  p_cik VARCHAR(10) DEFAULT NULL,
  p_reason VARCHAR(50) DEFAULT 'manual',
  p_priority INT DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO sync_queue (ticker, cik, reason, priority)
  VALUES (p_ticker, p_cik, p_reason, p_priority)
  ON CONFLICT (ticker, status)
  WHERE status = 'pending'
  DO UPDATE SET priority = GREATEST(sync_queue.priority, p_priority);
END;
$$;

-- View current sync progress
CREATE OR REPLACE VIEW sync_progress_view AS
SELECT
  s.sync_type,
  s.current_offset,
  s.total_companies,
  s.companies_synced,
  ROUND((s.companies_synced::NUMERIC / s.total_companies) * 100, 2) as percent_complete,
  s.is_running,
  s.last_batch_at,
  (SELECT COUNT(*) FROM sync_queue WHERE status = 'pending') as pending_queue,
  CASE
    WHEN s.companies_synced >= s.total_companies THEN 'COMPLETE'
    WHEN s.is_running THEN 'RUNNING'
    ELSE 'IDLE'
  END as status
FROM sync_state s
WHERE s.sync_type = 'financials';

-- API to get next batch to sync (called by Vercel API)
CREATE OR REPLACE FUNCTION get_next_sync_batch(batch_size INT DEFAULT 5)
RETURNS TABLE(
  ticker VARCHAR(20),
  cik VARCHAR(10),
  source VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
DECLARE
  queue_count INT;
BEGIN
  -- First check priority queue (new filings)
  SELECT COUNT(*) INTO queue_count FROM sync_queue WHERE status = 'pending';

  IF queue_count > 0 THEN
    -- Return from priority queue
    RETURN QUERY
    UPDATE sync_queue
    SET status = 'processing', started_at = NOW()
    WHERE id IN (
      SELECT id FROM sync_queue
      WHERE status = 'pending'
      ORDER BY priority DESC, queued_at
      LIMIT batch_size
    )
    RETURNING sync_queue.ticker, sync_queue.cik, 'queue'::VARCHAR(20);
  ELSE
    -- Return from main sync (all companies)
    -- This would need to be implemented with the SEC ticker list
    RETURN;
  END IF;
END;
$$;

-- Mark batch as complete
CREATE OR REPLACE FUNCTION mark_sync_complete(p_ticker VARCHAR(20), p_success BOOLEAN, p_error TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE sync_queue
  SET
    status = CASE WHEN p_success THEN 'completed' ELSE 'failed' END,
    completed_at = NOW(),
    error_message = p_error
  WHERE ticker = p_ticker AND status = 'processing';

  -- Update overall progress
  IF p_success THEN
    UPDATE sync_state
    SET companies_synced = companies_synced + 1,
        last_batch_at = NOW()
    WHERE sync_type = 'financials';
  END IF;
END;
$$;

COMMENT ON TABLE sync_queue IS 'Queue for company financial data syncs - priority queue for new filings';
COMMENT ON TABLE sync_state IS 'Tracks overall sync progress for bulk data loading';
