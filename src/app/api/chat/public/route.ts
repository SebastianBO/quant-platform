import { streamText, createGateway } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { financialTools } from '@/lib/ai/tools'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

// Vercel AI Gateway - 100x cheaper!
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
})

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

// RAG: Fetch relevant context from Supabase
async function fetchRelevantContext(query: string): Promise<string> {
  try {
    const supabase = getSupabase()
    const tickerMatch = query.match(/\b([A-Z]{1,5})\b/g)
    const potentialTickers = tickerMatch?.slice(0, 3) || []

    let context = ''

    if (potentialTickers.length > 0) {
      const { data: fundamentals } = await supabase
        .from('company_fundamentals')
        .select('ticker, company_name, sector, industry, market_cap, pe_ratio, eps')
        .in('ticker', potentialTickers)
        .limit(3)

      if (fundamentals && fundamentals.length > 0) {
        context += '\n\n## Company Data:\n'
        type Fundamental = Record<string, unknown>
        for (const f of fundamentals as Fundamental[]) {
          context += `- ${f.company_name} (${f.ticker}): Market Cap $${f.market_cap ? ((f.market_cap as number) / 1e9).toFixed(1) + 'B' : 'N/A'}, P/E ${(f.pe_ratio as number)?.toFixed(1) || 'N/A'}\n`
        }
      }
    }

    return context
  } catch (error) {
    console.error('RAG error:', error)
    return ''
  }
}

const SYSTEM_PROMPT = `You are Lician AI, a financial analyst on lician.com. You have tools to fetch stock data. Be concise and helpful.`

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req)
  const { allowed, remaining } = checkRateLimit(rateLimitKey)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  try {
    const { messages } = await req.json()

    // Extract text from various message formats
    type MessagePart = { type: string; text?: string }
    type RawMessage = { role: string; parts?: MessagePart[]; content?: string; text?: string }

    const getTextFromMessage = (msg: RawMessage): string => {
      // Handle { text: '...' } format
      if (typeof msg.text === 'string') {
        return msg.text
      }
      // Handle { parts: [{ type: 'text', text: '...' }] } format
      if (msg.parts) {
        const textPart = msg.parts.find((p) => p.type === 'text')
        return textPart?.text || ''
      }
      // Handle { content: '...' } format
      return typeof msg.content === 'string' ? msg.content : ''
    }

    // Get RAG context from last user message
    const lastUserMessage = [...(messages as RawMessage[])].reverse().find((m) => m.role === 'user')
    const userQuery = lastUserMessage ? getTextFromMessage(lastUserMessage) : ''

    const ragContext = await fetchRelevantContext(userQuery)

    const systemPrompt = ragContext
      ? `${SYSTEM_PROMPT}\n\nContext:${ragContext}`
      : SYSTEM_PROMPT

    // Convert messages to model format (role + content)
    const modelMessages = (messages as RawMessage[]).map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: getTextFromMessage(msg),
    }))

    // Use Llama 3.3-70B via Vercel AI Gateway
    const result = streamText({
      model: gateway('meta/llama-3.3-70b'),
      system: systemPrompt,
      messages: modelMessages,
      tools: financialTools,
      toolChoice: 'auto',
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
