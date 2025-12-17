-- ============================================================================
-- DATABASE SCHEMA & DATA INTEGRITY ANALYSIS
-- Quant Platform - PostgreSQL via Supabase
-- ============================================================================
-- Run this script in Supabase SQL Editor to analyze your database
-- ============================================================================

-- ============================================================================
-- 1. TABLE ROW COUNTS - Identify empty tables
-- ============================================================================
SELECT
  schemaname,
  relname as table_name,
  n_live_tup as row_count,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum,
  CASE
    WHEN n_live_tup = 0 THEN '⚠️ EMPTY'
    WHEN n_live_tup < 10 THEN '⚠️ VERY FEW ROWS'
    WHEN n_live_tup < 100 THEN 'Low'
    ELSE 'OK'
  END as status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup ASC;

-- ============================================================================
-- 2. TABLES WITHOUT PRIMARY KEYS - Critical integrity issue
-- ============================================================================
SELECT
  t.table_name,
  t.table_type,
  '⚠️ MISSING PRIMARY KEY' as issue
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

-- ============================================================================
-- 3. UNUSED INDEXES - Wasting storage and write performance
-- ============================================================================
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  '⚠️ NEVER USED' as status
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
  AND indexname NOT LIKE '%_pkey' -- Exclude primary key indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- 4. FOREIGN KEY RELATIONSHIPS - Full inventory
-- ============================================================================
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

-- ============================================================================
-- 5. FOREIGN KEYS WITHOUT INDEXES - CRITICAL PERFORMANCE ISSUE
-- ============================================================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  '⚠️ MISSING INDEX ON FK' as issue,
  'Add: CREATE INDEX idx_' || tc.table_name || '_' || kcu.column_name ||
    ' ON ' || tc.table_name || '(' || kcu.column_name || ');' as recommendation
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

-- ============================================================================
-- 6. DATA FRESHNESS CHECK - Identify stale data sources
-- ============================================================================
WITH freshness AS (
  SELECT
    'stock_prices' as table_name,
    MAX(date) as latest_date,
    COUNT(*) as total_rows,
    CURRENT_DATE - MAX(date) as days_stale
  FROM stock_prices
  UNION ALL
  SELECT
    'stock_prices_snapshot' as table_name,
    MAX(updated_at::date) as latest_date,
    COUNT(*) as total_rows,
    CURRENT_DATE - MAX(updated_at::date) as days_stale
  FROM stock_prices_snapshot
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
  UNION ALL
  SELECT
    'short_volume' as table_name,
    MAX(date) as latest_date,
    COUNT(*) as total_rows,
    CURRENT_DATE - MAX(date) as days_stale
  FROM short_volume
  UNION ALL
  SELECT
    'institutional_ownership' as table_name,
    MAX(report_date) as latest_date,
    COUNT(*) as total_rows,
    CURRENT_DATE - MAX(report_date) as days_stale
  FROM institutional_ownership
  UNION ALL
  SELECT
    'company_bonds' as table_name,
    MAX(updated_at::date) as latest_date,
    COUNT(*) as total_rows,
    CURRENT_DATE - MAX(updated_at::date) as days_stale
  FROM company_bonds
  UNION ALL
  SELECT
    'clinical_trials' as table_name,
    MAX(updated_at::date) as latest_date,
    COUNT(*) as total_rows,
    CURRENT_DATE - MAX(updated_at::date) as days_stale
  FROM clinical_trials
)
SELECT
  *,
  CASE
    WHEN total_rows = 0 THEN '🔴 EMPTY TABLE'
    WHEN days_stale > 7 THEN '⚠️ STALE (>7 days)'
    WHEN days_stale > 3 THEN '⚠️ AGING (>3 days)'
    WHEN days_stale > 1 THEN 'OK (>1 day)'
    ELSE '✅ FRESH'
  END as freshness_status
FROM freshness
ORDER BY days_stale DESC NULLS FIRST;

-- ============================================================================
-- 7. TABLE SIZES - Storage analysis
-- ============================================================================
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
  ROUND(
    100 * (pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename))::numeric /
    NULLIF(pg_total_relation_size(schemaname||'.'||tablename), 0),
    2
  ) as index_ratio_percent
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- ============================================================================
-- 8. POTENTIALLY PROBLEMATIC NULLABLE COLUMNS
-- ============================================================================
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  '⚠️ Should probably be NOT NULL' as issue
FROM information_schema.columns
WHERE table_schema = 'public'
  AND is_nullable = 'YES'
  AND (
    column_name IN ('ticker', 'cik', 'user_id', 'created_at', 'date', 'filing_date', 'report_period')
    OR column_name LIKE '%_id'
  )
ORDER BY table_name, column_name;

-- ============================================================================
-- 9. DUPLICATE OR REDUNDANT INDEXES
-- ============================================================================
SELECT
  pg_size_pretty(SUM(pg_relation_size(idx))::BIGINT) AS total_wasted_size,
  (array_agg(idx))[1] AS idx1,
  (array_agg(idx))[2] AS idx2,
  (array_agg(idx))[3] AS idx3
FROM (
  SELECT
    indexrelid::regclass AS idx,
    (indrelid::text ||E'\n'|| indclass::text ||E'\n'|| indkey::text ||E'\n'||
     COALESCE(indexprs::text,'')||E'\n' || COALESCE(indpred::text,'')) AS key
  FROM pg_index
) sub
GROUP BY key
HAVING COUNT(*) > 1
ORDER BY SUM(pg_relation_size(idx)) DESC;

-- ============================================================================
-- 10. TABLES WITH HIGH SEQUENTIAL SCANS - Missing indexes?
-- ============================================================================
SELECT
  schemaname,
  tablename,
  seq_scan,
  idx_scan,
  n_live_tup as rows,
  ROUND((seq_scan::float / NULLIF(seq_scan + idx_scan, 0) * 100)::numeric, 2) as seq_scan_percent,
  CASE
    WHEN n_live_tup > 10000 AND seq_scan::float / NULLIF(seq_scan + idx_scan, 0) > 0.5
      THEN '⚠️ HIGH SEQ SCANS - Add indexes'
    WHEN n_live_tup > 1000 AND seq_scan::float / NULLIF(seq_scan + idx_scan, 0) > 0.8
      THEN '⚠️ MOSTLY SEQ SCANS'
    ELSE 'OK'
  END as status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 0
  AND n_live_tup > 100
ORDER BY seq_scan DESC
LIMIT 20;

-- ============================================================================
-- 11. MISSING COMMON INDEXES - Based on typical query patterns
-- ============================================================================
WITH expected_indexes AS (
  SELECT 'companies' as table_name, 'ticker' as column_name UNION ALL
  SELECT 'companies', 'cik' UNION ALL
  SELECT 'stock_prices', 'ticker' UNION ALL
  SELECT 'stock_prices', 'date' UNION ALL
  SELECT 'company_news', 'ticker' UNION ALL
  SELECT 'company_news', 'date' UNION ALL
  SELECT 'insider_trades', 'ticker' UNION ALL
  SELECT 'insider_trades', 'filing_date' UNION ALL
  SELECT 'income_statements', 'ticker' UNION ALL
  SELECT 'income_statements', 'report_period' UNION ALL
  SELECT 'balance_sheets', 'ticker' UNION ALL
  SELECT 'balance_sheets', 'report_period' UNION ALL
  SELECT 'short_volume', 'ticker' UNION ALL
  SELECT 'short_volume', 'date' UNION ALL
  SELECT 'institutional_ownership', 'ticker' UNION ALL
  SELECT 'clinical_trials', 'nct_id'
)
SELECT
  ei.table_name,
  ei.column_name,
  '⚠️ MISSING COMMON INDEX' as issue,
  'CREATE INDEX idx_' || ei.table_name || '_' || ei.column_name ||
    ' ON ' || ei.table_name || '(' || ei.column_name || ');' as recommendation
FROM expected_indexes ei
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename = ei.table_name
    AND indexdef LIKE '%' || ei.column_name || '%'
)
ORDER BY ei.table_name, ei.column_name;

-- ============================================================================
-- 12. BROKEN FOREIGN KEY REFERENCES - Data integrity check
-- ============================================================================
-- Check for orphaned records in investments table
SELECT
  'investments' as table_name,
  'user_id' as fk_column,
  COUNT(*) as orphaned_records
FROM investments i
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = i.user_id)
HAVING COUNT(*) > 0

UNION ALL

-- Check for orphaned plaid_items
SELECT
  'plaid_items' as table_name,
  'user_id' as fk_column,
  COUNT(*) as orphaned_records
FROM plaid_items pi
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = pi.user_id)
HAVING COUNT(*) > 0

UNION ALL

-- Check for orphaned tink_connections
SELECT
  'tink_connections' as table_name,
  'user_id' as fk_column,
  COUNT(*) as orphaned_records
FROM tink_connections tc
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = tc.user_id)
HAVING COUNT(*) > 0;

-- ============================================================================
-- 13. COLUMN TYPE INCONSISTENCIES
-- ============================================================================
-- Check for ticker columns with different types
SELECT
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  '⚠️ Inconsistent ticker type' as issue
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'ticker'
  AND (
    data_type != 'character varying'
    OR character_maximum_length != 20
  )
ORDER BY table_name;

-- ============================================================================
-- 14. CRON JOB STATUS - Check automated tasks
-- ============================================================================
SELECT
  jobid,
  jobname,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
ORDER BY jobname;

-- ============================================================================
-- 15. SYNC LOG ANALYSIS - Recent sync activity
-- ============================================================================
SELECT
  'market_data_sync_log' as log_table,
  sync_type,
  status,
  COUNT(*) as count,
  MAX(started_at) as last_run,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds,
  SUM(records_created) as total_created,
  SUM(error_count) as total_errors
FROM market_data_sync_log
WHERE started_at > CURRENT_DATE - INTERVAL '7 days'
GROUP BY sync_type, status
ORDER BY last_run DESC;

-- ============================================================================
-- SUMMARY RECOMMENDATIONS
-- ============================================================================
SELECT '
================================================================================
SUMMARY RECOMMENDATIONS
================================================================================

Based on the analysis above, review the following:

1. EMPTY TABLES
   - Check tables with 0 rows - should they have data?
   - Focus on: stock_prices, company_news, insider_trades, financial_statements

2. MISSING INDEXES
   - Add indexes on foreign key columns (critical for performance)
   - Add indexes on commonly queried columns (ticker, date, cik)

3. FOREIGN KEY ISSUES
   - Check for orphaned records in user-related tables
   - Ensure referential integrity

4. DATA FRESHNESS
   - Investigate tables with stale data (>7 days old)
   - Check cron jobs are running properly
   - Review sync logs for errors

5. SCHEMA INCONSISTENCIES
   - Ensure ticker columns are consistent (VARCHAR(20))
   - Make critical columns NOT NULL (ticker, cik, dates)

6. PERFORMANCE ISSUES
   - Remove unused indexes
   - Add missing indexes on high-traffic tables
   - Investigate tables with high sequential scan ratios

Run each query above in Supabase SQL Editor for detailed analysis.
================================================================================
' as summary;
