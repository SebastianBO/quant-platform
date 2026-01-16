-- Guest Post Outreach Tables for n8n Workflow
-- Migration: 003_guest_post_outreach
-- Created: 2026-01-16

-- Main targets table
CREATE TABLE IF NOT EXISTS outreach_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site TEXT NOT NULL,
  site_name TEXT,
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  domain_authority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'following_up', 'responded', 'interested', 'declined', 'completed', 'bounced', 'unsubscribed')),
  outreach_stage TEXT DEFAULT 'initial' CHECK (outreach_stage IN ('initial', 'followup_1', 'followup_2', 'completed')),
  emails_sent INTEGER DEFAULT 0,
  last_email_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_type TEXT,
  response_content TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email log table for tracking
CREATE TABLE IF NOT EXISTS outreach_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID REFERENCES outreach_targets(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  subject TEXT,
  recipient TEXT NOT NULL,
  tracking_id TEXT UNIQUE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_outreach_targets_status ON outreach_targets(status);
CREATE INDEX IF NOT EXISTS idx_outreach_targets_next_followup ON outreach_targets(next_followup_at);
CREATE INDEX IF NOT EXISTS idx_outreach_targets_domain_authority ON outreach_targets(domain_authority DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_email_log_target ON outreach_email_log(target_id);
CREATE INDEX IF NOT EXISTS idx_outreach_email_log_tracking ON outreach_email_log(tracking_id);

-- Function for weekly stats (used by weekly report)
CREATE OR REPLACE FUNCTION outreach_weekly_stats()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  week_ago TIMESTAMPTZ := NOW() - INTERVAL '7 days';
BEGIN
  SELECT json_build_object(
    'emails_sent', (SELECT COUNT(*) FROM outreach_email_log WHERE sent_at >= week_ago),
    'opens', (SELECT COUNT(*) FROM outreach_email_log WHERE opened_at >= week_ago),
    'open_rate', (
      SELECT CASE
        WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::NUMERIC / COUNT(*) * 100), 1) || '%'
        ELSE '0%'
      END
      FROM outreach_email_log WHERE sent_at >= week_ago
    ),
    'replies', (SELECT COUNT(*) FROM outreach_targets WHERE responded_at >= week_ago),
    'reply_rate', (
      SELECT CASE
        WHEN (SELECT COUNT(*) FROM outreach_email_log WHERE sent_at >= week_ago) > 0
        THEN ROUND(
          (SELECT COUNT(*) FROM outreach_targets WHERE responded_at >= week_ago)::NUMERIC /
          (SELECT COUNT(*) FROM outreach_email_log WHERE sent_at >= week_ago) * 100, 1
        ) || '%'
        ELSE '0%'
      END
    ),
    'interested', (SELECT COUNT(*) FROM outreach_targets WHERE status = 'interested' AND updated_at >= week_ago),
    'declined', (SELECT COUNT(*) FROM outreach_targets WHERE status = 'declined' AND updated_at >= week_ago),
    'pending', (SELECT COUNT(*) FROM outreach_targets WHERE status IN ('pending', 'following_up')),
    'conversion_rate', (
      SELECT CASE
        WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status = 'interested')::NUMERIC / COUNT(*) * 100), 1) || '%'
        ELSE '0%'
      END
      FROM outreach_targets WHERE created_at >= week_ago
    ),
    'top_sites', (
      SELECT COALESCE(json_agg(json_build_object('site', site, 'da', domain_authority, 'status', status)), '[]'::json)
      FROM (
        SELECT site, domain_authority, status
        FROM outreach_targets
        WHERE status = 'interested'
        ORDER BY domain_authority DESC
        LIMIT 5
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- RLS Policies (enable RLS first)
ALTER TABLE outreach_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_email_log ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for n8n workflow)
CREATE POLICY "Service role full access on outreach_targets"
  ON outreach_targets
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on outreach_email_log"
  ON outreach_email_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE outreach_targets IS 'Guest post outreach targets for lician.com link building';
COMMENT ON TABLE outreach_email_log IS 'Email tracking log for outreach campaigns';
COMMENT ON FUNCTION outreach_weekly_stats() IS 'Returns weekly statistics for outreach reporting';
