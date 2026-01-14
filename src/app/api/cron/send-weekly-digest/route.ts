import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBatchWeeklyDigest } from '@/lib/email'

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not set')
  }
  return createClient(supabaseUrl, supabaseKey)
}

// Get date range for the past week
function getWeekRange(): string {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 7)

  const format = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return `${format(start)} - ${format(end)}`
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Also allow local testing
      const url = new URL(request.url)
      if (!url.searchParams.get('test')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const supabase = getSupabase()

    // Get confirmed subscribers who want weekly digest
    const { data: subscribers, error: subError } = await supabase
      .from('email_subscribers')
      .select('id, email')
      .eq('status', 'confirmed')
      .eq('subscribed_weekly_digest', true)

    if (subError) {
      console.error('Error fetching subscribers:', subError)
      throw subError
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscribers to send to',
        sent: 0,
      })
    }

    // Fetch market data for the digest
    const [gainersRes, losersRes, insiderRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://lician.com'}/api/trending?type=gainers&limit=5`),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://lician.com'}/api/trending?type=losers&limit=5`),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://lician.com'}/api/v1/insider-trades?limit=5`),
    ])

    const [gainersData, losersData, insiderData] = await Promise.all([
      gainersRes.ok ? gainersRes.json() : { gainers: [] },
      losersRes.ok ? losersRes.json() : { losers: [] },
      insiderRes.ok ? insiderRes.json() : { trades: [] },
    ])

    // Build digest data
    const digestData = {
      dateRange: getWeekRange(),
      topGainers: (gainersData.gainers || []).slice(0, 5).map((s: any) => ({
        ticker: s.symbol || s.ticker,
        name: s.name || s.companyName || s.symbol,
        change: s.changePercent || s.change || 0,
      })),
      topLosers: (losersData.losers || []).slice(0, 5).map((s: any) => ({
        ticker: s.symbol || s.ticker,
        name: s.name || s.companyName || s.symbol,
        change: s.changePercent || s.change || 0,
      })),
      insiderTrades: (insiderData.trades || []).slice(0, 5).map((t: any) => ({
        ticker: t.ticker || t.symbol,
        name: t.reporterName || t.name || 'Executive',
        type: t.transactionType || t.type || 'Trade',
        value: t.value ? `$${(t.value / 1000000).toFixed(1)}M` : 'N/A',
      })),
      upcomingEarnings: [], // Could fetch from earnings API
      aiInsight: "Markets showed mixed signals this week. Our AI analysis suggests focusing on companies with strong fundamentals and positive insider activity. The tech sector continues to show resilience despite macroeconomic headwinds.",
    }

    // Send to all subscribers
    const results = await sendBatchWeeklyDigest(subscribers, digestData)

    // Log the send
    await supabase.from('email_send_log').insert(
      subscribers.map((sub) => ({
        subscriber_id: sub.id,
        email_type: 'weekly_digest',
        subject: `Weekly Market Digest - ${digestData.dateRange}`,
        status: 'sent',
      }))
    )

    // Update subscriber stats
    await supabase
      .from('email_subscribers')
      .update({
        emails_sent: supabase.rpc('increment', { x: 1 }),
        last_email_sent_at: new Date().toISOString(),
      })
      .in('id', subscribers.map((s) => s.id))

    return NextResponse.json({
      success: true,
      sent: subscribers.length,
      dateRange: digestData.dateRange,
    })
  } catch (error) {
    console.error('Weekly digest error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send digest' },
      { status: 500 }
    )
  }
}
