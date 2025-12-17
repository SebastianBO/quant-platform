#!/usr/bin/env node

/**
 * Database Schema and Data Integrity Analysis
 *
 * Checks:
 * 1. Empty tables that should have data
 * 2. Missing indexes
 * 3. Foreign key issues
 * 4. Data freshness
 * 5. Schema inconsistencies
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runQuery(query, description) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${description}`);
  console.log('='.repeat(80));

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });

    if (error) {
      // If RPC doesn't exist, try direct query
      const { data: directData, error: directError } = await supabase
        .from('_temp')
        .select('*')
        .limit(0);

      // For SELECT queries, we need to use a different approach
      // Let's parse and execute through PostgREST
      console.error(`Error: ${error.message}`);
      console.log('Note: Direct SQL execution requires database access. Using Supabase PostgREST API instead.\n');
      return null;
    }

    if (data) {
      console.table(data);
      return data;
    }
  } catch (err) {
    console.error(`Error: ${err.message}\n`);
    return null;
  }
}

async function analyzeTableCounts() {
  const query = `
    SELECT
      schemaname,
      relname as table_name,
      n_live_tup as row_count,
      n_dead_tup as dead_rows,
      last_vacuum,
      last_autovacuum
    FROM pg_stat_user_tables
    ORDER BY n_live_tup ASC;
  `;

  return await runQuery(query, '1. TABLE ROW COUNTS (Empty tables first)');
}

async function checkMissingPrimaryKeys() {
  const query = `
    SELECT
      t.table_name,
      t.table_type
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND t.table_name NOT IN (
        SELECT tc.table_name
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
      )
    ORDER BY t.table_name;
  `;

  return await runQuery(query, '2. TABLES WITHOUT PRIMARY KEYS');
}

async function checkIndexUsage() {
  const query = `
    SELECT
      schemaname,
      tablename,
      indexname,
      idx_scan as scans,
      idx_tup_read as tuples_read,
      idx_tup_fetch as tuples_fetched,
      pg_size_pretty(pg_relation_size(indexrelid)) as index_size
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0
      AND schemaname = 'public'
    ORDER BY pg_relation_size(indexrelid) DESC;
  `;

  return await runQuery(query, '3. UNUSED INDEXES (never scanned)');
}

async function checkForeignKeys() {
  const query = `
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      tc.constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `;

  return await runQuery(query, '4. FOREIGN KEY RELATIONSHIPS');
}

async function checkMissingForeignKeyIndexes() {
  const query = `
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = tc.table_name
          AND indexdef LIKE '%' || kcu.column_name || '%'
      )
    ORDER BY tc.table_name;
  `;

  return await runQuery(query, '5. FOREIGN KEYS WITHOUT INDEXES (Performance Issue!)');
}

async function checkDataFreshness() {
  const query = `
    SELECT
      'stock_prices' as table_name,
      MAX(date) as latest_date,
      COUNT(*) as total_rows,
      CURRENT_DATE - MAX(date) as days_stale
    FROM stock_prices
    UNION ALL
    SELECT
      'company_news' as table_name,
      MAX(date::date) as latest_date,
      COUNT(*) as total_rows,
      CURRENT_DATE - MAX(date::date) as days_stale
    FROM company_news
    UNION ALL
    SELECT
      'insider_trades' as table_name,
      MAX(filing_date) as latest_date,
      COUNT(*) as total_rows,
      CURRENT_DATE - MAX(filing_date) as days_stale
    FROM insider_trades
    UNION ALL
    SELECT
      'income_statements' as table_name,
      MAX(report_period) as latest_date,
      COUNT(*) as total_rows,
      CURRENT_DATE - MAX(report_period) as days_stale
    FROM income_statements
    UNION ALL
    SELECT
      'balance_sheets' as table_name,
      MAX(report_period) as latest_date,
      COUNT(*) as total_rows,
      CURRENT_DATE - MAX(report_period) as days_stale
    FROM balance_sheets
    UNION ALL
    SELECT
      'cash_flow_statements' as table_name,
      MAX(report_period) as latest_date,
      COUNT(*) as total_rows,
      CURRENT_DATE - MAX(report_period) as days_stale
    FROM cash_flow_statements
    ORDER BY days_stale DESC;
  `;

  return await runQuery(query, '6. DATA FRESHNESS CHECK (Stale data detection)');
}

async function checkTableSizes() {
  const query = `
    SELECT
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
      pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LIMIT 20;
  `;

  return await runQuery(query, '7. TABLE SIZES (Top 20 by total size)');
}

async function checkNullableColumns() {
  const query = `
    SELECT
      table_name,
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND is_nullable = 'YES'
      AND column_name IN ('ticker', 'cik', 'user_id', 'created_at', 'date')
    ORDER BY table_name, column_name;
  `;

  return await runQuery(query, '8. POTENTIALLY PROBLEMATIC NULLABLE COLUMNS');
}

async function checkDuplicateIndexes() {
  const query = `
    SELECT
      pg_size_pretty(SUM(pg_relation_size(idx))::BIGINT) AS total_size,
      (array_agg(idx))[1] AS idx1,
      (array_agg(idx))[2] AS idx2,
      (array_agg(idx))[3] AS idx3,
      (array_agg(idx))[4] AS idx4
    FROM (
      SELECT
        indexrelid::regclass AS idx,
        (indrelid::text ||E'\n'|| indclass::text ||E'\n'|| indkey::text ||E'\n'|| COALESCE(indexprs::text,'')||E'\n' || COALESCE(indpred::text,'')) AS key
      FROM pg_index
    ) sub
    GROUP BY key
    HAVING COUNT(*) > 1
    ORDER BY SUM(pg_relation_size(idx)) DESC;
  `;

  return await runQuery(query, '9. DUPLICATE OR REDUNDANT INDEXES');
}

async function checkSequentialScans() {
  const query = `
    SELECT
      schemaname,
      tablename,
      seq_scan,
      seq_tup_read,
      idx_scan,
      idx_tup_fetch,
      n_live_tup,
      ROUND((seq_scan::float / NULLIF(seq_scan + idx_scan, 0) * 100)::numeric, 2) as seq_scan_percent
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
      AND seq_scan > 0
      AND n_live_tup > 1000
    ORDER BY seq_scan DESC
    LIMIT 20;
  `;

  return await runQuery(query, '10. TABLES WITH HIGH SEQUENTIAL SCANS (Missing indexes?)');
}

// Main execution
async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║         DATABASE SCHEMA & DATA INTEGRITY ANALYSIS                          ║');
  console.log('║         Quant Platform - PostgreSQL via Supabase                           ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  console.log('\n⚠️  NOTE: This script requires direct database access via SQL.');
  console.log('   Supabase PostgREST API has limitations. For complete analysis,');
  console.log('   please run the SQL queries directly in Supabase SQL Editor.\n');

  // Since we can't execute arbitrary SQL through the Supabase client directly,
  // we'll output the queries to run manually

  console.log('\n📋 QUERIES TO RUN IN SUPABASE SQL EDITOR:\n');

  const queries = [
    {
      name: '1. Table Row Counts',
      sql: `SELECT
  schemaname,
  relname as table_name,
  n_live_tup as row_count,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_live_tup ASC;`
    },
    {
      name: '2. Tables Without Primary Keys',
      sql: `SELECT
  t.table_name,
  t.table_type
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT IN (
    SELECT tc.table_name
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
  )
ORDER BY t.table_name;`
    },
    {
      name: '3. Unused Indexes',
      sql: `SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;`
    },
    {
      name: '4. Foreign Keys Without Indexes',
      sql: `SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = tc.table_name
      AND indexdef LIKE '%' || kcu.column_name || '%'
  )
ORDER BY tc.table_name;`
    },
    {
      name: '5. Data Freshness Check',
      sql: `SELECT
  'stock_prices' as table_name,
  MAX(date) as latest_date,
  COUNT(*) as total_rows,
  CURRENT_DATE - MAX(date) as days_stale
FROM stock_prices
UNION ALL
SELECT
  'company_news' as table_name,
  MAX(date::date) as latest_date,
  COUNT(*) as total_rows,
  CURRENT_DATE - MAX(date::date) as days_stale
FROM company_news
UNION ALL
SELECT
  'insider_trades' as table_name,
  MAX(filing_date) as latest_date,
  COUNT(*) as total_rows,
  CURRENT_DATE - MAX(filing_date) as days_stale
FROM insider_trades
UNION ALL
SELECT
  'income_statements' as table_name,
  MAX(report_period) as latest_date,
  COUNT(*) as total_rows,
  CURRENT_DATE - MAX(report_period) as days_stale
FROM income_statements
ORDER BY days_stale DESC;`
    },
    {
      name: '6. Tables with High Sequential Scans',
      sql: `SELECT
  schemaname,
  tablename,
  seq_scan,
  idx_scan,
  n_live_tup,
  ROUND((seq_scan::float / NULLIF(seq_scan + idx_scan, 0) * 100)::numeric, 2) as seq_scan_percent
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 0
  AND n_live_tup > 1000
ORDER BY seq_scan DESC
LIMIT 20;`
    },
    {
      name: '7. Table Sizes',
      sql: `SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;`
    },
    {
      name: '8. Missing Ticker Columns',
      sql: `SELECT
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('stock_prices', 'insider_trades', 'income_statements', 'balance_sheets', 'cash_flow_statements')
  AND column_name = 'ticker'
  AND is_nullable = 'YES'
ORDER BY table_name;`
    }
  ];

  queries.forEach((q, i) => {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`${q.name}`);
    console.log('─'.repeat(80));
    console.log(q.sql);
    console.log('\n');
  });

  console.log('\n💡 To run these queries:');
  console.log('   1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/editor');
  console.log('   2. Copy and paste each query above');
  console.log('   3. Review the results\n');
}

main().catch(console.error);
