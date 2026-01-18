/**
 * Company Assets Sync Script
 *
 * Fetches and stores company logos and CEO information:
 * - Logos from Clearbit (using domain lookup)
 * - Logos from EODHD as fallback
 * - CEO photos from LinkedIn or company websites
 * - Stores images in Supabase Storage
 * - Updates the company_assets table
 *
 * Usage:
 *   npx tsx scripts/sync-company-assets.ts             # Sync all companies missing logos
 *   npx tsx scripts/sync-company-assets.ts --force     # Re-sync all companies
 *   npx tsx scripts/sync-company-assets.ts AAPL MSFT   # Sync specific tickers
 */

import { createClient } from "@supabase/supabase-js"

// =============================================================================
// CONFIGURATION
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wcckhqxkmhyzfpynthte.supabase.co"
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjY2tocXhrbWh5emZweW50aHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQ4MzMyMiwiZXhwIjoyMDYxMDU5MzIyfQ.JpvVhcIJsWFrEJntLhKBba0E0F4M-pJzFocIUw3O_N4"
const EODHD_API_KEY = process.env.EODHD_API_KEY || "685d904ef1c904.48487943"

const STORAGE_BUCKET = "company-assets"
const BATCH_SIZE = 10 // Process 10 companies at a time
const DELAY_MS = 200 // 200ms between requests to avoid rate limiting

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// =============================================================================
// TYPES
// =============================================================================

interface CompanyAsset {
  id?: string
  ticker: string
  exchange: string
  logo_url?: string | null
  logo_light_url?: string | null
  logo_dark_url?: string | null
  icon_url?: string | null
  ceo_name?: string | null
  ceo_photo_url?: string | null
  ceo_linkedin_url?: string | null
  ceo_title?: string | null
  website_url?: string | null
  domain?: string | null
  source?: string
  last_synced_at?: string
}

interface SyncResult {
  ticker: string
  success: boolean
  logoSynced: boolean
  ceoSynced: boolean
  error?: string
}

// =============================================================================
// LOGO FETCHING
// =============================================================================

/**
 * Fetch logo from Clearbit using domain
 * Returns the image buffer if successful
 */
async function fetchClearbitLogo(domain: string, size: number = 128): Promise<Buffer | null> {
  const url = `https://logo.clearbit.com/${domain}?size=${size}`
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
      }
    })

    if (!response.ok) {
      console.log(`  Clearbit: No logo for ${domain} (${response.status})`)
      return null
    }

    const contentType = response.headers.get("content-type")
    if (!contentType?.includes("image")) {
      console.log(`  Clearbit: Invalid content type for ${domain}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log(`  Clearbit: Got logo for ${domain} (${arrayBuffer.byteLength} bytes)`)
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.log(`  Clearbit: Failed for ${domain}:`, error instanceof Error ? error.message : "Unknown")
    return null
  }
}

/**
 * Fetch logo from EODHD (fallback)
 */
async function fetchEODHDLogo(ticker: string): Promise<Buffer | null> {
  const url = `https://eodhistoricaldata.com/img/logos/US/${ticker.toUpperCase()}.png`
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
      }
    })

    if (!response.ok) {
      console.log(`  EODHD: No logo for ${ticker} (${response.status})`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    if (arrayBuffer.byteLength < 500) {
      // Too small, probably a placeholder
      console.log(`  EODHD: Logo too small for ${ticker}`)
      return null
    }

    console.log(`  EODHD: Got logo for ${ticker} (${arrayBuffer.byteLength} bytes)`)
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.log(`  EODHD: Failed for ${ticker}:`, error instanceof Error ? error.message : "Unknown")
    return null
  }
}

/**
 * Fetch CEO info from EODHD fundamentals API
 */
async function fetchEODHDCeoInfo(ticker: string): Promise<{ name: string; title?: string } | null> {
  const url = `https://eodhd.com/api/fundamentals/${ticker}.US?api_token=${EODHD_API_KEY}&filter=General&fmt=json`
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()
    const ceo = data?.Officers?.["0"]

    if (ceo?.Name) {
      return {
        name: ceo.Name,
        title: ceo.Title || "Chief Executive Officer"
      }
    }

    // Fallback to General.CEO
    if (data?.CEO) {
      return {
        name: data.CEO,
        title: "Chief Executive Officer"
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Upload image to Supabase Storage
 * Returns the public URL
 */
async function uploadToStorage(
  buffer: Buffer,
  path: string,
  contentType: string = "image/png"
): Promise<string | null> {
  try {
    // Check if file already exists and remove it
    await supabase.storage.from(STORAGE_BUCKET).remove([path])

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType,
        cacheControl: "31536000", // 1 year cache
        upsert: true
      })

    if (error) {
      console.log(`  Storage upload failed for ${path}:`, error.message)
      return null
    }

    // Get public URL
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    return data.publicUrl
  } catch (error) {
    console.log(`  Storage error:`, error instanceof Error ? error.message : "Unknown")
    return null
  }
}

// =============================================================================
// SYNC LOGIC
// =============================================================================

/**
 * Sync assets for a single company
 */
async function syncCompanyAssets(asset: CompanyAsset): Promise<SyncResult> {
  const { ticker, domain } = asset
  console.log(`\nSyncing ${ticker}...`)

  let logoSynced = false
  let ceoSynced = false
  let logoUrl: string | null = null
  let source = "manual"

  // 1. Try to fetch logo from Clearbit (if we have a domain)
  if (domain) {
    const clearbitLogo = await fetchClearbitLogo(domain)
    if (clearbitLogo) {
      const path = `logos/${ticker.toLowerCase()}.png`
      logoUrl = await uploadToStorage(clearbitLogo, path)
      if (logoUrl) {
        logoSynced = true
        source = "clearbit"
      }
    }
  }

  // 2. Fallback to EODHD
  if (!logoSynced) {
    const eohdLogo = await fetchEODHDLogo(ticker)
    if (eohdLogo) {
      const path = `logos/${ticker.toLowerCase()}.png`
      logoUrl = await uploadToStorage(eohdLogo, path)
      if (logoUrl) {
        logoSynced = true
        source = "eodhd"
      }
    }
  }

  // 3. Fetch CEO info from EODHD if not already set
  let ceoName = asset.ceo_name
  let ceoTitle = asset.ceo_title
  if (!ceoName) {
    const ceoInfo = await fetchEODHDCeoInfo(ticker)
    if (ceoInfo) {
      ceoName = ceoInfo.name
      ceoTitle = ceoInfo.title
      ceoSynced = true
      console.log(`  CEO: ${ceoName}`)
    }
  }

  // 4. Update the database
  const updateData: Partial<CompanyAsset> = {
    last_synced_at: new Date().toISOString(),
    source
  }

  if (logoUrl) {
    updateData.logo_url = logoUrl
    // Also set icon_url to same image for now
    updateData.icon_url = logoUrl
  }

  if (ceoName) {
    updateData.ceo_name = ceoName
    updateData.ceo_title = ceoTitle
  }

  const { error } = await supabase
    .from("company_assets")
    .update(updateData)
    .eq("ticker", ticker)

  if (error) {
    console.log(`  DB update failed:`, error.message)
    return {
      ticker,
      success: false,
      logoSynced: false,
      ceoSynced: false,
      error: error.message
    }
  }

  console.log(`  Done: logo=${logoSynced}, ceo=${ceoSynced}`)
  return {
    ticker,
    success: true,
    logoSynced,
    ceoSynced
  }
}

/**
 * Get all companies that need syncing
 */
async function getCompaniesToSync(force: boolean, specificTickers?: string[]): Promise<CompanyAsset[]> {
  let query = supabase.from("company_assets").select("*")

  if (specificTickers && specificTickers.length > 0) {
    // Sync specific tickers
    query = query.in("ticker", specificTickers.map(t => t.toUpperCase()))
  } else if (!force) {
    // Only sync companies without logos
    query = query.is("logo_url", null)
  }

  // Order by ticker for consistent processing
  query = query.order("ticker", { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error("Failed to fetch companies:", error.message)
    return []
  }

  return data || []
}

/**
 * Ensure the storage bucket exists
 */
async function ensureStorageBucket(): Promise<boolean> {
  try {
    // Try to get bucket
    const { data: buckets } = await supabase.storage.listBuckets()
    const exists = buckets?.some(b => b.name === STORAGE_BUCKET)

    if (!exists) {
      console.log(`Creating storage bucket: ${STORAGE_BUCKET}`)
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        allowedMimeTypes: ["image/png", "image/jpeg", "image/svg+xml", "image/webp"],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      })

      if (error) {
        console.error("Failed to create bucket:", error.message)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Bucket check failed:", error)
    return false
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const startTime = Date.now()
  console.log("=".repeat(60))
  console.log("COMPANY ASSETS SYNC")
  console.log("=".repeat(60))

  // Parse command line arguments
  const args = process.argv.slice(2)
  const force = args.includes("--force")
  const specificTickers = args.filter(a => !a.startsWith("--"))

  if (force) {
    console.log("Mode: Force re-sync all companies")
  } else if (specificTickers.length > 0) {
    console.log(`Mode: Sync specific tickers: ${specificTickers.join(", ")}`)
  } else {
    console.log("Mode: Sync companies missing logos")
  }

  // Ensure storage bucket exists
  const bucketReady = await ensureStorageBucket()
  if (!bucketReady) {
    console.error("\nFailed to initialize storage bucket. Exiting.")
    process.exit(1)
  }

  // Get companies to sync
  const companies = await getCompaniesToSync(force, specificTickers.length > 0 ? specificTickers : undefined)
  console.log(`\nFound ${companies.length} companies to sync`)

  if (companies.length === 0) {
    console.log("\nNo companies to sync. Done!")
    return
  }

  // Process in batches
  const results: SyncResult[] = []
  let processed = 0

  for (let i = 0; i < companies.length; i += BATCH_SIZE) {
    const batch = companies.slice(i, i + BATCH_SIZE)

    for (const company of batch) {
      const result = await syncCompanyAssets(company)
      results.push(result)
      processed++

      // Progress update
      if (processed % 10 === 0) {
        const elapsed = (Date.now() - startTime) / 1000
        const rate = processed / elapsed
        const remaining = companies.length - processed
        const eta = Math.round(remaining / rate)
        console.log(`\nProgress: ${processed}/${companies.length} (${(processed / companies.length * 100).toFixed(1)}%) | ETA: ${eta}s`)
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, DELAY_MS))
    }
  }

  // Summary
  const totalTime = Math.round((Date.now() - startTime) / 1000)
  const successful = results.filter(r => r.success).length
  const logosAdded = results.filter(r => r.logoSynced).length
  const ceosAdded = results.filter(r => r.ceoSynced).length
  const failed = results.filter(r => !r.success)

  console.log("\n" + "=".repeat(60))
  console.log("SYNC COMPLETE")
  console.log("=".repeat(60))
  console.log(`Total processed: ${results.length}`)
  console.log(`Successful: ${successful}`)
  console.log(`Logos added: ${logosAdded}`)
  console.log(`CEOs added: ${ceosAdded}`)
  console.log(`Failed: ${failed.length}`)
  console.log(`Time: ${totalTime} seconds`)

  if (failed.length > 0) {
    console.log("\nFailed companies:")
    failed.forEach(f => console.log(`  - ${f.ticker}: ${f.error}`))
  }

  // Final stats from database
  const { count: totalAssets } = await supabase
    .from("company_assets")
    .select("*", { count: "exact", head: true })

  const { count: withLogos } = await supabase
    .from("company_assets")
    .select("*", { count: "exact", head: true })
    .not("logo_url", "is", null)

  console.log(`\nDatabase stats:`)
  console.log(`  Total company assets: ${totalAssets}`)
  console.log(`  With logos: ${withLogos}`)
}

main().catch(console.error)
