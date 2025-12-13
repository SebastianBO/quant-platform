/**
 * DATA SOURCES CONFIGURATION
 *
 * Central mapping of all data sources used across the platform.
 * This helps track where data comes from and enables source indicators in the UI.
 */

export type DataSourceId =
  | 'financial-datasets'
  | 'yahoo-finance'
  | 'eodhd'
  | 'finra'
  | 'sec-edgar'
  | 'supabase-cache'
  | 'iborrowdesk'
  | 'openai'
  | 'openfigi'
  | 'clinicaltrials-gov'
  | 'openfda'
  | 'mock'

export interface DataSource {
  id: DataSourceId
  name: string
  shortName: string
  url?: string
  description: string
  isPaid: boolean
  color: string // Tailwind color class
}

export const DATA_SOURCES: Record<DataSourceId, DataSource> = {
  'financial-datasets': {
    id: 'financial-datasets',
    name: 'Financial Datasets API',
    shortName: 'FD',
    url: 'https://financialdatasets.ai',
    description: 'Premium financial data API - financials, metrics, institutional ownership',
    isPaid: true,
    color: 'blue'
  },
  'yahoo-finance': {
    id: 'yahoo-finance',
    name: 'Yahoo Finance',
    shortName: 'YF',
    url: 'https://finance.yahoo.com',
    description: 'Free market data - prices, trending, historical charts',
    isPaid: false,
    color: 'purple'
  },
  'eodhd': {
    id: 'eodhd',
    name: 'EODHD',
    shortName: 'EOD',
    url: 'https://eodhd.com',
    description: 'Market data API - prices, forex, indices',
    isPaid: true,
    color: 'green'
  },
  'finra': {
    id: 'finra',
    name: 'FINRA',
    shortName: 'FINRA',
    url: 'https://finra.org',
    description: 'Regulatory data - short volume, dark pool activity',
    isPaid: false,
    color: 'orange'
  },
  'sec-edgar': {
    id: 'sec-edgar',
    name: 'SEC EDGAR',
    shortName: 'SEC',
    url: 'https://sec.gov/edgar',
    description: 'Official SEC filings - 10-K, 10-Q, 13-F, insider trades',
    isPaid: false,
    color: 'red'
  },
  'supabase-cache': {
    id: 'supabase-cache',
    name: 'Cached Data',
    shortName: 'Cache',
    description: 'Pre-synced data from our database',
    isPaid: false,
    color: 'gray'
  },
  'iborrowdesk': {
    id: 'iborrowdesk',
    name: 'iBorrowDesk',
    shortName: 'IBD',
    url: 'https://iborrowdesk.com',
    description: 'Stock borrow/lending data',
    isPaid: false,
    color: 'yellow'
  },
  'openai': {
    id: 'openai',
    name: 'OpenAI',
    shortName: 'AI',
    url: 'https://openai.com',
    description: 'AI-generated analysis and summaries',
    isPaid: true,
    color: 'emerald'
  },
  'openfigi': {
    id: 'openfigi',
    name: 'OpenFIGI',
    shortName: 'FIGI',
    url: 'https://openfigi.com',
    description: 'Bond and security identifiers - corporate bonds, TRACE data',
    isPaid: false,
    color: 'cyan'
  },
  'clinicaltrials-gov': {
    id: 'clinicaltrials-gov',
    name: 'ClinicalTrials.gov',
    shortName: 'CT',
    url: 'https://clinicaltrials.gov',
    description: 'NIH clinical trials registry - trial phases, completion dates, results',
    isPaid: false,
    color: 'teal'
  },
  'openfda': {
    id: 'openfda',
    name: 'openFDA',
    shortName: 'FDA',
    url: 'https://open.fda.gov',
    description: 'FDA drug approvals, NDA/BLA submissions, labels',
    isPaid: false,
    color: 'indigo'
  },
  'mock': {
    id: 'mock',
    name: 'Mock Data',
    shortName: 'Mock',
    description: 'Placeholder/demo data when real data unavailable',
    isPaid: false,
    color: 'slate'
  }
}

/**
 * Maps each feature/component to its data source(s)
 */
export const FEATURE_DATA_SOURCES: Record<string, DataSourceId[]> = {
  // Stock Data
  'stock-price': ['eodhd', 'yahoo-finance'],
  'stock-chart': ['eodhd'],
  'company-facts': ['financial-datasets', 'sec-edgar'],

  // Financial Statements
  'income-statements': ['financial-datasets', 'sec-edgar'],
  'balance-sheets': ['financial-datasets', 'sec-edgar'],
  'cash-flow-statements': ['financial-datasets', 'sec-edgar'],
  'financial-metrics': ['financial-datasets'],
  'segmented-revenues': ['financial-datasets'],

  // Market Data
  'trending': ['yahoo-finance'],
  'market-overview': ['eodhd', 'yahoo-finance'],
  'treasury-yields': ['eodhd'],
  'company-debt': ['sec-edgar'],
  'company-bonds': ['openfigi'],
  'bonds-correlation': ['yahoo-finance'],

  // Ownership & Filings
  'institutional-ownership': ['financial-datasets', 'sec-edgar'],
  'insider-trades': ['financial-datasets', 'sec-edgar'],
  'sec-filings': ['sec-edgar'],
  '13f-filings': ['sec-edgar', 'supabase-cache'],

  // Short Interest
  'short-volume': ['finra', 'supabase-cache'],
  'borrow-cost': ['iborrowdesk'],

  // Analysis
  'ai-summary': ['openai'],
  'analyst-estimates': ['financial-datasets'],

  // Other
  'news': ['financial-datasets'],
  'earnings-calendar': ['financial-datasets'],
  'options': ['eodhd'],
  'fx-rates': ['eodhd'],

  // Biotech / Clinical Trials
  'clinical-trials': ['clinicaltrials-gov', 'supabase-cache'],
  'fda-approvals': ['openfda', 'supabase-cache'],
  'biotech-catalysts': ['clinicaltrials-gov', 'openfda', 'supabase-cache'],
}

/**
 * Get data source info for a feature
 */
export function getFeatureSources(feature: string): DataSource[] {
  const sourceIds = FEATURE_DATA_SOURCES[feature] || []
  return sourceIds.map(id => DATA_SOURCES[id])
}

/**
 * Get primary data source for a feature
 */
export function getPrimarySource(feature: string): DataSource | null {
  const sourceIds = FEATURE_DATA_SOURCES[feature]
  if (!sourceIds || sourceIds.length === 0) return null
  return DATA_SOURCES[sourceIds[0]]
}
