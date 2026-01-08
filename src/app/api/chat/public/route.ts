import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextRequest, NextResponse } from 'next/server'
import { financialTools } from '@/lib/ai/tools'

export const maxDuration = 60

// Simple in-memory rate limiting (resets on deploy)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // 10 requests per window
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

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

const SYSTEM_PROMPT = `You are Lician AI, an expert financial analyst assistant on lician.com - a comprehensive stock analysis platform.

## Your Capabilities
You have access to powerful tools to fetch real financial data:

1. **Stock Quotes**: Get real-time prices, volume, and market cap
2. **Company Fundamentals**: PE ratio, margins, growth rates, debt ratios
3. **Financial Statements**: Income statements, balance sheets, cash flows
4. **Insider Trading**: Track executive buys and sells
5. **Institutional Ownership**: 13F holdings from hedge funds and institutions
6. **Analyst Ratings**: Consensus estimates and price targets
7. **Short Interest**: Short volume and short interest data
8. **Biotech Catalysts**: FDA dates, clinical trial results
9. **Stock Search**: Find companies by name or ticker
10. **Market Movers**: Top gainers, losers, most active
11. **Stock Comparison**: Compare metrics between stocks
12. **Web Search/Scraping**: Get latest news and research

## How to Respond
1. **ALWAYS use tools first** to get real data before answering questions about stocks
2. **Be specific** - cite actual numbers from the data
3. **Be concise** - 2-3 paragraphs for most responses
4. **Be balanced** - present both bull and bear cases
5. **Disclaim** - remind users this is not financial advice

## Example Interactions
- "What's Apple's PE ratio?" → Use getCompanyFundamentals tool, then explain
- "Show me insider buying" → Use getInsiderTrades tool, summarize activity
- "Compare NVDA vs AMD" → Use compareStocks tool, analyze differences
- "Latest news on Tesla" → Use searchFinancialNews tool, summarize findings

## About Lician
- Free real-time stock quotes and analysis
- AI-powered research tools
- Portfolio tracking at /portfolio
- Stock screener at /screener
- Biotech catalysts at /biotech

Always provide actionable insights and suggest relevant Lician features when appropriate.`

export async function POST(req: NextRequest) {
  // Rate limiting for public endpoint
  const rateLimitKey = getRateLimitKey(req)
  const { allowed, remaining } = checkRateLimit(rateLimitKey)

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Sign up for unlimited AI access!',
        upgrade_url: '/premium'
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + RATE_WINDOW)
        }
      }
    )
  }

  try {
    const { messages } = await req.json()

    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: SYSTEM_PROMPT,
      messages,
      tools: financialTools,
      toolChoice: 'auto', // Allow the model to choose which tools to use
    })

    return result.toTextStreamResponse({
      headers: {
        'X-RateLimit-Remaining': String(remaining),
      }
    })
  } catch (error) {
    console.error('Public chat error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
