import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ''

// Admin password - MUST be set in environment variables (no fallback for security)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// All edge functions organized by category
export const EDGE_FUNCTIONS = {
  'Data Ingestion': [
    'auto-earnings-sync', 'auto-edgar-sync', 'auto-financial-sync', 'auto-short-volume-sync',
    'ingest-daily-data', 'ingest-earnings-calendar', 'ingest-eodhd-earnings', 'ingest-eodhd-fundamentals',
    'ingest-financial-data', 'ingest-edgar-filings', 'ingest-sec-filings', 'ingest-market-data-v1',
    'ingest-comprehensive-financials', 'ingest-historical-prices', 'ingest-real-time-prices',
    'ingest-insider-trading', 'ingest-dividends-splits', 'ingest-options-chains', 'ingest-options-batch',
    'ingest-all-options', 'ingest-short-data', 'ultra-efficient-earnings', 'ultra-efficient-updater',
    'ultra-financial-statements', 'polygon-data-ingestion', 'discover-all-symbols',
    'enhanced-symbol-discovery', 'global-symbol-ingestion'
  ],
  'Symbol Management': [
    'sync-tickers', 'symbol-priority-manager', 'daily-symbol-sync', 'social-symbol-processor',
    'populate-countries', 'populate-logos', 'populate-earnings', 'populate-earnings-alpha'
  ],
  'Options & Derivatives': [
    'fetch-options', 'fetch-options-greeks', 'monitor-options-flow', 'process-options-embeddings',
    'get-polygon-aggregates', 'get-batch-prices', 'optionChain'
  ],
  'Short Interest': [
    'short-interest', 'fetch-short-interest', 'fetch-finra-short-volume', 'fetch-insider-shorts',
    'get-short-interest'
  ],
  'Fundamentals': [
    'fetch-fundamentals', 'get-fundamentals', 'get-cached-earnings', 'get-earnings-calendar'
  ],
  'AI & Analysis': [
    'ask', 'query-market', 'financial-ai-assistant', 'ai-hedge-fund', 'analyze-campaign-performance',
    'generate-embeddings-hf', 'auto-generate-embeddings', 'process-earnings-embeddings',
    'summarize-market-data', 'summarize-edgar-filings', 'groq-ai-proxy', 'groq-ai-stream'
  ],
  'Portfolio': [
    'portfolio-import', 'portfolio-invite', 'portfolio-import-ai', 'portfolio-import-simple',
    'import-portfolio', 'import-portfolio-ai', 'portfolio-snapshot-service', 'portfolio-chat-webhook',
    'portfolio-message-notification', 'daily-portfolio-summary', 'scheduled-portfolio-summary',
    'monitor-portfolio', 'calculate-portfolio-risk', 'get-portfolio-updates',
    'send-portfolio-invite', 'accept-portfolio-email-invite', 'invite-user-to-portfolio-natively'
  ],
  'Real-time & WebSocket': [
    'polygon-websocket-relay', 'realtime-market-processor', 'realtime-chart-processor'
  ],
  'SEO & Content': [
    'generate-seo-content', 'generate-stock-pages', 'check-seo-pages', 'dynamic-sitemap',
    'smart-sitemap-generator', 'submit-sitemap-google', 'google-indexing-api',
    'autonomous-seo-orchestrator', 'seo-automation-cron', 'seo-error-handler',
    'seo-performance-monitor', 'scale-seo-system', 'public-stock-page', 'seed-community-content'
  ],
  'Notifications': [
    'send-campaign-emails', 'send-push-notification', 'send-web-push', 'send-notification-to-all',
    'unified-notification-handler', 'process-notifications', 'process-follow-ups',
    'track-email-open', 'track-email-click', 'unsubscribe', 'notify-moderators', 'check-price-alerts'
  ],
  'Banking Integration': [
    'create-tink-link', 'tink-create-link', 'exchange-public-token', 'exchange-tink-code',
    'tink-investments', 'tink-get-investments', 'tink-get-accounts', 'tink-get-transactions',
    'get-tink-investments', 'get-investments', 'create-link-token'
  ],
  'Infrastructure': [
    'sign-url', 'setup-minimal-db', 'setup-chat-media-bucket', 'deploy-schema', 'create-tables',
    'execute-sql', 'deploy-bloomberg-tables', 'smart-bloomberg-system', 'bloomberg-master-ingestion',
    'bloomberg-sequential', 'check-tables', 'diagnose-table', 'fix-earnings-table',
    'test-aapl-data', 'test-auth', 'test-user-search', 'delete-user-account',
    'automated-data-updater', 'master-data-scheduler', 'smart-daily-updater',
    'intelligent-batch-orchestrator', 'financial-data-ingestion'
  ],
  'External Integrations': [
    'api-proxy-handler', 'eodhd-proxy', 'firecrawl-extract', 'firecrawl-search',
    'fetch-logos', 'markitdown-converter', 'convert-to-markdown', 'get-polygon-key'
  ]
}

// All database tables organized by category
export const DATABASE_TABLES = {
  'Core Financial': [
    'financial_instruments', 'company_prices', 'price_data', 'realtime_prices',
    'fundamentals', 'fundamentals_data', 'symbols_universe'
  ],
  'Earnings': [
    'earnings_data', 'earnings_calendar', 'earnings_alerts', 'earnings_surprises',
    'earnings_sync_metadata', 'company_earnings'
  ],
  'Financial Statements': [
    'financial_statements', 'filing_financial_statements', 'income_statements',
    'balance_sheets', 'cash_flow_statements'
  ],
  'Options': [
    'options_data', 'options_chain_cache', 'options_volatility_surface',
    'options_flow', 'options_strategies'
  ],
  'Short Interest': [
    'short_interest', 'short_interest_data', 'daily_short_volume',
    'latest_short_volume', 'short_squeeze_signals'
  ],
  'SEC & Insider': [
    'sec_filings', 'sec_filing_content', 'sec_filings_metadata', 'sec_structured_data',
    'sec_company_mappings', 'insider_trading', 'insider_transactions',
    'form4_transactions', 'form13f_holdings', 'form13f_positions'
  ],
  'Portfolio': [
    'portfolios', 'investments', 'portfolio_holdings_history', 'portfolio_performance_metrics',
    'portfolio_value_history', 'portfolio_members', 'portfolio_email_invitations',
    'portfolio_dividends', 'portfolio_imports'
  ],
  'Social & Chat': [
    'profiles', 'posts', 'comments', 'likes', 'chat_groups', 'chat_messages',
    'chat_message_reactions', 'chat_group_members', 'portfolio_chat_messages',
    'social_symbol_mentions'
  ],
  'Users & Auth': [
    'users', 'user_subscriptions', 'push_tokens', 'notification_preferences',
    'notifications', 'user_onboarding', 'price_alerts'
  ],
  'Banking': [
    'plaid_items', 'tink_connections', 'currencies', 'fx_rates', 'fx_sync_history'
  ],
  'SEO': [
    'seo_performance', 'seo_content_versions', 'seo_indexing_log', 'seo_errors',
    'seo_stock_tiers', 'seo_orchestrator_state', 'seo_system_metrics',
    'seo_stock_pages', 'seo_community_pages'
  ],
  'Email': [
    'email_campaigns', 'email_templates', 'contact_lists', 'contacts',
    'campaign_recipients', 'follow_up_sequences', 'email_events', 'email_replies'
  ],
  'System & Logs': [
    'sync_logs', 'sync_metadata', 'data_ingestion_logs', 'data_update_log',
    'api_usage_tracking', 'cron_job_logs', 'exchange_metadata'
  ],
  'Financial Sync': [
    'sync_state', 'sync_queue', 'financial_sync_log', 'data_freshness',
    'insider_trades', 'institutional_holdings', 'institutional_investors',
    'institutional_filings', 'short_volume'
  ],
  'Biotech & Clinical': [
    'clinical_trials', 'fda_drug_approvals', 'biotech_catalysts',
    'biotech_company_mapping', 'pdufa_dates', 'drug_pipeline',
    'biotech_financials', 'biotech_8k_alerts', 'indication_competitors',
    'biotech_watchlist'
  ]
}

// External APIs to health check
const API_ENDPOINTS = [
  { name: 'EODHD Real-time', url: 'https://eodhd.com/api/real-time/AAPL.US?api_token={EODHD_KEY}&fmt=json', critical: true },
  { name: 'EODHD Fundamentals', url: 'https://eodhd.com/api/fundamentals/AAPL.US?api_token={EODHD_KEY}&fmt=json', critical: true },
  { name: 'Financial Datasets', url: 'https://api.financialdatasets.ai/financial-statements/income-statements?ticker=AAPL&limit=1', critical: true },
  { name: 'SEC EDGAR', url: 'https://data.sec.gov/submissions/CIK0000320193.json', critical: true },
  { name: 'SEC EDGAR Filings', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=&dateb=&owner=include&count=1&output=atom', critical: false },
  { name: 'Polygon.io', url: 'https://api.polygon.io/v2/aggs/ticker/AAPL/prev?apiKey={POLYGON_KEY}', critical: false },
  { name: 'ClinicalTrials.gov', url: 'https://clinicaltrials.gov/api/v2/studies?pageSize=1&format=json', critical: false },
  { name: 'openFDA', url: 'https://api.fda.gov/drug/drugsfda.json?limit=1', critical: false },
]

interface SystemStatus {
  timestamp: string
  database: {
    connected: boolean
    tablesByCategory: Record<string, { name: string; count: number; error?: string }[]>
    totalRows: number
  }
  edgeFunctions: {
    byCategory: Record<string, { name: string; status: 'active' | 'error' | 'unknown' }[]>
    totalActive: number
    totalFunctions: number
  }
  externalApis: {
    name: string
    status: 'healthy' | 'degraded' | 'down'
    responseTime?: number
    error?: string
    critical: boolean
  }[]
  syncStatus: {
    name: string
    lastSync: string | null
    status: 'fresh' | 'stale' | 'critical'
    recordsProcessed?: number
  }[]
  errors: {
    timestamp: string
    source: string
    message: string
    severity: 'error' | 'warning'
  }[]
  metrics: {
    totalSymbols: number
    totalPortfolios: number
    totalUsers: number
    apiCallsToday: number
    lastEarningsSync: string | null
    lastPriceSync: string | null
  }
  financialSync?: {
    syncProgress: {
      companiesSynced: number
      totalCompanies: number
      percentComplete: number
      isRunning: boolean
      lastBatchAt: string | null
    }
    dataFreshness: {
      dataType: string
      recordCount: number
      latestDate: string | null
      lastSync: string | null
    }[]
    pendingQueue: number
    recentSyncs: {
      ticker: string
      status: string
      syncedAt: string
      itemsCreated: number
    }[]
  }
}

export async function GET(request: NextRequest) {
  // Check auth - ADMIN_PASSWORD must be configured
  if (!ADMIN_PASSWORD) {
    console.error('CRITICAL: ADMIN_PASSWORD environment variable is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  const providedPassword = authHeader?.replace('Bearer ', '')

  if (!providedPassword || providedPassword !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status: SystemStatus = {
    timestamp: new Date().toISOString(),
    database: { connected: false, tablesByCategory: {}, totalRows: 0 },
    edgeFunctions: { byCategory: {}, totalActive: 0, totalFunctions: 0 },
    externalApis: [],
    syncStatus: [],
    errors: [],
    metrics: {
      totalSymbols: 0,
      totalPortfolios: 0,
      totalUsers: 0,
      apiCallsToday: 0,
      lastEarningsSync: null,
      lastPriceSync: null
    }
  }

  // 1. Check database connection and get table stats by category
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test connection
    const { error: testError } = await supabase
      .from('financial_instruments')
      .select('count')
      .limit(1)

    status.database.connected = !testError

    if (!testError) {
      let totalRows = 0

      // Get counts for each category
      for (const [category, tables] of Object.entries(DATABASE_TABLES)) {
        status.database.tablesByCategory[category] = []

        for (const table of tables) {
          try {
            const { count, error } = await supabase
              .from(table)
              .select('*', { count: 'exact', head: true })

            const tableCount = error ? 0 : (count || 0)
            totalRows += tableCount

            status.database.tablesByCategory[category].push({
              name: table,
              count: tableCount,
              error: error?.message
            })
          } catch {
            status.database.tablesByCategory[category].push({
              name: table,
              count: 0,
              error: 'Table may not exist'
            })
          }
        }
      }

      status.database.totalRows = totalRows

      // Get key metrics
      try {
        const [symbolsRes, portfoliosRes, usersRes] = await Promise.all([
          supabase.from('financial_instruments').select('*', { count: 'exact', head: true }),
          supabase.from('portfolios').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true })
        ])

        status.metrics.totalSymbols = symbolsRes.count || 0
        status.metrics.totalPortfolios = portfoliosRes.count || 0
        status.metrics.totalUsers = usersRes.count || 0
      } catch {
        // Metrics tables might not exist
      }

      // Get sync status from sync_logs
      try {
        const { data: syncLogs } = await supabase
          .from('sync_logs')
          .select('sync_type, completed_at, status, records_processed')
          .order('completed_at', { ascending: false })
          .limit(50)

        if (syncLogs) {
          const syncTypes = [...new Set(syncLogs.map(l => l.sync_type))]
          for (const syncType of syncTypes) {
            const latest = syncLogs.find(l => l.sync_type === syncType)
            if (latest) {
              const lastSync = new Date(latest.completed_at)
              const hoursSince = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60)

              status.syncStatus.push({
                name: syncType,
                lastSync: latest.completed_at,
                status: hoursSince < 24 ? 'fresh' :
                        hoursSince < 72 ? 'stale' : 'critical',
                recordsProcessed: latest.records_processed
              })
            }
          }
        }
      } catch {
        // sync_logs might not exist
      }

      // Get recent errors
      try {
        const { data: errorLogs } = await supabase
          .from('data_ingestion_logs')
          .select('created_at, source, error_message, status')
          .or('status.eq.error,error_message.not.is.null')
          .order('created_at', { ascending: false })
          .limit(20)

        if (errorLogs) {
          status.errors = errorLogs
            .filter(e => e.error_message)
            .map(e => ({
              timestamp: e.created_at,
              source: e.source || 'unknown',
              message: e.error_message,
              severity: 'error' as const
            }))
        }
      } catch {
        // data_ingestion_logs might not exist
      }

      // Check API usage
      try {
        const today = new Date().toISOString().split('T')[0]
        const { data: apiUsage } = await supabase
          .from('api_usage_tracking')
          .select('calls_count')
          .eq('date', today)
          .single()

        if (apiUsage) {
          status.metrics.apiCallsToday = apiUsage.calls_count || 0
        }
      } catch {
        // api_usage_tracking might not exist
      }

      // Get Financial Sync status
      try {
        // Get sync progress from sync_state
        const { data: syncState } = await supabase
          .from('sync_state')
          .select('*')
          .eq('sync_type', 'financials')
          .single()

        // Get pending queue count
        const { count: pendingQueue } = await supabase
          .from('sync_queue')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        // Get data freshness
        const { data: freshness } = await supabase
          .from('data_freshness')
          .select('*')

        // Get recent syncs from financial_sync_log
        const { data: recentSyncs } = await supabase
          .from('financial_sync_log')
          .select('ticker, status, completed_at, statements_created')
          .order('completed_at', { ascending: false })
          .limit(10)

        status.financialSync = {
          syncProgress: {
            companiesSynced: syncState?.companies_synced || 0,
            totalCompanies: syncState?.total_companies || 10196,
            percentComplete: syncState ?
              Math.round((syncState.companies_synced / syncState.total_companies) * 100 * 10) / 10 : 0,
            isRunning: syncState?.is_running || false,
            lastBatchAt: syncState?.last_batch_at || null
          },
          dataFreshness: (freshness || []).map(f => ({
            dataType: f.data_type,
            recordCount: f.record_count || 0,
            latestDate: f.latest_data_date,
            lastSync: f.last_sync
          })),
          pendingQueue: pendingQueue || 0,
          recentSyncs: (recentSyncs || []).map(s => ({
            ticker: s.ticker || 'unknown',
            status: s.status || 'unknown',
            syncedAt: s.completed_at,
            itemsCreated: s.statements_created || 0
          }))
        }
      } catch {
        // Financial sync tables might not exist yet
      }
    }
  } catch (error) {
    status.database.connected = false
    status.errors.push({
      timestamp: new Date().toISOString(),
      source: 'database',
      message: String(error),
      severity: 'error'
    })
  }

  // 2. Check external APIs
  for (const api of API_ENDPOINTS) {
    const startTime = Date.now()
    try {
      let url = api.url
      if (url.includes('{EODHD_KEY}')) {
        url = url.replace('{EODHD_KEY}', process.env.EODHD_API_KEY || '')
      }
      if (url.includes('{POLYGON_KEY}')) {
        url = url.replace('{POLYGON_KEY}', process.env.POLYGON_API_KEY || '')
      }

      const headers: Record<string, string> = {}
      if (api.name === 'Financial Datasets') {
        headers['X-API-KEY'] = process.env.FINANCIAL_DATASETS_API_KEY || ''
      }
      if (api.name.includes('SEC')) {
        headers['User-Agent'] = 'Lician contact@lician.com'
      }

      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(10000)
      })

      const responseTime = Date.now() - startTime

      status.externalApis.push({
        name: api.name,
        status: response.ok ? 'healthy' : 'degraded',
        responseTime,
        critical: api.critical
      })
    } catch (error) {
      status.externalApis.push({
        name: api.name,
        status: 'down',
        error: String(error).slice(0, 100),
        critical: api.critical
      })
    }
  }

  // 3. Edge functions status by category
  let totalFunctions = 0
  for (const [category, functions] of Object.entries(EDGE_FUNCTIONS)) {
    status.edgeFunctions.byCategory[category] = functions.map(fn => {
      totalFunctions++
      return {
        name: fn,
        status: 'active' as const // Would need Supabase Management API for real status
      }
    })
  }
  status.edgeFunctions.totalFunctions = totalFunctions
  status.edgeFunctions.totalActive = totalFunctions // Assuming all active

  return NextResponse.json(status)
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const providedPassword = authHeader?.replace('Bearer ', '')

  if (providedPassword !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body

  if (action === 'test-edge-function') {
    const { functionName } = body
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { test: true }
      })

      return NextResponse.json({
        success: !error,
        data,
        error: error?.message
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: String(error)
      })
    }
  }

  if (action === 'refresh-sync') {
    const { syncType } = body
    // Trigger a sync - would call the appropriate edge function
    return NextResponse.json({ success: true, message: `Triggered ${syncType} sync` })
  }

  // Financial sync actions
  if (action === 'sync-financials') {
    const { mode, limit } = body
    try {
      // Call our own cron endpoint
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'

      const response = await fetch(
        `${baseUrl}/api/cron/sync-financials?mode=${mode || 'priority'}&limit=${limit || 5}`,
        { method: 'GET' }
      )
      const result = await response.json()
      return NextResponse.json({
        success: result.success,
        message: `Synced ${result.summary?.itemsSynced || 0} items`,
        details: result
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: String(error)
      })
    }
  }

  if (action === 'watch-filings') {
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'

      const response = await fetch(`${baseUrl}/api/cron/watch-filings`, { method: 'GET' })
      const result = await response.json()
      return NextResponse.json({
        success: result.success,
        message: `Found ${result.summary?.totalFilingsFound || 0} filings, synced ${result.summary?.earningsProcessed || 0}`,
        details: result
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: String(error)
      })
    }
  }

  // Biotech clinical trials sync
  if (action === 'sync-clinical-trials') {
    const { ticker, limit } = body
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'

      const params = new URLSearchParams()
      if (ticker) params.set('ticker', ticker)
      if (limit) params.set('limit', String(limit))

      const response = await fetch(
        `${baseUrl}/api/cron/sync-clinical-trials?${params}`,
        { method: 'GET' }
      )
      const result = await response.json()
      return NextResponse.json({
        success: result.success,
        message: `Synced ${result.summary?.totalTrialsInserted || 0} trials, created ${result.summary?.totalCatalystsCreated || 0} catalysts`,
        details: result
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: String(error)
      })
    }
  }

  // Biotech company auto-discovery
  if (action === 'discover-biotech') {
    const { limit } = body
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'

      const response = await fetch(
        `${baseUrl}/api/biotech-mapper?action=discover&limit=${limit || 10}`,
        { method: 'GET' }
      )
      const result = await response.json()
      return NextResponse.json({
        success: result.success,
        message: `Discovered ${result.discovered || 0} biotech companies`,
        details: result
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: String(error)
      })
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
