/**
 * Google Indexing API - Batch 2: More priority URLs
 *
 * Usage: npx tsx scripts/request-indexing-batch2.ts
 */

import { google } from 'googleapis';

const BATCH2_URLS = [
  // Popular stock comparisons (high search volume)
  'https://lician.com/compare/aapl-vs-googl',
  'https://lician.com/compare/msft-vs-googl',
  'https://lician.com/compare/nvda-vs-amd',
  'https://lician.com/compare/spy-vs-voo',
  'https://lician.com/compare/spy-vs-qqq',
  'https://lician.com/compare/voo-vs-vti',
  'https://lician.com/compare/meta-vs-googl',
  'https://lician.com/compare/tsla-vs-rivn',
  'https://lician.com/compare/amzn-vs-wmt',
  'https://lician.com/compare/ko-vs-pep',
  'https://lician.com/compare/v-vs-ma',
  'https://lician.com/compare/jpm-vs-bac',
  'https://lician.com/compare/xom-vs-cvx',
  'https://lician.com/compare/jnj-vs-pfe',
  'https://lician.com/compare/dis-vs-nflx',
  'https://lician.com/compare/crm-vs-now',
  'https://lician.com/compare/cost-vs-wmt',
  'https://lician.com/compare/hd-vs-low',
  'https://lician.com/compare/unh-vs-cvs',
  'https://lician.com/compare/nvda-vs-intc',
  'https://lician.com/compare/amd-vs-intc',
  'https://lician.com/compare/tsla-vs-f',
  'https://lician.com/compare/tsla-vs-gm',
  'https://lician.com/compare/aapl-vs-amzn',
  'https://lician.com/compare/msft-vs-amzn',

  // Best stocks categories
  'https://lician.com/best-stocks/dividend',
  'https://lician.com/best-stocks/growth',
  'https://lician.com/best-stocks/value',
  'https://lician.com/best-stocks/tech',
  'https://lician.com/best-stocks/ai',
  'https://lician.com/best-stocks/healthcare',
  'https://lician.com/best-stocks/finance',

  // Top stock pages (Mag 7 + popular)
  'https://lician.com/stock/AAPL',
  'https://lician.com/stock/MSFT',
  'https://lician.com/stock/GOOGL',
  'https://lician.com/stock/AMZN',
  'https://lician.com/stock/NVDA',
  'https://lician.com/stock/META',
  'https://lician.com/stock/TSLA',
  'https://lician.com/stock/AMD',
  'https://lician.com/stock/INTC',
  'https://lician.com/stock/JPM',
  'https://lician.com/stock/BAC',
  'https://lician.com/stock/V',
  'https://lician.com/stock/MA',
  'https://lician.com/stock/JNJ',
  'https://lician.com/stock/PFE',
  'https://lician.com/stock/UNH',
  'https://lician.com/stock/XOM',
  'https://lician.com/stock/CVX',
  'https://lician.com/stock/KO',
  'https://lician.com/stock/PEP',
  'https://lician.com/stock/DIS',
  'https://lician.com/stock/NFLX',
  'https://lician.com/stock/CRM',
  'https://lician.com/stock/ORCL',
  'https://lician.com/stock/COST',
  'https://lician.com/stock/WMT',
  'https://lician.com/stock/HD',
  'https://lician.com/stock/LOW',
  'https://lician.com/stock/SPY',
  'https://lician.com/stock/QQQ',
  'https://lician.com/stock/VOO',
  'https://lician.com/stock/VTI',
  'https://lician.com/stock/PLTR',
  'https://lician.com/stock/COIN',
  'https://lician.com/stock/RIVN',
  'https://lician.com/stock/LCID',
  'https://lician.com/stock/NIO',
  'https://lician.com/stock/SOFI',
  'https://lician.com/stock/HOOD',
  'https://lician.com/stock/GME',
  'https://lician.com/stock/AMC',
  'https://lician.com/stock/MARA',
  'https://lician.com/stock/RIOT',

  // Should I Buy pages (high intent keywords)
  'https://lician.com/should-i-buy/msft',
  'https://lician.com/should-i-buy/googl',
  'https://lician.com/should-i-buy/amzn',
  'https://lician.com/should-i-buy/nvda',
  'https://lician.com/should-i-buy/meta',
  'https://lician.com/should-i-buy/tsla',
  'https://lician.com/should-i-buy/amd',
  'https://lician.com/should-i-buy/intc',
  'https://lician.com/should-i-buy/jpm',
  'https://lician.com/should-i-buy/v',
  'https://lician.com/should-i-buy/spy',
  'https://lician.com/should-i-buy/qqq',
  'https://lician.com/should-i-buy/pltr',
  'https://lician.com/should-i-buy/coin',
  'https://lician.com/should-i-buy/sofi',

  // Prediction pages
  'https://lician.com/prediction/aapl',
  'https://lician.com/prediction/msft',
  'https://lician.com/prediction/googl',
  'https://lician.com/prediction/amzn',
  'https://lician.com/prediction/tsla',
  'https://lician.com/prediction/meta',
  'https://lician.com/prediction/amd',
  'https://lician.com/prediction/intc',
  'https://lician.com/prediction/pltr',
  'https://lician.com/prediction/coin',
  'https://lician.com/prediction/spy',
  'https://lician.com/prediction/qqq',

  // More sectors
  'https://lician.com/sectors/consumer-discretionary',
  'https://lician.com/sectors/consumer-staples',
  'https://lician.com/sectors/industrials',
  'https://lician.com/sectors/materials',
  'https://lician.com/sectors/utilities',
  'https://lician.com/sectors/real-estate',
  'https://lician.com/sectors/communication-services',

  // Homepage (refresh)
  'https://lician.com/',
];

async function requestIndexing() {
  console.log('🚀 Starting Batch 2 indexing requests...\n');

  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || '/Users/sebastianbenzianolsson/gsc-key.json',
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const client = await auth.getClient();

  let successCount = 0;
  let errorCount = 0;

  for (const url of BATCH2_URLS) {
    try {
      await client.request({
        url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
        method: 'POST',
        data: {
          url: url,
          type: 'URL_UPDATED',
        },
      });

      console.log(`✅ ${url}`);
      successCount++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      console.error(`❌ ${url}: ${error.message || error}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} failed`);
  console.log(`📝 Total quota used today: ${49 + successCount} of 200`);
}

requestIndexing().catch(console.error);
