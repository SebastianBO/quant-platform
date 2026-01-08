import { streamText, createGateway } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { financialTools } from '@/lib/ai/tools'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

// Simple in-memory rate limiting (resets on deploy)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // 10 requests per window
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

// Lazy-load Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseClient
}

// Vercel AI Gateway - using API key
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY!,
})

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return ip
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT - 1 }
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT - record.count }
}

// RAG: Fetch relevant context from Supabase based on query
async function fetchRelevantContext(query: string): Promise<string> {
  try {
    const supabase = getSupabase()
    const tickerMatch = query.match(/\b([A-Z]{1,5})\b/g)
    const potentialTickers = tickerMatch?.slice(0, 3) || []

    let context = ''

    if (potentialTickers.length > 0) {
      const { data: fundamentals } = await supabase
        .from('company_fundamentals')
        .select('ticker, company_name, sector, industry, market_cap, pe_ratio, eps, revenue, description')
        .in('ticker', potentialTickers)
        .limit(3)

      if (fundamentals && fundamentals.length > 0) {
        context += '\n\n## Relevant Company Data:\n'
        type Fundamental = Record<string, unknown>
        for (const f of fundamentals as Fundamental[]) {
          context += `\n### ${f.company_name} (${f.ticker})\n`
          context += `- Sector: ${f.sector || 'N/A'} | Industry: ${f.industry || 'N/A'}\n`
          context += `- Market Cap: $${f.market_cap ? ((f.market_cap as number) / 1e9).toFixed(2) + 'B' : 'N/A'}\n`
          context += `- P/E Ratio: ${(f.pe_ratio as number)?.toFixed(2) || 'N/A'} | EPS: $${(f.eps as number)?.toFixed(2) || 'N/A'}\n`
          if (f.description) {
            context += `- Description: ${(f.description as string).substring(0, 200)}...\n`
          }
        }
      }
    }

    return context
  } catch (error) {
    console.error('RAG context fetch error:', error)
    return ''
  }
}

const SYSTEM_PROMPT = `You are Lician AI, an expert financial analyst assistant on lician.com - a comprehensive stock analysis platform.

You have access to tools to fetch real financial data including stock quotes, company fundamentals, financial statements, insider trading, institutional ownership, analyst ratings, short interest, biotech catalysts, stock search, market movers, stock comparison, and web scraping.

When users ask about stocks:
1. Use your tools to get real data
2. Be specific with numbers
3. Be concise (2-3 paragraphs)
4. Present balanced bull/bear cases
5. Remind users this is not financial advice

About Lician: Free stock quotes, AI research tools, portfolio tracking at /portfolio, stock screener at /screener.`

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req)
  const { allowed, remaining } = checkRateLimit(rateLimitKey)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Sign up for unlimited AI access!', upgrade_url: '/premium' },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
    )
  }

  try {
    const { messages } = await req.json()

    // Get RAG context
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
    const userQuery = lastUserMessage?.content || ''
    const ragContext = await fetchRelevantContext(userQuery)

    const enhancedSystemPrompt = ragContext
      ? `${SYSTEM_PROMPT}\n\n## Pre-loaded Context:${ragContext}`
      : SYSTEM_PROMPT

    // Use Llama 3.3-70B via Vercel AI Gateway
    const result = streamText({
      model: gateway('meta/llama-3.3-70b'),
      system: enhancedSystemPrompt,
      messages,
      tools: financialTools,
      toolChoice: 'auto',
    })

    return result.toTextStreamResponse({
      headers: { 'X-RateLimit-Remaining': String(remaining) }
    })
  } catch (error) {
    console.error('Public chat error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
