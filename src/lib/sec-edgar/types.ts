// SEC EDGAR Types for Data Ingestion

// ============================================================================
// Company Data Types
// ============================================================================

export interface SECCompanySubmissions {
  cik: string
  entityType: string
  sic: string
  sicDescription: string
  name: string
  tickers: string[]
  exchanges: string[]
  ein?: string
  fiscalYearEnd?: string
  filings: {
    recent: SECFilingList
    files: { name: string; filingCount: number }[]
  }
}

export interface SECFilingList {
  accessionNumber: string[]
  filingDate: string[]
  reportDate: string[]
  acceptanceDateTime: string[]
  act: string[]
  form: string[]
  fileNumber: string[]
  filmNumber: string[]
  items: string[]
  size: number[]
  isXBRL: number[]
  isInlineXBRL: number[]
  primaryDocument: string[]
  primaryDocDescription: string[]
}

// ============================================================================
// XBRL Company Facts Types
// ============================================================================

export interface SECCompanyFacts {
  cik: number
  entityName: string
  facts: {
    'us-gaap'?: Record<string, XBRLFact>
    'ifrs-full'?: Record<string, XBRLFact>
    dei?: Record<string, XBRLFact>
    srt?: Record<string, XBRLFact>
  }
}

export interface XBRLFact {
  label: string
  description: string
  units: Record<string, XBRLUnit[]>
}

export interface XBRLUnit {
  start?: string
  end: string
  val: number
  accn: string
  fy?: number
  fp?: string
  form?: string
  filed?: string
  frame?: string
}

// ============================================================================
// 13F Filing Types (Institutional Holdings)
// ============================================================================

export interface Form13FHolding {
  cusip: string
  issuerName: string
  titleOfClass: string
  value: number // In thousands
  shares: number
  shareType: 'SH' | 'PRN'
  investmentDiscretion: 'SOLE' | 'SHARED' | 'DFND'
  votingSole: number
  votingShared: number
  votingNone: number
  putCall?: 'PUT' | 'CALL'
}

export interface Form13FFiling {
  accessionNumber: string
  filingDate: string
  reportDate: string
  investorCik: string
  investorName: string
  holdings: Form13FHolding[]
  totalValue: number
  totalPositions: number
}

// ============================================================================
// Form 4 Types (Insider Trading)
// ============================================================================

export interface Form4Transaction {
  securityTitle: string
  transactionDate: string
  transactionCode: string // P, S, A, D, etc.
  transactionShares?: number
  transactionPricePerShare?: number
  sharesOwnedAfterTransaction: number
  acquiredDisposed: 'A' | 'D'
  directOrIndirect: 'D' | 'I'
  indirectOwnershipExplanation?: string
}

export interface Form4Filing {
  accessionNumber: string
  filingDate: string
  issuerCik: string
  issuerName: string
  issuerTicker?: string
  ownerCik: string
  ownerName: string
  isDirector: boolean
  isOfficer: boolean
  isTenPercentOwner: boolean
  isOther: boolean
  officerTitle?: string
  transactions: Form4Transaction[]
}

// ============================================================================
// Financial Statement Types (Normalized)
// ============================================================================

export interface IncomeStatement {
  cik: string
  ticker?: string
  reportPeriod: string
  fiscalPeriod?: string
  period: 'annual' | 'quarterly' | 'ttm'
  currency: string

  // Revenue
  revenue?: number
  costOfRevenue?: number
  grossProfit?: number

  // Operating
  operatingExpense?: number
  sgaExpenses?: number
  researchAndDevelopment?: number
  depreciationAndAmortization?: number
  operatingIncome?: number

  // Non-Operating
  interestExpense?: number
  interestIncome?: number
  otherIncomeExpense?: number

  // Pre-Tax
  ebit?: number
  ebitda?: number
  incomeBeforeTax?: number
  incomeTaxExpense?: number

  // Net Income
  netIncomeDiscontinuedOps?: number
  netIncomeNonControlling?: number
  netIncome?: number
  netIncomeCommonStock?: number
  preferredDividends?: number

  // Per Share
  eps?: number
  epsDiluted?: number
  dividendsPerShare?: number
  weightedAvgShares?: number
  weightedAvgSharesDiluted?: number

  // Source
  accessionNumber?: string
  filingDate?: string
}

export interface BalanceSheet {
  cik: string
  ticker?: string
  reportPeriod: string
  fiscalPeriod?: string
  period: 'annual' | 'quarterly' | 'ttm'
  currency: string

  // Assets
  totalAssets?: number
  currentAssets?: number
  cashAndEquivalents?: number
  shortTermInvestments?: number
  inventory?: number
  accountsReceivable?: number
  nonCurrentAssets?: number
  ppe?: number
  goodwill?: number
  intangibleAssets?: number
  investments?: number

  // Liabilities
  totalLiabilities?: number
  currentLiabilities?: number
  accountsPayable?: number
  currentDebt?: number
  deferredRevenue?: number
  nonCurrentLiabilities?: number
  longTermDebt?: number
  totalDebt?: number

  // Equity
  shareholdersEquity?: number
  commonStock?: number
  retainedEarnings?: number
  treasuryStock?: number
  accumulatedOCI?: number
  outstandingShares?: number

  // Source
  accessionNumber?: string
  filingDate?: string
}

export interface CashFlowStatement {
  cik: string
  ticker?: string
  reportPeriod: string
  fiscalPeriod?: string
  period: 'annual' | 'quarterly' | 'ttm'
  currency: string

  // Operating
  netIncome?: number
  depreciationAndAmortization?: number
  shareBasedCompensation?: number
  changeInWorkingCapital?: number
  netCashFromOperations?: number

  // Investing
  capitalExpenditure?: number
  acquisitions?: number
  purchasesOfInvestments?: number
  salesOfInvestments?: number
  netCashFromInvesting?: number

  // Financing
  debtIssuance?: number
  debtRepayment?: number
  stockIssuance?: number
  stockRepurchase?: number
  dividendsPaid?: number
  netCashFromFinancing?: number

  // Net Change
  effectOfFxChanges?: number
  netChangeInCash?: number
  beginningCash?: number
  endingCash?: number
  freeCashFlow?: number

  // Source
  accessionNumber?: string
  filingDate?: string
}

// ============================================================================
// CUSIP Resolution Types
// ============================================================================

export interface CUSIPMapping {
  cusip: string
  ticker?: string
  issuerName?: string
  securityType: 'EQUITY' | 'OPTION' | 'OTHER'
  source: 'SEC' | 'OPENFIGI' | 'MANUAL'
  confidence: number
}

// ============================================================================
// Sync Types
// ============================================================================

export interface SyncResult {
  success: boolean
  itemsProcessed: number
  itemsCreated: number
  itemsUpdated: number
  errors: string[]
  duration: number
}

export interface SyncOptions {
  forceRefresh?: boolean
  limit?: number
  startDate?: string
  endDate?: string
}
