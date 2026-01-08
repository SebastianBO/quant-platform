import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// DAILY SCRAPER STATUS DASHBOARD
// Shows health of all data pipelines at a glance
// Call daily to verify everything is working

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

interface TableStats {
  table: string
  totalRows: number
  last24h: number
  lastUpdated: string | null
  status: 'healthy' | 'warning' | 'critical'
}

interface CronJobStatus {
  jobName: string
  lastRun: string | null
  lastStatus: string | null
  runsLast24h: number
  successRate: number
  status: 'healthy' | 'warning' | 'critical'
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get table statistics
    const tableStats = await getTableStats()

    // Get cron job logs
    const cronJobs = await getCronJobStatus()

    // Calculate overall health
    const criticalCount = [...tableStats, ...cronJobs].filter(s => s.status === 'critical').length
    const warningCount = [...tableStats, ...cronJobs].filter(s => s.status === 'warning').length

    const overallHealth = criticalCount > 0 ? 'critical' : warningCount > 2 ? 'warning' : 'healthy'

    // Get data coverage stats
    const coverage = await getDataCoverage()

    return NextResponse.json({
      status: overallHealth,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,

      summary: {
        totalTables: tableStats.length,
        healthyTables: tableStats.filter(t => t.status === 'healthy').length,
        totalCronJobs: cronJobs.length,
        healthyCronJobs: cronJobs.filter(j => j.status === 'healthy').length,
        criticalIssues: criticalCount,
        warnings: warningCount,
      },

      dataCoverage: coverage,

      tables: tableStats,

      cronJobs: cronJobs,

      recommendations: generateRecommendations(tableStats, cronJobs),
    })
  } catch (error) {
    console.error('Monitoring error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function getTableStats(): Promise<TableStats[]> {
  const tables = [
    { name: 'income_statements', minDaily: 50 },
    { name: 'balance_sheets', minDaily: 50 },
    { name: 'cash_flow_statements', minDaily: 50 },
    { name: 'insider_trades', minDaily: 10 },
    { name: 'institutional_holdings', minDaily: 0 }, // Updated less frequently
    { name: 'stock_prices_snapshot', minDaily: 100 },
    { name: 'analyst_estimates', minDaily: 5 },
    { name: 'short_volume', minDaily: 100 },
    { name: 'sec_filings', minDaily: 20 },
    { name: 'clinical_trials', minDaily: 0 },
  ]

  const stats: TableStats[] = []
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  for (const table of tables) {
    try {
      // Get total count
      const { count: totalRows } = await getSupabase()
        .from(table.name)
        .select('*', { count: 'exact', head: true })

      // Get last 24h count
      const { count: last24h } = await getSupabase()
        .from(table.name)
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', yesterday)

      // Get last updated
      const { data: lastRow } = await getSupabase()
        .from(table.name)
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      const status = determineTableHealth(last24h || 0, table.minDaily, lastRow?.updated_at)

      stats.push({
        table: table.name,
        totalRows: totalRows || 0,
        last24h: last24h || 0,
        lastUpdated: lastRow?.updated_at || null,
        status,
      })
    } catch {
      stats.push({
        table: table.name,
        totalRows: 0,
        last24h: 0,
        lastUpdated: null,
        status: 'critical',
      })
    }
  }

  return stats
}

function determineTableHealth(last24h: number, minDaily: number, lastUpdated: string | null): 'healthy' | 'warning' | 'critical' {
  if (!lastUpdated) return 'critical'

  const hoursSinceUpdate = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60)

  if (hoursSinceUpdate > 48) return 'critical'
  if (hoursSinceUpdate > 24) return 'warning'
  if (last24h < minDaily * 0.5) return 'warning'

  return 'healthy'
}

async function getCronJobStatus(): Promise<CronJobStatus[]> {
  const jobs: CronJobStatus[] = []
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  try {
    // Get cron job logs
    const { data: logs } = await getSupabase()
      .from('cron_job_log')
      .select('job_name, status, created_at')
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false })

    if (!logs) return jobs

    // Group by job name
    const jobLogs = new Map<string, { status: string; created_at: string }[]>()

    for (const log of logs) {
      const existing = jobLogs.get(log.job_name) || []
      existing.push(log)
      jobLogs.set(log.job_name, existing)
    }

    // Calculate stats for each job
    for (const [jobName, jobLogList] of jobLogs) {
      const successCount = jobLogList.filter(l => l.status === 'completed').length
      const failCount = jobLogList.filter(l => l.status === 'failed').length
      const totalRuns = successCount + failCount
      const successRate = totalRuns > 0 ? (successCount / totalRuns) * 100 : 0

      const lastLog = jobLogList[0]

      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      if (successRate < 50) status = 'critical'
      else if (successRate < 80) status = 'warning'
      else if (totalRuns === 0) status = 'warning'

      jobs.push({
        jobName,
        lastRun: lastLog?.created_at || null,
        lastStatus: lastLog?.status || null,
        runsLast24h: totalRuns,
        successRate: Math.round(successRate),
        status,
      })
    }

    // Add expected jobs that didn't run
    const expectedJobs = [
      'sync-financials',
      'sync-prices',
      'sync-insider-trades',
      'sync-short-volume',
      'sync-8k-filings',
      'sync-analyst-estimates',
    ]

    for (const expected of expectedJobs) {
      if (!jobLogs.has(expected)) {
        jobs.push({
          jobName: expected,
          lastRun: null,
          lastStatus: null,
          runsLast24h: 0,
          successRate: 0,
          status: 'critical',
        })
      }
    }
  } catch (err) {
    console.error('Error fetching cron logs:', err)
  }

  return jobs.sort((a, b) => a.jobName.localeCompare(b.jobName))
}

async function getDataCoverage(): Promise<{
  stocks: { total: number; withFinancials: number; withPrices: number; coverage: number }
  financials: { incomeStatements: number; balanceSheets: number; cashFlows: number }
}> {
  try {
    // Count unique tickers with financials
    const { data: incomeStocks } = await getSupabase()
      .from('income_statements')
      .select('ticker')
      .limit(100000)

    const { data: balanceStocks } = await getSupabase()
      .from('balance_sheets')
      .select('ticker')
      .limit(100000)

    const { data: cashFlowStocks } = await getSupabase()
      .from('cash_flow_statements')
      .select('ticker')
      .limit(100000)

    const { data: priceStocks } = await getSupabase()
      .from('stock_prices_snapshot')
      .select('ticker')
      .limit(100000)

    const uniqueIncome = new Set((incomeStocks || []).map(s => s.ticker))
    const uniqueBalance = new Set((balanceStocks || []).map(s => s.ticker))
    const uniqueCashFlow = new Set((cashFlowStocks || []).map(s => s.ticker))
    const uniquePrices = new Set((priceStocks || []).map(s => s.ticker))

    const allTickers = new Set([...uniqueIncome, ...uniqueBalance, ...uniqueCashFlow])
    const withFinancials = allTickers.size
    const withPrices = uniquePrices.size

    // SEC has ~10,000 companies
    const totalSECCompanies = 10000
    const coverage = Math.round((withFinancials / totalSECCompanies) * 100)

    return {
      stocks: {
        total: totalSECCompanies,
        withFinancials,
        withPrices,
        coverage,
      },
      financials: {
        incomeStatements: uniqueIncome.size,
        balanceSheets: uniqueBalance.size,
        cashFlows: uniqueCashFlow.size,
      },
    }
  } catch {
    return {
      stocks: { total: 0, withFinancials: 0, withPrices: 0, coverage: 0 },
      financials: { incomeStatements: 0, balanceSheets: 0, cashFlows: 0 },
    }
  }
}

function generateRecommendations(tables: TableStats[], cronJobs: CronJobStatus[]): string[] {
  const recommendations: string[] = []

  // Check for critical issues
  const criticalTables = tables.filter(t => t.status === 'critical')
  const criticalJobs = cronJobs.filter(j => j.status === 'critical')

  if (criticalTables.length > 0) {
    recommendations.push(`🔴 ${criticalTables.length} tables have critical issues: ${criticalTables.map(t => t.table).join(', ')}`)
  }

  if (criticalJobs.length > 0) {
    recommendations.push(`🔴 ${criticalJobs.length} cron jobs failing: ${criticalJobs.map(j => j.jobName).join(', ')}`)
  }

  // Check for warnings
  const warningTables = tables.filter(t => t.status === 'warning')
  if (warningTables.length > 0) {
    recommendations.push(`⚠️ ${warningTables.length} tables need attention: ${warningTables.map(t => t.table).join(', ')}`)
  }

  // Check data freshness
  const stalePrice = tables.find(t => t.table === 'stock_prices_snapshot')
  if (stalePrice && stalePrice.last24h < 50) {
    recommendations.push('⚠️ Price data is stale - check sync-prices cron job')
  }

  // Check coverage
  const financialsTables = tables.filter(t => ['income_statements', 'balance_sheets', 'cash_flow_statements'].includes(t.table))
  const avgFinancialsPerDay = financialsTables.reduce((sum, t) => sum + t.last24h, 0) / 3
  if (avgFinancialsPerDay < 100) {
    recommendations.push('📈 Consider increasing sync-financials frequency to improve coverage')
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ All systems operating normally')
  }

  return recommendations
}
