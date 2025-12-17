-- ============================================================================
-- CRITICAL DATABASE CHECKS - RUN THESE FIRST
-- ============================================================================
-- Run these queries in Supabase SQL Editor to identify immediate issues
-- ============================================================================

-- ============================================================================
-- 1. TABLE ROW COUNTS - Which tables are empty?
-- ============================================================================
SELECT
  schemaname,
  relname as table_name,
  n_live_tup as row_count,
  CASE
    WHEN n_live_tup = 0 THEN '🔴 EMPTY'
    WHEN n_live_tup < 10 THEN '🟡 FEW ROWS'
    ELSE '🟢 HAS DATA'
  END as status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup ASC
LIMIT 30;

-- ============================================================================
-- 2. CRON JOB STATUS - Are automated sync jobs running?
-- ============================================================================
SELECT
  jobid,
  jobname,
  schedule,
  active,
  CASE
    WHEN active THEN '🟢 ACTIVE'
    ELSE '🔴 INACTIVE'
  END as status,
  command
FROM cron.job
ORDER BY jobname;

-- ============================================================================
-- 3. RECENT SYNC ACTIVITY - When was data last synced?
-- ============================================================================
SELECT
  sync_type,
  status,
  started_at,
  completed_at,
  records_created,
  records_updated,
  error_count,
  error_message
FROM market_data_sync_log
ORDER BY started_at DESC
LIMIT 20;

-- ============================================================================
-- 4. DATA FRESHNESS - How stale is the data?
-- ============================================================================
SELECT
  'stock_prices' as table_name,
  MAX(date) as latest_date,
  COUNT(*) as total_rows,
  CURRENT_DATE - MAX(date) as days_stale,
  CASE
    WHEN COUNT(*) = 0 THEN '🔴 EMPTY'
    WHEN CURRENT_DATE - MAX(date) > 7 THEN '🔴 STALE (>7 days)'
    WHEN CURRENT_DATE - MAX(date) > 3 THEN '🟡 AGING (>3 days)'
    ELSE '🟢 FRESH'
  END as status
FROM stock_prices
UNION ALL
SELECT
  'company_news',
  MAX(date::date),
  COUNT(*),
  CURRENT_DATE - MAX(date::date),
  CASE
    WHEN COUNT(*) = 0 THEN '🔴 EMPTY'
    WHEN CURRENT_DATE - MAX(date::date) > 7 THEN '🔴 STALE'
    WHEN CURRENT_DATE - MAX(date::date) > 3 THEN '🟡 AGING'
    ELSE '🟢 FRESH'
  END
FROM company_news
UNION ALL
SELECT
  'insider_trades',
  MAX(filing_date),
  COUNT(*),
  CURRENT_DATE - MAX(filing_date),
  CASE
    WHEN COUNT(*) = 0 THEN '🔴 EMPTY'
    WHEN CURRENT_DATE - MAX(filing_date) > 7 THEN '🔴 STALE'
    WHEN CURRENT_DATE - MAX(filing_date) > 3 THEN '🟡 AGING'
    ELSE '🟢 FRESH'
  END
FROM insider_trades
UNION ALL
SELECT
  'short_volume',
  MAX(trade_date),
  COUNT(*),
  CURRENT_DATE - MAX(trade_date),
  CASE
    WHEN COUNT(*) = 0 THEN '🔴 EMPTY'
    WHEN CURRENT_DATE - MAX(trade_date) > 7 THEN '🔴 STALE'
    WHEN CURRENT_DATE - MAX(trade_date) > 3 THEN '🟡 AGING'
    ELSE '🟢 FRESH'
  END
FROM short_volume
ORDER BY days_stale DESC NULLS FIRST;

-- ============================================================================
-- 5. ORPHANED USER DATA - Check referential integrity
-- ============================================================================
-- Check for orphaned investments
SELECT
  'investments' as table_name,
  COUNT(*) as orphaned_count,
  CASE
    WHEN COUNT(*) = 0 THEN '🟢 NO ORPHANS'
    ELSE '🔴 HAS ORPHANED RECORDS'
  END as status
FROM investments i
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = i.user_id)

UNION ALL

-- Check for orphaned portfolios
SELECT
  'portfolios',
  COUNT(*),
  CASE WHEN COUNT(*) = 0 THEN '🟢 NO ORPHANS' ELSE '🔴 HAS ORPHANED RECORDS' END
FROM portfolios p
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.user_id)

UNION ALL

-- Check for orphaned plaid_items
SELECT
  'plaid_items',
  COUNT(*),
  CASE WHEN COUNT(*) = 0 THEN '🟢 NO ORPHANS' ELSE '🔴 HAS ORPHANED RECORDS' END
FROM plaid_items pi
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = pi.user_id)

UNION ALL

-- Check for orphaned tink_connections
SELECT
  'tink_connections',
  COUNT(*),
  CASE WHEN COUNT(*) = 0 THEN '🟢 NO ORPHANS' ELSE '🔴 HAS ORPHANED RECORDS' END
FROM tink_connections tc
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = tc.user_id);

-- ============================================================================
-- 6. MISSING INDEXES ON FOREIGN KEYS - CRITICAL PERFORMANCE ISSUE
-- ============================================================================
-- This query finds foreign key columns that don't have indexes
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  '⚠️ MISSING INDEX ON FK' as issue,
  'CREATE INDEX idx_' || tc.table_name || '_' || kcu.column_name ||
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
-- 7. TABLES WITH HIGH SEQUENTIAL SCANS - Missing indexes?
-- ============================================================================
SELECT
  schemaname,
  tablename,
  seq_scan as sequential_scans,
  idx_scan as index_scans,
  n_live_tup as rows,
  ROUND((seq_scan::float / NULLIF(seq_scan + idx_scan, 0) * 100)::numeric, 2) as seq_scan_percent,
  CASE
    WHEN n_live_tup > 10000 AND seq_scan::float / NULLIF(seq_scan + idx_scan, 0) > 0.5
      THEN '🔴 HIGH SEQ SCANS - Add indexes'
    WHEN n_live_tup > 1000 AND seq_scan::float / NULLIF(seq_scan + idx_scan, 0) > 0.8
      THEN '🟡 MOSTLY SEQ SCANS'
    ELSE '🟢 OK'
  END as status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 0
  AND n_live_tup > 100
ORDER BY seq_scan DESC
LIMIT 15;

-- ============================================================================
-- 8. UNUSED INDEXES - Wasting storage?
-- ============================================================================
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  CASE
    WHEN idx_scan = 0 THEN '🟡 NEVER USED - Consider dropping'
    ELSE '🟢 IN USE'
  END as status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexname NOT LIKE '%_pkey' -- Exclude primary keys
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 10;

-- ============================================================================
-- 9. TABLE SIZES - Storage usage
-- ============================================================================
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
  n_live_tup as row_count
FROM pg_tables
JOIN pg_stat_user_tables USING (schemaname, tablename)
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 15;

-- ============================================================================
-- 10. RLS POLICIES - Security check
-- ============================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as operation,
  qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- QUICK SUMMARY
-- ============================================================================
SELECT '
================================================================================
QUICK SUMMARY - Review these results:
================================================================================

1. TABLE ROW COUNTS
   - Look for 🔴 EMPTY tables that should have data
   - Focus on: stock_prices, company_news, insider_trades

2. CRON JOB STATUS
   - All jobs should be 🟢 ACTIVE
   - If inactive, run: SELECT cron.unschedule(jobid) and recreate

3. SYNC ACTIVITY
   - Check for recent errors
   - Look at error_message column for failed syncs

4. DATA FRESHNESS
   - Any table >7 days stale needs attention
   - Check why cron jobs are not running

5. ORPHANED DATA
   - Should see 🟢 NO ORPHANS for all tables
   - If orphans exist, add FK constraints

6. MISSING FK INDEXES
   - ANY results here are CRITICAL performance issues
   - Run the recommended CREATE INDEX statements

7. HIGH SEQUENTIAL SCANS
   - 🔴 HIGH SEQ SCANS means missing indexes
   - Add indexes on frequently queried columns

8. UNUSED INDEXES
   - Consider dropping indexes that are never used
   - Saves storage and improves write performance

9. TABLE SIZES
   - Monitor growth over time
   - Plan partitioning for large tables

10. RLS POLICIES
    - Ensure user tables (investments, portfolios) have policies
    - Service role should have full access

Next Steps:
1. Fix any 🔴 CRITICAL issues immediately
2. Address 🟡 WARNINGS within 1 week
3. Monitor 🟢 OK items regularly

For detailed analysis, see:
/Users/sebastianbenzianolsson/Developer/quant-platform/docs/database-analysis-report.md
================================================================================
' as summary;
