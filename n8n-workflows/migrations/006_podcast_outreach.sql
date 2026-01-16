-- Podcast Guest Outreach Tables for Lician.com
-- Tracks podcast targets, outreach campaigns, bookings, and episode releases

-- Main podcast targets table
CREATE TABLE IF NOT EXISTS podcast_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Podcast info
  name TEXT NOT NULL,
  host_name TEXT,
  host_email TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'investing' CHECK (category IN ('investing', 'personal_finance', 'business')),
  audience_size TEXT DEFAULT 'unknown', -- e.g., 'small', 'medium', 'large', '10k-50k', '50k-100k', '100k+'
  website_url TEXT,
  apple_podcasts_url TEXT,
  spotify_url TEXT,

  -- Outreach status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Not yet contacted
    'following_up', -- In follow-up sequence
    'responded',    -- Host replied
    'interested',   -- Host expressed interest
    'booked',       -- Episode booked
    'recorded',     -- Episode recorded
    'released',     -- Episode published
    'declined',     -- Host declined
    'bounced',      -- Email bounced
    'completed'     -- Outreach sequence finished (no response)
  )),
  outreach_stage TEXT DEFAULT 'initial' CHECK (outreach_stage IN ('initial', 'followup_1', 'followup_2', 'completed')),

  -- Email tracking
  emails_sent INTEGER DEFAULT 0,
  last_email_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,

  -- Response tracking
  responded_at TIMESTAMPTZ,
  response_type TEXT,
  response_content TEXT,

  -- Booking tracking
  booking_date TIMESTAMPTZ,
  recording_date TIMESTAMPTZ,
  booking_notes TEXT,
  calendar_link TEXT,

  -- Episode tracking
  episode_release_date TIMESTAMPTZ,
  episode_url TEXT,
  episode_title TEXT,
  episode_apple_url TEXT,
  episode_spotify_url TEXT,
  episode_youtube_url TEXT,

  -- Metadata
  notes TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email log for tracking all sent emails
CREATE TABLE IF NOT EXISTS podcast_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID REFERENCES podcast_targets(id) ON DELETE CASCADE,

  -- Email details
  email_type TEXT NOT NULL, -- 'initial', 'followup_1', 'followup_2'
  category TEXT, -- Podcast category used for template
  subject TEXT NOT NULL,
  recipient TEXT NOT NULL,
  tracking_id TEXT UNIQUE,

  -- Tracking
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_podcast_targets_status ON podcast_targets(status);
CREATE INDEX IF NOT EXISTS idx_podcast_targets_category ON podcast_targets(category);
CREATE INDEX IF NOT EXISTS idx_podcast_targets_next_followup ON podcast_targets(next_followup_at) WHERE status IN ('pending', 'following_up');
CREATE INDEX IF NOT EXISTS idx_podcast_targets_host_email ON podcast_targets(host_email);
CREATE INDEX IF NOT EXISTS idx_podcast_email_log_podcast_id ON podcast_email_log(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_email_log_tracking_id ON podcast_email_log(tracking_id);

-- Function to get pipeline stats for weekly report
CREATE OR REPLACE FUNCTION podcast_pipeline_stats()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  week_ago TIMESTAMPTZ := NOW() - INTERVAL '7 days';
BEGIN
  SELECT json_build_object(
    -- Pipeline counts
    'total_podcasts', (SELECT COUNT(*) FROM podcast_targets),
    'pending', (SELECT COUNT(*) FROM podcast_targets WHERE status = 'pending'),
    'following_up', (SELECT COUNT(*) FROM podcast_targets WHERE status = 'following_up'),
    'responded', (SELECT COUNT(*) FROM podcast_targets WHERE status = 'responded'),
    'interested', (SELECT COUNT(*) FROM podcast_targets WHERE status = 'interested'),
    'booked', (SELECT COUNT(*) FROM podcast_targets WHERE status = 'booked'),
    'recorded', (SELECT COUNT(*) FROM podcast_targets WHERE status = 'recorded'),
    'released', (SELECT COUNT(*) FROM podcast_targets WHERE status = 'released'),
    'declined', (SELECT COUNT(*) FROM podcast_targets WHERE status = 'declined'),

    -- Category breakdown
    'investing_count', (SELECT COUNT(*) FROM podcast_targets WHERE category = 'investing'),
    'personal_finance_count', (SELECT COUNT(*) FROM podcast_targets WHERE category = 'personal_finance'),
    'business_count', (SELECT COUNT(*) FROM podcast_targets WHERE category = 'business'),

    -- This week's email metrics
    'emails_sent_this_week', (
      SELECT COUNT(*) FROM podcast_email_log
      WHERE sent_at >= week_ago
    ),
    'opens_this_week', (
      SELECT COUNT(*) FROM podcast_email_log
      WHERE opened_at >= week_ago
    ),
    'replies_this_week', (
      SELECT COUNT(*) FROM podcast_email_log
      WHERE replied_at >= week_ago
    ),

    -- Rates
    'open_rate', (
      SELECT CASE
        WHEN COUNT(*) > 0 THEN
          ROUND((COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::NUMERIC / COUNT(*)::NUMERIC) * 100, 1)::TEXT || '%'
        ELSE '0%'
      END
      FROM podcast_email_log
      WHERE sent_at >= week_ago
    ),
    'reply_rate', (
      SELECT CASE
        WHEN COUNT(*) > 0 THEN
          ROUND((COUNT(*) FILTER (WHERE replied_at IS NOT NULL)::NUMERIC / COUNT(*)::NUMERIC) * 100, 1)::TEXT || '%'
        ELSE '0%'
      END
      FROM podcast_email_log
      WHERE sent_at >= week_ago
    ),

    -- Conversion rates
    'pitch_to_response_rate', (
      SELECT CASE
        WHEN COUNT(*) > 0 THEN
          ROUND((COUNT(*) FILTER (WHERE status IN ('responded', 'interested', 'booked', 'recorded', 'released'))::NUMERIC / COUNT(*)::NUMERIC) * 100, 1)::TEXT || '%'
        ELSE '0%'
      END
      FROM podcast_targets
    ),
    'response_to_booking_rate', (
      SELECT CASE
        WHEN COUNT(*) FILTER (WHERE status IN ('responded', 'interested', 'booked', 'recorded', 'released')) > 0 THEN
          ROUND((COUNT(*) FILTER (WHERE status IN ('booked', 'recorded', 'released'))::NUMERIC /
                 COUNT(*) FILTER (WHERE status IN ('responded', 'interested', 'booked', 'recorded', 'released'))::NUMERIC) * 100, 1)::TEXT || '%'
        ELSE '0%'
      END
      FROM podcast_targets
    ),

    -- Upcoming recordings
    'upcoming_recordings', (
      SELECT COALESCE(json_agg(json_build_object(
        'name', name,
        'host_name', host_name,
        'recording_date', recording_date
      )), '[]'::JSON)
      FROM podcast_targets
      WHERE status IN ('booked', 'recorded')
        AND recording_date >= NOW()
        AND recording_date <= NOW() + INTERVAL '30 days'
      ORDER BY recording_date
      LIMIT 5
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_podcast_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_podcast_targets_updated_at ON podcast_targets;
CREATE TRIGGER trigger_podcast_targets_updated_at
  BEFORE UPDATE ON podcast_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_podcast_targets_updated_at();

-- Enable Row Level Security
ALTER TABLE podcast_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_email_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service role can do everything)
CREATE POLICY "Service role full access to podcast_targets" ON podcast_targets
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access to podcast_email_log" ON podcast_email_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON podcast_targets TO service_role;
GRANT ALL ON podcast_email_log TO service_role;
GRANT EXECUTE ON FUNCTION podcast_pipeline_stats() TO service_role;

-- Comments for documentation
COMMENT ON TABLE podcast_targets IS 'Tracks podcast outreach targets for CEO guest appearances - lician.com';
COMMENT ON TABLE podcast_email_log IS 'Log of all outreach emails sent to podcast hosts';
COMMENT ON FUNCTION podcast_pipeline_stats IS 'Returns JSON stats for weekly pipeline report';
