-- Broken Link Opportunities Table for n8n Workflow
-- Migration: 004_broken_link_opportunities
-- Created: 2026-01-16
-- Purpose: Store broken link building opportunities discovered by the n8n workflow

-- Main opportunities table
CREATE TABLE IF NOT EXISTS broken_link_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Unique identifier for deduplication
  opportunity_id TEXT UNIQUE NOT NULL,

  -- Source page information (where the broken link was found)
  source_url TEXT NOT NULL,
  source_domain TEXT NOT NULL,
  source_category TEXT CHECK (source_category IN ('government', 'education', 'finance_blog', 'personal_finance', 'research', 'exchange', 'fintech', 'other')),
  source_domain_authority INTEGER DEFAULT 0,
  source_page_title TEXT,

  -- Broken link details
  broken_url TEXT NOT NULL,
  broken_domain TEXT,
  http_status_code INTEGER,
  error_message TEXT,
  status_category TEXT CHECK (status_category IN ('404', '403', '410', '4xx', '5xx', 'error', 'ok', 'unknown')),
  anchor_text TEXT,
  is_nofollow BOOLEAN DEFAULT FALSE,

  -- Suggested replacement from lician.com
  suggested_replacement_url TEXT,
  suggested_replacement_title TEXT,
  content_match_score INTEGER DEFAULT 0,

  -- Priority scoring
  priority_score INTEGER DEFAULT 0 CHECK (priority_score >= 0 AND priority_score <= 100),
  priority_tier TEXT DEFAULT 'low' CHECK (priority_tier IN ('high', 'medium', 'low')),

  -- Generated outreach content
  outreach_email_subject TEXT,
  outreach_email_body TEXT,

  -- Outreach tracking
  outreach_status TEXT DEFAULT 'pending' CHECK (outreach_status IN ('pending', 'contacted', 'responded', 'success', 'rejected', 'no_response', 'invalid')),
  outreach_sent_at TIMESTAMPTZ,
  outreach_response_at TIMESTAMPTZ,
  outreach_notes TEXT,

  -- Link acquisition tracking
  link_acquired BOOLEAN DEFAULT FALSE,
  link_acquired_at TIMESTAMPTZ,
  acquired_url TEXT,
  acquired_anchor_text TEXT,

  -- Timestamps
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_broken_link_opp_source_domain ON broken_link_opportunities(source_domain);
CREATE INDEX IF NOT EXISTS idx_broken_link_opp_priority_tier ON broken_link_opportunities(priority_tier);
CREATE INDEX IF NOT EXISTS idx_broken_link_opp_priority_score ON broken_link_opportunities(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_broken_link_opp_outreach_status ON broken_link_opportunities(outreach_status);
CREATE INDEX IF NOT EXISTS idx_broken_link_opp_source_category ON broken_link_opportunities(source_category);
CREATE INDEX IF NOT EXISTS idx_broken_link_opp_discovered_at ON broken_link_opportunities(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_broken_link_opp_source_da ON broken_link_opportunities(source_domain_authority DESC);
CREATE INDEX IF NOT EXISTS idx_broken_link_opp_link_acquired ON broken_link_opportunities(link_acquired);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_broken_link_opp_pending_priority
  ON broken_link_opportunities(outreach_status, priority_tier, priority_score DESC)
  WHERE outreach_status = 'pending';

-- Full text search on anchor text for content matching
CREATE INDEX IF NOT EXISTS idx_broken_link_opp_anchor_text_gin
  ON broken_link_opportunities USING gin(to_tsvector('english', COALESCE(anchor_text, '')));

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_broken_link_opp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_broken_link_opp_updated_at ON broken_link_opportunities;
CREATE TRIGGER trigger_broken_link_opp_updated_at
  BEFORE UPDATE ON broken_link_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_broken_link_opp_updated_at();

-- Function for weekly stats (used by Slack report)
CREATE OR REPLACE FUNCTION broken_link_weekly_stats()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  week_ago TIMESTAMPTZ := NOW() - INTERVAL '7 days';
BEGIN
  SELECT json_build_object(
    'total_opportunities', (SELECT COUNT(*) FROM broken_link_opportunities),
    'new_this_week', (SELECT COUNT(*) FROM broken_link_opportunities WHERE discovered_at >= week_ago),
    'high_priority', (SELECT COUNT(*) FROM broken_link_opportunities WHERE priority_tier = 'high' AND outreach_status = 'pending'),
    'medium_priority', (SELECT COUNT(*) FROM broken_link_opportunities WHERE priority_tier = 'medium' AND outreach_status = 'pending'),
    'low_priority', (SELECT COUNT(*) FROM broken_link_opportunities WHERE priority_tier = 'low' AND outreach_status = 'pending'),
    'outreach_sent', (SELECT COUNT(*) FROM broken_link_opportunities WHERE outreach_sent_at >= week_ago),
    'responses_received', (SELECT COUNT(*) FROM broken_link_opportunities WHERE outreach_response_at >= week_ago),
    'links_acquired', (SELECT COUNT(*) FROM broken_link_opportunities WHERE link_acquired_at >= week_ago),
    'avg_domain_authority', (SELECT ROUND(AVG(source_domain_authority), 1) FROM broken_link_opportunities WHERE outreach_status = 'pending'),
    'by_category', (
      SELECT json_object_agg(source_category, cnt)
      FROM (
        SELECT COALESCE(source_category, 'other') as source_category, COUNT(*) as cnt
        FROM broken_link_opportunities
        WHERE discovered_at >= week_ago
        GROUP BY source_category
      ) sub
    ),
    'conversion_rate', (
      SELECT CASE
        WHEN (SELECT COUNT(*) FROM broken_link_opportunities WHERE outreach_sent_at IS NOT NULL) > 0
        THEN ROUND(
          (SELECT COUNT(*) FROM broken_link_opportunities WHERE link_acquired = true)::NUMERIC /
          (SELECT COUNT(*) FROM broken_link_opportunities WHERE outreach_sent_at IS NOT NULL) * 100, 1
        ) || '%'
        ELSE '0%'
      END
    )
  ) INTO result;
  RETURN result;
END;
$$;

-- Function to get top opportunities for outreach
CREATE OR REPLACE FUNCTION get_top_broken_link_opportunities(
  limit_count INTEGER DEFAULT 10,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  source_domain TEXT,
  source_domain_authority INTEGER,
  broken_url TEXT,
  anchor_text TEXT,
  suggested_replacement_url TEXT,
  priority_score INTEGER,
  outreach_email_subject TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.source_domain,
    o.source_domain_authority,
    o.broken_url,
    o.anchor_text,
    o.suggested_replacement_url,
    o.priority_score,
    o.outreach_email_subject
  FROM broken_link_opportunities o
  WHERE o.outreach_status = 'pending'
    AND o.is_nofollow = FALSE
    AND (category_filter IS NULL OR o.source_category = category_filter)
  ORDER BY o.priority_score DESC, o.source_domain_authority DESC
  LIMIT limit_count;
END;
$$;

-- Function to mark opportunity as contacted
CREATE OR REPLACE FUNCTION mark_broken_link_contacted(
  opp_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS broken_link_opportunities
LANGUAGE plpgsql
AS $$
DECLARE
  updated_row broken_link_opportunities;
BEGIN
  UPDATE broken_link_opportunities
  SET
    outreach_status = 'contacted',
    outreach_sent_at = NOW(),
    outreach_notes = COALESCE(notes, outreach_notes)
  WHERE id = opp_id
  RETURNING * INTO updated_row;

  RETURN updated_row;
END;
$$;

-- Function to record link acquisition
CREATE OR REPLACE FUNCTION record_broken_link_acquisition(
  opp_id UUID,
  new_url TEXT,
  new_anchor TEXT DEFAULT NULL
)
RETURNS broken_link_opportunities
LANGUAGE plpgsql
AS $$
DECLARE
  updated_row broken_link_opportunities;
BEGIN
  UPDATE broken_link_opportunities
  SET
    outreach_status = 'success',
    link_acquired = TRUE,
    link_acquired_at = NOW(),
    acquired_url = new_url,
    acquired_anchor_text = COALESCE(new_anchor, anchor_text)
  WHERE id = opp_id
  RETURNING * INTO updated_row;

  RETURN updated_row;
END;
$$;

-- RLS Policies (enable if needed)
-- ALTER TABLE broken_link_opportunities ENABLE ROW LEVEL SECURITY;

-- Grant access to service role
-- GRANT ALL ON broken_link_opportunities TO service_role;
-- GRANT EXECUTE ON FUNCTION broken_link_weekly_stats() TO service_role;
-- GRANT EXECUTE ON FUNCTION get_top_broken_link_opportunities(INTEGER, TEXT) TO service_role;
-- GRANT EXECUTE ON FUNCTION mark_broken_link_contacted(UUID, TEXT) TO service_role;
-- GRANT EXECUTE ON FUNCTION record_broken_link_acquisition(UUID, TEXT, TEXT) TO service_role;

-- Sample data for testing (commented out)
/*
INSERT INTO broken_link_opportunities (
  opportunity_id, source_url, source_domain, source_category, source_domain_authority,
  broken_url, broken_domain, http_status_code, status_category, anchor_text,
  suggested_replacement_url, suggested_replacement_title, content_match_score,
  priority_score, priority_tier, outreach_email_subject
) VALUES (
  'test_investopedia_example',
  'https://investopedia.com/best-stock-screeners',
  'investopedia.com',
  'finance_blog',
  86,
  'https://defunct-stock-tool.com/screener',
  'defunct-stock-tool.com',
  404,
  '404',
  'free stock screener',
  'https://lician.com/stocks',
  'Stock Screener - Filter 110K+ US & EU Stocks',
  45,
  73,
  'high',
  'Broken Link Report - investopedia.com'
);
*/

COMMENT ON TABLE broken_link_opportunities IS 'Stores broken link building opportunities discovered by the n8n broken-link-finder workflow. Used for SEO link building outreach.';
