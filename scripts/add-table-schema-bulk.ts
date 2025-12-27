/**
 * Bulk Update Script: Add TableSchema to all pSEO metric pages
 *
 * This script adds getTableSchema import and TableSchema to schemas array
 * for all 442+ metric pages that are missing it.
 *
 * Run with: npx tsx scripts/add-table-schema-bulk.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const APP_DIR = path.join(__dirname, '../src/app')

// Metric name to display name mapping
const METRIC_DISPLAY_NAMES: Record<string, string> = {
  'pe-ratio': 'P/E Ratio',
  'revenue': 'Revenue',
  'net-margin': 'Net Margin',
  'gross-margin': 'Gross Margin',
  'rsi': 'RSI',
  'market-cap': 'Market Cap',
  'debt-to-equity': 'Debt to Equity',
  'dividend-yield': 'Dividend Yield',
  'eps': 'EPS',
  'roic': 'ROIC',
  'free-cash-flow': 'Free Cash Flow',
  'operating-margin': 'Operating Margin',
  'ebit-margin': 'EBIT Margin',
  'ebitda-margin': 'EBITDA Margin',
  'asset-turnover': 'Asset Turnover',
  'current-ratio': 'Current Ratio',
  'quick-ratio': 'Quick Ratio',
  'inventory-turnover': 'Inventory Turnover',
  'receivables-turnover': 'Receivables Turnover',
  'payables-turnover': 'Payables Turnover',
  'cash-conversion-cycle': 'Cash Conversion Cycle',
  'roe': 'ROE',
  'roa': 'ROA',
  'roce': 'ROCE',
  'profit-margin': 'Profit Margin',
  'price-to-book': 'Price to Book',
  'price-to-sales': 'Price to Sales',
  'ev-to-ebitda': 'EV/EBITDA',
  'ev-to-revenue': 'EV/Revenue',
  'peg-ratio': 'PEG Ratio',
  'short-interest': 'Short Interest',
  'shares-short': 'Shares Short',
  'days-to-cover': 'Days to Cover',
  'bollinger-bands': 'Bollinger Bands',
  'macd': 'MACD',
  'stochastic': 'Stochastic',
  'moving-average': 'Moving Average',
  // Add more as needed
}

function getDisplayName(metricName: string): string {
  return METRIC_DISPLAY_NAMES[metricName] ||
    metricName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
}

function findMetricPages(): string[] {
  const metricPages: string[] = []

  const entries = fs.readdirSync(APP_DIR, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const tickerDir = path.join(APP_DIR, entry.name, '[ticker]')
      const pageFile = path.join(tickerDir, 'page.tsx')

      if (fs.existsSync(pageFile)) {
        metricPages.push(pageFile)
      }
    }
  }

  return metricPages
}

function addTableSchemaToPage(filePath: string): boolean {
  let content = fs.readFileSync(filePath, 'utf-8')

  // Skip if already has getTableSchema
  if (content.includes('getTableSchema')) {
    return false
  }

  // Skip if no schemas array (minimal pages)
  if (!content.includes('const schemas = [') && !content.includes('schemas = [')) {
    return false
  }

  // Get metric name from path
  const metricName = path.basename(path.dirname(path.dirname(filePath)))
  const displayName = getDisplayName(metricName)

  // Add import if missing
  if (content.includes("from '@/lib/seo'")) {
    // Add getTableSchema to existing import
    content = content.replace(
      /import \{([^}]+)\} from '@\/lib\/seo'/,
      (match, imports) => {
        if (!imports.includes('getTableSchema')) {
          return `import {${imports}, getTableSchema } from '@/lib/seo'`
        }
        return match
      }
    )
  }

  // Find the schemas array closing bracket and add TableSchema before it
  // Pattern: look for ]  after getArticleSchema or getFAQSchema or getCorporationSchema
  const schemasEndPattern = /(getFAQSchema\([^)]+\)),?\s*\]/
  if (schemasEndPattern.test(content)) {
    content = content.replace(schemasEndPattern, (match, faqPart) => {
      return `${faqPart},
    getTableSchema({
      name: \`\${symbol} ${displayName} History\`,
      description: \`Historical ${displayName} data for \${companyName} (\${symbol})\`,
      url: pageUrl,
      columns: ['Period', '${displayName}', 'Change'],
      rowCount: 5,
    }),
  ]`
    })
  } else {
    // Alternative pattern for pages ending with corporationSchema
    const altPattern = /(getCorporationSchema\([^)]+\)),?\s*\]/
    if (altPattern.test(content)) {
      content = content.replace(altPattern, (match, corpPart) => {
        return `${corpPart},
    getTableSchema({
      name: \`\${symbol} ${displayName} History\`,
      description: \`Historical ${displayName} data for \${companyName} (\${symbol})\`,
      url: pageUrl,
      columns: ['Period', '${displayName}', 'Change'],
      rowCount: 5,
    }),
  ]`
      })
    }
  }

  fs.writeFileSync(filePath, content)
  return true
}

async function main() {
  console.log('🔍 Finding metric pages...')
  const pages = findMetricPages()
  console.log(`Found ${pages.length} metric pages`)

  let updated = 0
  let skipped = 0

  for (const page of pages) {
    try {
      const wasUpdated = addTableSchemaToPage(page)
      if (wasUpdated) {
        updated++
        console.log(`✅ Updated: ${page}`)
      } else {
        skipped++
      }
    } catch (error) {
      console.error(`❌ Error updating ${page}:`, error)
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Updated: ${updated} pages`)
  console.log(`   Skipped: ${skipped} pages (already had TableSchema or no schemas array)`)
}

main()
