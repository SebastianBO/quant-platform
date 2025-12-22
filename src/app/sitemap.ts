import { MetadataRoute } from 'next'

// S&P 500 + Popular stocks + ETFs (comprehensive list from index-all-stocks.ts)
const ALL_STOCKS = [
  // S&P 500
  'AAPL', 'ABBV', 'ABT', 'ACN', 'ADBE', 'ADI', 'ADP', 'ADSK', 'AEP', 'AES',
  'AFL', 'AIG', 'AIZ', 'AJG', 'AKAM', 'ALB', 'ALGN', 'ALL', 'ALLE', 'AMAT',
  'AMCR', 'AMD', 'AME', 'AMGN', 'AMP', 'AMT', 'AMZN', 'ANET', 'ANSS', 'AON',
  'AOS', 'APA', 'APD', 'APH', 'APTV', 'ARE', 'ATO', 'AVB', 'AVGO', 'AVY',
  'AWK', 'AXP', 'AZO', 'BA', 'BAC', 'BAX', 'BBY', 'BDX', 'BEN', 'BF.B',
  'BIIB', 'BIO', 'BK', 'BKNG', 'BLK', 'BMY', 'BR', 'BRK.B', 'BRO', 'BSX',
  'BWA', 'BXP', 'C', 'CAG', 'CAH', 'CARR', 'CAT', 'CB', 'CBOE', 'CBRE',
  'CCI', 'CCL', 'CDNS', 'CDW', 'CE', 'CEG', 'CF', 'CFG', 'CHD', 'CHRW',
  'CHTR', 'CI', 'CINF', 'CL', 'CLX', 'CMA', 'CMCSA', 'CME', 'CMG', 'CMI',
  'CMS', 'CNC', 'CNP', 'COF', 'COO', 'COP', 'COST', 'CPB', 'CPRT', 'CPT',
  'CRL', 'CRM', 'CSCO', 'CSGP', 'CSX', 'CTAS', 'CTLT', 'CTRA', 'CTSH', 'CTVA',
  'CVS', 'CVX', 'CZR', 'D', 'DAL', 'DD', 'DE', 'DFS', 'DG', 'DGX',
  'DHI', 'DHR', 'DIS', 'DLR', 'DLTR', 'DOV', 'DOW', 'DPZ', 'DRI', 'DTE',
  'DUK', 'DVA', 'DVN', 'DXCM', 'EA', 'EBAY', 'ECL', 'ED', 'EFX', 'EG',
  'EIX', 'EL', 'EMN', 'EMR', 'ENPH', 'EOG', 'EPAM', 'EQIX', 'EQR', 'EQT',
  'ES', 'ESS', 'ETN', 'ETR', 'EVRG', 'EW', 'EXC', 'EXPD', 'EXPE', 'EXR',
  'F', 'FANG', 'FAST', 'FCX', 'FDS', 'FDX', 'FE', 'FFIV', 'FIS', 'FITB',
  'FLT', 'FMC', 'FOX', 'FOXA', 'FRT', 'FSLR', 'FTNT', 'FTV', 'GD', 'GE',
  'GEHC', 'GEN', 'GILD', 'GIS', 'GL', 'GLW', 'GM', 'GNRC', 'GOOG', 'GOOGL',
  'GPC', 'GPN', 'GRMN', 'GS', 'GWW', 'HAL', 'HAS', 'HBAN', 'HCA', 'HD',
  'HES', 'HIG', 'HII', 'HLT', 'HOLX', 'HON', 'HPE', 'HPQ', 'HRL', 'HSIC',
  'HST', 'HSY', 'HUBB', 'HUM', 'HWM', 'IBM', 'ICE', 'IDXX', 'IEX', 'IFF',
  'ILMN', 'INCY', 'INTC', 'INTU', 'INVH', 'IP', 'IPG', 'IQV', 'IR', 'IRM',
  'ISRG', 'IT', 'ITW', 'IVZ', 'J', 'JBHT', 'JCI', 'JKHY', 'JNJ', 'JNPR',
  'JPM', 'K', 'KDP', 'KEY', 'KEYS', 'KHC', 'KIM', 'KLAC', 'KMB', 'KMI',
  'KMX', 'KO', 'KR', 'L', 'LDOS', 'LEN', 'LH', 'LHX', 'LIN', 'LKQ',
  'LLY', 'LMT', 'LNC', 'LNT', 'LOW', 'LRCX', 'LULU', 'LUV', 'LVS', 'LW',
  'LYB', 'LYV', 'MA', 'MAA', 'MAR', 'MAS', 'MCD', 'MCHP', 'MCK', 'MCO',
  'MDLZ', 'MDT', 'MET', 'META', 'MGM', 'MHK', 'MKC', 'MKTX', 'MLM', 'MMC',
  'MMM', 'MNST', 'MO', 'MOH', 'MOS', 'MPC', 'MPWR', 'MRK', 'MRNA', 'MRO',
  'MS', 'MSCI', 'MSFT', 'MSI', 'MTB', 'MTCH', 'MTD', 'MU', 'NCLH', 'NDAQ',
  'NDSN', 'NEE', 'NEM', 'NFLX', 'NI', 'NKE', 'NOC', 'NOW', 'NRG', 'NSC',
  'NTAP', 'NTRS', 'NUE', 'NVDA', 'NVR', 'NWL', 'NWS', 'NWSA', 'O', 'ODFL',
  'OGN', 'OKE', 'OMC', 'ON', 'ORCL', 'ORLY', 'OTIS', 'OXY', 'PARA', 'PAYC',
  'PAYX', 'PCAR', 'PCG', 'PEAK', 'PEG', 'PEP', 'PFE', 'PFG', 'PG', 'PGR',
  'PH', 'PHM', 'PKG', 'PKI', 'PLD', 'PM', 'PNC', 'PNR', 'PNW', 'POOL',
  'PPG', 'PPL', 'PRU', 'PSA', 'PSX', 'PTC', 'PVH', 'PWR', 'PYPL', 'QCOM',
  'QRVO', 'RCL', 'REG', 'REGN', 'RF', 'RHI', 'RJF', 'RL', 'RMD', 'ROK',
  'ROL', 'ROP', 'ROST', 'RSG', 'RTX', 'RVTY', 'SBAC', 'SBUX', 'SCHW', 'SHW',
  'SJM', 'SLB', 'SMCI', 'SNA', 'SNPS', 'SO', 'SPG', 'SPGI', 'SRE', 'STE',
  'STLD', 'STT', 'STX', 'STZ', 'SWK', 'SWKS', 'SYF', 'SYK', 'SYY', 'T',
  'TAP', 'TDG', 'TDY', 'TECH', 'TEL', 'TER', 'TFC', 'TFX', 'TGT', 'TJX',
  'TMO', 'TMUS', 'TPR', 'TRGP', 'TRMB', 'TROW', 'TRV', 'TSCO', 'TSLA', 'TSN',
  'TT', 'TTWO', 'TXN', 'TXT', 'TYL', 'UAL', 'UDR', 'UHS', 'ULTA', 'UNH',
  'UNP', 'UPS', 'URI', 'USB', 'V', 'VFC', 'VICI', 'VLO', 'VMC', 'VRSK',
  'VRSN', 'VRTX', 'VTR', 'VTRS', 'VZ', 'WAB', 'WAT', 'WBA', 'WBD', 'WDC',
  'WEC', 'WELL', 'WFC', 'WHR', 'WM', 'WMB', 'WMT', 'WRB', 'WRK', 'WST',
  'WTW', 'WY', 'WYNN', 'XEL', 'XOM', 'XRAY', 'XYL', 'YUM', 'ZBH', 'ZBRA',
  'ZION', 'ZTS',
  // Popular non-S&P stocks
  'PLTR', 'COIN', 'RIVN', 'LCID', 'NIO', 'SOFI', 'HOOD', 'GME', 'AMC',
  'MARA', 'RIOT', 'PLUG', 'SPCE', 'DKNG', 'RBLX', 'U', 'SNAP', 'PINS',
  'ROKU', 'ZM', 'DOCU', 'CRWD', 'SNOW', 'NET', 'DDOG', 'MDB', 'OKTA',
  // Popular ETFs
  'SPY', 'QQQ', 'VOO', 'VTI', 'IWM', 'DIA', 'ARKK', 'XLF', 'XLE', 'XLK',
]

// Comparison pairs organized by category (comprehensive coverage)
const COMPARISON_PAIRS = [
  // Tech Giants (20 pairs)
  ['AAPL', 'MSFT'], ['AAPL', 'GOOGL'], ['MSFT', 'GOOGL'], ['META', 'GOOGL'],
  ['AMZN', 'MSFT'], ['AMZN', 'GOOGL'], ['AAPL', 'AMZN'], ['META', 'AAPL'],
  ['META', 'MSFT'], ['META', 'AMZN'], ['AAPL', 'NVDA'], ['MSFT', 'NVDA'],
  ['GOOGL', 'NVDA'], ['AMZN', 'META'], ['AAPL', 'TSLA'], ['MSFT', 'TSLA'],
  ['GOOGL', 'TSLA'], ['META', 'TSLA'], ['AMZN', 'TSLA'], ['NVDA', 'TSLA'],

  // Semiconductors (20 pairs)
  ['NVDA', 'AMD'], ['NVDA', 'INTC'], ['AMD', 'INTC'], ['AVGO', 'QCOM'],
  ['NVDA', 'AVGO'], ['AMD', 'AVGO'], ['INTC', 'AVGO'], ['NVDA', 'QCOM'],
  ['AMD', 'QCOM'], ['INTC', 'QCOM'], ['NVDA', 'TXN'], ['AMD', 'TXN'],
  ['INTC', 'TXN'], ['AVGO', 'TXN'], ['QCOM', 'TXN'], ['NVDA', 'LRCX'],
  ['AMD', 'LRCX'], ['INTC', 'LRCX'], ['AVGO', 'LRCX'], ['QCOM', 'ADI'],

  // Auto/EV (15 pairs)
  ['TSLA', 'F'], ['TSLA', 'GM'], ['TSLA', 'RIVN'], ['F', 'GM'],
  ['RIVN', 'LCID'], ['TSLA', 'LCID'], ['F', 'RIVN'], ['GM', 'RIVN'],
  ['F', 'LCID'], ['GM', 'LCID'], ['TSLA', 'NIO'], ['RIVN', 'NIO'],
  ['LCID', 'NIO'], ['F', 'NIO'], ['GM', 'NIO'],

  // Finance/Banks (20 pairs)
  ['JPM', 'BAC'], ['JPM', 'WFC'], ['BAC', 'C'], ['BAC', 'WFC'],
  ['GS', 'MS'], ['V', 'MA'], ['JPM', 'C'], ['JPM', 'GS'],
  ['BAC', 'GS'], ['WFC', 'C'], ['WFC', 'GS'], ['C', 'GS'],
  ['JPM', 'MS'], ['BAC', 'MS'], ['WFC', 'MS'], ['C', 'MS'],
  ['JPM', 'SCHW'], ['BAC', 'SCHW'], ['C', 'SCHW'], ['WFC', 'SCHW'],

  // Payment/Fintech (15 pairs)
  ['PYPL', 'V'], ['PYPL', 'MA'], ['HOOD', 'COIN'], ['SOFI', 'HOOD'],
  ['V', 'PYPL'], ['MA', 'PYPL'], ['PYPL', 'COIN'], ['SOFI', 'COIN'],
  ['SOFI', 'PYPL'], ['HOOD', 'PYPL'], ['V', 'COIN'], ['MA', 'COIN'],
  ['PYPL', 'SQ'], ['SOFI', 'SQ'], ['HOOD', 'SQ'],

  // Streaming/Media (15 pairs)
  ['NFLX', 'DIS'], ['NFLX', 'PARA'], ['DIS', 'WBD'], ['NFLX', 'WBD'],
  ['DIS', 'PARA'], ['PARA', 'WBD'], ['NFLX', 'GOOGL'], ['DIS', 'GOOGL'],
  ['NFLX', 'AMZN'], ['DIS', 'AMZN'], ['RBLX', 'EA'], ['SNAP', 'PINS'],
  ['ROKU', 'NFLX'], ['ZM', 'DOCU'], ['SNAP', 'META'],

  // Retail (20 pairs)
  ['WMT', 'TGT'], ['HD', 'LOW'], ['COST', 'WMT'], ['AMZN', 'WMT'],
  ['AMZN', 'TGT'], ['WMT', 'LOW'], ['TGT', 'LOW'], ['COST', 'TGT'],
  ['COST', 'HD'], ['COST', 'LOW'], ['HD', 'TGT'], ['AMZN', 'COST'],
  ['AMZN', 'HD'], ['AMZN', 'LOW'], ['WMT', 'HD'], ['TGT', 'HD'],
  ['WMT', 'COST'], ['TGT', 'COST'], ['HD', 'WMT'], ['LOW', 'WMT'],

  // Cloud/SaaS (20 pairs)
  ['CRM', 'MSFT'], ['SNOW', 'PLTR'], ['DDOG', 'CRWD'], ['NET', 'CRWD'],
  ['CRM', 'SNOW'], ['CRM', 'PLTR'], ['MSFT', 'SNOW'], ['MSFT', 'PLTR'],
  ['SNOW', 'CRWD'], ['PLTR', 'CRWD'], ['CRM', 'DDOG'], ['CRM', 'NET'],
  ['SNOW', 'DDOG'], ['SNOW', 'NET'], ['PLTR', 'DDOG'], ['PLTR', 'NET'],
  ['NOW', 'CRM'], ['NOW', 'SNOW'], ['NOW', 'PLTR'], ['DDOG', 'NET'],

  // Consumer (15 pairs)
  ['KO', 'PEP'], ['NKE', 'LULU'], ['SBUX', 'CMG'], ['MCD', 'YUM'],
  ['KO', 'MDLZ'], ['PEP', 'MDLZ'], ['SBUX', 'MCD'], ['CMG', 'YUM'],
  ['MCD', 'CMG'], ['SBUX', 'YUM'], ['KO', 'SBUX'], ['PEP', 'SBUX'],
  ['NKE', 'ADDYY'], ['LULU', 'UAA'], ['MCD', 'SBUX'],

  // Healthcare/Pharma (20 pairs)
  ['PFE', 'MRK'], ['JNJ', 'ABBV'], ['LLY', 'NVO'], ['UNH', 'CVS'],
  ['PFE', 'ABBV'], ['MRK', 'ABBV'], ['JNJ', 'MRK'], ['JNJ', 'PFE'],
  ['LLY', 'ABBV'], ['LLY', 'JNJ'], ['UNH', 'CI'], ['CVS', 'CI'],
  ['UNH', 'ABBV'], ['UNH', 'JNJ'], ['CVS', 'ABBV'], ['TMO', 'DHR'],
  ['ISRG', 'ABBV'], ['VRTX', 'REGN'], ['GILD', 'ABBV'], ['AMGN', 'GILD'],

  // Energy (15 pairs)
  ['XOM', 'CVX'], ['COP', 'XOM'], ['SLB', 'HAL'], ['NEE', 'DUK'],
  ['XOM', 'HAL'], ['CVX', 'HAL'], ['COP', 'CVX'], ['COP', 'HAL'],
  ['SLB', 'XOM'], ['SLB', 'CVX'], ['SLB', 'COP'], ['NEE', 'SO'],
  ['DUK', 'SO'], ['XOM', 'COP'], ['CVX', 'COP'],

  // AI Stocks (20 pairs)
  ['NVDA', 'MSFT'], ['GOOGL', 'META'], ['PLTR', 'SNOW'], ['CRM', 'MSFT'],
  ['NVDA', 'GOOGL'], ['NVDA', 'META'], ['MSFT', 'META'], ['MSFT', 'GOOGL'],
  ['PLTR', 'MSFT'], ['PLTR', 'GOOGL'], ['SNOW', 'MSFT'], ['SNOW', 'GOOGL'],
  ['CRM', 'GOOGL'], ['NVDA', 'PLTR'], ['NVDA', 'SNOW'], ['META', 'PLTR'],
  ['META', 'SNOW'], ['GOOGL', 'PLTR'], ['GOOGL', 'SNOW'], ['CRM', 'PLTR'],

  // ETFs
  ['SPY', 'VOO'], ['SPY', 'QQQ'], ['VOO', 'VTI'], ['QQQ', 'ARKK'],
  ['SPY', 'VTI'], ['QQQ', 'SPY'], ['ARKK', 'SPY'], ['IWM', 'SPY'],
]

// All 11 stock market sectors
const SECTORS = [
  'technology',
  'healthcare',
  'financials',
  'energy',
  'consumer-discretionary',
  'consumer-staples',
  'industrials',
  'materials',
  'utilities',
  'real-estate',
  'communication-services'
]

// High-traffic seasonal/trending content pages
const INSIGHTS_PAGES = [
  '2026-stock-predictions',
  'best-stocks-2026',
  'ai-stocks-2026',
  'dividend-stocks-2026',
]

// Educational content pages for SEO and topical authority
const LEARNING_PAGES = [
  'stock-analysis',
  'dcf-valuation',
  'pe-ratio',
  'dividend-investing',
  'ai-stock-analysis',
  'how-to-invest',
  'technical-analysis',
  'day-trading',
  'value-investing',
  'growth-investing',
]

// Filter categories for programmatic pages
const FILTER_CATEGORIES = [
  'dividend', 'growth', 'value', 'tech', 'healthcare', 'energy', 'ai'
]

// Market movers pages
const MARKET_PAGES = [
  'most-active',
  'top-gainers',
  'top-losers',
  '52-week-high',
  '52-week-low',
  'premarket',
  'after-hours',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lician.com'
  const currentDate = new Date().toISOString()

  const routes: MetadataRoute.Sitemap = []

  // ============================================================================
  // HOMEPAGE - Maximum Priority
  // ============================================================================
  routes.push({
    url: baseUrl,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 1.0,
  })

  // ============================================================================
  // MAIN PLATFORM PAGES - Very High Priority
  // ============================================================================
  routes.push({
    url: `${baseUrl}/dashboard`,
    lastModified: currentDate,
    changeFrequency: 'hourly',
    priority: 0.9,
  })

  routes.push({
    url: `${baseUrl}/screener`,
    lastModified: currentDate,
    changeFrequency: 'hourly',
    priority: 0.95,
  })

  routes.push({
    url: `${baseUrl}/news`,
    lastModified: currentDate,
    changeFrequency: 'hourly',
    priority: 0.95,
  })

  // ============================================================================
  // MARKET DATA PAGES - High Priority, Frequent Updates
  // ============================================================================
  routes.push({
    url: `${baseUrl}/markets`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  MARKET_PAGES.forEach((page) => {
    routes.push({
      url: `${baseUrl}/markets/${page}`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    })
  })

  // ============================================================================
  // CALENDAR & EVENT PAGES - High Priority
  // ============================================================================
  routes.push({
    url: `${baseUrl}/earnings`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  routes.push({
    url: `${baseUrl}/earnings/surprises`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  routes.push({
    url: `${baseUrl}/earnings/transcripts`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  routes.push({
    url: `${baseUrl}/dividends`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  routes.push({
    url: `${baseUrl}/ipo`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  routes.push({
    url: `${baseUrl}/stock-splits`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  })

  routes.push({
    url: `${baseUrl}/economic-calendar`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  // ============================================================================
  // TRADING & ANALYSIS PAGES - High Priority
  // ============================================================================
  routes.push({
    url: `${baseUrl}/analyst-ratings`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  routes.push({
    url: `${baseUrl}/insider-trading`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  routes.push({
    url: `${baseUrl}/institutional`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  routes.push({
    url: `${baseUrl}/short-interest`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  routes.push({
    url: `${baseUrl}/options`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  })

  // ============================================================================
  // ASSET CLASS PAGES - High Priority
  // ============================================================================
  const assetClasses = [
    'bonds',
    'forex',
    'commodities',
    'crypto',
    'etfs',
  ]

  assetClasses.forEach((asset) => {
    routes.push({
      url: `${baseUrl}/${asset}`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.95,
    })
  })

  // ============================================================================
  // SPECIALTY STOCK PAGES - High Priority
  // ============================================================================
  routes.push({
    url: `${baseUrl}/penny-stocks`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  })

  routes.push({
    url: `${baseUrl}/blue-chip-stocks`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  })

  routes.push({
    url: `${baseUrl}/biotech`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  // ============================================================================
  // SECTOR PAGES - High Priority
  // ============================================================================
  routes.push({
    url: `${baseUrl}/sectors`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  SECTORS.forEach((sector) => {
    routes.push({
      url: `${baseUrl}/sectors/${sector}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    })
  })

  // ============================================================================
  // INSIGHTS & TRENDING CONTENT - High Priority
  // ============================================================================
  routes.push({
    url: `${baseUrl}/insights`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  })

  INSIGHTS_PAGES.forEach((page) => {
    routes.push({
      url: `${baseUrl}/insights/${page}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  })

  // ============================================================================
  // LEARNING/EDUCATIONAL CONTENT - Good Priority
  // ============================================================================
  routes.push({
    url: `${baseUrl}/learn`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  })

  LEARNING_PAGES.forEach((page) => {
    routes.push({
      url: `${baseUrl}/learn/${page}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  })

  // ============================================================================
  // CATEGORY/FILTER PAGES - Good Priority
  // ============================================================================
  FILTER_CATEGORIES.forEach((category) => {
    routes.push({
      url: `${baseUrl}/best-stocks/${category}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    })
  })

  // ============================================================================
  // STOCK PAGES - Very High Priority for Top Stocks
  // ============================================================================
  ALL_STOCKS.forEach((ticker, index) => {
    // Highest priority for top 50 stocks, decreasing for others
    const basePriority = index < 20 ? 0.9 : index < 50 ? 0.85 : index < 100 ? 0.8 : index < 200 ? 0.75 : 0.7

    // Main stock page
    routes.push({
      url: `${baseUrl}/stock/${ticker}`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: basePriority,
    })

    // Should I buy page (slightly lower priority)
    routes.push({
      url: `${baseUrl}/should-i-buy/${ticker.toLowerCase()}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: basePriority - 0.1,
    })

    // Stock prediction page (slightly lower priority)
    routes.push({
      url: `${baseUrl}/prediction/${ticker.toLowerCase()}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: basePriority - 0.1,
    })
  })

  // ============================================================================
  // COMPARISON PAGES - Good Priority
  // ============================================================================
  COMPARISON_PAIRS.forEach(([ticker1, ticker2]) => {
    routes.push({
      url: `${baseUrl}/compare/${ticker1.toLowerCase()}-vs-${ticker2.toLowerCase()}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
    })
  })

  // ============================================================================
  // AUTHENTICATION & ACCOUNT PAGES - Lower Priority
  // ============================================================================
  routes.push({
    url: `${baseUrl}/login`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.5,
  })

  routes.push({
    url: `${baseUrl}/premium`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  })

  return routes
}
