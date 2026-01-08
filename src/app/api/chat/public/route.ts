import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

// Simple in-memory rate limiting (resets on deploy)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5 // 5 requests per window
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

    const systemPrompt = `You are Lician AI, a helpful financial assistant on lician.com - a free stock analysis platform.

Your role:
- Provide helpful, accurate financial guidance about stocks, investing, and markets
- Be concise but thorough (2-3 paragraphs max for most responses)
- Use specific examples and data when discussing stocks
- Always remind users this is not financial advice

About Lician:
- Free real-time stock quotes and analysis
- AI-powered stock research tools
- Portfolio tracking and screeners
- Biotech catalyst calendars and FDA dates

Keep responses focused and actionable. If users want deeper analysis, suggest they explore specific Lician features like the stock screener or portfolio tracker.`

    const result = await streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      messages,
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
