import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"

// =============================================================================
// COMPANY ASSETS API
// Returns company logo, CEO info, and website data with caching
// Falls back gracefully to external APIs if data is missing
// =============================================================================

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Cache duration constants
const CACHE_MAX_AGE = 86400 // 1 day browser cache
const CACHE_S_MAXAGE = 604800 // 7 days CDN cache
const CACHE_STALE_WHILE_REVALIDATE = 86400 // 1 day stale-while-revalidate

interface Props {
  params: Promise<{ symbol: string }>
}

interface CompanyAssets {
  ticker: string
  exchange: string | null
  logo: {
    url: string | null
    lightUrl: string | null
    darkUrl: string | null
    iconUrl: string | null
    source: "database" | "clearbit" | "eodhd" | null
  }
  ceo: {
    name: string | null
    photoUrl: string | null
    linkedinUrl: string | null
    title: string | null
  }
  website: {
    url: string | null
    domain: string | null
  }
  lastSynced: string | null
}

// Known domain mappings for fallback (subset of commonly requested tickers)
const TICKER_TO_DOMAIN: Record<string, string> = {
  AAPL: "apple.com",
  MSFT: "microsoft.com",
  GOOGL: "google.com",
  GOOG: "google.com",
  AMZN: "amazon.com",
  META: "meta.com",
  NVDA: "nvidia.com",
  TSLA: "tesla.com",
  AMD: "amd.com",
  INTC: "intel.com",
  CRM: "salesforce.com",
  ORCL: "oracle.com",
  ADBE: "adobe.com",
  NFLX: "netflix.com",
  JPM: "jpmorganchase.com",
  V: "visa.com",
  MA: "mastercard.com",
}

export async function GET(request: NextRequest, { params }: Props) {
  const { symbol } = await params
  const upperTicker = symbol.toUpperCase()

  try {
    // Query company_assets table
    const { data: asset, error } = await supabase
      .from("company_assets")
      .select("*")
      .eq("ticker", upperTicker)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found, which is okay
      logger.error("Company assets DB error", { ticker: upperTicker, error: error.message })
    }

    // Build response with database data or fallbacks
    const response: CompanyAssets = {
      ticker: upperTicker,
      exchange: asset?.exchange || null,
      logo: {
        url: asset?.logo_url || null,
        lightUrl: asset?.logo_light_url || null,
        darkUrl: asset?.logo_dark_url || null,
        iconUrl: asset?.icon_url || null,
        source: asset?.logo_url ? "database" : null
      },
      ceo: {
        name: asset?.ceo_name || null,
        photoUrl: asset?.ceo_photo_url || null,
        linkedinUrl: asset?.ceo_linkedin_url || null,
        title: asset?.ceo_title || null
      },
      website: {
        url: asset?.website_url || null,
        domain: asset?.domain || null
      },
      lastSynced: asset?.last_synced_at || null
    }

    // If no logo in database, provide fallback URLs for client-side use
    if (!response.logo.url) {
      const domain = asset?.domain || TICKER_TO_DOMAIN[upperTicker]

      // Generate fallback URLs that the client can try
      const fallbacks: { clearbit?: string; eodhd?: string } = {}

      if (domain) {
        fallbacks.clearbit = `https://logo.clearbit.com/${domain}?size=128`
      }
      fallbacks.eodhd = `https://eodhistoricaldata.com/img/logos/US/${upperTicker}.png`

      // Return with fallback info
      const jsonResponse = NextResponse.json({
        ...response,
        _fallbacks: fallbacks
      })

      // Shorter cache for fallback responses to encourage syncing
      jsonResponse.headers.set(
        "Cache-Control",
        `public, max-age=3600, s-maxage=7200, stale-while-revalidate=3600`
      )

      return jsonResponse
    }

    // Return response with aggressive caching (data is stable)
    const jsonResponse = NextResponse.json(response)

    jsonResponse.headers.set(
      "Cache-Control",
      `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_S_MAXAGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`
    )

    return jsonResponse
  } catch (error) {
    logger.error("Company assets API error", {
      ticker: upperTicker,
      error: error instanceof Error ? error.message : "Unknown"
    })

    // Return minimal fallback response even on error
    const fallbackDomain = TICKER_TO_DOMAIN[upperTicker]
    const errorResponse = NextResponse.json({
      ticker: upperTicker,
      exchange: null,
      logo: {
        url: null,
        lightUrl: null,
        darkUrl: null,
        iconUrl: null,
        source: null
      },
      ceo: {
        name: null,
        photoUrl: null,
        linkedinUrl: null,
        title: null
      },
      website: {
        url: null,
        domain: fallbackDomain || null
      },
      lastSynced: null,
      _fallbacks: {
        clearbit: fallbackDomain ? `https://logo.clearbit.com/${fallbackDomain}?size=128` : undefined,
        eodhd: `https://eodhistoricaldata.com/img/logos/US/${upperTicker}.png`
      }
    })

    // Short cache on errors
    errorResponse.headers.set("Cache-Control", "public, max-age=60, s-maxage=300")

    return errorResponse
  }
}

// HEAD request for cache validation
export async function HEAD(request: NextRequest, { params }: Props) {
  const { symbol } = await params
  const upperTicker = symbol.toUpperCase()

  const { data: asset } = await supabase
    .from("company_assets")
    .select("last_synced_at")
    .eq("ticker", upperTicker)
    .single()

  const response = new NextResponse(null)

  if (asset?.last_synced_at) {
    response.headers.set("Last-Modified", new Date(asset.last_synced_at).toUTCString())
  }

  response.headers.set(
    "Cache-Control",
    `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_S_MAXAGE}`
  )

  return response
}
