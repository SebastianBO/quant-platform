import { NextRequest, NextResponse } from 'next/server'

// Cache for og:image URLs (in-memory, resets on cold start)
const imageCache = new Map<string, string | null>()

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 })
  }

  // Check cache first
  if (imageCache.has(url)) {
    const cached = imageCache.get(url)
    return NextResponse.json({ image: cached, cached: true })
  }

  try {
    // Fetch the article page with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000) // 3 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Lician/1.0; +https://lician.com)',
        'Accept': 'text/html',
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      imageCache.set(url, null)
      return NextResponse.json({ image: null, error: 'Failed to fetch' })
    }

    const html = await response.text()

    // Extract og:image
    let image: string | null = null

    // Try og:image first
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)

    if (ogMatch) {
      image = ogMatch[1]
    }

    // Try twitter:image as fallback
    if (!image) {
      const twitterMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i)

      if (twitterMatch) {
        image = twitterMatch[1]
      }
    }

    // Validate image URL
    if (image) {
      // Make relative URLs absolute
      if (image.startsWith('/')) {
        const urlObj = new URL(url)
        image = `${urlObj.origin}${image}`
      }

      // Skip small icons or tracking pixels
      if (image.includes('favicon') || image.includes('logo') && image.includes('16')) {
        image = null
      }
    }

    // Cache the result
    imageCache.set(url, image)

    // Limit cache size
    if (imageCache.size > 500) {
      const firstKey = imageCache.keys().next().value
      if (firstKey) imageCache.delete(firstKey)
    }

    return NextResponse.json({
      image,
      cached: false
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    })

  } catch (error) {
    // On timeout or error, return null
    imageCache.set(url, null)
    return NextResponse.json({ image: null, error: 'Timeout or error' })
  }
}
