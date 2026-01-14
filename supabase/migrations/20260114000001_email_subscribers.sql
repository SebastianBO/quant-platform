-- Email Subscribers Table for Newsletter
-- Created: Jan 14, 2026

-- Main subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Subscription preferences
  subscribed_weekly_digest BOOLEAN DEFAULT true,
  subscribed_market_alerts BOOLEAN DEFAULT true,
  subscribed_earnings_calendar BOOLEAN DEFAULT false,
  subscribed_product_updates BOOLEAN DEFAULT true,

  -- Tracking
  source TEXT DEFAULT 'homepage', -- homepage, footer, popup, premium_signup
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed', 'bounced')),
  confirmation_token UUID DEFAULT gen_random_uuid(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,

  -- Engagement metrics
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON email_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_weekly_digest ON email_subscribers(subscribed_weekly_digest) WHERE status = 'confirmed';

-- Email send log for tracking
CREATE TABLE IF NOT EXISTS email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES email_subscribers(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- welcome, weekly_digest, market_alert, earnings_reminder
  subject TEXT NOT NULL,
  resend_id TEXT, -- Resend message ID for tracking
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained')),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_log_subscriber ON email_send_log(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_log_type ON email_send_log(email_type);

-- Watchlist for personalized alerts (for premium users)
CREATE TABLE IF NOT EXISTS email_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES email_subscribers(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  alert_on_price_change BOOLEAN DEFAULT true,
  alert_on_insider_trade BOOLEAN DEFAULT true,
  alert_on_earnings BOOLEAN DEFAULT true,
  alert_threshold_percent NUMERIC(5,2) DEFAULT 5.0, -- Alert if price moves 5%+
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscriber_id, ticker)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_subscriber ON email_watchlist(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_ticker ON email_watchlist(ticker);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriber_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriber_timestamp
  BEFORE UPDATE ON email_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriber_timestamp();

-- RLS Policies
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_send_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_watchlist ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access to subscribers" ON email_subscribers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to email log" ON email_send_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to watchlist" ON email_watchlist
  FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON email_subscribers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own subscription" ON email_subscribers
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own watchlist
CREATE POLICY "Users can manage own watchlist" ON email_watchlist
  FOR ALL USING (subscriber_id IN (
    SELECT id FROM email_subscribers WHERE user_id = auth.uid()
  ));

-- Anonymous users can insert (signup)
CREATE POLICY "Anyone can subscribe" ON email_subscribers
  FOR INSERT WITH CHECK (true);
