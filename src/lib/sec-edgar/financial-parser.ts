// SEC EDGAR Financial Statement Parser
// Extracts and normalizes financial data from XBRL Company Facts

import { SECCompanyFacts, XBRLUnit, IncomeStatement, BalanceSheet, CashFlowStatement } from './types'

// ============================================================================
// XBRL Concept Mappings
// Maps standard us-gaap concepts to our normalized field names
// ============================================================================

const INCOME_STATEMENT_CONCEPTS = {
  // Revenue
  revenue: ['Revenues', 'RevenueFromContractWithCustomerExcludingAssessedTax', 'SalesRevenueNet', 'SalesRevenueGoodsNet', 'SalesRevenueServicesNet', 'TotalRevenuesAndOtherIncome'],
  costOfRevenue: ['CostOfRevenue', 'CostOfGoodsAndServicesSold', 'CostOfGoodsSold', 'CostOfServices'],
  grossProfit: ['GrossProfit'],

  // Operating Expenses
  operatingExpense: ['OperatingExpenses', 'CostsAndExpenses'],
  sgaExpenses: ['SellingGeneralAndAdministrativeExpense', 'GeneralAndAdministrativeExpense'],
  researchAndDevelopment: ['ResearchAndDevelopmentExpense', 'ResearchAndDevelopmentExpenseExcludingAcquiredInProcessCost'],
  depreciationAndAmortization: ['DepreciationAndAmortization', 'DepreciationDepletionAndAmortization'],
  operatingIncome: ['OperatingIncomeLoss', 'IncomeLossFromOperations'],

  // Non-Operating
  interestExpense: ['InterestExpense', 'InterestExpenseDebt'],
  interestIncome: ['InterestIncome', 'InvestmentIncomeInterest'],
  otherIncomeExpense: ['OtherNonoperatingIncomeExpense', 'NonoperatingIncomeExpense'],

  // Pre-Tax Income
  incomeBeforeTax: ['IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest', 'IncomeLossFromContinuingOperationsBeforeIncomeTaxes'],
  incomeTaxExpense: ['IncomeTaxExpenseBenefit'],

  // Net Income
  netIncome: ['NetIncomeLoss', 'ProfitLoss'],
  netIncomeCommonStock: ['NetIncomeLossAvailableToCommonStockholdersBasic'],

  // Per Share
  eps: ['EarningsPerShareBasic'],
  epsDiluted: ['EarningsPerShareDiluted'],
  dividendsPerShare: ['CommonStockDividendsPerShareDeclared'],
  weightedAvgShares: ['WeightedAverageNumberOfSharesOutstandingBasic'],
  weightedAvgSharesDiluted: ['WeightedAverageNumberOfDilutedSharesOutstanding'],
}

const BALANCE_SHEET_CONCEPTS = {
  // Assets
  totalAssets: ['Assets'],
  currentAssets: ['AssetsCurrent'],
  cashAndEquivalents: ['CashAndCashEquivalentsAtCarryingValue', 'Cash', 'CashCashEquivalentsAndShortTermInvestments'],
  shortTermInvestments: ['ShortTermInvestments', 'MarketableSecuritiesCurrent', 'AvailableForSaleSecuritiesCurrent'],
  inventory: ['InventoryNet', 'Inventory'],
  accountsReceivable: ['AccountsReceivableNetCurrent', 'AccountsReceivableNet', 'ReceivablesNetCurrent'],
  nonCurrentAssets: ['AssetsNoncurrent'],
  ppe: ['PropertyPlantAndEquipmentNet', 'PropertyPlantAndEquipmentGross'],
  goodwill: ['Goodwill'],
  intangibleAssets: ['IntangibleAssetsNetExcludingGoodwill', 'FiniteLivedIntangibleAssetsNet'],
  investments: ['LongTermInvestments', 'InvestmentsAndAdvances', 'AvailableForSaleSecuritiesNoncurrent'],

  // Liabilities
  totalLiabilities: ['Liabilities', 'LiabilitiesAndStockholdersEquity'],
  currentLiabilities: ['LiabilitiesCurrent'],
  accountsPayable: ['AccountsPayableCurrent', 'AccountsPayableAndAccruedLiabilitiesCurrent'],
  currentDebt: ['ShortTermBorrowings', 'DebtCurrent', 'LongTermDebtCurrent'],
  deferredRevenue: ['ContractWithCustomerLiabilityCurrent', 'DeferredRevenueCurrent', 'DeferredRevenue'],
  nonCurrentLiabilities: ['LiabilitiesNoncurrent'],
  longTermDebt: ['LongTermDebtNoncurrent', 'LongTermDebt'],
  totalDebt: ['DebtAndCapitalLeaseObligations', 'LongTermDebtAndCapitalLeaseObligations'],

  // Equity
  shareholdersEquity: ['StockholdersEquity', 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'],
  commonStock: ['CommonStockValue', 'CommonStocksIncludingAdditionalPaidInCapital'],
  retainedEarnings: ['RetainedEarningsAccumulatedDeficit'],
  treasuryStock: ['TreasuryStockValue'],
  accumulatedOCI: ['AccumulatedOtherComprehensiveIncomeLossNetOfTax'],
  outstandingShares: ['CommonStockSharesOutstanding', 'EntityCommonStockSharesOutstanding'],
}

const CASH_FLOW_CONCEPTS = {
  // Operating
  netIncome: ['NetIncomeLoss', 'ProfitLoss'],
  depreciationAndAmortization: ['DepreciationDepletionAndAmortization', 'DepreciationAndAmortization'],
  shareBasedCompensation: ['ShareBasedCompensation', 'StockOptionPlanExpense'],
  changeInWorkingCapital: ['IncreaseDecreaseInOperatingCapital'],
  netCashFromOperations: ['NetCashProvidedByUsedInOperatingActivities'],

  // Investing
  capitalExpenditure: ['PaymentsToAcquirePropertyPlantAndEquipment', 'PaymentsForCapitalImprovements'],
  acquisitions: ['PaymentsToAcquireBusinessesNetOfCashAcquired'],
  purchasesOfInvestments: ['PaymentsToAcquireInvestments', 'PaymentsToAcquireAvailableForSaleSecurities'],
  salesOfInvestments: ['ProceedsFromSaleOfAvailableForSaleSecurities', 'ProceedsFromSaleOfInvestments'],
  netCashFromInvesting: ['NetCashProvidedByUsedInInvestingActivities'],

  // Financing
  debtIssuance: ['ProceedsFromIssuanceOfLongTermDebt', 'ProceedsFromDebtNetOfIssuanceCosts'],
  debtRepayment: ['RepaymentsOfLongTermDebt', 'RepaymentsOfDebt'],
  stockIssuance: ['ProceedsFromIssuanceOfCommonStock'],
  stockRepurchase: ['PaymentsForRepurchaseOfCommonStock', 'PaymentsForRepurchaseOfEquity'],
  dividendsPaid: ['PaymentsOfDividendsCommonStock', 'PaymentsOfDividends'],
  netCashFromFinancing: ['NetCashProvidedByUsedInFinancingActivities'],

  // Net Change
  effectOfFxChanges: ['EffectOfExchangeRateOnCashAndCashEquivalents'],
  netChangeInCash: ['CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalentsPeriodIncreaseDecreaseIncludingExchangeRateEffect', 'CashAndCashEquivalentsPeriodIncreaseDecrease'],
  endingCash: ['CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents', 'CashAndCashEquivalentsAtCarryingValue'],
}

// ============================================================================
// Parser Functions
// ============================================================================

/**
 * Extract a value from XBRL facts using concept mappings
 */
function extractValue(
  facts: SECCompanyFacts['facts'],
  concepts: string[],
  period: { start?: string; end: string },
  unit: string = 'USD'
): number | undefined {
  const usGaap = facts['us-gaap'] || {}

  for (const concept of concepts) {
    const fact = usGaap[concept]
    if (!fact?.units?.[unit]) continue

    // Find matching period
    const values = fact.units[unit]
    const match = values.find(v => {
      // For instant values (balance sheet)
      if (v.start === undefined && v.end === period.end) return true
      // For duration values (income/cash flow)
      if (v.start === period.start && v.end === period.end) return true
      return false
    })

    if (match) return match.val
  }

  return undefined
}

/**
 * Get all reporting periods from company facts
 */
export function getReportingPeriods(facts: SECCompanyFacts): { start?: string; end: string; form: string; filed: string; fy?: number; fp?: string }[] {
  const periods: Map<string, { start?: string; end: string; form: string; filed: string; fy?: number; fp?: string }> = new Map()

  const usGaap = facts.facts['us-gaap'] || {}

  // Look at Revenue or NetIncome to find all periods
  const revenueFact = usGaap['Revenues'] || usGaap['RevenueFromContractWithCustomerExcludingAssessedTax']
  const netIncomeFact = usGaap['NetIncomeLoss']

  const factToScan = revenueFact || netIncomeFact
  if (!factToScan?.units?.USD) return []

  for (const unit of factToScan.units.USD) {
    const key = `${unit.start || ''}-${unit.end}`
    if (!periods.has(key)) {
      periods.set(key, {
        start: unit.start,
        end: unit.end,
        form: unit.form || '',
        filed: unit.filed || '',
        fy: unit.fy,
        fp: unit.fp,
      })
    }
  }

  return Array.from(periods.values()).sort((a, b) => b.end.localeCompare(a.end))
}

/**
 * Parse income statements from company facts
 */
export function parseIncomeStatements(facts: SECCompanyFacts, ticker?: string): IncomeStatement[] {
  const periods = getReportingPeriods(facts)
  const cik = String(facts.cik)
  const statements: IncomeStatement[] = []

  for (const period of periods) {
    // Skip if no start date (these are instant values)
    if (!period.start) continue

    // Determine period type
    const startDate = new Date(period.start)
    const endDate = new Date(period.end)
    const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    let periodType: 'annual' | 'quarterly' | 'ttm' = 'quarterly'
    if (daysDiff > 350) periodType = 'annual'
    else if (daysDiff > 180) periodType = 'ttm'

    const statement: IncomeStatement = {
      cik,
      ticker,
      reportPeriod: period.end,
      fiscalPeriod: period.fp,
      period: periodType,
      currency: 'USD',

      revenue: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.revenue, period),
      costOfRevenue: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.costOfRevenue, period),
      grossProfit: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.grossProfit, period),
      operatingExpense: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.operatingExpense, period),
      sgaExpenses: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.sgaExpenses, period),
      researchAndDevelopment: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.researchAndDevelopment, period),
      depreciationAndAmortization: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.depreciationAndAmortization, period),
      operatingIncome: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.operatingIncome, period),
      interestExpense: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.interestExpense, period),
      interestIncome: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.interestIncome, period),
      otherIncomeExpense: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.otherIncomeExpense, period),
      incomeBeforeTax: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.incomeBeforeTax, period),
      incomeTaxExpense: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.incomeTaxExpense, period),
      netIncome: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.netIncome, period),
      netIncomeCommonStock: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.netIncomeCommonStock, period),
      eps: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.eps, period, 'USD/shares'),
      epsDiluted: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.epsDiluted, period, 'USD/shares'),
      dividendsPerShare: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.dividendsPerShare, period, 'USD/shares'),
      weightedAvgShares: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.weightedAvgShares, period, 'shares'),
      weightedAvgSharesDiluted: extractValue(facts.facts, INCOME_STATEMENT_CONCEPTS.weightedAvgSharesDiluted, period, 'shares'),
    }

    // Only add if we have meaningful data
    if (statement.revenue || statement.netIncome) {
      // Calculate derived fields
      if (!statement.grossProfit && statement.revenue && statement.costOfRevenue) {
        statement.grossProfit = statement.revenue - statement.costOfRevenue
      }

      statements.push(statement)
    }
  }

  return statements
}

/**
 * Parse balance sheets from company facts
 */
export function parseBalanceSheets(facts: SECCompanyFacts, ticker?: string): BalanceSheet[] {
  const cik = String(facts.cik)
  const statements: BalanceSheet[] = []

  // Get all instant (balance sheet) periods
  const usGaap = facts.facts['us-gaap'] || {}
  const assetsFact = usGaap['Assets']
  if (!assetsFact?.units?.USD) return []

  const periods = new Set(assetsFact.units.USD.map(v => v.end))

  for (const endDate of periods) {
    const period = { end: endDate }

    // Find the form and fiscal period
    const matchingValue = assetsFact.units.USD.find(v => v.end === endDate)

    const statement: BalanceSheet = {
      cik,
      ticker,
      reportPeriod: endDate,
      fiscalPeriod: matchingValue?.fp,
      period: matchingValue?.fp === 'FY' ? 'annual' : 'quarterly',
      currency: 'USD',

      totalAssets: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.totalAssets, period),
      currentAssets: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.currentAssets, period),
      cashAndEquivalents: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.cashAndEquivalents, period),
      shortTermInvestments: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.shortTermInvestments, period),
      inventory: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.inventory, period),
      accountsReceivable: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.accountsReceivable, period),
      nonCurrentAssets: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.nonCurrentAssets, period),
      ppe: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.ppe, period),
      goodwill: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.goodwill, period),
      intangibleAssets: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.intangibleAssets, period),
      investments: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.investments, period),
      totalLiabilities: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.totalLiabilities, period),
      currentLiabilities: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.currentLiabilities, period),
      accountsPayable: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.accountsPayable, period),
      currentDebt: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.currentDebt, period),
      deferredRevenue: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.deferredRevenue, period),
      nonCurrentLiabilities: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.nonCurrentLiabilities, period),
      longTermDebt: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.longTermDebt, period),
      totalDebt: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.totalDebt, period),
      shareholdersEquity: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.shareholdersEquity, period),
      commonStock: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.commonStock, period),
      retainedEarnings: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.retainedEarnings, period),
      treasuryStock: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.treasuryStock, period),
      accumulatedOCI: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.accumulatedOCI, period),
      outstandingShares: extractValue(facts.facts, BALANCE_SHEET_CONCEPTS.outstandingShares, period, 'shares'),
    }

    // Only add if we have meaningful data
    if (statement.totalAssets) {
      statements.push(statement)
    }
  }

  return statements.sort((a, b) => b.reportPeriod.localeCompare(a.reportPeriod))
}

/**
 * Parse cash flow statements from company facts
 */
export function parseCashFlowStatements(facts: SECCompanyFacts, ticker?: string): CashFlowStatement[] {
  const periods = getReportingPeriods(facts)
  const cik = String(facts.cik)
  const statements: CashFlowStatement[] = []

  for (const period of periods) {
    // Skip if no start date (these are instant values)
    if (!period.start) continue

    // Determine period type
    const startDate = new Date(period.start)
    const endDate = new Date(period.end)
    const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    let periodType: 'annual' | 'quarterly' | 'ttm' = 'quarterly'
    if (daysDiff > 350) periodType = 'annual'
    else if (daysDiff > 180) periodType = 'ttm'

    const statement: CashFlowStatement = {
      cik,
      ticker,
      reportPeriod: period.end,
      fiscalPeriod: period.fp,
      period: periodType,
      currency: 'USD',

      netIncome: extractValue(facts.facts, CASH_FLOW_CONCEPTS.netIncome, period),
      depreciationAndAmortization: extractValue(facts.facts, CASH_FLOW_CONCEPTS.depreciationAndAmortization, period),
      shareBasedCompensation: extractValue(facts.facts, CASH_FLOW_CONCEPTS.shareBasedCompensation, period),
      changeInWorkingCapital: extractValue(facts.facts, CASH_FLOW_CONCEPTS.changeInWorkingCapital, period),
      netCashFromOperations: extractValue(facts.facts, CASH_FLOW_CONCEPTS.netCashFromOperations, period),
      capitalExpenditure: extractValue(facts.facts, CASH_FLOW_CONCEPTS.capitalExpenditure, period),
      acquisitions: extractValue(facts.facts, CASH_FLOW_CONCEPTS.acquisitions, period),
      purchasesOfInvestments: extractValue(facts.facts, CASH_FLOW_CONCEPTS.purchasesOfInvestments, period),
      salesOfInvestments: extractValue(facts.facts, CASH_FLOW_CONCEPTS.salesOfInvestments, period),
      netCashFromInvesting: extractValue(facts.facts, CASH_FLOW_CONCEPTS.netCashFromInvesting, period),
      debtIssuance: extractValue(facts.facts, CASH_FLOW_CONCEPTS.debtIssuance, period),
      debtRepayment: extractValue(facts.facts, CASH_FLOW_CONCEPTS.debtRepayment, period),
      stockIssuance: extractValue(facts.facts, CASH_FLOW_CONCEPTS.stockIssuance, period),
      stockRepurchase: extractValue(facts.facts, CASH_FLOW_CONCEPTS.stockRepurchase, period),
      dividendsPaid: extractValue(facts.facts, CASH_FLOW_CONCEPTS.dividendsPaid, period),
      netCashFromFinancing: extractValue(facts.facts, CASH_FLOW_CONCEPTS.netCashFromFinancing, period),
      effectOfFxChanges: extractValue(facts.facts, CASH_FLOW_CONCEPTS.effectOfFxChanges, period),
      netChangeInCash: extractValue(facts.facts, CASH_FLOW_CONCEPTS.netChangeInCash, period),
      endingCash: extractValue(facts.facts, CASH_FLOW_CONCEPTS.endingCash, period),
    }

    // Calculate free cash flow if we have the components
    if (statement.netCashFromOperations && statement.capitalExpenditure) {
      // CapEx is typically negative in the cash flow, so we add it
      statement.freeCashFlow = statement.netCashFromOperations + (statement.capitalExpenditure || 0)
    }

    // Only add if we have meaningful data
    if (statement.netCashFromOperations !== undefined) {
      statements.push(statement)
    }
  }

  return statements
}
