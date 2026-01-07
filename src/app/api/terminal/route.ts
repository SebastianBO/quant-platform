import { streamText, convertToCoreMessages } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const SYSTEM_PROMPT = `You are an elite AI Quant Analyst - a personal research assistant for financial markets.

You can help with:
- Analyzing stocks and their fundamentals
- Explaining financial concepts
- Discussing market trends
- Investment research and due diligence
- Options and derivatives analysis
- Biotech and clinical trials

Remember: You're a research tool, not financial advice. Users should do their own due diligence.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Choose model - prefer Claude for better analysis
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
    const hasOpenAI = !!process.env.OPENAI_API_KEY

    if (!hasAnthropic && !hasOpenAI) {
      return NextResponse.json(
        { error: 'No AI API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.' },
        { status: 500 }
      )
    }

    const model = hasAnthropic
      ? anthropic('claude-sonnet-4-20250514')
      : openai('gpt-4o')

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: convertToCoreMessages(messages),
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Terminal API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    model: process.env.ANTHROPIC_API_KEY ? 'claude-sonnet-4' : 'gpt-4o'
  })
}
