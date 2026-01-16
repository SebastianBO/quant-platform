-- Migration: Create tables for backlink acquisition automation
-- Run this in Supabase SQL editor or apply via CLI

-- ============================================
-- HARO Opportunities Table
-- Stores journalist queries from HARO emails
-- ============================================
CREATE TABLE IF NOT EXISTS haro_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Journalist/Query Info
  journalist_name TEXT,
  outlet TEXT,
  query TEXT,
  deadline TEXT,
  requirements TEXT,

  -- Scoring & Classification
  relevance_score INTEGER DEFAULT 0,
  platform TEXT DEFAULT 'haro', -- haro, qwoted, sourcebottle, etc.

  -- Email Metadata
  email_subject TEXT,
  email_from TEXT,
  received_at TIMESTAMPTZ,
  raw_content TEXT,

  -- Status Tracking
  status TEXT DEFAULT 'new', -- new, reviewed, responded, won, lost, expired
  response_sent BOOLEAN DEFAULT FALSE,
  response_sent_at TIMESTAMPTZ,
  response_text TEXT,

  -- Outcome Tracking
  backlink_acquired BOOLEAN DEFAULT FALSE,
  backlink_url TEXT,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_haro_status ON haro_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_haro_relevance ON haro_opportunities(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_haro_deadline ON haro_opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_haro_created ON haro_opportunities(created_at DESC);

-- ============================================
-- Social Posts Table
-- Tracks content posted to social platforms
-- ============================================
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Content Reference
  content_url TEXT NOT NULL,
  content_title TEXT,
  content_type TEXT DEFAULT 'article', -- article, tool, analysis, news

  -- Platform Copy
  twitter_copy TEXT,
  linkedin_copy TEXT,
  facebook_copy TEXT, -- Future expansion

  -- Twitter Status
  twitter_status TEXT DEFAULT 'pending', -- pending, posted, failed, skipped
  twitter_post_id TEXT,
  twitter_posted_at TIMESTAMPTZ,
  twitter_engagement JSONB, -- {likes, retweets, replies}

  -- LinkedIn Status
  linkedin_status TEXT DEFAULT 'pending',
  linkedin_post_id TEXT,
  linkedin_posted_at TIMESTAMPTZ,
  linkedin_engagement JSONB, -- {likes, comments, shares}

  -- Error Tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_content_url ON social_posts(content_url);
CREATE INDEX IF NOT EXISTS idx_social_posts_twitter_status ON social_posts(twitter_status);
CREATE INDEX IF NOT EXISTS idx_social_posts_linkedin_status ON social_posts(linkedin_status);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at DESC);

-- ============================================
-- Directory Submissions Table
-- Tracks submissions to directories/listings
-- ============================================
CREATE TABLE IF NOT EXISTS directory_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Directory Info
  directory_name TEXT NOT NULL,
  url TEXT,
  category TEXT DEFAULT 'finance', -- finance, startup, saas, business, etc.

  -- Submission Details
  priority TEXT DEFAULT 'normal', -- low, normal, high, critical
  status TEXT DEFAULT 'pending', -- pending, submitted, needs_followup, approved, rejected

  -- Timeline
  submitted_at TIMESTAMPTZ,
  followup_sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,

  -- Results
  backlink_url TEXT,
  backlink_verified BOOLEAN DEFAULT FALSE,
  backlink_verified_at TIMESTAMPTZ,

  -- Domain Authority (for prioritization)
  domain_authority INTEGER,

  -- Notes
  notes TEXT,
  rejection_reason TEXT,

  -- Cost (some directories are paid)
  cost_usd DECIMAL(10,2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_directory_status ON directory_submissions(status);
CREATE INDEX IF NOT EXISTS idx_directory_priority ON directory_submissions(priority);
CREATE INDEX IF NOT EXISTS idx_directory_created ON directory_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_directory_submitted ON directory_submissions(submitted_at);

-- ============================================
-- Backlink Tracking Table (Master List)
-- Central tracking of all acquired backlinks
-- ============================================
CREATE TABLE IF NOT EXISTS backlinks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Link Details
  source_url TEXT NOT NULL, -- The page linking to us
  source_domain TEXT NOT NULL, -- Domain of the source
  target_url TEXT NOT NULL, -- Our page being linked to
  anchor_text TEXT,

  -- Source Classification
  source_type TEXT, -- haro, directory, guest_post, mention, partnership
  source_table TEXT, -- haro_opportunities, directory_submissions, etc.
  source_id UUID, -- Reference to the source record

  -- Quality Metrics
  domain_authority INTEGER,
  is_dofollow BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'active', -- active, lost, broken
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_backlinks_source_domain ON backlinks(source_domain);
CREATE INDEX IF NOT EXISTS idx_backlinks_target_url ON backlinks(target_url);
CREATE INDEX IF NOT EXISTS idx_backlinks_source_type ON backlinks(source_type);
CREATE INDEX IF NOT EXISTS idx_backlinks_status ON backlinks(status);

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE haro_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlinks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- Service role gets full access (for n8n)
-- ============================================
CREATE POLICY "Service role full access haro"
  ON haro_opportunities FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access social"
  ON social_posts FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access directory"
  ON directory_submissions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access backlinks"
  ON backlinks FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Trigger for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_haro_updated_at
    BEFORE UPDATE ON haro_opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
    BEFORE UPDATE ON social_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_directory_updated_at
    BEFORE UPDATE ON directory_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backlinks_updated_at
    BEFORE UPDATE ON backlinks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data for Testing
-- ============================================
-- Uncomment to insert sample data

/*
INSERT INTO directory_submissions (directory_name, url, category, priority, status) VALUES
  ('Product Hunt', 'https://www.producthunt.com', 'startup', 'high', 'pending'),
  ('AlternativeTo', 'https://alternativeto.net', 'software', 'normal', 'pending'),
  ('G2', 'https://www.g2.com', 'software', 'high', 'pending'),
  ('Capterra', 'https://www.capterra.com', 'software', 'high', 'pending'),
  ('FinTech News', 'https://www.fintechnews.org', 'finance', 'high', 'pending'),
  ('Investopedia Directory', 'https://www.investopedia.com', 'finance', 'critical', 'pending');
*/
