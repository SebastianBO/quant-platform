import { streamText, createGateway } from 'ai'

export const maxDuration = 30

// Create AI Gateway instance - automatically uses OIDC on Vercel deployments
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
})

export async function POST(req: Request) {
  const { messages, portfolioContext } = await req.json()

  // Build system prompt with portfolio context if available
  const systemPrompt = portfolioContext
    ? `You are a helpful financial advisor assistant for a portfolio management platform called Lician.
You have access to the following portfolio information:

Portfolio Name: ${portfolioContext.name}
Currency: ${portfolioContext.currency}
Total Value: ${portfolioContext.totalValue}
Total Positions: ${portfolioContext.positionCount}

Holdings:
${portfolioContext.holdings?.map((h: any) =>
  `- ${h.ticker}: ${h.shares} shares @ $${h.avgCost?.toFixed(2) || 'N/A'} avg cost, current value: $${h.marketValue?.toFixed(2) || 'N/A'}`
).join('\n') || 'No holdings data available'}

Provide helpful, accurate financial guidance. Be concise but thorough.
When discussing specific stocks or positions, reference the actual data from the portfolio.
Always remind users that this is not financial advice and they should consult a licensed professional for investment decisions.`
    : `You are a helpful financial advisor assistant for a portfolio management platform called Lician.
Provide helpful, accurate financial guidance about investing, portfolio management, and market analysis.
Be concise but thorough.
Always remind users that this is not financial advice and they should consult a licensed professional for investment decisions.`

  const result = await streamText({
    model: gateway('anthropic/claude-sonnet-4-20250514'),
    system: systemPrompt,
    messages,
  })

  return result.toTextStreamResponse()
}
