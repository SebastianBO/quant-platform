import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// SEC EDGAR API - Free, no key required
// Returns debt maturity schedule and other debt metrics from XBRL filings

const SEC_USER_AGENT = 'Lician contact@lician.com'

interface DebtConcept {
  end: string
  val: number
  accn: string
  fy: number
  fp: string
  form: string
  filed: string
  frame?: string
}

interface DebtMaturity {
  year: string
  label: string
  amount: number
  percentOfTotal: number
}

// Ticker to CIK mapping (common companies - SEC provides a full list)
const TICKER_TO_CIK: Record<string, string> = {
  AAPL: '0000320193',
  MSFT: '0000789019',
  GOOGL: '0001652044',
  GOOG: '0001652044',
  AMZN: '0001018724',
  META: '0001326801',
  TSLA: '0001318605',
  NVDA: '0001045810',
  BRK: '0001067983',
  'BRK.A': '0001067983',
  'BRK.B': '0001067983',
  JPM: '0000019617',
  V: '0001403161',
  JNJ: '0000200406',
  WMT: '0000104169',
  UNH: '0000731766',
  XOM: '0000034088',
  MA: '0001141391',
  PG: '0000080424',
  HD: '0000354950',
  CVX: '0000093410',
  ABBV: '0001551152',
  MRK: '0000310158',
  LLY: '0000059478',
  COST: '0000909832',
  PEP: '0000077476',
  KO: '0000021344',
  AVGO: '0001730168',
  TMO: '0000097745',
  MCD: '0000063908',
  CSCO: '0000858877',
  ABT: '0000001800',
  ACN: '0001467373',
  NKE: '0000320187',
  CRM: '0001108524',
  DIS: '0001744489',
  VZ: '0000732712',
  INTC: '0000050863',
  CMCSA: '0001166691',
  ADBE: '0000796343',
  TXN: '0000097476',
  PM: '0001413329',
  NFLX: '0001065280',
  AMD: '0000002488',
  ORCL: '0001341439',
  IBM: '0000051143',
  HON: '0000773840',
  QCOM: '0000804328',
  UPS: '0001090727',
  CAT: '0000018230',
  BA: '0000012927',
  GE: '0000040545',
  GS: '0000886982',
  MS: '0000895421',
  SCHW: '0000316709',
  BLK: '0001364742',
  AXP: '0000004962',
  C: '0000831001',
  BAC: '0000070858',
  WFC: '0000072971',
  SNOW: '0001640147',
  PLTR: '0001321655',
  COIN: '0001679788',
}

async function getCIKForTicker(ticker: string): Promise<string | null> {
  const upperTicker = ticker.toUpperCase()

  // Check our cache first
  if (TICKER_TO_CIK[upperTicker]) {
    return TICKER_TO_CIK[upperTicker]
  }

  // Try SEC's company ticker search
  try {
    const response = await fetch(
      `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${upperTicker}&type=10-K&dateb=&owner=include&count=1&output=json`,
      { headers: { 'User-Agent': SEC_USER_AGENT } }
    )

    if (!response.ok) return null

    const data = await response.json()
    if (data.results?.[0]?.cik) {
      return data.results[0].cik.padStart(10, '0')
    }

    // Alternative: check SEC ticker map
    const tickerMapResponse = await fetch(
      'https://www.sec.gov/files/company_tickers.json',
      { headers: { 'User-Agent': SEC_USER_AGENT } }
    )

    if (tickerMapResponse.ok) {
      const tickerMap = await tickerMapResponse.json()
      for (const entry of Object.values(tickerMap) as { cik_str: number; ticker: string }[]) {
        if (entry.ticker === upperTicker) {
          return String(entry.cik_str).padStart(10, '0')
        }
      }
    }
  } catch (error) {
    logger.error('Error looking up CIK', { error: error instanceof Error ? error.message : 'Unknown' })
  }

  return null
}

function getLatestValue(concepts: DebtConcept[] | undefined): number | null {
  if (!concepts || concepts.length === 0) return null

  // Sort by end date descending
  const sorted = [...concepts].sort((a, b) =>
    new Date(b.end).getTime() - new Date(a.end).getTime()
  )

  // Get the most recent value that's from a 10-K or 10-Q
  const recent = sorted.find(c => c.form === '10-K' || c.form === '10-Q')
  return recent?.val ?? sorted[0]?.val ?? null
}

function getLatestAnnualValue(concepts: DebtConcept[] | undefined): DebtConcept | null {
  if (!concepts || concepts.length === 0) return null

  // Get most recent 10-K filing
  const annuals = concepts.filter(c => c.form === '10-K')
  if (annuals.length === 0) return null

  return annuals.sort((a, b) =>
    new Date(b.end).getTime() - new Date(a.end).getTime()
  )[0]
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    // Get CIK for ticker
    const cik = await getCIKForTicker(ticker)

    if (!cik) {
      return NextResponse.json({
        error: 'Company not found',
        ticker: ticker.toUpperCase(),
        debt: null
      }, { status: 404 })
    }

    // Fetch company facts from SEC EDGAR
    const response = await fetch(
      `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`,
      {
        headers: { 'User-Agent': SEC_USER_AGENT },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to fetch SEC data',
        ticker: ticker.toUpperCase(),
        debt: null
      }, { status: response.status })
    }

    const facts = await response.json()
    const usGaap = facts.facts?.['us-gaap'] || {}

    // Extract debt-related concepts
    const longTermDebt = usGaap.LongTermDebt?.units?.USD
    const longTermDebtCurrent = usGaap.LongTermDebtCurrent?.units?.USD
    const commercialPaper = usGaap.CommercialPaper?.units?.USD
    const shortTermBorrowings = usGaap.ShortTermBorrowings?.units?.USD
    const interestExpense = usGaap.InterestExpenseDebt?.units?.USD || usGaap.InterestExpense?.units?.USD

    // Additional financial data for ratios
    const operatingIncome = usGaap.OperatingIncomeLoss?.units?.USD
    const stockholdersEquity = usGaap.StockholdersEquity?.units?.USD
    const totalAssets = usGaap.Assets?.units?.USD
    const cashAndEquivalents = usGaap.CashAndCashEquivalentsAtCarryingValue?.units?.USD
    const operatingCashFlow = usGaap.NetCashProvidedByUsedInOperatingActivities?.units?.USD
    const debtIssuances = usGaap.ProceedsFromIssuanceOfLongTermDebt?.units?.USD
    const debtRepayments = usGaap.RepaymentsOfLongTermDebt?.units?.USD

    // Debt maturities
    const maturitiesYear1 = usGaap.LongTermDebtMaturitiesRepaymentsOfPrincipalInNextTwelveMonths?.units?.USD
    const maturitiesYear2 = usGaap.LongTermDebtMaturitiesRepaymentsOfPrincipalInYearTwo?.units?.USD
    const maturitiesYear3 = usGaap.LongTermDebtMaturitiesRepaymentsOfPrincipalInYearThree?.units?.USD
    const maturitiesYear4 = usGaap.LongTermDebtMaturitiesRepaymentsOfPrincipalInYearFour?.units?.USD
    const maturitiesYear5 = usGaap.LongTermDebtMaturitiesRepaymentsOfPrincipalInYearFive?.units?.USD
    const maturitiesAfter5 = usGaap.LongTermDebtMaturitiesRepaymentsOfPrincipalAfterYearFive?.units?.USD

    // Get latest values
    const totalLongTermDebt = getLatestValue(longTermDebt)
    const currentPortionOfDebt = getLatestValue(longTermDebtCurrent)
    const commercialPaperValue = getLatestValue(commercialPaper)
    const shortTermDebtValue = getLatestValue(shortTermBorrowings)
    const interestExpenseValue = getLatestValue(interestExpense)

    // Get values for ratios
    const operatingIncomeValue = getLatestValue(operatingIncome)
    const stockholdersEquityValue = getLatestValue(stockholdersEquity)
    const totalAssetsValue = getLatestValue(totalAssets)
    const cashValue = getLatestValue(cashAndEquivalents)
    const operatingCashFlowValue = getLatestValue(operatingCashFlow)
    const debtIssuancesValue = getLatestValue(debtIssuances)
    const debtRepaymentsValue = getLatestValue(debtRepayments)

    // Build maturity schedule
    const latestFiling = getLatestAnnualValue(maturitiesYear1)
    const filingDate = latestFiling?.end
    const fiscalYear = latestFiling?.fy

    const maturitySchedule: DebtMaturity[] = []
    const year1 = getLatestValue(maturitiesYear1)
    const year2 = getLatestValue(maturitiesYear2)
    const year3 = getLatestValue(maturitiesYear3)
    const year4 = getLatestValue(maturitiesYear4)
    const year5 = getLatestValue(maturitiesYear5)
    const after5 = getLatestValue(maturitiesAfter5)

    const totalScheduledDebt = (year1 || 0) + (year2 || 0) + (year3 || 0) +
                                (year4 || 0) + (year5 || 0) + (after5 || 0)

    if (year1 !== null) {
      maturitySchedule.push({
        year: 'Year 1',
        label: fiscalYear ? `FY${fiscalYear + 1}` : 'Year 1',
        amount: year1,
        percentOfTotal: totalScheduledDebt > 0 ? (year1 / totalScheduledDebt) * 100 : 0
      })
    }
    if (year2 !== null) {
      maturitySchedule.push({
        year: 'Year 2',
        label: fiscalYear ? `FY${fiscalYear + 2}` : 'Year 2',
        amount: year2,
        percentOfTotal: totalScheduledDebt > 0 ? (year2 / totalScheduledDebt) * 100 : 0
      })
    }
    if (year3 !== null) {
      maturitySchedule.push({
        year: 'Year 3',
        label: fiscalYear ? `FY${fiscalYear + 3}` : 'Year 3',
        amount: year3,
        percentOfTotal: totalScheduledDebt > 0 ? (year3 / totalScheduledDebt) * 100 : 0
      })
    }
    if (year4 !== null) {
      maturitySchedule.push({
        year: 'Year 4',
        label: fiscalYear ? `FY${fiscalYear + 4}` : 'Year 4',
        amount: year4,
        percentOfTotal: totalScheduledDebt > 0 ? (year4 / totalScheduledDebt) * 100 : 0
      })
    }
    if (year5 !== null) {
      maturitySchedule.push({
        year: 'Year 5',
        label: fiscalYear ? `FY${fiscalYear + 5}` : 'Year 5',
        amount: year5,
        percentOfTotal: totalScheduledDebt > 0 ? (year5 / totalScheduledDebt) * 100 : 0
      })
    }
    if (after5 !== null) {
      maturitySchedule.push({
        year: 'After 5',
        label: 'After 5 Years',
        amount: after5,
        percentOfTotal: totalScheduledDebt > 0 ? (after5 / totalScheduledDebt) * 100 : 0
      })
    }

    // Calculate totals
    const totalShortTermDebt = (currentPortionOfDebt || 0) + (commercialPaperValue || 0) + (shortTermDebtValue || 0)
    const totalDebt = (totalLongTermDebt || 0) + totalShortTermDebt

    // Calculate ratios
    const netDebt = totalDebt - (cashValue || 0)
    const debtToEquity = stockholdersEquityValue && stockholdersEquityValue > 0
      ? totalDebt / stockholdersEquityValue
      : null
    const debtToAssets = totalAssetsValue && totalAssetsValue > 0
      ? totalDebt / totalAssetsValue
      : null
    const interestCoverage = interestExpenseValue && interestExpenseValue > 0 && operatingIncomeValue
      ? operatingIncomeValue / interestExpenseValue
      : null
    const debtServiceCoverage = interestExpenseValue && interestExpenseValue > 0 && operatingCashFlowValue
      ? operatingCashFlowValue / interestExpenseValue
      : null
    const netDebtChange = (debtIssuancesValue || 0) - (debtRepaymentsValue || 0)

    // Debt health rating
    let debtHealthRating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'CONCERN' | 'HIGH_RISK' = 'MODERATE'
    if (interestCoverage !== null) {
      if (interestCoverage >= 10 && (debtToEquity === null || debtToEquity < 0.5)) {
        debtHealthRating = 'EXCELLENT'
      } else if (interestCoverage >= 5 && (debtToEquity === null || debtToEquity < 1)) {
        debtHealthRating = 'GOOD'
      } else if (interestCoverage >= 2.5) {
        debtHealthRating = 'MODERATE'
      } else if (interestCoverage >= 1.5) {
        debtHealthRating = 'CONCERN'
      } else {
        debtHealthRating = 'HIGH_RISK'
      }
    }

    // Get company name from facts
    const companyName = facts.entityName || ticker.toUpperCase()

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      companyName,
      cik,
      asOfDate: filingDate,
      debt: {
        totalDebt,
        longTermDebt: totalLongTermDebt,
        shortTermDebt: totalShortTermDebt,
        currentPortionOfLongTermDebt: currentPortionOfDebt,
        commercialPaper: commercialPaperValue,
        interestExpense: interestExpenseValue,
        maturitySchedule,
        totalScheduledMaturities: totalScheduledDebt,
      },
      ratios: {
        netDebt,
        debtToEquity,
        debtToAssets,
        interestCoverage,
        debtServiceCoverage,
        debtHealthRating,
      },
      cashFlow: {
        debtIssuances: debtIssuancesValue,
        debtRepayments: debtRepaymentsValue,
        netDebtChange,
        isPayingDownDebt: netDebtChange < 0,
      },
      balanceSheet: {
        cash: cashValue,
        totalAssets: totalAssetsValue,
        stockholdersEquity: stockholdersEquityValue,
        operatingIncome: operatingIncomeValue,
        operatingCashFlow: operatingCashFlowValue,
      },
      _meta: {
        source: 'SEC_EDGAR',
        fetched_at: new Date().toISOString(),
        fiscalYear,
      }
    })

  } catch (error) {
    logger.error('Company debt API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({
      error: 'Internal server error',
      ticker: ticker.toUpperCase(),
      debt: null
    }, { status: 500 })
  }
}
