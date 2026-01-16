import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scrapeAnalystRatings, NEWS_SOURCES } from '@/lib/analyst-scraper'
import { logger } from '@/lib/logger'

// Autonomous analyst ratings scraper
// Runs every 2 hours to collect new analyst ratings from press releases and news

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function GET(request: NextRequest) {
  // Verify auth
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Analyst ratings scraper called without valid CRON_SECRET')
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Configuration missing' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    const startTime = Date.now()

    // Run the scraper
    const results = await scrapeAnalystRatings(supabase)

    // Log the sync
    await supabase.from('cron_job_log').insert({
      job_name: 'sync-analyst-ratings',
      status: results.errors.length > 0 ? 'partial' : 'completed',
      details: {
        sourcesProcessed: results.sourcesProcessed,
        ratingsExtracted: results.ratingsExtracted,
        errors: results.errors,
        duration: Date.now() - startTime,
        sources: NEWS_SOURCES.map(s => s.name)
      }
    })

    return NextResponse.json({
      success: true,
      summary: {
        sourcesProcessed: results.sourcesProcessed,
        ratingsExtracted: results.ratingsExtracted,
        errorCount: results.errors.length,
        duration: Date.now() - startTime
      },
      sources: NEWS_SOURCES.map(s => s.name),
      errors: results.errors
    })
  } catch (error) {
    logger.error('Analyst ratings scraper error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({
      error: 'Scraper failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Manual POST endpoint to scrape specific news URL
export async function POST(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Configuration missing' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { url, title, description, source } = body

    if (!title && !description) {
      return NextResponse.json({ error: 'title or description required' }, { status: 400 })
    }

    const { extractAnalystRatings, storeRating, markSourceProcessed } = await import('@/lib/analyst-scraper')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const newsItem = {
      title: title || '',
      description: description || '',
      link: url || '',
      pubDate: new Date().toISOString(),
      source: source || 'manual',
      sourceType: 'manual'
    }

    const ratings = extractAnalystRatings(newsItem)

    let stored = 0
    for (const rating of ratings) {
      if (await storeRating(supabase, rating, newsItem)) {
        stored++
      }
    }

    if (url) {
      await markSourceProcessed(supabase, newsItem, stored)
    }

    return NextResponse.json({
      success: true,
      ratingsExtracted: ratings.length,
      ratingsStored: stored,
      ratings: ratings.map(r => ({
        ticker: r.ticker,
        firm: r.firmName,
        analyst: r.analystName,
        rating: r.rating,
        priceTarget: r.priceTarget,
        confidence: r.confidence
      }))
    })
  } catch (error) {
    logger.error('Manual extraction error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({
      error: 'Extraction failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
