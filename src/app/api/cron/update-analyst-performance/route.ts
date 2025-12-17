import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Update analyst performance metrics
// Runs daily to calculate returns on past ratings and update analyst rankings

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const EODHD_API_KEY = process.env.EODHD_API_KEY || ""

async function getStockPrice(ticker: string, date?: string): Promise<number | null> {
  try {
    // Use EODHD for historical prices
    const url = date
      ? `https://eodhd.com/api/eod/${ticker}.US?api_token=${EODHD_API_KEY}&from=${date}&to=${date}&fmt=json`
      : `https://eodhd.com/api/real-time/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json`

    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()

    if (date && Array.isArray(data) && data.length > 0) {
      return data[0].close
    } else if (!date && data?.close) {
      return data.close
    }

    return null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('Analyst performance update called without valid CRON_SECRET')
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Configuration missing' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    const startTime = Date.now()
    let ratingsUpdated = 0
    let analystsUpdated = 0

    // Get ratings that need performance updates
    // (ratings older than 1 day that don't have return_1d, etc.)
    const today = new Date()
    const oneDay = new Date(today)
    oneDay.setDate(oneDay.getDate() - 1)
    const oneWeek = new Date(today)
    oneWeek.setDate(oneWeek.getDate() - 7)
    const oneMonth = new Date(today)
    oneMonth.setMonth(oneMonth.getMonth() - 1)
    const threeMonths = new Date(today)
    threeMonths.setMonth(threeMonths.getMonth() - 3)

    // Update 1-day returns for ratings from yesterday
    const { data: dayOldRatings } = await supabase
      .from('analyst_ratings')
      .select('id, ticker, price_at_rating, rating_date')
      .lte('rating_date', oneDay.toISOString().split('T')[0])
      .is('return_1d', null)
      .limit(100)

    for (const rating of dayOldRatings || []) {
      const currentPrice = await getStockPrice(rating.ticker)
      if (currentPrice && rating.price_at_rating) {
        const return1d = (currentPrice - rating.price_at_rating) / rating.price_at_rating
        await supabase
          .from('analyst_ratings')
          .update({
            price_1d: currentPrice,
            return_1d: return1d
          })
          .eq('id', rating.id)
        ratingsUpdated++
      }
      await new Promise(r => setTimeout(r, 100)) // Rate limit
    }

    // Update 1-week returns for ratings from a week ago
    const { data: weekOldRatings } = await supabase
      .from('analyst_ratings')
      .select('id, ticker, price_at_rating, rating_date')
      .lte('rating_date', oneWeek.toISOString().split('T')[0])
      .is('return_1w', null)
      .not('price_at_rating', 'is', null)
      .limit(50)

    for (const rating of weekOldRatings || []) {
      const currentPrice = await getStockPrice(rating.ticker)
      if (currentPrice && rating.price_at_rating) {
        const return1w = (currentPrice - rating.price_at_rating) / rating.price_at_rating
        await supabase
          .from('analyst_ratings')
          .update({
            price_1w: currentPrice,
            return_1w: return1w
          })
          .eq('id', rating.id)
        ratingsUpdated++
      }
      await new Promise(r => setTimeout(r, 100))
    }

    // Update 1-month returns
    const { data: monthOldRatings } = await supabase
      .from('analyst_ratings')
      .select('id, ticker, price_at_rating, rating_date')
      .lte('rating_date', oneMonth.toISOString().split('T')[0])
      .is('return_1m', null)
      .not('price_at_rating', 'is', null)
      .limit(50)

    for (const rating of monthOldRatings || []) {
      const currentPrice = await getStockPrice(rating.ticker)
      if (currentPrice && rating.price_at_rating) {
        const return1m = (currentPrice - rating.price_at_rating) / rating.price_at_rating
        await supabase
          .from('analyst_ratings')
          .update({
            price_1m: currentPrice,
            return_1m: return1m
          })
          .eq('id', rating.id)
        ratingsUpdated++
      }
      await new Promise(r => setTimeout(r, 100))
    }

    // Update 3-month returns
    const { data: threeMonthOldRatings } = await supabase
      .from('analyst_ratings')
      .select('id, ticker, price_at_rating, rating_date')
      .lte('rating_date', threeMonths.toISOString().split('T')[0])
      .is('return_3m', null)
      .not('price_at_rating', 'is', null)
      .limit(50)

    for (const rating of threeMonthOldRatings || []) {
      const currentPrice = await getStockPrice(rating.ticker)
      if (currentPrice && rating.price_at_rating) {
        const return3m = (currentPrice - rating.price_at_rating) / rating.price_at_rating
        await supabase
          .from('analyst_ratings')
          .update({
            price_3m: currentPrice,
            return_3m: return3m
          })
          .eq('id', rating.id)
        ratingsUpdated++
      }
      await new Promise(r => setTimeout(r, 100))
    }

    // Fill in price_at_rating for any ratings missing it
    const { data: missingPriceRatings } = await supabase
      .from('analyst_ratings')
      .select('id, ticker, rating_date')
      .is('price_at_rating', null)
      .limit(50)

    for (const rating of missingPriceRatings || []) {
      const price = await getStockPrice(rating.ticker, rating.rating_date)
      if (price) {
        await supabase
          .from('analyst_ratings')
          .update({ price_at_rating: price })
          .eq('id', rating.id)
      }
      await new Promise(r => setTimeout(r, 100))
    }

    // Update analyst aggregate performance
    const { data: analysts } = await supabase
      .from('analysts')
      .select('id')

    for (const analyst of analysts || []) {
      // Get aggregate stats for this analyst
      const { data: stats } = await supabase
        .from('analyst_ratings')
        .select('rating, return_1m')
        .eq('analyst_id', analyst.id)
        .not('return_1m', 'is', null)

      if (stats && stats.length > 0) {
        const total = stats.length
        const successful = stats.filter(s => {
          const isBuy = ['Buy', 'Strong Buy', 'Outperform', 'Overweight'].includes(s.rating)
          const isSell = ['Sell', 'Underperform', 'Underweight'].includes(s.rating)
          const isHold = s.rating === 'Hold'

          if (isBuy && s.return_1m > 0) return true
          if (isSell && s.return_1m < 0) return true
          if (isHold && Math.abs(s.return_1m) < 0.05) return true
          return false
        }).length

        const avgReturn = stats.reduce((sum, s) => sum + (s.return_1m || 0), 0) / total
        const successRate = total > 0 ? successful / total : 0

        await supabase
          .from('analysts')
          .update({
            total_ratings: total,
            successful_ratings: successful,
            average_return: avgReturn,
            success_rate: successRate,
            rank_score: successRate * Math.log(total + 1), // Score considers both accuracy and volume
            updated_at: new Date().toISOString()
          })
          .eq('id', analyst.id)

        analystsUpdated++
      }
    }

    // Log the job
    await supabase.from('cron_job_log').insert({
      job_name: 'update-analyst-performance',
      status: 'completed',
      details: {
        ratingsUpdated,
        analystsUpdated,
        duration: Date.now() - startTime
      }
    })

    return NextResponse.json({
      success: true,
      summary: {
        ratingsUpdated,
        analystsUpdated,
        duration: Date.now() - startTime
      }
    })
  } catch (error) {
    console.error('Analyst performance update error:', error)
    return NextResponse.json({
      error: 'Update failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
