-- Migration: Create reddit_opportunities table for n8n workflow
-- Run this in your Supabase SQL editor before activating the workflow

CREATE TABLE IF NOT EXISTS reddit_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reddit_id TEXT UNIQUE NOT NULL,
  subreddit TEXT NOT NULL,
  title TEXT NOT NULL,
  selftext TEXT,
  author TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  num_comments INTEGER DEFAULT 0,
  url TEXT NOT NULL,
  post_created_at TIMESTAMPTZ NOT NULL,
  opportunity_type TEXT NOT NULL DEFAULT 'general',
  relevance_score INTEGER DEFAULT 0,
  suggested_response TEXT,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'responded', 'skipped', 'expired')),
  responded_at TIMESTAMPTZ,
  response_text TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reddit_opportunities_status ON reddit_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_reddit_opportunities_relevance ON reddit_opportunities(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_reddit_opportunities_discovered ON reddit_opportunities(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_reddit_opportunities_subreddit ON reddit_opportunities(subreddit);
CREATE INDEX IF NOT EXISTS idx_reddit_opportunities_type ON reddit_opportunities(opportunity_type);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_reddit_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reddit_opportunities_updated_at ON reddit_opportunities;
CREATE TRIGGER trigger_reddit_opportunities_updated_at
  BEFORE UPDATE ON reddit_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_reddit_opportunities_updated_at();

-- Auto-expire old opportunities (run as scheduled job or cron)
-- Marks opportunities older than 7 days as expired
CREATE OR REPLACE FUNCTION expire_old_reddit_opportunities()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE reddit_opportunities
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'new'
    AND discovered_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (if using Supabase Auth)
ALTER TABLE reddit_opportunities ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all opportunities
CREATE POLICY "Allow authenticated read" ON reddit_opportunities
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role full access (for n8n)
CREATE POLICY "Allow service role full access" ON reddit_opportunities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Sample queries for dashboard/admin views:

-- Get today's opportunities
-- SELECT * FROM reddit_opportunities
-- WHERE discovered_at > NOW() - INTERVAL '24 hours'
-- ORDER BY relevance_score DESC;

-- Get opportunities by type
-- SELECT opportunity_type, COUNT(*) as count, AVG(relevance_score) as avg_score
-- FROM reddit_opportunities
-- WHERE status = 'new'
-- GROUP BY opportunity_type
-- ORDER BY count DESC;

-- Mark as responded
-- UPDATE reddit_opportunities
-- SET status = 'responded', responded_at = NOW(), response_text = 'Your response here'
-- WHERE id = 'uuid-here';

COMMENT ON TABLE reddit_opportunities IS 'Reddit posts identified as marketing opportunities for Lician.com via n8n workflow';
COMMENT ON COLUMN reddit_opportunities.opportunity_type IS 'Category: compound_interest, stock_comparison, pe_ratio, dividend_yield, stock_screener, financial_analysis, valuation, general';
COMMENT ON COLUMN reddit_opportunities.relevance_score IS 'Score 0-100 indicating how relevant the post is for Lician marketing';
COMMENT ON COLUMN reddit_opportunities.status IS 'Workflow status: new (unprocessed), responded (answered), skipped (not worth responding), expired (too old)';
