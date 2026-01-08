/**
 * Autonomous Financial Research Agent API
 * Inspired by virattt/dexter
 *
 * Uses multi-phase reasoning:
 * 1. Understand - Extract intent and entities
 * 2. Plan - Create research tasks
 * 3. Execute - Run tools autonomously
 * 4. Reflect - Evaluate completeness
 * 5. Answer - Generate response
 */

import { NextRequest, NextResponse } from 'next/server'
import { createGateway } from 'ai'
import { Agent } from '@/lib/ai/agent'

export const maxDuration = 120 // Longer timeout for autonomous research

// Vercel AI Gateway
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
})

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5 // Lower limit for autonomous (more expensive)
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0] : 'unknown'
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
  const rateLimitKey = getRateLimitKey(req)
  const { allowed } = checkRateLimit(rateLimitKey)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded for autonomous research' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const { query, conversationHistory, stream = true } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Use Llama 3.3-70B for autonomous reasoning
    const model = gateway('meta/llama-3.3-70b')

    const agent = new Agent(model, {
      maxIterations: 3, // Keep it efficient
    })

    if (stream) {
      // Streaming response with Server-Sent Events
      const encoder = new TextEncoder()

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of agent.runStreaming(query, conversationHistory)) {
              const data = `data: ${JSON.stringify(event)}\n\n`
              controller.enqueue(encoder.encode(data))
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Agent error'
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', data: errorMsg })}\n\n`))
            controller.close()
          }
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Non-streaming response
      const answer = await agent.run(query, conversationHistory)
      return NextResponse.json({ answer })
    }
  } catch (error) {
    console.error('Autonomous agent error:', error)
    return NextResponse.json(
      { error: 'Research failed' },
      { status: 500 }
    )
  }
}
