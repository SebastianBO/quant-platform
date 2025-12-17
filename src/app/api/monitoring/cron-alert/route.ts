import { NextRequest, NextResponse } from 'next/server'

interface CronHealthAlert {
  scheduler_alive: boolean
  total_jobs: number
  active_jobs: number
  failed_jobs_1h: number
  stale_jobs: number
  checked_at: string
  alert_reason?: string
}

export async function POST(req: NextRequest) {
  try {
    const alert: CronHealthAlert = await req.json()

    console.error('[CRON ALERT]', JSON.stringify(alert, null, 2))

    // Build alert message
    const messages: string[] = []

    if (!alert.scheduler_alive) {
      messages.push('CRITICAL: pg_cron scheduler is DOWN!')
    }

    if (alert.failed_jobs_1h > 5) {
      messages.push(`WARNING: ${alert.failed_jobs_1h} cron jobs failed in the last hour`)
    }

    if (alert.stale_jobs > 0) {
      messages.push(`WARNING: ${alert.stale_jobs} daily jobs haven't run in 25+ hours`)
    }

    const alertMessage = messages.join('\n')

    // Log to database for admin dashboard visibility
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      await fetch(`${supabaseUrl}/rest/v1/cron_job_log`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          job_name: 'cron-health-alert',
          status: 'alert',
          details: {
            ...alert,
            alert_message: alertMessage,
          },
        }),
      })
    }

    // TODO: Add your preferred alerting integrations here:
    // - Slack webhook
    // - Discord webhook
    // - Email via Resend/SendGrid
    // - PagerDuty
    // - SMS via Twilio

    // Example Slack integration (uncomment and add webhook URL):
    // const slackWebhook = process.env.SLACK_WEBHOOK_URL
    // if (slackWebhook && alertMessage) {
    //   await fetch(slackWebhook, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       text: `🚨 *Lician Cron Alert*\n${alertMessage}`,
    //       attachments: [{
    //         color: alert.scheduler_alive ? 'warning' : 'danger',
    //         fields: [
    //           { title: 'Total Jobs', value: String(alert.total_jobs), short: true },
    //           { title: 'Active Jobs', value: String(alert.active_jobs), short: true },
    //           { title: 'Failed (1h)', value: String(alert.failed_jobs_1h), short: true },
    //           { title: 'Stale Jobs', value: String(alert.stale_jobs), short: true },
    //         ],
    //       }],
    //     }),
    //   })
    // }

    return NextResponse.json({
      received: true,
      alert_sent: alertMessage.length > 0,
      message: alertMessage || 'No critical issues',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron alert processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process alert' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'cron-alert-receiver',
    timestamp: new Date().toISOString(),
  })
}
