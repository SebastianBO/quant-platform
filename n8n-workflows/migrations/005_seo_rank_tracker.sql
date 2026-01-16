-- SEO Rank Tracker Tables
-- Used by: seo-rank-tracker.json n8n workflow
-- Created: 2026-01-16

-- =============================================================================
-- Table: keyword_rankings
-- Stores daily SERP position data for tracked keywords
-- =============================================================================
CREATE TABLE IF NOT EXISTS keyword_rankings (
    id BIGSERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL DEFAULT 'lician.com',

    -- Position data
    position INTEGER, -- NULL if not in top 100
    url TEXT, -- URL that ranks
    title TEXT, -- SERP title
    snippet TEXT, -- SERP description

    -- Search metadata
    total_results BIGINT,
    search_time FLOAT,

    -- SERP features
    has_featured_snippet BOOLEAN DEFAULT FALSE,
    featured_snippet_type VARCHAR(50),
    in_people_also_ask BOOLEAN DEFAULT FALSE,

    -- Change tracking
    previous_position INTEGER,
    position_change INTEGER, -- Positive = improved, negative = declined
    change_direction VARCHAR(20) DEFAULT 'new', -- new, up, down, same, entered, dropped

    -- Timestamps
    tracking_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    -- Unique constraint per keyword/domain/date
    CONSTRAINT unique_keyword_domain_date UNIQUE (keyword, domain, tracking_date)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_domain ON keyword_rankings(domain);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_date ON keyword_rankings(tracking_date);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_keyword ON keyword_rankings(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_position ON keyword_rankings(position) WHERE position IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_domain_date ON keyword_rankings(domain, tracking_date);

-- =============================================================================
-- Table: seo_weekly_summaries
-- Stores aggregated weekly metrics for trend analysis
-- =============================================================================
CREATE TABLE IF NOT EXISTS seo_weekly_summaries (
    id BIGSERIAL PRIMARY KEY,
    domain VARCHAR(255) NOT NULL DEFAULT 'lician.com',
    report_date DATE NOT NULL,

    -- Summary metrics
    total_keywords INTEGER NOT NULL,
    ranking_keywords INTEGER NOT NULL, -- Keywords in top 100
    top_10_count INTEGER DEFAULT 0,
    top_20_count INTEGER DEFAULT 0,
    top_50_count INTEGER DEFAULT 0,

    -- Position metrics
    avg_position DECIMAL(5,2),
    best_position INTEGER,
    worst_position INTEGER,

    -- Change metrics
    improved_count INTEGER DEFAULT 0,
    declined_count INTEGER DEFAULT 0,
    stable_count INTEGER DEFAULT 0,

    -- SERP features
    featured_snippets INTEGER DEFAULT 0,
    people_also_ask INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    -- Unique constraint per domain/date
    CONSTRAINT unique_summary_domain_date UNIQUE (domain, report_date)
);

-- Index for time-series queries
CREATE INDEX IF NOT EXISTS idx_seo_summaries_domain_date ON seo_weekly_summaries(domain, report_date);

-- =============================================================================
-- Table: seo_keywords
-- Master list of keywords to track (optional - for UI management)
-- =============================================================================
CREATE TABLE IF NOT EXISTS seo_keywords (
    id BIGSERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL DEFAULT 'lician.com',

    -- Categorization
    category VARCHAR(100), -- e.g., 'calculators', 'screeners', 'analysis'
    priority INTEGER DEFAULT 3, -- 1=high, 2=medium, 3=low

    -- Target metrics
    target_position INTEGER DEFAULT 10,
    current_position INTEGER,

    -- Search volume (from external tools)
    monthly_search_volume INTEGER,
    keyword_difficulty INTEGER, -- 0-100
    cpc_value DECIMAL(10,2),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    -- Unique constraint
    CONSTRAINT unique_keyword_domain UNIQUE (keyword, domain)
);

-- Index for active keywords
CREATE INDEX IF NOT EXISTS idx_seo_keywords_active ON seo_keywords(domain, is_active) WHERE is_active = TRUE;

-- =============================================================================
-- Table: seo_alerts
-- Historical log of significant ranking changes
-- =============================================================================
CREATE TABLE IF NOT EXISTS seo_alerts (
    id BIGSERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL DEFAULT 'lician.com',

    -- Alert details
    alert_type VARCHAR(50) NOT NULL, -- 'significant_up', 'significant_down', 'entered', 'dropped'
    message TEXT NOT NULL,

    -- Position data
    old_position INTEGER,
    new_position INTEGER,
    position_change INTEGER,

    -- Notification status
    email_sent BOOLEAN DEFAULT FALSE,
    slack_sent BOOLEAN DEFAULT FALSE,

    -- Timestamps
    alert_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by VARCHAR(255)
);

-- Index for recent alerts
CREATE INDEX IF NOT EXISTS idx_seo_alerts_date ON seo_alerts(alert_date DESC);
CREATE INDEX IF NOT EXISTS idx_seo_alerts_domain ON seo_alerts(domain, alert_date DESC);

-- =============================================================================
-- Views for common queries
-- =============================================================================

-- Current rankings (latest position for each keyword)
CREATE OR REPLACE VIEW current_keyword_rankings AS
SELECT DISTINCT ON (keyword, domain)
    id,
    keyword,
    domain,
    position,
    url,
    position_change,
    change_direction,
    tracking_date,
    has_featured_snippet
FROM keyword_rankings
ORDER BY keyword, domain, tracking_date DESC;

-- Top performers (position 1-10)
CREATE OR REPLACE VIEW top_performing_keywords AS
SELECT *
FROM current_keyword_rankings
WHERE position <= 10
ORDER BY position ASC;

-- Keywords needing attention (declining or not ranking)
CREATE OR REPLACE VIEW keywords_needing_attention AS
SELECT *
FROM current_keyword_rankings
WHERE position IS NULL OR change_direction = 'down'
ORDER BY
    CASE WHEN position IS NULL THEN 1 ELSE 0 END,
    position_change ASC;

-- =============================================================================
-- Functions for analytics
-- =============================================================================

-- Get ranking trend for a keyword over N days
CREATE OR REPLACE FUNCTION get_keyword_trend(
    p_keyword VARCHAR,
    p_domain VARCHAR DEFAULT 'lician.com',
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    tracking_date DATE,
    position INTEGER,
    position_change INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        kr.tracking_date,
        kr.position,
        kr.position_change
    FROM keyword_rankings kr
    WHERE kr.keyword = p_keyword
      AND kr.domain = p_domain
      AND kr.tracking_date > CURRENT_DATE - p_days
    ORDER BY kr.tracking_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Get overall SEO health score (0-100)
CREATE OR REPLACE FUNCTION get_seo_health_score(p_domain VARCHAR DEFAULT 'lician.com')
RETURNS INTEGER AS $$
DECLARE
    total_keywords INTEGER;
    ranking_keywords INTEGER;
    top_10_count INTEGER;
    top_20_count INTEGER;
    improving_count INTEGER;
    score INTEGER;
BEGIN
    -- Get current stats
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE position IS NOT NULL),
        COUNT(*) FILTER (WHERE position <= 10),
        COUNT(*) FILTER (WHERE position <= 20),
        COUNT(*) FILTER (WHERE change_direction = 'up')
    INTO total_keywords, ranking_keywords, top_10_count, top_20_count, improving_count
    FROM current_keyword_rankings
    WHERE domain = p_domain;

    IF total_keywords = 0 THEN
        RETURN 0;
    END IF;

    -- Calculate weighted score
    score := (
        (ranking_keywords::float / total_keywords * 30) + -- 30 points for ranking
        (top_10_count::float / total_keywords * 40) + -- 40 points for top 10
        (top_20_count::float / total_keywords * 15) + -- 15 points for top 20
        (improving_count::float / total_keywords * 15)  -- 15 points for improving
    )::INTEGER;

    RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Insert initial keywords (matches n8n workflow)
-- =============================================================================
INSERT INTO seo_keywords (keyword, domain, category, priority, monthly_search_volume) VALUES
-- Core product keywords
('stock screener', 'lician.com', 'screeners', 1, 40500),
('P/E ratio by sector', 'lician.com', 'analysis', 1, 1900),
('compound interest calculator', 'lician.com', 'calculators', 1, 135000),
('dividend yield calculator', 'lician.com', 'calculators', 1, 6600),
('S&P 500 historical returns', 'lician.com', 'market-data', 1, 12100),
('stock comparison tool', 'lician.com', 'analysis', 1, 2900),
('AI stock predictions', 'lician.com', 'ai-features', 1, 4400),
('free stock analysis', 'lician.com', 'analysis', 1, 3600),

-- Stock analysis keywords
('stock fundamental analysis', 'lician.com', 'analysis', 2, 8100),
('financial ratio calculator', 'lician.com', 'calculators', 2, 2400),
('stock valuation tool', 'lician.com', 'analysis', 2, 1600),
('intrinsic value calculator', 'lician.com', 'calculators', 2, 5400),
('DCF calculator', 'lician.com', 'calculators', 2, 6600),
('stock research platform', 'lician.com', 'analysis', 2, 880),

-- Market data keywords
('sector performance chart', 'lician.com', 'market-data', 2, 720),
('market cap by sector', 'lician.com', 'market-data', 2, 1300),
('earnings calendar', 'lician.com', 'market-data', 2, 40500),
('dividend stocks list', 'lician.com', 'screeners', 2, 9900),
('growth stocks screener', 'lician.com', 'screeners', 2, 2900),

-- Calculator keywords
('CAGR calculator', 'lician.com', 'calculators', 2, 33100),
('ROI calculator stocks', 'lician.com', 'calculators', 2, 2400),
('price to book ratio', 'lician.com', 'analysis', 2, 22200),
('debt to equity ratio', 'lician.com', 'analysis', 2, 27100),

-- Comparison/research keywords
('compare stocks side by side', 'lician.com', 'analysis', 3, 2400),
('best stock screener free', 'lician.com', 'screeners', 3, 4400),
('stock portfolio analyzer', 'lician.com', 'analysis', 3, 2900),
('financial statement analysis', 'lician.com', 'analysis', 3, 12100),
('quarterly earnings analysis', 'lician.com', 'analysis', 3, 590)
ON CONFLICT (keyword, domain) DO UPDATE SET
    category = EXCLUDED.category,
    priority = EXCLUDED.priority,
    monthly_search_volume = EXCLUDED.monthly_search_volume,
    updated_at = NOW();

-- =============================================================================
-- RLS Policies (if using Supabase Auth)
-- =============================================================================
ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_alerts ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for n8n workflows)
CREATE POLICY "Service role full access" ON keyword_rankings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON seo_weekly_summaries
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON seo_keywords
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON seo_alerts
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users read access (for dashboard)
CREATE POLICY "Authenticated read access" ON keyword_rankings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read access" ON seo_weekly_summaries
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read access" ON seo_keywords
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read access" ON seo_alerts
    FOR SELECT USING (auth.role() = 'authenticated');
