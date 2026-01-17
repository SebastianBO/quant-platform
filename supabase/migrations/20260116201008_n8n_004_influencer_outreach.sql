-- Influencer Outreach Tables for n8n Workflow
-- Migration: 004_influencer_outreach
-- Created: 2026-01-16

-- Main influencer contacts table
CREATE TABLE IF NOT EXISTS influencer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'youtube', 'tiktok', 'instagram', 'linkedin')),
  handle TEXT NOT NULL,
  followers INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'nano' CHECK (tier IN ('nano', 'micro', 'macro', 'mega')),
  niche TEXT DEFAULT 'finance',
  email TEXT,
  profile_url TEXT,

  -- Outreach tracking
  outreach_method TEXT DEFAULT 'dm' CHECK (outreach_method IN ('email', 'dm')),
  priority_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'following_up', 'responded', 'interested',
    'declined', 'converted', 'completed', 'bounced', 'no_response'
  )),
  outreach_stage TEXT DEFAULT 'initial' CHECK (outreach_stage IN (
    'initial', 'followup_1', 'followup_2', 'completed'
  )),
  messages_sent INTEGER DEFAULT 0,

  -- Offer tracking
  offer_type TEXT DEFAULT 'premium_access' CHECK (offer_type IN (
    'premium_access', 'affiliate', 'collaboration'
  )),

  -- Timestamps
  last_outreach_at TIMESTAMPTZ,
  next_outreach_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,

  -- Response data
  response_type TEXT,
  response_content TEXT,
  conversion_type TEXT CHECK (conversion_type IN (
    'premium_signup', 'affiliate_joined', 'collaboration_agreed', NULL
  )),

  -- Metadata
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint on platform + handle
  UNIQUE (platform, handle)
);

-- Outreach log table for tracking all messages
CREATE TABLE IF NOT EXISTS influencer_outreach_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES influencer_contacts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  outreach_stage TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('email', 'dm', 'slack_queue')),
  message TEXT,
  tracking_id TEXT UNIQUE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_via TEXT,
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_influencer_contacts_status ON influencer_contacts(status);
CREATE INDEX IF NOT EXISTS idx_influencer_contacts_platform ON influencer_contacts(platform);
CREATE INDEX IF NOT EXISTS idx_influencer_contacts_tier ON influencer_contacts(tier);
CREATE INDEX IF NOT EXISTS idx_influencer_contacts_priority ON influencer_contacts(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_influencer_contacts_next_outreach ON influencer_contacts(next_outreach_at);
CREATE INDEX IF NOT EXISTS idx_influencer_contacts_followers ON influencer_contacts(followers DESC);
CREATE INDEX IF NOT EXISTS idx_influencer_outreach_log_contact ON influencer_outreach_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_influencer_outreach_log_tracking ON influencer_outreach_log(tracking_id);

-- Function for pipeline statistics (used by weekly report)
CREATE OR REPLACE FUNCTION influencer_pipeline_stats()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  week_ago TIMESTAMPTZ := NOW() - INTERVAL '7 days';
BEGIN
  SELECT json_build_object(
    -- Pipeline counts
    'total_contacts', (SELECT COUNT(*) FROM influencer_contacts),
    'pending', (SELECT COUNT(*) FROM influencer_contacts WHERE status = 'pending'),
    'following_up', (SELECT COUNT(*) FROM influencer_contacts WHERE status = 'following_up'),
    'responded', (SELECT COUNT(*) FROM influencer_contacts WHERE status = 'responded'),
    'interested', (SELECT COUNT(*) FROM influencer_contacts WHERE status = 'interested'),
    'converted', (SELECT COUNT(*) FROM influencer_contacts WHERE status = 'converted'),
    'declined', (SELECT COUNT(*) FROM influencer_contacts WHERE status = 'declined'),

    -- Week metrics
    'messages_sent_week', (SELECT COUNT(*) FROM influencer_outreach_log WHERE sent_at >= week_ago),
    'responses_week', (SELECT COUNT(*) FROM influencer_contacts WHERE responded_at >= week_ago),
    'conversions_week', (SELECT COUNT(*) FROM influencer_contacts WHERE converted_at >= week_ago),

    -- Response rate
    'response_rate', (
      SELECT CASE
        WHEN COUNT(*) > 0 THEN ROUND(
          (COUNT(*) FILTER (WHERE status IN ('responded', 'interested', 'converted', 'declined')))::NUMERIC
          / COUNT(*) * 100, 1
        ) || '%'
        ELSE '0%'
      END
      FROM influencer_contacts
      WHERE messages_sent > 0
    ),

    -- Conversion rate
    'conversion_rate', (
      SELECT CASE
        WHEN COUNT(*) > 0 THEN ROUND(
          (COUNT(*) FILTER (WHERE status = 'converted'))::NUMERIC
          / COUNT(*) * 100, 1
        ) || '%'
        ELSE '0%'
      END
      FROM influencer_contacts
      WHERE status IN ('responded', 'interested', 'converted', 'declined')
    ),

    -- By platform breakdown
    'by_platform', (
      SELECT json_object_agg(
        platform,
        json_build_object(
          'total', COUNT(*),
          'converted', COUNT(*) FILTER (WHERE status = 'converted')
        )
      )
      FROM influencer_contacts
      GROUP BY platform
    ),

    -- By tier breakdown
    'by_tier', (
      SELECT json_object_agg(
        tier,
        json_build_object(
          'total', COUNT(*),
          'converted', COUNT(*) FILTER (WHERE status = 'converted')
        )
      )
      FROM influencer_contacts
      GROUP BY tier
    ),

    -- Top conversions this month
    'top_conversions', (
      SELECT COALESCE(json_agg(json_build_object(
        'name', name,
        'platform', platform,
        'handle', handle,
        'followers', followers,
        'conversion_type', conversion_type,
        'converted_at', converted_at
      )), '[]'::json)
      FROM (
        SELECT name, platform, handle, followers, conversion_type, converted_at
        FROM influencer_contacts
        WHERE status = 'converted'
        AND converted_at >= NOW() - INTERVAL '30 days'
        ORDER BY followers DESC
        LIMIT 5
      ) t
    ),

    -- Hot leads (interested, high priority)
    'hot_leads', (
      SELECT COALESCE(json_agg(json_build_object(
        'name', name,
        'platform', platform,
        'handle', handle,
        'followers', followers,
        'responded_at', responded_at
      )), '[]'::json)
      FROM (
        SELECT name, platform, handle, followers, responded_at
        FROM influencer_contacts
        WHERE status = 'interested'
        ORDER BY priority_score DESC, followers DESC
        LIMIT 10
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_influencer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_influencer_updated_at ON influencer_contacts;
CREATE TRIGGER trigger_influencer_updated_at
  BEFORE UPDATE ON influencer_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_influencer_updated_at();

-- RLS Policies
ALTER TABLE influencer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_outreach_log ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for n8n workflow)
CREATE POLICY "Service role full access on influencer_contacts"
  ON influencer_contacts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on influencer_outreach_log"
  ON influencer_outreach_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE influencer_contacts IS 'Finance influencer contacts for lician.com partnership outreach';
COMMENT ON TABLE influencer_outreach_log IS 'Log of all outreach messages sent to influencers';
COMMENT ON FUNCTION influencer_pipeline_stats() IS 'Returns pipeline statistics for influencer outreach weekly reports';
COMMENT ON COLUMN influencer_contacts.tier IS 'Influencer size: nano (<10K), micro (10K-100K), macro (100K-1M), mega (1M+)';
COMMENT ON COLUMN influencer_contacts.priority_score IS 'Calculated priority based on followers, email availability, and niche relevance';
COMMENT ON COLUMN influencer_contacts.offer_type IS 'Type of partnership offered: premium_access, affiliate, collaboration';
