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

// Available models via Vercel AI Gateway
const AVAILABLE_MODELS = {
  // Best reasoning (expensive)
  'gpt-4o': { id: 'openai/gpt-4o', name: 'GPT-4o', tier: 'premium' },
  'claude-sonnet-4': { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', tier: 'premium' },

  // Good balance (recommended)
  'gpt-4o-mini': { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', tier: 'standard' },
  'claude-3-5-sonnet': { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', tier: 'standard' },
  'llama-3.3-70b': { id: 'meta/llama-3.3-70b', name: 'Llama 3.3 70B', tier: 'standard' },

  // Fast (for simple queries)
  'gemini-flash': { id: 'google/gemini-2.0-flash', name: 'Gemini Flash', tier: 'fast' },
} as const

type ModelKey = keyof typeof AVAILABLE_MODELS

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // Increased for multi-model support
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

export async function GET() {
  // Return available models for UI
  return NextResponse.json({ models: AVAILABLE_MODELS })
}

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req)
  const { allowed, remaining } = checkRateLimit(rateLimitKey)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded for autonomous research' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const { query, conversationHistory, stream = true, model: modelKey = 'gpt-4o-mini' } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Get model from available models, default to gpt-4o-mini
    const modelConfig = AVAILABLE_MODELS[modelKey as ModelKey] || AVAILABLE_MODELS['gpt-4o-mini']
    const model = gateway(modelConfig.id as Parameters<typeof gateway>[0])

    // Use Gemini Flash as fast model for tool selection (like Dexter uses gpt-4-mini)
    const fastModel = gateway('google/gemini-2.0-flash' as Parameters<typeof gateway>[0])

    const agent = new Agent(model, {
      maxIterations: 3, // Keep it efficient
      fastModel, // Use fast model for tool selection
    })

    if (stream) {
      // Streaming response with Server-Sent Events
      const encoder = new TextEncoder()

      const readable = new ReadableStream({
        async start(controller) {
          try {
            // Send model info first
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'model', data: { key: modelKey, name: modelConfig.name } })}\n\n`))
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'remaining', data: remaining })}\n\n`))

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
      return NextResponse.json({
        answer,
        model: { key: modelKey, name: modelConfig.name },
        remaining
      })
    }
  } catch (error) {
    console.error('Autonomous agent error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Research failed', details: errorMessage },
      { status: 500 }
    )
  }
}
