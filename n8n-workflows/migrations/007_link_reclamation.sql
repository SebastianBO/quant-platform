-- ============================================
-- Link Reclamation Tables for Lician.com
-- ============================================
-- Tracks unlinked brand mentions and outreach for link reclamation
-- Used by: link-reclamation.json n8n workflow

-- Drop existing tables if recreating
-- DROP TABLE IF EXISTS public.unlinked_mentions CASCADE;
-- DROP TABLE IF EXISTS public.link_reclamation_outreach CASCADE;

-- ============================================
-- Main unlinked mentions table
-- ============================================
CREATE TABLE IF NOT EXISTS public.unlinked_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Source page information
    url TEXT NOT NULL UNIQUE,
    domain TEXT NOT NULL,
    title TEXT,
    snippet TEXT,
    mention_context TEXT,
    mention_count INTEGER DEFAULT 1,

    -- Authority metrics
    domain_authority INTEGER DEFAULT 0,
    authority_source TEXT DEFAULT 'estimated', -- 'moz', 'ahrefs', 'estimated'
    priority_score INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'low' CHECK (tier IN ('high', 'medium', 'low')),

    -- Contact information
    author TEXT,
    contact_emails JSONB DEFAULT '[]'::jsonb,

    -- Outreach templates
    outreach_subject TEXT,
    outreach_body TEXT,

    -- Status tracking
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'follow_up', 'converted', 'declined', 'no_response', 'invalid')),

    -- Search metadata
    search_query TEXT,
    found_at TIMESTAMPTZ DEFAULT NOW(),

    -- Outreach tracking
    contacted_at TIMESTAMPTZ,
    follow_up_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,

    -- Notes and metadata
    notes TEXT,
    tags JSONB DEFAULT '[]'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_unlinked_mentions_domain ON public.unlinked_mentions(domain);
CREATE INDEX IF NOT EXISTS idx_unlinked_mentions_status ON public.unlinked_mentions(status);
CREATE INDEX IF NOT EXISTS idx_unlinked_mentions_tier ON public.unlinked_mentions(tier);
CREATE INDEX IF NOT EXISTS idx_unlinked_mentions_priority ON public.unlinked_mentions(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_unlinked_mentions_domain_authority ON public.unlinked_mentions(domain_authority DESC);
CREATE INDEX IF NOT EXISTS idx_unlinked_mentions_found_at ON public.unlinked_mentions(found_at DESC);
CREATE INDEX IF NOT EXISTS idx_unlinked_mentions_status_tier ON public.unlinked_mentions(status, tier);

-- ============================================
-- Outreach history/log table
-- ============================================
CREATE TABLE IF NOT EXISTS public.link_reclamation_outreach (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mention_id UUID NOT NULL REFERENCES public.unlinked_mentions(id) ON DELETE CASCADE,

    -- Outreach details
    outreach_type TEXT NOT NULL CHECK (outreach_type IN ('initial', 'follow_up_1', 'follow_up_2', 'final')),
    email_to TEXT,
    email_subject TEXT,
    email_body TEXT,

    -- Response tracking
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    response_type TEXT CHECK (response_type IN ('positive', 'negative', 'question', 'no_response')),
    response_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_mention_id ON public.link_reclamation_outreach(mention_id);
CREATE INDEX IF NOT EXISTS idx_outreach_sent_at ON public.link_reclamation_outreach(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_type ON public.link_reclamation_outreach(outreach_type);

-- ============================================
-- Summary statistics view
-- ============================================
CREATE OR REPLACE VIEW public.link_reclamation_stats AS
SELECT
    COUNT(*) AS total_mentions,
    COUNT(*) FILTER (WHERE status = 'new') AS pending_outreach,
    COUNT(*) FILTER (WHERE status = 'contacted') AS contacted,
    COUNT(*) FILTER (WHERE status = 'follow_up') AS follow_up_pending,
    COUNT(*) FILTER (WHERE status = 'converted') AS converted,
    COUNT(*) FILTER (WHERE status = 'declined') AS declined,
    COUNT(*) FILTER (WHERE status = 'no_response') AS no_response,

    -- By tier
    COUNT(*) FILTER (WHERE tier = 'high') AS high_tier,
    COUNT(*) FILTER (WHERE tier = 'medium') AS medium_tier,
    COUNT(*) FILTER (WHERE tier = 'low') AS low_tier,

    -- High priority (high tier + new status)
    COUNT(*) FILTER (WHERE tier = 'high' AND status = 'new') AS high_priority_pending,

    -- Conversion metrics
    ROUND(
        COUNT(*) FILTER (WHERE status = 'converted')::numeric /
        NULLIF(COUNT(*) FILTER (WHERE status IN ('contacted', 'converted', 'declined', 'no_response')), 0) * 100,
        2
    ) AS conversion_rate,

    -- This week
    COUNT(*) FILTER (WHERE found_at > NOW() - INTERVAL '7 days') AS found_this_week,
    COUNT(*) FILTER (WHERE converted_at > NOW() - INTERVAL '7 days') AS converted_this_week,

    -- Average DA
    ROUND(AVG(domain_authority), 1) AS avg_domain_authority,
    MAX(domain_authority) AS max_domain_authority
FROM public.unlinked_mentions;

-- ============================================
-- Top opportunities view (high DA, pending)
-- ============================================
CREATE OR REPLACE VIEW public.link_reclamation_opportunities AS
SELECT
    id,
    url,
    domain,
    title,
    domain_authority,
    priority_score,
    tier,
    author,
    contact_emails,
    outreach_subject,
    mention_context,
    found_at
FROM public.unlinked_mentions
WHERE status = 'new'
ORDER BY priority_score DESC, domain_authority DESC
LIMIT 50;

-- ============================================
-- Pending follow-ups view
-- ============================================
CREATE OR REPLACE VIEW public.link_reclamation_follow_ups AS
SELECT
    m.id,
    m.url,
    m.domain,
    m.title,
    m.domain_authority,
    m.tier,
    m.contacted_at,
    m.contact_emails,
    NOW() - m.contacted_at AS days_since_contact,
    (SELECT COUNT(*) FROM public.link_reclamation_outreach o WHERE o.mention_id = m.id) AS outreach_count
FROM public.unlinked_mentions m
WHERE m.status = 'contacted'
  AND m.contacted_at < NOW() - INTERVAL '7 days'
ORDER BY m.domain_authority DESC, m.contacted_at ASC;

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_link_reclamation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_unlinked_mentions_updated_at ON public.unlinked_mentions;
CREATE TRIGGER trigger_unlinked_mentions_updated_at
    BEFORE UPDATE ON public.unlinked_mentions
    FOR EACH ROW
    EXECUTE FUNCTION update_link_reclamation_timestamp();

-- ============================================
-- RLS Policies (enable as needed)
-- ============================================
-- ALTER TABLE public.unlinked_mentions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.link_reclamation_outreach ENABLE ROW LEVEL SECURITY;

-- Service role full access
-- CREATE POLICY "Service role full access on unlinked_mentions"
--     ON public.unlinked_mentions FOR ALL
--     USING (auth.role() = 'service_role');

-- CREATE POLICY "Service role full access on outreach"
--     ON public.link_reclamation_outreach FOR ALL
--     USING (auth.role() = 'service_role');

-- ============================================
-- Sample data for testing (commented out)
-- ============================================
/*
INSERT INTO public.unlinked_mentions (
    url, domain, title, snippet, mention_context, mention_count,
    domain_authority, authority_source, priority_score, tier,
    author, contact_emails, outreach_subject, outreach_body,
    status, search_query
) VALUES (
    'https://example.com/finance-tools-review',
    'example.com',
    'Top 10 Finance Tools for 2025',
    'Lician provides comprehensive stock analysis tools...',
    '...investors are using Lician for their stock analysis needs. The platform offers...',
    2,
    65, 'estimated', 75, 'medium',
    'John Smith',
    '["john@example.com"]',
    'Quick fix for your Top 10 Finance Tools article',
    'Hi John, I noticed your article mentions Lician but doesn''t include a link...',
    'new',
    '"lician" finance stock analysis -site:lician.com'
);
*/

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unlinked_mentions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.link_reclamation_outreach TO service_role;
GRANT SELECT ON public.link_reclamation_stats TO service_role;
GRANT SELECT ON public.link_reclamation_opportunities TO service_role;
GRANT SELECT ON public.link_reclamation_follow_ups TO service_role;

COMMENT ON TABLE public.unlinked_mentions IS 'Tracks brand mentions that do not link to lician.com for link reclamation outreach';
COMMENT ON TABLE public.link_reclamation_outreach IS 'Logs all outreach attempts for link reclamation';
COMMENT ON VIEW public.link_reclamation_stats IS 'Summary statistics for link reclamation campaign';
COMMENT ON VIEW public.link_reclamation_opportunities IS 'Top opportunities for link reclamation (high DA, pending)';
COMMENT ON VIEW public.link_reclamation_follow_ups IS 'Mentions requiring follow-up (contacted >7 days ago)';
