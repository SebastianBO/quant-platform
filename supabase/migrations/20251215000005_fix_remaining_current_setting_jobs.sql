-- Fix remaining 10 cron jobs that use current_setting()
-- These jobs call Edge Functions that either don't exist or should use Vercel API endpoints

-- ============================================
-- UNSCHEDULE JOBS CALLING NON-EXISTENT EDGE FUNCTIONS
-- ============================================

-- These Edge Functions don't exist in supabase/functions/

-- 1. daily-short-volume-update - calls non-existent Edge Function
-- We already have sync-short-volume-daily that works via Vercel API
SELECT cron.unschedule('daily-short-volume-update')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-short-volume-update');

-- 2. weekly-comprehensive-update - calls automated-data-updater (doesn't exist)
SELECT cron.unschedule('weekly-comprehensive-update')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-comprehensive-update');

-- 3. sync-financial-weekly - calls auto-financial-sync (doesn't exist)
-- We have sync-financials-daily and sync-financials-continuous
SELECT cron.unschedule('sync-financial-weekly')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-financial-weekly');

-- 4. discover-symbols-monthly - calls auto-financial-sync (doesn't exist)
SELECT cron.unschedule('discover-symbols-monthly')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'discover-symbols-monthly');

-- 5. sync-fundamentals-quarterly - calls auto-financial-sync (doesn't exist)
SELECT cron.unschedule('sync-fundamentals-quarterly')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-fundamentals-quarterly');

-- 6. weekly-historical-earnings - calls auto-financial-sync (doesn't exist)
SELECT cron.unschedule('weekly-historical-earnings')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-historical-earnings');

-- 7-10. SEO jobs calling Edge Functions that may or may not exist
-- These use current_setting() with fallback but still unreliable
SELECT cron.unschedule('seo-autonomous-orchestrator')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'seo-autonomous-orchestrator');

SELECT cron.unschedule('seo-regenerate-sitemaps')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'seo-regenerate-sitemaps');

SELECT cron.unschedule('seo-performance-monitor')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'seo-performance-monitor');

SELECT cron.unschedule('seo-error-handler')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'seo-error-handler');

-- ============================================
-- LOG THIS CLEANUP
-- ============================================

INSERT INTO cron_job_log (job_name, status, details)
VALUES (
  'migration-fix-current-setting-jobs',
  'completed',
  jsonb_build_object(
    'message', 'Removed 10 cron jobs using current_setting() that called non-existent Edge Functions',
    'jobs_removed', ARRAY[
      'daily-short-volume-update',
      'weekly-comprehensive-update',
      'sync-financial-weekly',
      'discover-symbols-monthly',
      'sync-fundamentals-quarterly',
      'weekly-historical-earnings',
      'seo-autonomous-orchestrator',
      'seo-regenerate-sitemaps',
      'seo-performance-monitor',
      'seo-error-handler'
    ],
    'reason', 'Jobs used current_setting() to access non-configured parameters and called non-existent Edge Functions',
    'working_alternatives', jsonb_build_object(
      'short_volume', 'sync-short-volume-daily (Vercel API)',
      'financials', 'sync-financials-daily, sync-financials-continuous (Vercel API)',
      'seo', 'update-seo-pages-hourly, update-data-freshness (direct SQL)'
    ),
    'version', '20251215000005'
  )
);

-- ============================================
-- SUMMARY OF WORKING CRON JOBS
-- ============================================

-- After this migration, all remaining cron jobs should be:
-- 1. Using direct Vercel API calls (https://lician.com/api/cron/*)
-- 2. Using direct SQL statements
-- 3. NOT using current_setting() or Edge Function calls with auth
