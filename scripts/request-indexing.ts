/**
 * Google Indexing API - Request indexing for priority URLs
 *
 * Usage: npx tsx scripts/request-indexing.ts
 *
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account key
 */

import { google } from 'googleapis';

const PRIORITY_URLS = [
  // High priority - main SEO pages
  'https://lician.com/earnings',
  'https://lician.com/screener',
  'https://lician.com/markets',
  'https://lician.com/bonds',
  'https://lician.com/forex',
  'https://lician.com/commodities',
  'https://lician.com/crypto',
  'https://lician.com/etfs',
  'https://lician.com/analyst-ratings',
  'https://lician.com/insider-trading',
  'https://lician.com/institutional',
  'https://lician.com/short-interest',
  'https://lician.com/dividends',
  'https://lician.com/ipo',
  'https://lician.com/economic-calendar',
  'https://lician.com/stock-splits',
  'https://lician.com/news',
  'https://lician.com/options',
  'https://lician.com/biotech',
  'https://lician.com/penny-stocks',
  'https://lician.com/blue-chip-stocks',

  // Market movers
  'https://lician.com/markets/premarket',
  'https://lician.com/markets/after-hours',
  'https://lician.com/markets/top-gainers',
  'https://lician.com/markets/top-losers',
  'https://lician.com/markets/most-active',
  'https://lician.com/markets/52-week-high',
  'https://lician.com/markets/52-week-low',

  // Learn section
  'https://lician.com/learn',
  'https://lician.com/learn/how-to-invest',
  'https://lician.com/learn/technical-analysis',
  'https://lician.com/learn/value-investing',
  'https://lician.com/learn/growth-investing',
  'https://lician.com/learn/dividend-investing',
  'https://lician.com/learn/day-trading',
  'https://lician.com/learn/dcf-valuation',
  'https://lician.com/learn/pe-ratio',
  'https://lician.com/learn/stock-analysis',
  'https://lician.com/learn/ai-stock-analysis',

  // Insights
  'https://lician.com/insights',
  'https://lician.com/insights/2026-stock-predictions',
  'https://lician.com/insights/ai-stocks-2026',
  'https://lician.com/insights/best-stocks-2026',
  'https://lician.com/insights/dividend-stocks-2026',

  // Sectors
  'https://lician.com/sectors',
  'https://lician.com/sectors/technology',
  'https://lician.com/sectors/healthcare',
  'https://lician.com/sectors/financials',
  'https://lician.com/sectors/energy',
];

async function requestIndexing() {
  console.log('🚀 Starting Google Indexing API requests...\n');

  // Authenticate using service account
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || '/Users/sebastianbenzianolsson/gsc-key.json',
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const client = await auth.getClient();

  let successCount = 0;
  let errorCount = 0;

  for (const url of PRIORITY_URLS) {
    try {
      const response = await client.request({
        url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
        method: 'POST',
        data: {
          url: url,
          type: 'URL_UPDATED',
        },
      });

      console.log(`✅ ${url}`);
      successCount++;

      // Rate limiting - be nice to the API
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      console.error(`❌ ${url}: ${error.message || error}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} failed`);
  console.log(`📝 Quota used: ${successCount} of 200 daily requests`);
}

requestIndexing().catch(console.error);
