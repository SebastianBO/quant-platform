#!/usr/bin/env node
/**
 * Check Supabase pg_cron status
 * Run: node scripts/check-cron-status.js
 */

const SUPABASE_URL = 'https://wcckhqxkmhyzfpynthte.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjY2tocXhrbWh5emZweW50aHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQ4MzMyMiwiZXhwIjoyMDYxMDU5MzIyfQ.JpvVhcIJsWFrEJntLhKBba0E0F4M-pJzFocIUw3O_N4'

async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql })
  })

  if (!response.ok) {
    // Try direct query via PostgREST
    return null
  }
  return response.json()
}

async function checkCronScheduler() {
  console.log('\n🔍 SUPABASE PG_CRON DIAGNOSTIC REPORT\n')
  console.log('='.repeat(60))

  // Check 1: Query cron.job table via PostgREST (if exposed)
  console.log('\n📋 1. Checking cron.job table...')
  try {
    const jobsResponse = await fetch(`${SUPABASE_URL}/rest/v1/cron.job?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      }
    })

    if (jobsResponse.ok) {
      const jobs = await jobsResponse.json()
      console.log(`   ✅ Found ${jobs.length} cron jobs defined`)
      jobs.forEach(job => {
        console.log(`      - ${job.jobname}: ${job.schedule} [active: ${job.active}]`)
      })
    } else {
      console.log('   ⚠️  cron.job table not accessible via PostgREST (normal - it\'s in cron schema)')
    }
  } catch (e) {
    console.log('   ⚠️  Could not query cron.job:', e.message)
  }

  // Check 2: Query cron_job_log table (custom logging table)
  console.log('\n📋 2. Checking cron_job_log (custom logging table)...')
  try {
    const logsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/cron_job_log?select=*&order=executed_at.desc&limit=20`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        }
      }
    )

    if (logsResponse.ok) {
      const logs = await logsResponse.json()
      if (logs.length > 0) {
        console.log(`   ✅ Found ${logs.length} recent cron executions:`)
        logs.slice(0, 10).forEach(log => {
          const time = new Date(log.executed_at).toLocaleString()
          console.log(`      - ${log.job_name}: ${log.status} at ${time}`)
        })
      } else {
        console.log('   ❌ NO CRON EXECUTIONS LOGGED!')
        console.log('      This suggests cron jobs are NOT running.')
      }
    } else {
      console.log('   ⚠️  cron_job_log table might not exist or not accessible')
    }
  } catch (e) {
    console.log('   ⚠️  Could not query cron_job_log:', e.message)
  }

  // Check 3: Query data_freshness table
  console.log('\n📋 3. Checking data_freshness table...')
  try {
    const freshnessResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/data_freshness?select=*`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        }
      }
    )

    if (freshnessResponse.ok) {
      const freshness = await freshnessResponse.json()
      if (freshness.length > 0) {
        console.log(`   ✅ Data freshness status:`)
        freshness.forEach(f => {
          const lastSync = f.last_sync ? new Date(f.last_sync).toLocaleString() : 'NEVER'
          console.log(`      - ${f.data_type}: last sync ${lastSync}, records: ${f.record_count}`)
        })
      }
    }
  } catch (e) {
    console.log('   ⚠️  Could not query data_freshness:', e.message)
  }

  // Check 4: Query financial_sync_log for recent activity
  console.log('\n📋 4. Checking financial_sync_log...')
  try {
    const syncResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/financial_sync_log?select=*&order=synced_at.desc&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        }
      }
    )

    if (syncResponse.ok) {
      const syncs = await syncResponse.json()
      if (syncs.length > 0) {
        console.log(`   ✅ Recent sync activity:`)
        syncs.forEach(s => {
          const time = new Date(s.synced_at).toLocaleString()
          console.log(`      - ${s.ticker || s.sync_type}: ${s.status} at ${time}`)
        })
      } else {
        console.log('   ❌ No recent sync activity found')
      }
    }
  } catch (e) {
    console.log('   ⚠️  Could not query financial_sync_log:', e.message)
  }

  // Check 5: Query short_volume for latest data
  console.log('\n📋 5. Checking short_volume latest data...')
  try {
    const shortResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/short_volume?select=trade_date,ticker&order=trade_date.desc&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        }
      }
    )

    if (shortResponse.ok) {
      const shorts = await shortResponse.json()
      if (shorts.length > 0) {
        const latestDate = shorts[0].trade_date
        const daysSinceUpdate = Math.floor((Date.now() - new Date(latestDate)) / (1000 * 60 * 60 * 24))
        console.log(`   Latest short volume data: ${latestDate}`)
        if (daysSinceUpdate > 3) {
          console.log(`   ❌ DATA IS ${daysSinceUpdate} DAYS OLD - cron likely not running!`)
        } else {
          console.log(`   ✅ Data is ${daysSinceUpdate} days old (acceptable)`)
        }
      } else {
        console.log('   ❌ No short volume data found')
      }
    }
  } catch (e) {
    console.log('   ⚠️  Could not query short_volume:', e.message)
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\n🔧 RECOMMENDED ACTIONS:\n')
  console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/wcckhqxkmhyzfpynthte')
  console.log('2. Go to Database > Extensions and verify pg_cron and pg_net are enabled')
  console.log('3. Run this SQL in SQL Editor to check scheduler status:')
  console.log(`
   SELECT pid, usename, application_name, backend_start, state
   FROM pg_stat_activity
   WHERE application_name ILIKE 'pg_cron scheduler';
`)
  console.log('4. If no results, do a FAST REBOOT in Settings > General')
  console.log('5. Check cron.job_run_details for execution logs:')
  console.log(`
   SELECT jobname, status, start_time, return_message
   FROM cron.job_run_details
   ORDER BY start_time DESC LIMIT 20;
`)
}

checkCronScheduler().catch(console.error)
