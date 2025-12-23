import { NextRequest, NextResponse } from 'next/server'

const FINANCIAL_DATASETS_API_KEY = process.env.FINANCIAL_DATASETS_API_KEY || ""
const EODHD_API_KEY = process.env.EODHD_API_KEY || ""
const FD_BASE_URL = "https://api.financialdatasets.ai"

// Get base URL for internal API calls
function getBaseUrl() {
  // In production, use the absolute URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // In development, use localhost
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

async function fetchFD(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${FD_BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))

  const response = await fetch(url.toString(), {
    headers: { "X-API-KEY": FINANCIAL_DATASETS_API_KEY },
    next: { revalidate: 300 }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// Fetch from internal v1 APIs (which check Supabase first, then fallback to FD API)
async function fetchInternal(endpoint: string, params: Record<string, string>) {
  const baseUrl = getBaseUrl()
  const url = new URL(`${baseUrl}/api/v1${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      return { data: null, _meta: { source: 'error' } }
    }

    return response.json()
  } catch (error) {
    console.error(`Internal API error for ${endpoint}:`, error)
    return { data: null, _meta: { source: 'error' } }
  }
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  // Source override: 'cache' (Supabase only), 'fd' (Financial Datasets), 'eodhd' (EODHD only)
  const sourceOverride = request.nextUrl.searchParams.get('source')

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    // Calculate date range for 52-week data
    const today = new Date()
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const startDate = oneYearAgo.toISOString().split('T')[0]
    const endDate = today.toISOString().split('T')[0]

    // Fetch ALL available data in parallel
    // Use internal v1 APIs for financial statements (they check Supabase cache first)
    const [
      snapshot,
      incomeResult,
      balanceResult,
      cashFlowResult,
      metrics,
      allMetrics,
      insiderTrades,
      analystEstimates,
      segmentedResult,
      companyFacts,
      quarterlyIncomeResult,
      quarterlyBalanceResult,
      quarterlyCashFlowResult,
      priceHistory,
      priceTargets,
      eohdRealtime,
      eohdFundamentals
    ] = await Promise.all([
      fetchFD('/prices/snapshot/', { ticker }).catch(() => ({ snapshot: null })),
      // Use internal APIs (Supabase-first with fallback)
      fetchInternal('/financials/income-statements', { ticker, period: 'annual', limit: '5' }),
      fetchInternal('/financials/balance-sheets', { ticker, period: 'annual', limit: '5' }),
      fetchInternal('/financials/cash-flow-statements', { ticker, period: 'annual', limit: '5' }),
      fetchInternal('/financial-metrics', { ticker, period: 'annual', limit: '1' }),
      fetchInternal('/financial-metrics', { ticker, period: 'annual', limit: '5' }),
      fetchInternal('/insider-trades', { ticker, limit: '20' }),
      fetchInternal('/analyst-estimates', { ticker, limit: '8' }),
      fetchInternal('/financials/segmented-revenues', { ticker, period: 'annual', limit: '3' }),
      fetchFD('/company/facts/', { ticker }).catch(() => ({ company_facts: null })),
      fetchInternal('/financials/income-statements', { ticker, period: 'quarterly', limit: '8' }),
      fetchInternal('/financials/balance-sheets', { ticker, period: 'quarterly', limit: '8' }),
      fetchInternal('/financials/cash-flow-statements', { ticker, period: 'quarterly', limit: '8' }),
      fetchFD('/prices/', { ticker, interval: 'day', start_date: startDate, end_date: endDate }).catch(() => ({ prices: [] })),
      fetchFD('/analyst/price-targets/', { ticker, limit: '10' }).catch(() => ({ price_targets: [] })),
      // EODHD real-time for bid/ask and intraday data
      fetch(`https://eodhd.com/api/real-time/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json`, { next: { revalidate: 60 } })
        .then(r => r.ok ? r.json() : null).catch(() => null),
      // EODHD fundamentals for additional data
      fetch(`https://eodhd.com/api/fundamentals/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json`, { next: { revalidate: 3600 } })
        .then(r => r.ok ? r.json() : null).catch(() => null),
    ])

    // Extract data and sources from internal API responses
    const incomeStatements = { income_statements: incomeResult.income_statements || [] }
    const balanceSheets = { balance_sheets: balanceResult.balance_sheets || [] }
    const cashFlows = { cash_flow_statements: cashFlowResult.cash_flow_statements || [] }
    const segmentedRevenues = { segmented_revenues: segmentedResult.segmented_revenues || [] }
    const quarterlyIncome = { income_statements: quarterlyIncomeResult.income_statements || [] }
    const quarterlyBalance = { balance_sheets: quarterlyBalanceResult.balance_sheets || [] }
    const quarterlyCashFlow = { cash_flow_statements: quarterlyCashFlowResult.cash_flow_statements || [] }

    // Parse segmented revenues - extract product segments and geographic segments
    const latestSegmented = segmentedRevenues?.segmented_revenues?.[0]
    const segments: { name: string; revenue: number; type: string }[] = []
    const productSegments: { name: string; revenue: number }[] = []
    const geoSegments: { name: string; revenue: number }[] = []

    if (latestSegmented?.items) {
      latestSegmented.items.forEach((item: any) => {
        const segmentInfo = item.segments?.[0]
        if (segmentInfo && item.amount > 0) {
          const label = segmentInfo.label || segmentInfo.key
          const type = segmentInfo.type || 'Unknown'

          // Categorize by type
          if (type === 'Product or Service' && !['Product', 'Service'].includes(label)) {
            productSegments.push({ name: label, revenue: item.amount })
          } else if (type === 'Statement Geographical' || type === 'Statement Business Segments') {
            geoSegments.push({ name: label, revenue: item.amount })
          }

          segments.push({ name: label, revenue: item.amount, type })
        }
      })
    }

    // Fallback: if no segments, create synthetic ones from income statement
    if (productSegments.length === 0 && incomeStatements.income_statements?.[0]) {
      const is = incomeStatements.income_statements[0]
      if (is.revenue) {
        productSegments.push({ name: 'Total Revenue', revenue: is.revenue })
      }
    }

    // Calculate 52-week high/low and average volume from price history
    const prices = priceHistory?.prices || []
    let yearHigh = 0
    let yearLow = Infinity
    let totalVolume = 0
    let volumeCount = 0

    prices.forEach((p: { high: number; low: number; volume: number }) => {
      if (p.high > yearHigh) yearHigh = p.high
      if (p.low < yearLow) yearLow = p.low
      if (p.volume) {
        totalVolume += p.volume
        volumeCount++
      }
    })

    const avgVolume = volumeCount > 0 ? Math.round(totalVolume / volumeCount) : 0
    if (yearLow === Infinity) yearLow = 0

    // Get today's OHLC from the most recent price data
    const todayPrice = prices[prices.length - 1] || {}
    const yesterdayPrice = prices[prices.length - 2] || {}

    // Get price target from analyst data
    const latestPriceTarget = priceTargets?.price_targets?.[0]
    const avgPriceTarget = latestPriceTarget?.price_target || null

    // Get company facts for beta, dividend, etc.
    const facts = companyFacts?.company_facts || {}

    // Get EODHD data
    const eohdTechnicals = eohdFundamentals?.Technicals || {}
    const eohdHighlights = eohdFundamentals?.Highlights || {}
    const eohdGeneral = eohdFundamentals?.General || {}
    const eohdValuation = eohdFundamentals?.Valuation || {}

    // Build EODHD fallback metrics for when Financial Datasets doesn't have data
    const eohdMetricsFallback = {
      // Profitability
      return_on_invested_capital: eohdHighlights.ReturnOnEquityTTM ? eohdHighlights.ReturnOnEquityTTM / 100 : undefined,
      return_on_equity: eohdHighlights.ReturnOnEquityTTM ? eohdHighlights.ReturnOnEquityTTM / 100 : undefined,
      return_on_assets: eohdHighlights.ReturnOnAssetsTTM ? eohdHighlights.ReturnOnAssetsTTM / 100 : undefined,
      // Margins
      gross_margin: eohdHighlights.GrossProfitTTM && eohdHighlights.RevenueTTM
        ? eohdHighlights.GrossProfitTTM / eohdHighlights.RevenueTTM : undefined,
      operating_margin: eohdHighlights.OperatingMarginTTM ? eohdHighlights.OperatingMarginTTM / 100 : undefined,
      net_margin: eohdHighlights.ProfitMargin ? eohdHighlights.ProfitMargin / 100 : undefined,
      profit_margin: eohdHighlights.ProfitMargin ? eohdHighlights.ProfitMargin / 100 : undefined,
      // Growth
      revenue_growth: eohdHighlights.QuarterlyRevenueGrowthYOY ? eohdHighlights.QuarterlyRevenueGrowthYOY / 100 : undefined,
      earnings_growth: eohdHighlights.QuarterlyEarningsGrowthYOY ? eohdHighlights.QuarterlyEarningsGrowthYOY / 100 : undefined,
      // Valuation
      price_to_earnings_ratio: eohdHighlights.PERatio || eohdValuation.TrailingPE,
      price_to_book_ratio: eohdValuation.PriceBookMRQ,
      price_to_sales_ratio: eohdValuation.PriceSalesTTM,
      enterprise_value_to_ebitda: eohdValuation.EnterpriseValueEbitda,
      peg_ratio: eohdHighlights.PEGRatio,
      // Financial Health
      debt_to_equity: eohdHighlights.DebtToEquity ? eohdHighlights.DebtToEquity / 100 : undefined,
      current_ratio: eohdHighlights.CurrentRatio,
      // Earnings
      earnings_per_share: eohdHighlights.EarningsShare,
      book_value_per_share: eohdHighlights.BookValue,
      revenue_per_share: eohdHighlights.RevenuePerShareTTM,
      // Cash Flow - estimate FCF yield from market cap and EBITDA
      free_cash_flow_yield: eohdHighlights.EBITDA && eohdHighlights.MarketCapitalization
        ? (eohdHighlights.EBITDA * 0.7) / eohdHighlights.MarketCapitalization : undefined,
      // Market Data
      market_cap: eohdHighlights.MarketCapitalization,
      enterprise_value: eohdValuation.EnterpriseValue,
      // Dividend
      dividend_yield: eohdHighlights.DividendYield ? eohdHighlights.DividendYield / 100 : undefined,
    }

    // Remove undefined values from EODHD fallback
    Object.keys(eohdMetricsFallback).forEach(key => {
      if (eohdMetricsFallback[key as keyof typeof eohdMetricsFallback] === undefined) {
        delete eohdMetricsFallback[key as keyof typeof eohdMetricsFallback]
      }
    })

    // Collect data sources for each data type
    // Check if primary metrics source has real data (not just null values)
    const primaryMetrics = metrics.financial_metrics?.[0] || {}
    const primaryHasRealData = Object.values(primaryMetrics).some(v => v !== null && v !== undefined)
    const hasEohdData = Object.keys(eohdMetricsFallback).length > 0

    const dataSources = {
      incomeStatements: incomeResult._meta?.source || 'financialdatasets.ai',
      balanceSheets: balanceResult._meta?.source || 'financialdatasets.ai',
      cashFlows: cashFlowResult._meta?.source || 'financialdatasets.ai',
      segmentedRevenues: segmentedResult._meta?.source || 'financialdatasets.ai',
      quarterlyIncome: quarterlyIncomeResult._meta?.source || 'financialdatasets.ai',
      quarterlyBalance: quarterlyBalanceResult._meta?.source || 'financialdatasets.ai',
      quarterlyCashFlow: quarterlyCashFlowResult._meta?.source || 'financialdatasets.ai',
      // Metrics source cascade: show primary source if it has data, otherwise EODHD
      metrics: primaryHasRealData
        ? (metrics._meta?.source || 'financialdatasets.ai')
        : (hasEohdData ? 'eodhd.com' : 'none'),
      insiderTrades: insiderTrades._meta?.source || 'financialdatasets.ai',
      analystEstimates: analystEstimates._meta?.source || 'financialdatasets.ai',
    }

    // Create fallback snapshot from EODHD if Financial Datasets doesn't have the ticker
    const baseSnapshot = snapshot.snapshot || {
      ticker: ticker.toUpperCase(),
      price: eohdRealtime?.close || eohdRealtime?.previousClose || 0,
      day_change: eohdRealtime?.change || 0,
      day_change_percent: eohdRealtime?.change_p || 0,
      volume: eohdRealtime?.volume || 0,
      market_cap: eohdHighlights?.MarketCapitalization || 0,
    }

    // Enhance snapshot with calculated data
    const enhancedSnapshot = {
      ...baseSnapshot,
      // Day's OHLC - prefer EODHD real-time data
      open: eohdRealtime?.open || todayPrice.open || baseSnapshot?.open,
      dayHigh: eohdRealtime?.high || todayPrice.high || baseSnapshot?.day_high,
      dayLow: eohdRealtime?.low || todayPrice.low || baseSnapshot?.day_low,
      previousClose: eohdRealtime?.previousClose || yesterdayPrice.close || baseSnapshot?.previous_close,
      // Bid/Ask from EODHD real-time
      bid: eohdRealtime?.bid,
      ask: eohdRealtime?.ask,
      // 52-week range - prefer EODHD technicals
      yearHigh: eohdTechnicals['52WeekHigh'] || yearHigh || snapshot.snapshot?.year_high,
      yearLow: eohdTechnicals['52WeekLow'] || yearLow || snapshot.snapshot?.year_low,
      // Volume
      avgVolume,
      // From EODHD technicals
      beta: eohdTechnicals.Beta || facts.beta,
      fiftyDayMA: eohdTechnicals['50DayMA'],
      twoHundredDayMA: eohdTechnicals['200DayMA'],
      // Dividend info from EODHD
      dividendYield: eohdHighlights.DividendYield || facts.dividend_yield,
      forwardDividendYield: eohdHighlights.ForwardAnnualDividendYield || facts.forward_dividend_yield,
      dividendShare: eohdHighlights.DividendShare,
      exDividendDate: eohdGeneral.ExDividendDate || facts.ex_dividend_date,
      // Earnings info
      earningsDate: eohdGeneral.MostRecentQuarter || facts.earnings_date || facts.next_earnings_date,
      // Price target from EODHD or Financial Datasets
      priceTarget: eohdHighlights.WallStreetTargetPrice || avgPriceTarget,
    }

    // EODHD Financial Statements Fallback
    // Parse EODHD financials if primary sources are empty
    const eohdFinancials = eohdFundamentals?.Financials || {}
    const eohdIncomeYearly = eohdFinancials.Income_Statement?.yearly || {}
    const eohdBalanceYearly = eohdFinancials.Balance_Sheet?.yearly || {}
    const eohdCashFlowYearly = eohdFinancials.Cash_Flow?.yearly || {}
    const eohdIncomeQuarterly = eohdFinancials.Income_Statement?.quarterly || {}
    const eohdBalanceQuarterly = eohdFinancials.Balance_Sheet?.quarterly || {}
    const eohdCashFlowQuarterly = eohdFinancials.Cash_Flow?.quarterly || {}

    // Helper to convert EODHD income statement to our format
    const convertEohdIncome = (data: any, period: string, reportDate: string) => ({
      ticker: ticker.toUpperCase(),
      report_period: reportDate,
      period,
      currency: 'USD',
      revenue: data.totalRevenue,
      cost_of_revenue: data.costOfRevenue,
      gross_profit: data.grossProfit,
      operating_expense: data.operatingExpenses || data.totalOperatingExpenses,
      selling_general_and_administrative_expenses: data.sellingGeneralAdministrative,
      research_and_development: data.researchDevelopment,
      operating_income: data.operatingIncome,
      interest_expense: data.interestExpense,
      ebit: data.ebit,
      income_tax_expense: data.incomeTaxExpense,
      net_income: data.netIncome,
      earnings_per_share: data.basicEPS,
      earnings_per_share_diluted: data.dilutedEPS,
    })

    // Helper to convert EODHD balance sheet to our format
    const convertEohdBalance = (data: any, period: string, reportDate: string) => ({
      ticker: ticker.toUpperCase(),
      report_period: reportDate,
      period,
      currency: 'USD',
      total_assets: data.totalAssets,
      current_assets: data.totalCurrentAssets,
      cash_and_equivalents: data.cash || data.cashAndShortTermInvestments,
      inventory: data.inventory,
      trade_and_non_trade_receivables: data.netReceivables,
      non_current_assets: data.totalAssets - (data.totalCurrentAssets || 0),
      property_plant_and_equipment: data.propertyPlantEquipment || data.propertyPlantAndEquipmentNet,
      total_liabilities: data.totalLiab || data.totalLiabilities,
      current_liabilities: data.totalCurrentLiabilities,
      current_debt: data.shortTermDebt || data.shortLongTermDebt,
      trade_and_non_trade_payables: data.accountsPayable,
      non_current_liabilities: (data.totalLiab || data.totalLiabilities || 0) - (data.totalCurrentLiabilities || 0),
      non_current_debt: data.longTermDebt,
      shareholders_equity: data.totalStockholderEquity || data.totalShareholderEquity,
      retained_earnings: data.retainedEarnings,
    })

    // Helper to convert EODHD cash flow to our format
    const convertEohdCashFlow = (data: any, period: string, reportDate: string) => ({
      ticker: ticker.toUpperCase(),
      report_period: reportDate,
      period,
      currency: 'USD',
      net_income: data.netIncome,
      depreciation_and_amortization: data.depreciation,
      net_cash_flow_from_operations: data.totalCashFromOperatingActivities || data.operatingCashFlow,
      capital_expenditure: data.capitalExpenditures,
      net_cash_flow_from_investing: data.totalCashflowsFromInvestingActivities,
      net_cash_flow_from_financing: data.totalCashFromFinancingActivities,
      dividends_and_other_cash_distributions: data.dividendsPaid,
      free_cash_flow: (data.totalCashFromOperatingActivities || 0) - Math.abs(data.capitalExpenditures || 0),
    })

    // Build EODHD fallback arrays
    const eohdIncomeStatements = Object.entries(eohdIncomeYearly)
      .slice(0, 5)
      .map(([date, data]) => convertEohdIncome(data, 'annual', date))
      .filter(s => s.revenue || s.net_income)

    const eohdBalanceSheets = Object.entries(eohdBalanceYearly)
      .slice(0, 5)
      .map(([date, data]) => convertEohdBalance(data, 'annual', date))
      .filter(s => s.total_assets)

    const eohdCashFlows = Object.entries(eohdCashFlowYearly)
      .slice(0, 5)
      .map(([date, data]) => convertEohdCashFlow(data, 'annual', date))
      .filter(s => s.net_cash_flow_from_operations)

    const eohdQuarterlyIncome = Object.entries(eohdIncomeQuarterly)
      .slice(0, 8)
      .map(([date, data]) => convertEohdIncome(data, 'quarterly', date))
      .filter(s => s.revenue || s.net_income)

    const eohdQuarterlyBalance = Object.entries(eohdBalanceQuarterly)
      .slice(0, 8)
      .map(([date, data]) => convertEohdBalance(data, 'quarterly', date))
      .filter(s => s.total_assets)

    const eohdQuarterlyCashFlow = Object.entries(eohdCashFlowQuarterly)
      .slice(0, 8)
      .map(([date, data]) => convertEohdCashFlow(data, 'quarterly', date))
      .filter(s => s.net_cash_flow_from_operations)

    // Use primary data if available, otherwise EODHD fallback
    // sourceOverride: 'eodhd' forces EODHD only
    // sourceOverride: 'financialdatasets' forces Financial Datasets/cache only (no EODHD fallback)
    const forceEodhd = sourceOverride === 'eodhd'
    const skipEohdFallback = sourceOverride === 'financialdatasets'

    const finalIncomeStatements = forceEodhd
      ? eohdIncomeStatements
      : (incomeStatements.income_statements?.length > 0)
        ? incomeStatements.income_statements
        : skipEohdFallback ? [] : eohdIncomeStatements

    const finalBalanceSheets = forceEodhd
      ? eohdBalanceSheets
      : (balanceSheets.balance_sheets?.length > 0)
        ? balanceSheets.balance_sheets
        : skipEohdFallback ? [] : eohdBalanceSheets

    const finalCashFlows = forceEodhd
      ? eohdCashFlows
      : (cashFlows.cash_flow_statements?.length > 0)
        ? cashFlows.cash_flow_statements
        : skipEohdFallback ? [] : eohdCashFlows

    const finalQuarterlyIncome = forceEodhd
      ? eohdQuarterlyIncome
      : (quarterlyIncome.income_statements?.length > 0)
        ? quarterlyIncome.income_statements
        : skipEohdFallback ? [] : eohdQuarterlyIncome

    const finalQuarterlyBalance = forceEodhd
      ? eohdQuarterlyBalance
      : (quarterlyBalance.balance_sheets?.length > 0)
        ? quarterlyBalance.balance_sheets
        : skipEohdFallback ? [] : eohdQuarterlyBalance

    const finalQuarterlyCashFlow = forceEodhd
      ? eohdQuarterlyCashFlow
      : (quarterlyCashFlow.cash_flow_statements?.length > 0)
        ? quarterlyCashFlow.cash_flow_statements
        : skipEohdFallback ? [] : eohdQuarterlyCashFlow

    // Update dataSources to reflect EODHD fallback or forced override
    if (forceEodhd || (finalIncomeStatements === eohdIncomeStatements && eohdIncomeStatements.length > 0)) {
      dataSources.incomeStatements = 'eodhd.com'
    }
    if (forceEodhd || (finalBalanceSheets === eohdBalanceSheets && eohdBalanceSheets.length > 0)) {
      dataSources.balanceSheets = 'eodhd.com'
    }
    if (forceEodhd || (finalCashFlows === eohdCashFlows && eohdCashFlows.length > 0)) {
      dataSources.cashFlows = 'eodhd.com'
    }
    if (forceEodhd || (finalQuarterlyIncome === eohdQuarterlyIncome && eohdQuarterlyIncome.length > 0)) {
      dataSources.quarterlyIncome = 'eodhd.com'
    }
    if (forceEodhd || (finalQuarterlyBalance === eohdQuarterlyBalance && eohdQuarterlyBalance.length > 0)) {
      dataSources.quarterlyBalance = 'eodhd.com'
    }
    if (forceEodhd || (finalQuarterlyCashFlow === eohdQuarterlyCashFlow && eohdQuarterlyCashFlow.length > 0)) {
      dataSources.quarterlyCashFlow = 'eodhd.com'
    }
    if (forceEodhd) {
      dataSources.metrics = 'eodhd.com'
    }

    // Merge company facts: Financial Datasets base with EODHD description fallback
    const baseCompanyFacts = companyFacts?.company_facts || {}
    const mergedCompanyFacts = {
      ...baseCompanyFacts,
      // Always use EODHD description if Financial Datasets doesn't have one
      description: baseCompanyFacts.description || eohdGeneral?.Description || null,
      // Fallbacks for other fields
      name: baseCompanyFacts.name || eohdGeneral?.Name || ticker.toUpperCase(),
      sector: baseCompanyFacts.sector || eohdGeneral?.Sector || null,
      industry: baseCompanyFacts.industry || eohdGeneral?.Industry || null,
      exchange: baseCompanyFacts.exchange || eohdGeneral?.Exchange || null,
      website: baseCompanyFacts.website_url || baseCompanyFacts.website || eohdGeneral?.WebURL || null,
      employees: baseCompanyFacts.number_of_employees || eohdGeneral?.FullTimeEmployees || null,
      headquarters: baseCompanyFacts.location || (eohdGeneral?.Address ? `${eohdGeneral.Address}, ${eohdGeneral.City}` : null),
      founded: eohdGeneral?.IPODate || baseCompanyFacts.listing_date || null,
      ceo: eohdGeneral?.CEO || null,
      country: eohdGeneral?.Country || null,
      phone: eohdGeneral?.Phone || null,
    }

    return NextResponse.json({
      snapshot: enhancedSnapshot,
      companyFacts: mergedCompanyFacts,
      // Annual statements - with EODHD fallback
      incomeStatements: finalIncomeStatements,
      balanceSheets: finalBalanceSheets,
      cashFlows: finalCashFlows,
      // Quarterly statements - with EODHD fallback
      quarterlyIncome: finalQuarterlyIncome,
      quarterlyBalance: finalQuarterlyBalance,
      quarterlyCashFlow: finalQuarterlyCashFlow,
      // Metrics - merge with cascade: Supabase/FD (primary) → EODHD (fallback)
      // sourceOverride: 'eodhd' forces EODHD only, otherwise merge
      metrics: (() => {
        if (forceEodhd) {
          return eohdMetricsFallback
        }
        const primary = metrics.financial_metrics?.[0] || {}
        // Only include non-null values from primary source
        const filteredPrimary = Object.fromEntries(
          Object.entries(primary).filter(([_, v]) => v !== null && v !== undefined)
        )
        // Merge: EODHD base, then filtered primary overwrites
        return { ...eohdMetricsFallback, ...filteredPrimary }
      })(),
      metricsHistory: allMetrics.financial_metrics || [],
      // Other data
      insiderTrades: insiderTrades.insider_trades || [],
      analystEstimates: analystEstimates.analyst_estimates || [],
      // Segmented data
      segments: productSegments,
      allSegments: segments,
      productSegments,
      geoSegments,
      rawSegmentedRevenues: segmentedRevenues?.segmented_revenues || [],
      // Data source tracking - shows whether data came from Supabase cache or API
      dataSources,
    })
  } catch (error) {
    console.error('Stock API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 })
  }
}
