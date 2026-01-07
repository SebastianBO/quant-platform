-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  preferences JSONB DEFAULT '{"daily_digest": true, "weekly_summary": true, "breaking_news": true}'::jsonb,
  source TEXT DEFAULT 'website',
  ip_address TEXT,
  user_agent TEXT,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);

-- RLS policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (for signups)
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Allow updates for unsubscribe (anyone can unsubscribe their own email)
CREATE POLICY "Anyone can unsubscribe" ON newsletter_subscribers
  FOR UPDATE USING (true) WITH CHECK (true);

-- Track newsletter sends
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  content_html TEXT,
  content_text TEXT,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter analytics
CREATE TABLE IF NOT EXISTS newsletter_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id UUID REFERENCES newsletter_sends(id),
  subscriber_id UUID REFERENCES newsletter_subscribers(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_events_send ON newsletter_events(send_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_events_subscriber ON newsletter_events(subscriber_id);
