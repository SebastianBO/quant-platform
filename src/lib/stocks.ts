/**
 * Curated list of actively traded stocks for pSEO pre-rendering
 * Only includes verified, actively traded tickers
 */

// Mega-cap tech (most searched)
const MEGA_CAP = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO',
  'ORCL', 'ADBE', 'CRM', 'CSCO', 'ACN', 'AMD', 'INTC', 'IBM',
  'QCOM', 'TXN', 'INTU', 'NOW', 'AMAT', 'MU', 'PANW',
]

// Major financials
const FINANCIALS = [
  'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'SPGI', 'AXP', 'BLK',
  'C', 'SCHW', 'MMC', 'PGR', 'ICE', 'CME', 'AON', 'USB', 'PNC', 'COF',
]

// Healthcare & pharma
const HEALTHCARE = [
  'LLY', 'UNH', 'JNJ', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'PFE',
  'AMGN', 'BMY', 'GILD', 'VRTX', 'CVS', 'CI', 'REGN', 'ISRG', 'ZTS',
  'BSX', 'MDT', 'SYK', 'HCA', 'ELV', 'HUM',
]

// Consumer & retail
const CONSUMER = [
  'WMT', 'HD', 'PG', 'COST', 'KO', 'PEP', 'NKE', 'MCD', 'SBUX',
  'TGT', 'LOW', 'TJX', 'BKNG', 'CMG', 'LULU', 'ABNB', 'MAR', 'YUM',
  'ORLY', 'AZO', 'ROST', 'DG', 'KR', 'SYY', 'HSY', 'GIS',
]

// Energy
const ENERGY = [
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY',
  'DVN', 'HAL', 'KMI', 'WMB', 'OKE',
]

// Industrials
const INDUSTRIALS = [
  'UNP', 'CAT', 'BA', 'HON', 'RTX', 'GE', 'LMT', 'DE', 'ETN',
  'EMR', 'ITW', 'PH', 'FDX', 'UPS', 'NSC', 'CSX', 'WM', 'NOC', 'GD',
]

// Communications
const COMMUNICATIONS = [
  'NFLX', 'DIS', 'CMCSA', 'VZ', 'T', 'TMUS', 'CHTR', 'EA', 'TTWO', 'WBD',
]

// REITs & Real Estate
const REAL_ESTATE = [
  'PLD', 'AMT', 'EQIX', 'CCI', 'PSA', 'WELL', 'DLR', 'O', 'SPG',
  'AVB', 'EQR', 'VICI',
]

// Materials
const MATERIALS = [
  'LIN', 'APD', 'SHW', 'ECL', 'FCX', 'NEM', 'DD', 'DOW', 'NUE', 'VMC',
]

// Utilities
const UTILITIES = [
  'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'XEL', 'ED', 'WEC',
]

// Popular growth stocks
const GROWTH = [
  'PLTR', 'COIN', 'RIVN', 'NIO', 'SOFI', 'HOOD', 'DDOG', 'SNOW', 'NET',
  'CRWD', 'ZS', 'MDB', 'RBLX', 'DKNG', 'U', 'DASH', 'UBER', 'LYFT',
]

// Popular ETFs
const ETFS = [
  'SPY', 'QQQ', 'VOO', 'VTI', 'IWM', 'DIA', 'ARKK', 'XLF', 'XLE', 'XLK',
  'VIG', 'SCHD', 'VYM', 'VGT', 'XLV', 'XLI', 'XLP', 'XLU', 'VNQ', 'GLD',
]

// Additional S&P 500 stocks (verified active)
const SP500_ADDITIONAL = [
  'PYPL', 'SHOP', 'MELI',
  'ADI', 'KLAC', 'LRCX', 'SNPS', 'CDNS', 'MRVL', 'NXPI', 'ON',
  'AFL', 'MET', 'TRV', 'ALL', 'CB',
  'F', 'GM', 'TM',
  'MRNA', 'BIIB',
  'WDAY', 'TEAM', 'ZM', 'DOCU', 'OKTA',
  'ENPH', 'FSLR', 'RUN',
  'LEN', 'DHI', 'PHM',
  'STZ', 'TAP', 'BUD', 'DEO',
  'MDLZ', 'MNST', 'KHC',
  'CL', 'CLX', 'CHD', 'KMB',
  'ADP', 'PAYX', 'CTAS',
  'RSG', 'WCN',
  'FAST', 'SNA', 'SWK',
  'IQV', 'A', 'PKI', 'WAT',
  'IDXX', 'DXCM',
  'CPRT', 'COPART',
  'ODFL', 'JBHT', 'XPO',
  'ROK', 'AME', 'GNRC',
  'TDG', 'HWM', 'TXT',
  'RCL', 'CCL', 'NCLH',
  'HLT', 'H', 'WH',
  'SBAC', 'AMT',
  'EXR', 'CUBE', 'LSI',
  'CBRE', 'JLL',
  'BXP', 'VNO',
]

// Combine all stocks and remove duplicates
export const ALL_STOCKS = Array.from(new Set([
  ...MEGA_CAP,
  ...FINANCIALS,
  ...HEALTHCARE,
  ...CONSUMER,
  ...ENERGY,
  ...INDUSTRIALS,
  ...COMMUNICATIONS,
  ...REAL_ESTATE,
  ...MATERIALS,
  ...UTILITIES,
  ...GROWTH,
  ...ETFS,
  ...SP500_ADDITIONAL,
]))

// Export total count for reference
export const TOTAL_STOCKS = ALL_STOCKS.length

// Export by category for potential filtering
export const STOCK_CATEGORIES = {
  MEGA_CAP,
  FINANCIALS,
  HEALTHCARE,
  CONSUMER,
  ENERGY,
  INDUSTRIALS,
  COMMUNICATIONS,
  REAL_ESTATE,
  MATERIALS,
  UTILITIES,
  GROWTH,
  ETFS,
}
