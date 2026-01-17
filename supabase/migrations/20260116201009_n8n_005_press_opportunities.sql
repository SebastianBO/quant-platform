-- Press Opportunities Table for Link Building
-- Stores press/news monitoring opportunities for lician.com outreach

-- Create press_opportunities table
CREATE TABLE IF NOT EXISTS press_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Article Information
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    description TEXT,
    domain TEXT NOT NULL,
    pub_date TIMESTAMPTZ,
    article_source TEXT, -- Original source publication name

    -- Source Tracking
    feed_source TEXT NOT NULL, -- 'google_news', 'pr_newswire', 'business_wire'
    feed_category TEXT, -- 'stock_analysis', 'best_apps', 'finance', 'fintech', 'technology'

    -- Opportunity Classification
    opportunity_type TEXT NOT NULL DEFAULT 'general_mention',
    -- Types: 'best_of_list', 'trend_article', 'tool_mention', 'fintech_news', 'general_mention'
    pitch_angle TEXT,

    -- Scoring
    relevance_score INTEGER DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 100),
    estimated_domain_authority INTEGER DEFAULT 0 CHECK (estimated_domain_authority >= 0 AND estimated_domain_authority <= 100),
    priority_score INTEGER DEFAULT 0 CHECK (priority_score >= 0 AND priority_score <= 100),
    priority TEXT DEFAULT 'low' CHECK (priority IN ('high', 'medium', 'low')),
    keywords_matched TEXT,

    -- Generated Pitch
    pitch_subject TEXT,
    pitch_body TEXT,
    pitch_tone TEXT, -- 'professional_request', 'expert_outreach', 'product_pitch', 'story_pitch', 'introduction'

    -- Outreach Tracking
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'replied', 'placed', 'rejected', 'no_response', 'pending')),
    contact_name TEXT,
    contact_email TEXT,
    outreach_notes TEXT,

    -- Placement Information
    placement_url TEXT, -- URL where lician.com was linked (if placed)

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_contacted_at TIMESTAMPTZ,
    placed_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_opportunity_type CHECK (opportunity_type IN (
        'best_of_list', 'trend_article', 'tool_mention', 'fintech_news', 'general_mention'
    ))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_press_opportunities_status ON press_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_press_opportunities_priority ON press_opportunities(priority);
CREATE INDEX IF NOT EXISTS idx_press_opportunities_opportunity_type ON press_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_press_opportunities_domain ON press_opportunities(domain);
CREATE INDEX IF NOT EXISTS idx_press_opportunities_feed_source ON press_opportunities(feed_source);
CREATE INDEX IF NOT EXISTS idx_press_opportunities_priority_score ON press_opportunities(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_press_opportunities_created_at ON press_opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_press_opportunities_pub_date ON press_opportunities(pub_date DESC);

-- Composite indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_press_opportunities_status_priority ON press_opportunities(status, priority);
CREATE INDEX IF NOT EXISTS idx_press_opportunities_type_priority ON press_opportunities(opportunity_type, priority_score DESC);

-- Full-text search on title and description
CREATE INDEX IF NOT EXISTS idx_press_opportunities_title_fts ON press_opportunities USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_press_opportunities_description_fts ON press_opportunities USING gin(to_tsvector('english', COALESCE(description, '')));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_press_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_press_opportunities_updated_at ON press_opportunities;
CREATE TRIGGER trigger_press_opportunities_updated_at
    BEFORE UPDATE ON press_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_press_opportunities_updated_at();

-- View for high-priority opportunities dashboard
CREATE OR REPLACE VIEW v_press_opportunities_high_priority AS
SELECT
    id,
    title,
    url,
    domain,
    opportunity_type,
    priority_score,
    status,
    pitch_subject,
    contact_name,
    created_at,
    CASE
        WHEN status = 'new' AND created_at > NOW() - INTERVAL '24 hours' THEN 'Fresh'
        WHEN status = 'new' AND created_at > NOW() - INTERVAL '72 hours' THEN 'Recent'
        WHEN status = 'new' THEN 'Aging'
        ELSE status
    END as urgency
FROM press_opportunities
WHERE priority IN ('high', 'medium')
AND status NOT IN ('placed', 'rejected', 'no_response')
ORDER BY priority_score DESC, created_at DESC;

-- View for weekly metrics
CREATE OR REPLACE VIEW v_press_opportunities_weekly_metrics AS
SELECT
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) as total_found,
    COUNT(*) FILTER (WHERE status = 'contacted') as contacted,
    COUNT(*) FILTER (WHERE status = 'replied') as replied,
    COUNT(*) FILTER (WHERE status = 'placed') as placed,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
    COUNT(*) FILTER (WHERE status = 'no_response') as no_response,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
    AVG(priority_score) as avg_priority_score,
    AVG(estimated_domain_authority) as avg_domain_authority,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'placed')::DECIMAL /
         NULLIF(COUNT(*) FILTER (WHERE status IN ('contacted', 'replied', 'placed', 'rejected', 'no_response')), 0)) * 100,
        2
    ) as conversion_rate
FROM press_opportunities
WHERE created_at > NOW() - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;

-- View for domain performance
CREATE OR REPLACE VIEW v_press_domain_performance AS
SELECT
    domain,
    estimated_domain_authority,
    COUNT(*) as opportunities_found,
    COUNT(*) FILTER (WHERE status = 'contacted') as times_contacted,
    COUNT(*) FILTER (WHERE status = 'placed') as placements,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'placed')::DECIMAL /
         NULLIF(COUNT(*) FILTER (WHERE status = 'contacted'), 0)) * 100,
        2
    ) as success_rate,
    MAX(created_at) as last_opportunity
FROM press_opportunities
GROUP BY domain, estimated_domain_authority
HAVING COUNT(*) > 1
ORDER BY placements DESC, opportunities_found DESC;

-- Enable RLS
ALTER TABLE press_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow authenticated users and service role)
DROP POLICY IF EXISTS "Service role can manage press_opportunities" ON press_opportunities;
CREATE POLICY "Service role can manage press_opportunities"
ON press_opportunities
FOR ALL
USING (true)
WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE press_opportunities IS 'Stores press release and news article opportunities for link building outreach. Populated by n8n press-monitor workflow.';

-- Comments on columns
COMMENT ON COLUMN press_opportunities.opportunity_type IS 'Type of link building opportunity: best_of_list (highest value), trend_article (expert quotes), tool_mention (pitch as alternative), fintech_news, general_mention';
COMMENT ON COLUMN press_opportunities.priority_score IS 'Calculated score (0-100) based on relevance * domain authority. Higher = more valuable opportunity.';
COMMENT ON COLUMN press_opportunities.status IS 'Outreach status: new, contacted, replied, placed, rejected, no_response, pending';
COMMENT ON COLUMN press_opportunities.pitch_tone IS 'Generated pitch style: professional_request, expert_outreach, product_pitch, story_pitch, introduction';
