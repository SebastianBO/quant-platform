#!/usr/bin/env node
/**
 * Setup Short Volume Feature
 * Run: node scripts/setup-short-volume.js
 *
 * This script:
 * 1. Creates the short_volume table if it doesn't exist
 * 2. Backfills historical data from FINRA (last 60 trading days)
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wcckhqxkmhyzfpynthte.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjY2tocXhrbWh5emZweW50aHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQ4MzMyMiwiZXhwIjoyMDYxMDU5MzIyfQ.JpvVhcIJsWFrEJntLhKBba0E0F4M-pJzFocIUw3O_N4'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// Parse FINRA file
function parseFinraFile(content, date) {
  const records = []
  const lines = content.split('\n')

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split('|')
    if (parts.length >= 5) {
      const symbol = parts[1]
      const shortVolume = parseInt(parts[2]) || 0
      const shortExemptVolume = parseInt(parts[3]) || 0
      const totalVolume = parseInt(parts[4]) || 0

      const existing = records.find(r => r.symbol === symbol)
      if (existing) {
        existing.short_volume += shortVolume
        existing.short_exempt_volume += shortExemptVolume
        existing.total_volume += totalVolume
      } else {
        records.push({
          symbol,
          trade_date: date,
          short_volume: shortVolume,
          short_exempt_volume: shortExemptVolume,
          total_volume: totalVolume
        })
      }
    }
  }

  return records
}

async function checkTableExists() {
  const { data, error } = await supabase.from('short_volume').select('id').limit(1)
  return !error || error.code !== '42P01'
}

async function backfillData(days = 60) {
  console.log(`\n📊 Starting backfill for last ${days} trading days...`)

  let currentDate = new Date()
  let processedDays = 0
  let totalRecords = 0

  while (processedDays < days) {
    const dayOfWeek = currentDate.getDay()

    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dateFileFormat = dateStr.replace(/-/g, '')

      // Check if we already have data for this date
      const { data: existing } = await supabase
        .from('short_volume')
        .select('id')
        .eq('trade_date', dateStr)
        .limit(1)

      if (existing && existing.length > 0) {
        console.log(`  ⏭️  ${dateStr}: Already has data, skipping`)
        processedDays++
        currentDate.setDate(currentDate.getDate() - 1)
        continue
      }

      // Fetch FINRA file
      const finraUrl = `https://cdn.finra.org/equity/regsho/daily/CNMSshvol${dateFileFormat}.txt`

      try {
        const response = await fetch(finraUrl)

        if (response.ok) {
          const content = await response.text()
          const records = parseFinraFile(content, dateStr)
          const validRecords = records.filter(r => r.total_volume > 0)

          // Insert in batches
          const batchSize = 1000
          for (let i = 0; i < validRecords.length; i += batchSize) {
            const batch = validRecords.slice(i, i + batchSize)
            const { error } = await supabase
              .from('short_volume')
              .upsert(batch, { onConflict: 'symbol,trade_date' })

            if (error) {
              console.error(`    ❌ Batch error for ${dateStr}:`, error.message)
            }
          }

          totalRecords += validRecords.length
          console.log(`  ✅ ${dateStr}: ${validRecords.length} records`)
        } else {
          console.log(`  ⚠️  ${dateStr}: FINRA file not available (HTTP ${response.status})`)
        }
      } catch (err) {
        console.log(`  ❌ ${dateStr}: Error - ${err.message}`)
      }

      processedDays++
    }

    currentDate.setDate(currentDate.getDate() - 1)
  }

  return totalRecords
}

async function main() {
  console.log('🚀 Short Volume Setup Script')
  console.log('============================\n')

  // Step 1: Check if table exists
  console.log('1️⃣  Checking if short_volume table exists...')
  const exists = await checkTableExists()

  if (!exists) {
    console.log('\n❌ Table does not exist!')
    console.log('\n📋 Please run this SQL in the Supabase Dashboard SQL Editor:')
    console.log('   Go to: https://supabase.com/dashboard/project/wcckhqxkmhyzfpynthte/sql/new\n')
    console.log('------- COPY SQL BELOW -------\n')
    console.log(`
CREATE TABLE IF NOT EXISTS short_volume (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  trade_date DATE NOT NULL,
  short_volume BIGINT NOT NULL DEFAULT 0,
  short_exempt_volume BIGINT NOT NULL DEFAULT 0,
  total_volume BIGINT NOT NULL DEFAULT 0,
  short_percent DECIMAL(6,2) GENERATED ALWAYS AS (
    CASE WHEN total_volume > 0
      THEN (short_volume::DECIMAL / total_volume * 100)::DECIMAL(6,2)
      ELSE 0
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_symbol_date UNIQUE (symbol, trade_date)
);

CREATE INDEX IF NOT EXISTS idx_short_volume_symbol ON short_volume(symbol);
CREATE INDEX IF NOT EXISTS idx_short_volume_date ON short_volume(trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_short_volume_symbol_date ON short_volume(symbol, trade_date DESC);

ALTER TABLE short_volume ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON short_volume FOR SELECT USING (true);
CREATE POLICY "Service role insert" ON short_volume FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role update" ON short_volume FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS short_volume_ingestion_log (
  id BIGSERIAL PRIMARY KEY,
  trade_date DATE NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  symbols_processed INT DEFAULT 0,
  symbols_inserted INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE short_volume_ingestion_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read log" ON short_volume_ingestion_log FOR SELECT USING (true);
CREATE POLICY "Service manage log" ON short_volume_ingestion_log FOR ALL USING (true);
`)
    console.log('\n------- END SQL -------\n')
    console.log('After running the SQL, run this script again to backfill data.\n')
    process.exit(1)
  }

  console.log('   ✅ Table exists!\n')

  // Step 2: Check current data status
  console.log('2️⃣  Checking current data status...')
  const { data: stats } = await supabase
    .from('short_volume')
    .select('trade_date')
    .order('trade_date', { ascending: false })
    .limit(1)

  const { count } = await supabase
    .from('short_volume')
    .select('*', { count: 'exact', head: true })

  console.log(`   Total records: ${count || 0}`)
  console.log(`   Latest date: ${stats?.[0]?.trade_date || 'None'}\n`)

  // Step 3: Backfill data
  if (!count || count === 0) {
    console.log('3️⃣  Backfilling data from FINRA (60 trading days)...')
    const total = await backfillData(60)
    console.log(`\n✅ Backfill complete! Inserted ${total} total records.`)
  } else {
    console.log('3️⃣  Data already exists. Skipping backfill.')
    console.log('   (To force backfill, delete existing data first)\n')
  }

  console.log('\n🎉 Setup complete!')
  console.log('\nNext steps:')
  console.log('1. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local:')
  console.log(`   SUPABASE_SERVICE_ROLE_KEY="${SERVICE_KEY}"`)
  console.log('\n2. Start your dev server: npm run dev')
  console.log('3. View any stock → Short Volume tab should show real FINRA data!\n')
}

main().catch(console.error)
