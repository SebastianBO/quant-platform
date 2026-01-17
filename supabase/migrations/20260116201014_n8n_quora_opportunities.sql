-- Migration: Create quora_opportunities table for n8n workflow
-- Run this in your Supabase SQL editor before activating the workflow

CREATE TABLE IF NOT EXISTS quora_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quora_id TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  question_summary TEXT,
  search_query TEXT,
  view_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  age_days INTEGER DEFAULT 0,
  opportunity_type TEXT NOT NULL DEFAULT 'general',
  relevance_score INTEGER DEFAULT 0,
  suggested_response TEXT,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'answered', 'skipped', 'expired', 'pending_verification')),
  -- Tracking fields for answered questions
  answered_at TIMESTAMPTZ,
  answer_url TEXT,
  answer_text TEXT,
  answer_upvotes INTEGER DEFAULT 0,
  is_answer_visible BOOLEAN DEFAULT false,
  last_tracked_at TIMESTAMPTZ,
  -- Metadata
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_quora_opportunities_status ON quora_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_quora_opportunities_relevance ON quora_opportunities(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_quora_opportunities_discovered ON quora_opportunities(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_quora_opportunities_type ON quora_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_quora_opportunities_views ON quora_opportunities(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_quora_opportunities_answered ON quora_opportunities(answered_at DESC) WHERE answered_at IS NOT NULL;

-- Full text search index for finding questions by content
CREATE INDEX IF NOT EXISTS idx_quora_opportunities_title_fts ON quora_opportunities USING gin(to_tsvector('english', title));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_quora_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_quora_opportunities_updated_at ON quora_opportunities;
CREATE TRIGGER trigger_quora_opportunities_updated_at
  BEFORE UPDATE ON quora_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_quora_opportunities_updated_at();

-- Auto-expire old opportunities (run as scheduled job or cron)
-- Marks opportunities older than 14 days as expired (longer than Reddit since Quora content is evergreen)
CREATE OR REPLACE FUNCTION expire_old_quora_opportunities()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE quora_opportunities
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'new'
    AND discovered_at < NOW() - INTERVAL '14 days';

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Get performance metrics for answered questions
CREATE OR REPLACE FUNCTION get_quora_answer_performance()
RETURNS TABLE (
  total_answered BIGINT,
  total_upvotes BIGINT,
  avg_upvotes NUMERIC,
  visible_answers BIGINT,
  visibility_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_answered,
    COALESCE(SUM(answer_upvotes), 0)::BIGINT as total_upvotes,
    COALESCE(AVG(answer_upvotes), 0)::NUMERIC as avg_upvotes,
    COUNT(*) FILTER (WHERE is_answer_visible)::BIGINT as visible_answers,
    (COUNT(*) FILTER (WHERE is_answer_visible)::NUMERIC / NULLIF(COUNT(*), 0) * 100)::NUMERIC as visibility_rate
  FROM quora_opportunities
  WHERE status = 'answered';
END;
$$ LANGUAGE plpgsql;

-- Workflow runs tracking table (shared across workflows)
CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name TEXT NOT NULL,
  run_date TIMESTAMPTZ DEFAULT NOW(),
  opportunities_found INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  avg_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_name, run_date)
);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_name_date ON workflow_runs(workflow_name, run_date DESC);

-- RLS Policies (if using Supabase Auth)
ALTER TABLE quora_opportunities ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all opportunities
CREATE POLICY "Allow authenticated read quora" ON quora_opportunities
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role full access (for n8n)
CREATE POLICY "Allow service role full access quora" ON quora_opportunities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS for workflow_runs
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read workflow_runs" ON workflow_runs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role full access workflow_runs" ON workflow_runs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Sample queries for dashboard/admin views:

-- Get today's top opportunities
-- SELECT * FROM quora_opportunities
-- WHERE discovered_at > NOW() - INTERVAL '24 hours'
--   AND status = 'new'
-- ORDER BY relevance_score DESC, view_count DESC
-- LIMIT 20;

-- Get opportunities by type with stats
-- SELECT
--   opportunity_type,
--   COUNT(*) as count,
--   AVG(relevance_score) as avg_score,
--   SUM(view_count) as total_views
-- FROM quora_opportunities
-- WHERE status = 'new'
-- GROUP BY opportunity_type
-- ORDER BY count DESC;

-- Get high-value opportunities (high views, few answers)
-- SELECT * FROM quora_opportunities
-- WHERE status = 'new'
--   AND view_count >= 1000
--   AND answer_count <= 3
--   AND relevance_score >= 75
-- ORDER BY view_count DESC, relevance_score DESC;

-- Mark question as answered
-- UPDATE quora_opportunities
-- SET
--   status = 'answered',
--   answered_at = NOW(),
--   answer_url = 'https://quora.com/...',
--   answer_text = 'Your answer summary'
-- WHERE id = 'uuid-here';

-- Track answer performance over time
-- SELECT
--   DATE_TRUNC('week', answered_at) as week,
--   COUNT(*) as answers_posted,
--   SUM(answer_upvotes) as total_upvotes,
--   AVG(answer_upvotes) as avg_upvotes,
--   COUNT(*) FILTER (WHERE is_answer_visible) as visible_count
-- FROM quora_opportunities
-- WHERE status = 'answered'
-- GROUP BY DATE_TRUNC('week', answered_at)
-- ORDER BY week DESC;

-- Search questions by topic
-- SELECT * FROM quora_opportunities
-- WHERE to_tsvector('english', title) @@ to_tsquery('english', 'dividend & investing')
--   AND status = 'new'
-- ORDER BY relevance_score DESC;

COMMENT ON TABLE quora_opportunities IS 'Quora questions identified as marketing opportunities for Lician.com via n8n workflow';
COMMENT ON COLUMN quora_opportunities.opportunity_type IS 'Category: stock_basics, pe_ratio, dividend_investing, compound_interest, etf_investing, retirement, stock_screener, stock_analysis, valuation, comparison, general';
COMMENT ON COLUMN quora_opportunities.relevance_score IS 'Score 0-100 indicating how relevant the question is for Lician marketing';
COMMENT ON COLUMN quora_opportunities.status IS 'Workflow status: new (unprocessed), answered (response posted), pending_verification (answer posted but not verified), skipped (not worth responding), expired (too old)';
COMMENT ON COLUMN quora_opportunities.answer_upvotes IS 'Number of upvotes on our answer (tracked periodically)';
COMMENT ON COLUMN quora_opportunities.is_answer_visible IS 'Whether our answer is still visible on the page (not collapsed/hidden)';
COMMENT ON TABLE workflow_runs IS 'Tracking table for n8n workflow execution metrics';
