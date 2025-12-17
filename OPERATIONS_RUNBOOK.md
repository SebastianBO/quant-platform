# Lician Operations Runbook

> Quick reference for common operations and troubleshooting

---

## Daily Operations

### Morning Checklist (9 AM)

1. **Check Admin Dashboard** - `/admin`
   - Verify database status is "connected"
   - Check for error logs
   - Review data freshness indicators

2. **Verify Cron Jobs Ran**
   ```sql
   SELECT job_name, executed_at, status
   FROM cron_job_log
   WHERE executed_at > NOW() - INTERVAL '24 hours'
   ORDER BY executed_at DESC;
   ```

3. **Check Short Volume Data**
   ```sql
   SELECT MAX(trade_date) as latest FROM short_volume;
   -- Should be yesterday (or Friday if weekend)
   ```

---

## Common Tasks

### Manually Trigger Data Sync

**Financial Statements (Top 10 companies):**
```bash
curl -X POST https://lician.com/api/admin/sync/batch \
  -H "Content-Type: application/json" \
  -d '{"type": "financials", "limit": 10}'
```

**13F Institutional Holdings:**
```bash
curl -X POST https://lician.com/api/admin/sync/batch \
  -H "Content-Type: application/json" \
  -d '{"type": "13f", "limit": 5}'
```

**Short Volume (Last 3 days):**
```bash
curl -X POST https://lician.com/api/short-volume/backfill \
  -H "Content-Type: application/json" \
  -d '{"days": 3}'
```

**Clinical Trials:**
```bash
curl https://lician.com/api/cron/sync-biotech?batch=10
```

### Deploy Database Changes

```bash
# Create migration
supabase migration new my_change_name

# Edit the migration file in supabase/migrations/

# Push to production
supabase db push --linked

# Verify
supabase migration list --linked
```

### Check Cron Status

```bash
node scripts/check-cron-status.js
```

Or run SQL:
```sql
-- Check scheduler process
SELECT pid, application_name, state
FROM pg_stat_activity
WHERE application_name ILIKE 'pg_cron scheduler';

-- Check job definitions
SELECT jobname, schedule, active FROM cron.job;

-- Check recent runs
SELECT jobname, status, start_time, return_message
FROM cron.job_run_details
ORDER BY start_time DESC LIMIT 20;
```

---

## Troubleshooting

### Problem: Cron Jobs Not Running

**Symptoms:**
- Data not updating
- Empty tables
- `cron_job_log` has no recent entries

**Solution:**

1. Check if scheduler is alive:
   ```sql
   SELECT * FROM pg_stat_activity
   WHERE application_name ILIKE 'pg_cron scheduler';
   ```

2. If no results → **Fast Reboot**:
   - Go to Supabase Dashboard
   - Settings > General
   - Click "Restart Server" or "Fast Reboot"

3. Wait 2-3 minutes, then verify scheduler is back

### Problem: API Endpoint Returning 500

**Diagnosis:**
1. Check Vercel logs: https://vercel.com/finance-liciancoms-projects/quant-platform/logs
2. Check Supabase logs: Dashboard > Logs > API Logs

**Common Causes:**
- Missing environment variable
- Database connection timeout
- Rate limit exceeded on external API

### Problem: Stripe Webhook Failing

**Diagnosis:**
1. Go to Stripe Dashboard > Webhooks
2. Find the endpoint
3. Check "Attempts" for failures

**Common Causes:**
- Wrong webhook secret
- Endpoint URL changed
- Payload validation error

**Fix:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
2. Resend failed events from Stripe

### Problem: User Can't Connect Brokerage

**Plaid (US):**
1. Check Plaid Dashboard for errors
2. Verify `PLAID_ENV` is correct (sandbox vs production)
3. Check user's `plaid_items` table entry

**Tink (EU):**
1. Check Tink Console for errors
2. Verify callback URL is registered
3. Check `tink_connections` table

### Problem: Search Console Not Indexing

**Diagnosis:**
1. Go to Google Search Console
2. Check Coverage report
3. Use URL Inspection tool on specific pages

**Common Causes:**
- Pages returning 404/500
- noindex meta tag
- Sitemap not submitted
- Pages too slow (Core Web Vitals)

**Fix:**
1. Submit sitemaps manually
2. Request indexing for key pages
3. Fix any server errors

---

## Emergency Procedures

### Database Overload

**Symptoms:**
- Slow queries
- Connection timeouts
- High CPU in Supabase dashboard

**Immediate Actions:**
1. Identify heavy queries in Supabase > Database > Query Performance
2. Kill long-running queries:
   ```sql
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'active'
   AND query_start < NOW() - INTERVAL '5 minutes';
   ```
3. Consider upgrading compute (Supabase > Settings > Compute)

### Stripe Payment Failures

**Symptoms:**
- Users report payment not working
- Webhook errors in Stripe dashboard

**Immediate Actions:**
1. Check Stripe Status: https://status.stripe.com
2. Verify webhook endpoint is responding
3. Check API key validity
4. Review recent webhook logs

### Data Sync Completely Stopped

**Symptoms:**
- All data is stale (>24 hours old)
- No cron job logs

**Immediate Actions:**
1. Fast Reboot Supabase
2. Manually trigger key syncs:
   ```bash
   curl https://lician.com/api/cron/sync-financials?mode=priority
   curl https://lician.com/api/cron/sync-short-volume?priority=true
   ```
3. Check external API status (EODHD, SEC EDGAR)
4. Review Vercel function logs for errors

---

## Monitoring URLs

| Service | URL |
|---------|-----|
| Vercel Dashboard | https://vercel.com/finance-liciancoms-projects/quant-platform |
| Supabase Dashboard | https://supabase.com/dashboard/project/wcckhqxkmhyzfpynthte |
| Stripe Dashboard | https://dashboard.stripe.com |
| Plaid Dashboard | https://dashboard.plaid.com |
| Google Search Console | https://search.google.com/search-console |
| Admin Dashboard | https://lician.com/admin |

---

## Key Contacts & Resources

### Documentation
- Platform Docs: `/PLATFORM_DOCUMENTATION.md`
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

### Support
- Supabase: https://supabase.com/dashboard (Support tab)
- Stripe: https://support.stripe.com
- Vercel: https://vercel.com/support

---

## Cron Schedule Quick Reference

| Time (UTC) | Jobs Running |
|------------|--------------|
| 04:00 | discover-biotech-weekly (Sun) |
| 05:00 | sync-top-institutions-weekly (Sun) |
| 06:00 | sync-financials-daily, sync-13f-holdings-v2 |
| 07:00 | sync-financials-batch-v2 |
| 10:00 | sync-clinical-trials-weekday-1 (Mon-Fri) |
| 15:00 | sync-insider-trades-v2 (Mon-Fri) |
| 16:00 | sync-clinical-trials-weekday-2 (Mon-Fri) |
| 19:00 | sync-short-volume (Mon-Fri) |
| 21:00 | sync-portfolios-daily (Mon-Fri) |
| 21:30 | sync-short-volume-daily (Mon-Fri) |
| */4 hours | sync-clinical-trials-4h |
| Hourly | update-data-freshness |

---

*Last Updated: December 15, 2025*
