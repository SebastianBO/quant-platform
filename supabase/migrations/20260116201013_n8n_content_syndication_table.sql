-- Migration: Create content_syndication table for tracking syndication status
-- Run this on your Supabase database before using the content-syndication.json workflow

CREATE TABLE IF NOT EXISTS public.content_syndication (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    syndication_id TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    canonical_url TEXT NOT NULL,
    title TEXT NOT NULL,

    -- Dev.to tracking
    devto_status TEXT DEFAULT 'pending' CHECK (devto_status IN ('pending', 'success', 'failed', 'skipped')),
    devto_url TEXT,
    devto_post_id TEXT,
    devto_error TEXT,

    -- Medium tracking
    medium_status TEXT DEFAULT 'pending' CHECK (medium_status IN ('pending', 'success', 'failed', 'skipped')),
    medium_url TEXT,
    medium_post_id TEXT,
    medium_error TEXT,

    -- Hashnode tracking
    hashnode_status TEXT DEFAULT 'pending' CHECK (hashnode_status IN ('pending', 'success', 'failed', 'skipped')),
    hashnode_url TEXT,
    hashnode_post_id TEXT,
    hashnode_error TEXT,

    -- LinkedIn tracking
    linkedin_status TEXT DEFAULT 'pending' CHECK (linkedin_status IN ('pending', 'success', 'failed', 'skipped')),
    linkedin_url TEXT,
    linkedin_post_id TEXT,
    linkedin_error TEXT,

    -- Summary fields
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_content_syndication_syndication_id ON public.content_syndication(syndication_id);
CREATE INDEX IF NOT EXISTS idx_content_syndication_original_url ON public.content_syndication(original_url);
CREATE INDEX IF NOT EXISTS idx_content_syndication_created_at ON public.content_syndication(created_at DESC);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_content_syndication_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_content_syndication_updated_at ON public.content_syndication;
CREATE TRIGGER trigger_content_syndication_updated_at
    BEFORE UPDATE ON public.content_syndication
    FOR EACH ROW
    EXECUTE FUNCTION update_content_syndication_updated_at();

-- Enable RLS (adjust policies as needed)
ALTER TABLE public.content_syndication ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role has full access to content_syndication"
    ON public.content_syndication
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.content_syndication TO service_role;
GRANT SELECT ON public.content_syndication TO authenticated;

COMMENT ON TABLE public.content_syndication IS 'Tracks content syndication status across Dev.to, Medium, Hashnode, and LinkedIn';
