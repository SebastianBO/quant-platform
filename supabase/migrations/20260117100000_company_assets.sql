-- =============================================================================
-- COMPANY ASSETS TABLE
-- Stores company logos, CEO information, and website data
-- Owned data instead of relying on external APIs at runtime
-- =============================================================================

-- Create company_assets table
CREATE TABLE IF NOT EXISTS public.company_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Company identification
    ticker VARCHAR(20) NOT NULL,
    exchange VARCHAR(20) DEFAULT 'US',

    -- Logo URLs (stored in Supabase Storage)
    logo_url TEXT,                    -- Primary logo (default/colored)
    logo_light_url TEXT,              -- Light mode optimized logo
    logo_dark_url TEXT,               -- Dark mode optimized logo
    icon_url TEXT,                    -- Small square icon (favicon-style)

    -- CEO information
    ceo_name VARCHAR(255),
    ceo_photo_url TEXT,               -- Stored in Supabase Storage
    ceo_linkedin_url TEXT,
    ceo_title VARCHAR(255) DEFAULT 'Chief Executive Officer',

    -- Website information
    website_url TEXT,
    domain VARCHAR(255),              -- Extracted domain for Clearbit lookups

    -- Metadata
    source VARCHAR(50) DEFAULT 'manual',  -- 'clearbit', 'eodhd', 'linkedin', 'manual'
    last_synced_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Constraints
    CONSTRAINT company_assets_ticker_exchange_unique UNIQUE (ticker, exchange)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_company_assets_ticker ON public.company_assets(ticker);
CREATE INDEX IF NOT EXISTS idx_company_assets_domain ON public.company_assets(domain);
CREATE INDEX IF NOT EXISTS idx_company_assets_last_synced ON public.company_assets(last_synced_at);

-- Enable Row Level Security
ALTER TABLE public.company_assets ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (assets are public data)
CREATE POLICY "Allow public read access to company_assets"
    ON public.company_assets
    FOR SELECT
    USING (true);

-- Create policy for service role write access
CREATE POLICY "Allow service role full access to company_assets"
    ON public.company_assets
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_company_assets_updated_at ON public.company_assets;
CREATE TRIGGER trigger_update_company_assets_updated_at
    BEFORE UPDATE ON public.company_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_company_assets_updated_at();

-- =============================================================================
-- SUPABASE STORAGE BUCKET FOR COMPANY ASSETS
-- Note: Run this in the Supabase dashboard or via separate bucket creation
-- =============================================================================
-- The following should be executed via Supabase dashboard:
-- 1. Create bucket: "company-assets"
-- 2. Set as public bucket
-- 3. Create folders: logos/, ceo-photos/, icons/

-- Grant permissions (if not using RLS on storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('company-assets', 'company-assets', true);

-- =============================================================================
-- SEED DATA: S&P 500 / NASDAQ 100 top companies with known domains
-- This provides initial mapping for the sync script
-- =============================================================================

INSERT INTO public.company_assets (ticker, exchange, domain, website_url, ceo_name, source)
VALUES
    -- Tech Giants
    ('AAPL', 'NASDAQ', 'apple.com', 'https://www.apple.com', 'Tim Cook', 'manual'),
    ('MSFT', 'NASDAQ', 'microsoft.com', 'https://www.microsoft.com', 'Satya Nadella', 'manual'),
    ('GOOGL', 'NASDAQ', 'google.com', 'https://www.google.com', 'Sundar Pichai', 'manual'),
    ('AMZN', 'NASDAQ', 'amazon.com', 'https://www.amazon.com', 'Andy Jassy', 'manual'),
    ('META', 'NASDAQ', 'meta.com', 'https://www.meta.com', 'Mark Zuckerberg', 'manual'),
    ('NVDA', 'NASDAQ', 'nvidia.com', 'https://www.nvidia.com', 'Jensen Huang', 'manual'),
    ('TSLA', 'NASDAQ', 'tesla.com', 'https://www.tesla.com', 'Elon Musk', 'manual'),

    -- Semiconductors
    ('AMD', 'NASDAQ', 'amd.com', 'https://www.amd.com', 'Lisa Su', 'manual'),
    ('INTC', 'NASDAQ', 'intel.com', 'https://www.intel.com', 'Pat Gelsinger', 'manual'),
    ('AVGO', 'NASDAQ', 'broadcom.com', 'https://www.broadcom.com', 'Hock Tan', 'manual'),
    ('QCOM', 'NASDAQ', 'qualcomm.com', 'https://www.qualcomm.com', 'Cristiano Amon', 'manual'),
    ('MU', 'NASDAQ', 'micron.com', 'https://www.micron.com', 'Sanjay Mehrotra', 'manual'),
    ('ARM', 'NASDAQ', 'arm.com', 'https://www.arm.com', 'Rene Haas', 'manual'),
    ('SMCI', 'NASDAQ', 'supermicro.com', 'https://www.supermicro.com', 'Charles Liang', 'manual'),

    -- Software/Cloud
    ('CRM', 'NYSE', 'salesforce.com', 'https://www.salesforce.com', 'Marc Benioff', 'manual'),
    ('ORCL', 'NYSE', 'oracle.com', 'https://www.oracle.com', 'Safra Catz', 'manual'),
    ('ADBE', 'NASDAQ', 'adobe.com', 'https://www.adobe.com', 'Shantanu Narayen', 'manual'),
    ('NOW', 'NYSE', 'servicenow.com', 'https://www.servicenow.com', 'Bill McDermott', 'manual'),
    ('SNOW', 'NYSE', 'snowflake.com', 'https://www.snowflake.com', 'Sridhar Ramaswamy', 'manual'),
    ('PLTR', 'NYSE', 'palantir.com', 'https://www.palantir.com', 'Alex Karp', 'manual'),
    ('NET', 'NYSE', 'cloudflare.com', 'https://www.cloudflare.com', 'Matthew Prince', 'manual'),
    ('DDOG', 'NASDAQ', 'datadoghq.com', 'https://www.datadoghq.com', 'Olivier Pomel', 'manual'),
    ('CRWD', 'NASDAQ', 'crowdstrike.com', 'https://www.crowdstrike.com', 'George Kurtz', 'manual'),
    ('ZS', 'NASDAQ', 'zscaler.com', 'https://www.zscaler.com', 'Jay Chaudhry', 'manual'),
    ('PANW', 'NASDAQ', 'paloaltonetworks.com', 'https://www.paloaltonetworks.com', 'Nikesh Arora', 'manual'),

    -- Financial
    ('JPM', 'NYSE', 'jpmorganchase.com', 'https://www.jpmorganchase.com', 'Jamie Dimon', 'manual'),
    ('V', 'NYSE', 'visa.com', 'https://www.visa.com', 'Ryan McInerney', 'manual'),
    ('MA', 'NYSE', 'mastercard.com', 'https://www.mastercard.com', 'Michael Miebach', 'manual'),
    ('BAC', 'NYSE', 'bankofamerica.com', 'https://www.bankofamerica.com', 'Brian Moynihan', 'manual'),
    ('WFC', 'NYSE', 'wellsfargo.com', 'https://www.wellsfargo.com', 'Charlie Scharf', 'manual'),
    ('GS', 'NYSE', 'goldmansachs.com', 'https://www.goldmansachs.com', 'David Solomon', 'manual'),
    ('MS', 'NYSE', 'morganstanley.com', 'https://www.morganstanley.com', 'Ted Pick', 'manual'),
    ('BLK', 'NYSE', 'blackrock.com', 'https://www.blackrock.com', 'Larry Fink', 'manual'),
    ('SCHW', 'NYSE', 'schwab.com', 'https://www.schwab.com', 'Walt Bettinger', 'manual'),
    ('COIN', 'NASDAQ', 'coinbase.com', 'https://www.coinbase.com', 'Brian Armstrong', 'manual'),
    ('PYPL', 'NASDAQ', 'paypal.com', 'https://www.paypal.com', 'Alex Chriss', 'manual'),
    ('HOOD', 'NASDAQ', 'robinhood.com', 'https://www.robinhood.com', 'Vlad Tenev', 'manual'),

    -- Consumer/Retail
    ('WMT', 'NYSE', 'walmart.com', 'https://www.walmart.com', 'Doug McMillon', 'manual'),
    ('COST', 'NASDAQ', 'costco.com', 'https://www.costco.com', 'Ron Vachris', 'manual'),
    ('HD', 'NYSE', 'homedepot.com', 'https://www.homedepot.com', 'Ted Decker', 'manual'),
    ('TGT', 'NYSE', 'target.com', 'https://www.target.com', 'Brian Cornell', 'manual'),
    ('SBUX', 'NASDAQ', 'starbucks.com', 'https://www.starbucks.com', 'Brian Niccol', 'manual'),
    ('MCD', 'NYSE', 'mcdonalds.com', 'https://www.mcdonalds.com', 'Chris Kempczinski', 'manual'),
    ('NKE', 'NYSE', 'nike.com', 'https://www.nike.com', 'John Donahoe', 'manual'),
    ('LULU', 'NASDAQ', 'lululemon.com', 'https://www.lululemon.com', 'Calvin McDonald', 'manual'),

    -- Healthcare/Pharma
    ('JNJ', 'NYSE', 'jnj.com', 'https://www.jnj.com', 'Joaquin Duato', 'manual'),
    ('UNH', 'NYSE', 'unitedhealthgroup.com', 'https://www.unitedhealthgroup.com', 'Andrew Witty', 'manual'),
    ('PFE', 'NYSE', 'pfizer.com', 'https://www.pfizer.com', 'Albert Bourla', 'manual'),
    ('MRK', 'NYSE', 'merck.com', 'https://www.merck.com', 'Rob Davis', 'manual'),
    ('ABBV', 'NYSE', 'abbvie.com', 'https://www.abbvie.com', 'Rob Michael', 'manual'),
    ('LLY', 'NYSE', 'lilly.com', 'https://www.lilly.com', 'David Ricks', 'manual'),
    ('BMY', 'NYSE', 'bms.com', 'https://www.bms.com', 'Chris Boerner', 'manual'),
    ('MRNA', 'NASDAQ', 'modernatx.com', 'https://www.modernatx.com', 'Stephane Bancel', 'manual'),

    -- Energy
    ('XOM', 'NYSE', 'exxonmobil.com', 'https://www.exxonmobil.com', 'Darren Woods', 'manual'),
    ('CVX', 'NYSE', 'chevron.com', 'https://www.chevron.com', 'Mike Wirth', 'manual'),
    ('COP', 'NYSE', 'conocophillips.com', 'https://www.conocophillips.com', 'Ryan Lance', 'manual'),

    -- Entertainment/Media
    ('DIS', 'NYSE', 'disney.com', 'https://www.disney.com', 'Bob Iger', 'manual'),
    ('NFLX', 'NASDAQ', 'netflix.com', 'https://www.netflix.com', 'Ted Sarandos', 'manual'),
    ('CMCSA', 'NASDAQ', 'comcast.com', 'https://www.comcast.com', 'Brian Roberts', 'manual'),
    ('SPOT', 'NYSE', 'spotify.com', 'https://www.spotify.com', 'Daniel Ek', 'manual'),
    ('RBLX', 'NYSE', 'roblox.com', 'https://www.roblox.com', 'David Baszucki', 'manual'),
    ('EA', 'NASDAQ', 'ea.com', 'https://www.ea.com', 'Andrew Wilson', 'manual'),

    -- Automotive
    ('F', 'NYSE', 'ford.com', 'https://www.ford.com', 'Jim Farley', 'manual'),
    ('GM', 'NYSE', 'gm.com', 'https://www.gm.com', 'Mary Barra', 'manual'),
    ('RIVN', 'NASDAQ', 'rivian.com', 'https://www.rivian.com', 'RJ Scaringe', 'manual'),
    ('LCID', 'NASDAQ', 'lucidmotors.com', 'https://www.lucidmotors.com', 'Peter Rawlinson', 'manual'),

    -- Airlines/Travel
    ('DAL', 'NYSE', 'delta.com', 'https://www.delta.com', 'Ed Bastian', 'manual'),
    ('UAL', 'NASDAQ', 'united.com', 'https://www.united.com', 'Scott Kirby', 'manual'),
    ('LUV', 'NYSE', 'southwest.com', 'https://www.southwest.com', 'Bob Jordan', 'manual'),
    ('ABNB', 'NASDAQ', 'airbnb.com', 'https://www.airbnb.com', 'Brian Chesky', 'manual'),
    ('BKNG', 'NASDAQ', 'booking.com', 'https://www.booking.com', 'Glenn Fogel', 'manual'),
    ('UBER', 'NYSE', 'uber.com', 'https://www.uber.com', 'Dara Khosrowshahi', 'manual'),
    ('LYFT', 'NASDAQ', 'lyft.com', 'https://www.lyft.com', 'David Risher', 'manual'),

    -- Telecom
    ('T', 'NYSE', 'att.com', 'https://www.att.com', 'John Stankey', 'manual'),
    ('VZ', 'NYSE', 'verizon.com', 'https://www.verizon.com', 'Hans Vestberg', 'manual'),
    ('TMUS', 'NASDAQ', 't-mobile.com', 'https://www.t-mobile.com', 'Mike Sievert', 'manual'),

    -- Industrial
    ('BA', 'NYSE', 'boeing.com', 'https://www.boeing.com', 'Kelly Ortberg', 'manual'),
    ('CAT', 'NYSE', 'caterpillar.com', 'https://www.caterpillar.com', 'Jim Umpleby', 'manual'),
    ('DE', 'NYSE', 'deere.com', 'https://www.deere.com', 'John May', 'manual'),
    ('GE', 'NYSE', 'ge.com', 'https://www.ge.com', 'Larry Culp', 'manual'),
    ('HON', 'NASDAQ', 'honeywell.com', 'https://www.honeywell.com', 'Vimal Kapur', 'manual'),
    ('LMT', 'NYSE', 'lockheedmartin.com', 'https://www.lockheedmartin.com', 'Jim Taiclet', 'manual'),
    ('RTX', 'NYSE', 'rtx.com', 'https://www.rtx.com', 'Chris Calio', 'manual'),

    -- Other Tech
    ('IBM', 'NYSE', 'ibm.com', 'https://www.ibm.com', 'Arvind Krishna', 'manual'),
    ('CSCO', 'NASDAQ', 'cisco.com', 'https://www.cisco.com', 'Chuck Robbins', 'manual'),
    ('DELL', 'NYSE', 'dell.com', 'https://www.dell.com', 'Michael Dell', 'manual'),

    -- Social/Internet
    ('PINS', 'NYSE', 'pinterest.com', 'https://www.pinterest.com', 'Bill Ready', 'manual'),
    ('SNAP', 'NYSE', 'snap.com', 'https://www.snap.com', 'Evan Spiegel', 'manual'),
    ('SHOP', 'NYSE', 'shopify.com', 'https://www.shopify.com', 'Tobi Lutke', 'manual'),
    ('ZM', 'NASDAQ', 'zoom.us', 'https://zoom.us', 'Eric Yuan', 'manual'),
    ('TEAM', 'NASDAQ', 'atlassian.com', 'https://www.atlassian.com', 'Mike Cannon-Brookes', 'manual'),

    -- Berkshire and major holdings
    ('BRK.B', 'NYSE', 'berkshirehathaway.com', 'https://www.berkshirehathaway.com', 'Warren Buffett', 'manual'),
    ('KO', 'NYSE', 'coca-colacompany.com', 'https://www.coca-colacompany.com', 'James Quincey', 'manual'),
    ('PEP', 'NASDAQ', 'pepsico.com', 'https://www.pepsico.com', 'Ramon Laguarta', 'manual'),
    ('PG', 'NYSE', 'pg.com', 'https://www.pg.com', 'Jon Moeller', 'manual')

ON CONFLICT (ticker, exchange) DO UPDATE SET
    domain = EXCLUDED.domain,
    website_url = EXCLUDED.website_url,
    ceo_name = EXCLUDED.ceo_name,
    source = EXCLUDED.source,
    updated_at = now();

-- Add helpful comments
COMMENT ON TABLE public.company_assets IS 'Stores company logos, CEO information, and website data for cached asset serving';
COMMENT ON COLUMN public.company_assets.logo_url IS 'Primary logo URL stored in Supabase Storage';
COMMENT ON COLUMN public.company_assets.domain IS 'Company domain for Clearbit logo lookups';
COMMENT ON COLUMN public.company_assets.source IS 'Data source: clearbit, eodhd, linkedin, manual';
