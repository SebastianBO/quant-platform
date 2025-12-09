import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ''

// Admin password - should be set in environment variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lician-admin-2025'

// Edge functions to monitor (key ones)
const CRITICAL_FUNCTIONS = [
  'ai-hedge-fund',
  'ingest-market-data-v1',
  'ingest-eodhd-earnings',
  'ingest-eodhd-fundamentals',
  'ingest-edgar-filings',
  'ingest-sec-filings',
  'ingest-short-data',
  'get-cached-earnings',
  'get-fundamentals',
  'calculate-portfolio-risk',
  'api-proxy-handler',
]

// External APIs to health check
const API_ENDPOINTS = [
  { name: 'EODHD Real-time', url: 'https://eodhd.com/api/real-time/AAPL.US?api_token={EODHD_KEY}&fmt=json' },
  { name: 'Financial Datasets', url: 'https://api.financialdatasets.ai/financial-statements/income-statements?ticker=AAPL&limit=1' },
  { name: 'SEC EDGAR', url: 'https://data.sec.gov/submissions/CIK0000320193.json' },
]

interface SystemStatus {
  timestamp: string
  database: {
    connected: boolean
    tables: { name: string; count: number; lastUpdated?: string }[]
  }
  edgeFunctions: {
    name: string
    status: 'active' | 'error' | 'unknown'
    lastInvoked?: string
  }[]
  externalApis: {
    name: string
    status: 'healthy' | 'degraded' | 'down'
    responseTime?: number
    error?: string
  }[]
  syncStatus: {
    name: string
    lastSync: string | null
    status: 'fresh' | 'stale' | 'critical'
  }[]
  errors: {
    timestamp: string
    source: string
    message: string
  }[]
}

export async function GET(request: NextRequest) {
  // Check auth
  const authHeader = request.headers.get('authorization')
  const providedPassword = authHeader?.replace('Bearer ', '')

  if (providedPassword !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status: SystemStatus = {
    timestamp: new Date().toISOString(),
    database: { connected: false, tables: [] },
    edgeFunctions: [],
    externalApis: [],
    syncStatus: [],
    errors: []
  }

  // 1. Check database connection and get table stats
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('financial_instruments')
      .select('count')
      .limit(1)

    status.database.connected = !testError

    if (!testError) {
      // Get key table counts
      const tables = [
        'financial_instruments',
        'company_prices',
        'company_earnings',
        'portfolios',
        'investments',
        'sec_filings',
        'insider_trading',
        'short_interest_data',
        'sync_logs',
        'data_ingestion_logs'
      ]

      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })

          if (!error) {
            status.database.tables.push({
              name: table,
              count: count || 0
            })
          }
        } catch {
          status.database.tables.push({ name: table, count: -1 })
        }
      }

      // Get last sync times from sync_logs if it exists
      try {
        const { data: syncLogs } = await supabase
          .from('sync_logs')
          .select('sync_type, completed_at, status')
          .order('completed_at', { ascending: false })
          .limit(20)

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
                        hoursSince < 72 ? 'stale' : 'critical'
              })
            }
          }
        }
      } catch {
        // sync_logs might not exist
      }

      // Get recent errors from data_ingestion_logs
      try {
        const { data: errorLogs } = await supabase
          .from('data_ingestion_logs')
          .select('created_at, source, error_message')
          .not('error_message', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10)

        if (errorLogs) {
          status.errors = errorLogs.map(e => ({
            timestamp: e.created_at,
            source: e.source,
            message: e.error_message
          }))
        }
      } catch {
        // data_ingestion_logs might not exist
      }
    }
  } catch (error) {
    status.database.connected = false
    status.errors.push({
      timestamp: new Date().toISOString(),
      source: 'database',
      message: String(error)
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

      const headers: Record<string, string> = {}
      if (api.name === 'Financial Datasets') {
        headers['X-API-KEY'] = process.env.FINANCIAL_DATASETS_API_KEY || ''
      }
      if (api.name === 'SEC EDGAR') {
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
        responseTime
      })
    } catch (error) {
      status.externalApis.push({
        name: api.name,
        status: 'down',
        error: String(error)
      })
    }
  }

  // 3. Edge functions status (from Supabase - we mark as active since they're deployed)
  for (const fn of CRITICAL_FUNCTIONS) {
    status.edgeFunctions.push({
      name: fn,
      status: 'active' // Would need Supabase Management API for real status
    })
  }

  return NextResponse.json(status)
}

export async function POST(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  const providedPassword = authHeader?.replace('Bearer ', '')

  if (providedPassword !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body

  // Actions that admin can trigger
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

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
