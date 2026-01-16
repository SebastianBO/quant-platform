import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Admin password - MUST be set in environment variables (no fallback for security)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

let supabase: SupabaseClient | null = null

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

export async function POST(request: NextRequest) {
  // Auth check - ADMIN_PASSWORD must be configured
  if (!ADMIN_PASSWORD) {
    logger.error('CRITICAL: ADMIN_PASSWORD environment variable is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { migration } = await request.json()

  if (migration !== 'institutional_ownership') {
    return NextResponse.json({ error: 'Unknown migration' }, { status: 400 })
  }

  const results: { step: string; success: boolean; error?: string }[] = []

  // Run migrations step by step
  const migrations = [
    {
      name: 'Create institutional_investors table',
      sql: `
        CREATE TABLE IF NOT EXISTS institutional_investors (
          id BIGSERIAL PRIMARY KEY,
          cik VARCHAR(10) NOT NULL UNIQUE,
          name VARCHAR(500) NOT NULL,
          normalized_name VARCHAR(500) NOT NULL,
          investor_type VARCHAR(50),
          first_filing_date DATE,
          last_filing_date DATE,
          total_filings INT DEFAULT 0,
          latest_aum BIGINT,
          latest_positions INT,
          latest_report_date DATE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Create cusip_mappings table',
      sql: `
        CREATE TABLE IF NOT EXISTS cusip_mappings (
          id BIGSERIAL PRIMARY KEY,
          cusip VARCHAR(9) NOT NULL UNIQUE,
          ticker VARCHAR(20),
          issuer_name VARCHAR(500),
          title_of_class VARCHAR(200),
          security_type VARCHAR(20) DEFAULT 'EQUITY',
          source VARCHAR(50),
          confidence NUMERIC(3,2) DEFAULT 1.0,
          verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Create institutional_filings table',
      sql: `
        CREATE TABLE IF NOT EXISTS institutional_filings (
          id BIGSERIAL PRIMARY KEY,
          investor_cik VARCHAR(10) NOT NULL,
          accession_number VARCHAR(25) NOT NULL UNIQUE,
          filing_date DATE NOT NULL,
          report_date DATE NOT NULL,
          form_type VARCHAR(20) NOT NULL,
          is_amendment BOOLEAN DEFAULT FALSE,
          total_value BIGINT,
          total_positions INT,
          processed BOOLEAN DEFAULT FALSE,
          processed_at TIMESTAMPTZ,
          error_message TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Create institutional_holdings table',
      sql: `
        CREATE TABLE IF NOT EXISTS institutional_holdings (
          id BIGSERIAL PRIMARY KEY,
          filing_id BIGINT,
          investor_cik VARCHAR(10) NOT NULL,
          cusip VARCHAR(9) NOT NULL,
          ticker VARCHAR(20),
          issuer_name VARCHAR(500),
          title_of_class VARCHAR(200),
          report_date DATE NOT NULL,
          shares BIGINT NOT NULL,
          market_value BIGINT NOT NULL,
          share_type VARCHAR(10) DEFAULT 'SH',
          price NUMERIC(20,4),
          investment_discretion VARCHAR(10),
          voting_sole BIGINT DEFAULT 0,
          voting_shared BIGINT DEFAULT 0,
          voting_none BIGINT DEFAULT 0,
          put_call VARCHAR(10),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Create institutional_changes table',
      sql: `
        CREATE TABLE IF NOT EXISTS institutional_changes (
          id BIGSERIAL PRIMARY KEY,
          investor_cik VARCHAR(10) NOT NULL,
          ticker VARCHAR(20) NOT NULL,
          cusip VARCHAR(9) NOT NULL,
          report_date DATE NOT NULL,
          shares BIGINT NOT NULL,
          market_value BIGINT NOT NULL,
          prior_report_date DATE,
          prior_shares BIGINT,
          prior_market_value BIGINT,
          change_in_shares BIGINT,
          change_percent NUMERIC(10,2),
          change_in_value BIGINT,
          is_new_position BOOLEAN DEFAULT FALSE,
          is_exit BOOLEAN DEFAULT FALSE,
          is_increased BOOLEAN DEFAULT FALSE,
          is_decreased BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(investor_cik, ticker, report_date)
        );
      `
    },
    {
      name: 'Create institutional_ticker_coverage table',
      sql: `
        CREATE TABLE IF NOT EXISTS institutional_ticker_coverage (
          id BIGSERIAL PRIMARY KEY,
          ticker VARCHAR(20) NOT NULL UNIQUE,
          cusip VARCHAR(9),
          issuer_name VARCHAR(500),
          total_holders INT DEFAULT 0,
          total_shares BIGINT DEFAULT 0,
          total_value BIGINT DEFAULT 0,
          first_report_date DATE,
          last_report_date DATE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Create institutional_sync_log table',
      sql: `
        CREATE TABLE IF NOT EXISTS institutional_sync_log (
          id BIGSERIAL PRIMARY KEY,
          sync_type VARCHAR(50) NOT NULL,
          started_at TIMESTAMPTZ DEFAULT NOW(),
          completed_at TIMESTAMPTZ,
          status VARCHAR(20) DEFAULT 'RUNNING',
          investors_processed INT DEFAULT 0,
          filings_processed INT DEFAULT 0,
          holdings_processed INT DEFAULT 0,
          changes_calculated INT DEFAULT 0,
          error_count INT DEFAULT 0,
          error_message TEXT,
          parameters JSONB
        );
      `
    },
    {
      name: 'Create indexes for holdings',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_holdings_ticker ON institutional_holdings(ticker);
        CREATE INDEX IF NOT EXISTS idx_holdings_cusip ON institutional_holdings(cusip);
        CREATE INDEX IF NOT EXISTS idx_holdings_cik ON institutional_holdings(investor_cik);
        CREATE INDEX IF NOT EXISTS idx_holdings_report_date ON institutional_holdings(report_date DESC);
        CREATE INDEX IF NOT EXISTS idx_holdings_ticker_report ON institutional_holdings(ticker, report_date DESC);
        CREATE INDEX IF NOT EXISTS idx_holdings_cik_report ON institutional_holdings(investor_cik, report_date DESC);
      `
    },
    {
      name: 'Create indexes for changes',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_changes_ticker ON institutional_changes(ticker);
        CREATE INDEX IF NOT EXISTS idx_changes_cik ON institutional_changes(investor_cik);
        CREATE INDEX IF NOT EXISTS idx_changes_report_date ON institutional_changes(report_date DESC);
      `
    },
    {
      name: 'Create indexes for investors and filings',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_investors_cik ON institutional_investors(cik);
        CREATE INDEX IF NOT EXISTS idx_investors_normalized_name ON institutional_investors(normalized_name);
        CREATE INDEX IF NOT EXISTS idx_filings_cik ON institutional_filings(investor_cik);
        CREATE INDEX IF NOT EXISTS idx_filings_report_date ON institutional_filings(report_date DESC);
        CREATE INDEX IF NOT EXISTS idx_cusip_ticker ON cusip_mappings(ticker);
      `
    }
  ]

  for (const m of migrations) {
    try {
      const { error } = await getSupabase().rpc('exec_sql', { sql: m.sql })
      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await getSupabase().from('_migrations_temp').select('*').limit(0)
        results.push({ step: m.name, success: false, error: error.message })
      } else {
        results.push({ step: m.name, success: true })
      }
    } catch (err) {
      results.push({ step: m.name, success: false, error: String(err) })
    }
  }

  // Seed initial data
  const seedInvestors = [
    { cik: '102909', name: 'VANGUARD GROUP INC', normalized_name: 'VANGUARD_GROUP_INC', investor_type: 'Index Fund' },
    { cik: '1364742', name: 'BLACKROCK INC', normalized_name: 'BLACKROCK_INC', investor_type: 'Index Fund' },
    { cik: '93751', name: 'STATE STREET CORP', normalized_name: 'STATE_STREET_CORP', investor_type: 'Index Fund' },
    { cik: '315066', name: 'FMR LLC', normalized_name: 'FMR_LLC', investor_type: 'Asset Manager' },
    { cik: '1067983', name: 'BERKSHIRE HATHAWAY INC', normalized_name: 'BERKSHIRE_HATHAWAY_INC', investor_type: 'Conglomerate' },
    { cik: '19617', name: 'JPMORGAN CHASE & CO', normalized_name: 'JPMORGAN_CHASE', investor_type: 'Bank' },
    { cik: '895421', name: 'MORGAN STANLEY', normalized_name: 'MORGAN_STANLEY', investor_type: 'Bank' },
    { cik: '886982', name: 'GOLDMAN SACHS GROUP INC', normalized_name: 'GOLDMAN_SACHS', investor_type: 'Bank' },
    { cik: '1423053', name: 'CITADEL ADVISORS LLC', normalized_name: 'CITADEL_ADVISORS_LLC', investor_type: 'Hedge Fund' },
    { cik: '1350694', name: 'BRIDGEWATER ASSOCIATES LP', normalized_name: 'BRIDGEWATER_ASSOCIATES_LP', investor_type: 'Hedge Fund' },
    { cik: '1037389', name: 'RENAISSANCE TECHNOLOGIES LLC', normalized_name: 'RENAISSANCE_TECHNOLOGIES_LLC', investor_type: 'Hedge Fund' },
    { cik: '1179392', name: 'TWO SIGMA INVESTMENTS LP', normalized_name: 'TWO_SIGMA_INVESTMENTS_LP', investor_type: 'Hedge Fund' },
    { cik: '1582202', name: 'NORGES BANK', normalized_name: 'NORGES_BANK', investor_type: 'Sovereign Wealth' },
  ]

  try {
    const { error } = await getSupabase()
      .from('institutional_investors')
      .upsert(seedInvestors, { onConflict: 'cik' })
    results.push({ step: 'Seed investors', success: !error, error: error?.message })
  } catch (err) {
    results.push({ step: 'Seed investors', success: false, error: String(err) })
  }

  // Seed CUSIP mappings
  const seedCusips = [
    { cusip: '037833100', ticker: 'AAPL', issuer_name: 'Apple Inc', source: 'MANUAL', verified: true },
    { cusip: '594918104', ticker: 'MSFT', issuer_name: 'Microsoft Corp', source: 'MANUAL', verified: true },
    { cusip: '67066G104', ticker: 'NVDA', issuer_name: 'NVIDIA Corp', source: 'MANUAL', verified: true },
    { cusip: '023135106', ticker: 'AMZN', issuer_name: 'Amazon.com Inc', source: 'MANUAL', verified: true },
    { cusip: '02079K305', ticker: 'GOOGL', issuer_name: 'Alphabet Inc Class A', source: 'MANUAL', verified: true },
    { cusip: '30303M102', ticker: 'META', issuer_name: 'Meta Platforms Inc', source: 'MANUAL', verified: true },
    { cusip: '88160R101', ticker: 'TSLA', issuer_name: 'Tesla Inc', source: 'MANUAL', verified: true },
    { cusip: '084670702', ticker: 'BRK.B', issuer_name: 'Berkshire Hathaway Inc Class B', source: 'MANUAL', verified: true },
    { cusip: '46625H100', ticker: 'JPM', issuer_name: 'JPMorgan Chase & Co', source: 'MANUAL', verified: true },
    { cusip: '92826C839', ticker: 'V', issuer_name: 'Visa Inc', source: 'MANUAL', verified: true },
    { cusip: '91324P102', ticker: 'UNH', issuer_name: 'UnitedHealth Group Inc', source: 'MANUAL', verified: true },
    { cusip: '532457108', ticker: 'LLY', issuer_name: 'Eli Lilly & Co', source: 'MANUAL', verified: true },
    { cusip: '060505104', ticker: 'BAC', issuer_name: 'Bank of America Corp', source: 'MANUAL', verified: true },
    { cusip: '30231G102', ticker: 'XOM', issuer_name: 'Exxon Mobil Corp', source: 'MANUAL', verified: true },
    { cusip: '166764100', ticker: 'CVX', issuer_name: 'Chevron Corp', source: 'MANUAL', verified: true },
    { cusip: '191216100', ticker: 'KO', issuer_name: 'Coca-Cola Co', source: 'MANUAL', verified: true },
    { cusip: '025816109', ticker: 'AXP', issuer_name: 'American Express Co', source: 'MANUAL', verified: true },
    { cusip: '693718108', ticker: 'OXY', issuer_name: 'Occidental Petroleum Corp', source: 'MANUAL', verified: true },
  ]

  try {
    const { error } = await getSupabase()
      .from('cusip_mappings')
      .upsert(seedCusips, { onConflict: 'cusip' })
    results.push({ step: 'Seed CUSIP mappings', success: !error, error: error?.message })
  } catch (err) {
    results.push({ step: 'Seed CUSIP mappings', success: false, error: String(err) })
  }

  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  return NextResponse.json({
    migration: 'institutional_ownership',
    results,
    summary: {
      total: results.length,
      successful,
      failed
    }
  })
}

export async function GET(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check table status
  const tables = [
    'institutional_investors',
    'institutional_holdings',
    'institutional_filings',
    'institutional_changes',
    'institutional_ticker_coverage',
    'institutional_sync_log',
    'cusip_mappings'
  ]

  const status: { table: string; exists: boolean; count?: number }[] = []

  for (const table of tables) {
    try {
      const { count, error } = await getSupabase()
        .from(table)
        .select('*', { count: 'exact', head: true })

      status.push({
        table,
        exists: !error,
        count: count || 0
      })
    } catch {
      status.push({ table, exists: false })
    }
  }

  return NextResponse.json({ tables: status })
}
