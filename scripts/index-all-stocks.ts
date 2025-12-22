/**
 * Comprehensive Stock Indexing Script
 *
 * Submits ALL stock-related URLs to Google Indexing API
 * Run daily to index 200 URLs per day
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json" npx tsx scripts/index-all-stocks.ts
 *
 * With offset (to continue from where you left off):
 *   GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json" npx tsx scripts/index-all-stocks.ts 200
 */

import { google } from 'googleapis';
import * as fs from 'fs';

// S&P 500 + Popular stocks
const ALL_STOCKS = [
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
  // ETFs
  'SPY', 'QQQ', 'VOO', 'VTI', 'IWM', 'DIA', 'ARKK', 'XLF', 'XLE', 'XLK',
];

// Generate all URLs for a stock
function getStockUrls(ticker: string): string[] {
  const t = ticker.toLowerCase();
  return [
    `https://lician.com/stock/${ticker}`,
    `https://lician.com/should-i-buy/${t}`,
    `https://lician.com/prediction/${t}`,
  ];
}

// All comparison pairs
const COMPARISON_PAIRS = [
  ['AAPL', 'MSFT'], ['AAPL', 'GOOGL'], ['MSFT', 'GOOGL'], ['META', 'GOOGL'],
  ['AMZN', 'MSFT'], ['AMZN', 'GOOGL'], ['AAPL', 'AMZN'], ['META', 'AAPL'],
  ['META', 'MSFT'], ['META', 'AMZN'], ['AAPL', 'NVDA'], ['MSFT', 'NVDA'],
  ['GOOGL', 'NVDA'], ['AMZN', 'META'], ['AAPL', 'TSLA'], ['MSFT', 'TSLA'],
  ['NVDA', 'AMD'], ['NVDA', 'INTC'], ['AMD', 'INTC'], ['AVGO', 'QCOM'],
  ['TSLA', 'F'], ['TSLA', 'GM'], ['TSLA', 'RIVN'], ['F', 'GM'],
  ['JPM', 'BAC'], ['JPM', 'WFC'], ['BAC', 'C'], ['GS', 'MS'], ['V', 'MA'],
  ['SPY', 'VOO'], ['SPY', 'QQQ'], ['VOO', 'VTI'], ['QQQ', 'ARKK'],
  ['KO', 'PEP'], ['MCD', 'SBUX'], ['HD', 'LOW'], ['COST', 'WMT'],
  ['DIS', 'NFLX'], ['GOOG', 'META'], ['CRM', 'ORCL'], ['ADBE', 'CRM'],
  ['JNJ', 'PFE'], ['UNH', 'CVS'], ['MRK', 'LLY'], ['ABBV', 'BMY'],
  ['XOM', 'CVX'], ['COP', 'EOG'], ['SLB', 'HAL'],
  ['BA', 'LMT'], ['RTX', 'GD'], ['CAT', 'DE'],
  ['AMZN', 'WMT'], ['AMZN', 'TGT'], ['TGT', 'WMT'],
];

function getComparisonUrl(pair: string[]): string {
  return `https://lician.com/compare/${pair[0].toLowerCase()}-vs-${pair[1].toLowerCase()}`;
}

async function indexUrls() {
  const offset = parseInt(process.argv[2] || '0');
  const limit = 200; // Daily quota

  console.log('🚀 Comprehensive Stock Indexing\n');

  // Generate all URLs
  const allUrls: string[] = [];

  // Stock pages (3 per stock)
  for (const stock of ALL_STOCKS) {
    allUrls.push(...getStockUrls(stock));
  }

  // Comparison pages
  for (const pair of COMPARISON_PAIRS) {
    allUrls.push(getComparisonUrl(pair));
  }

  console.log(`📊 Total URLs available: ${allUrls.length}`);
  console.log(`📍 Starting from offset: ${offset}`);
  console.log(`🎯 Will submit: ${Math.min(limit, allUrls.length - offset)} URLs\n`);

  // Get URLs for this batch
  const batchUrls = allUrls.slice(offset, offset + limit);

  if (batchUrls.length === 0) {
    console.log('✅ All URLs have been submitted!');
    return;
  }

  // Authenticate
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || '/Users/sebastianbenzianolsson/gsc-key.json',
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const client = await auth.getClient();

  let successCount = 0;
  let errorCount = 0;

  for (const url of batchUrls) {
    try {
      await client.request({
        url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
        method: 'POST',
        data: { url, type: 'URL_UPDATED' },
      });

      console.log(`✅ ${url}`);
      successCount++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));

    } catch (error: any) {
      if (error.message?.includes('Quota exceeded')) {
        console.log(`\n⚠️ Daily quota reached after ${successCount} URLs`);
        break;
      }
      console.error(`❌ ${url}: ${error.message || error}`);
      errorCount++;
    }
  }

  const nextOffset = offset + successCount;

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 Results: ${successCount} succeeded, ${errorCount} failed`);
  console.log(`📍 Next offset: ${nextOffset}`);
  console.log(`📝 Remaining URLs: ${allUrls.length - nextOffset}`);
  console.log(`\n💡 Run tomorrow with: npx tsx scripts/index-all-stocks.ts ${nextOffset}`);
}

indexUrls().catch(console.error);
