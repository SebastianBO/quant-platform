import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ""
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""
const FINANCIAL_DATASETS_API_KEY = process.env.FINANCIAL_DATASETS_API_KEY || ""

interface Position {
  ticker: string
  shares: number
  avgCost?: number
  currentPrice?: number
  marketValue?: number
  gainLoss?: number
  gainLossPercent?: number
  weight?: number
}

interface PortfolioAnalysis {
  positions: Position[]
  totalValue: number
  sectors: { name: string; weight: number; value: number }[]
  metrics: {
    diversificationScore: number
    concentrationRisk: string
    topHolding: string
    topHoldingWeight: number
    numberOfPositions: number
    avgPositionSize: number
  }
  recommendations: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, imageData, positions } = body

    if (!OPENROUTER_API_KEY && !OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'No API key configured (OpenRouter or OpenAI)'
      }, { status: 500 })
    }

    // Action: Extract positions from image
    if (action === 'extract') {
      const extractedPositions = await extractPositionsFromImage(imageData)
      return NextResponse.json({ positions: extractedPositions })
    }

    // Action: Analyze portfolio
    if (action === 'analyze') {
      const analysis = await analyzePortfolio(positions)
      return NextResponse.json(analysis)
    }

    // Action: Get AI recommendations
    if (action === 'recommend') {
      const recommendations = await getAIRecommendations(positions)
      return NextResponse.json({ recommendations })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Portfolio API error:', error)
    return NextResponse.json({
      error: 'Failed to process portfolio request'
    }, { status: 500 })
  }
}

async function extractPositionsFromImage(imageData: string): Promise<Position[]> {
  // Use OpenRouter with Claude 3.5 Sonnet (best for vision/OCR tasks)
  const apiUrl = OPENROUTER_API_KEY
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions'

  const apiKey = OPENROUTER_API_KEY || OPENAI_API_KEY
  const model = OPENROUTER_API_KEY ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o'

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }

  // Add OpenRouter-specific headers
  if (OPENROUTER_API_KEY) {
    headers['HTTP-Referer'] = 'https://lician.com'
    headers['X-Title'] = 'Lician Portfolio Analyzer'
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `You are a financial data extraction expert. Extract stock positions from brokerage screenshots.

Return ONLY a valid JSON array of positions with this exact format:
[
  {"ticker": "AAPL", "shares": 100, "avgCost": 150.00, "currentPrice": 175.00, "marketValue": 17500},
  {"ticker": "GOOGL", "shares": 50, "avgCost": 120.00, "currentPrice": 140.00, "marketValue": 7000}
]

Rules:
- Extract the stock ticker symbol (use standard US ticker format)
- Extract number of shares (quantity)
- Extract average cost per share if visible
- Extract current price if visible
- Extract market value if visible
- If a value isn't visible, omit that field
- Only include actual stock positions, not cash or totals
- Return empty array [] if no positions can be extracted`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all stock positions from this brokerage screenshot. Return only the JSON array, no other text.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageData,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('OpenAI Vision API error:', error)
    throw new Error('Failed to extract positions from image')
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || '[]'

  // Parse the JSON response
  try {
    // Clean up the response - remove markdown code blocks if present
    let jsonStr = content.trim()
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7)
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3)
    }
    jsonStr = jsonStr.trim()

    const rawPositions = JSON.parse(jsonStr)
    if (!Array.isArray(rawPositions)) return []

    // Validate and clean positions - ensure required fields exist
    const validPositions: Position[] = rawPositions
      .filter((pos: any) => pos && pos.ticker)
      .map((pos: any) => ({
        ticker: String(pos.ticker).toUpperCase(),
        shares: Number(pos.shares) || Number(pos.quantity) || 1,
        avgCost: pos.avgCost ? Number(pos.avgCost) : pos.avg_cost ? Number(pos.avg_cost) : pos.averageCost ? Number(pos.averageCost) : undefined,
        currentPrice: pos.currentPrice ? Number(pos.currentPrice) : pos.current_price ? Number(pos.current_price) : pos.price ? Number(pos.price) : undefined,
        marketValue: pos.marketValue ? Number(pos.marketValue) : pos.market_value ? Number(pos.market_value) : pos.value ? Number(pos.value) : undefined,
      }))

    return validPositions
  } catch (e) {
    console.error('Failed to parse positions JSON:', content)
    return []
  }
}

async function analyzePortfolio(positions: Position[]): Promise<PortfolioAnalysis> {
  if (!positions || positions.length === 0) {
    return {
      positions: [],
      totalValue: 0,
      sectors: [],
      metrics: {
        diversificationScore: 0,
        concentrationRisk: 'N/A',
        topHolding: 'N/A',
        topHoldingWeight: 0,
        numberOfPositions: 0,
        avgPositionSize: 0
      },
      recommendations: ['Add positions to analyze your portfolio']
    }
  }

  // Fetch current prices and sector info for all tickers
  const enrichedPositions = await Promise.all(
    positions.map(async (pos) => {
      try {
        // Fetch current price
        const priceResponse = await fetch(
          `https://api.financialdatasets.ai/prices/snapshot/?ticker=${pos.ticker}`,
          {
            headers: { 'X-API-KEY': FINANCIAL_DATASETS_API_KEY }
          }
        )
        const priceData = priceResponse.ok ? await priceResponse.json() : null
        const currentPrice = priceData?.snapshot?.price || pos.currentPrice || pos.avgCost || 0

        const marketValue = pos.shares * currentPrice
        const costBasis = pos.shares * (pos.avgCost || currentPrice)
        const gainLoss = marketValue - costBasis
        const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0

        return {
          ...pos,
          currentPrice,
          marketValue,
          gainLoss,
          gainLossPercent
        }
      } catch (e) {
        return {
          ...pos,
          marketValue: pos.marketValue || (pos.shares * (pos.currentPrice || pos.avgCost || 0))
        }
      }
    })
  )

  // Calculate total value
  const totalValue = enrichedPositions.reduce((sum, pos) => sum + (pos.marketValue || 0), 0)

  // Add weights
  const positionsWithWeights = enrichedPositions.map(pos => ({
    ...pos,
    weight: totalValue > 0 ? ((pos.marketValue || 0) / totalValue) * 100 : 0
  }))

  // Sort by weight
  positionsWithWeights.sort((a, b) => (b.weight || 0) - (a.weight || 0))

  // Get sector allocations using OpenAI
  const sectorData = await getSectorAllocations(positionsWithWeights)

  // Calculate metrics
  const topHolding = positionsWithWeights[0]
  const weights = positionsWithWeights.map(p => p.weight || 0)

  // Herfindahl-Hirschman Index for concentration
  const hhi = weights.reduce((sum, w) => sum + Math.pow(w / 100, 2), 0)
  const diversificationScore = Math.round((1 - hhi) * 100)

  let concentrationRisk = 'Low'
  if (topHolding?.weight && topHolding.weight > 30) concentrationRisk = 'High'
  else if (topHolding?.weight && topHolding.weight > 20) concentrationRisk = 'Medium'

  // Generate recommendations
  const recommendations = generateRecommendations(positionsWithWeights, sectorData, diversificationScore)

  return {
    positions: positionsWithWeights,
    totalValue,
    sectors: sectorData,
    metrics: {
      diversificationScore,
      concentrationRisk,
      topHolding: topHolding?.ticker || 'N/A',
      topHoldingWeight: topHolding?.weight || 0,
      numberOfPositions: positionsWithWeights.length,
      avgPositionSize: totalValue / positionsWithWeights.length
    },
    recommendations
  }
}

async function getSectorAllocations(positions: Position[]): Promise<{ name: string; weight: number; value: number }[]> {
  const tickers = positions.map(p => p.ticker).join(', ')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You classify stocks into GICS sectors. Return ONLY a JSON object mapping ticker to sector.

Sectors: Technology, Healthcare, Financials, Consumer Discretionary, Consumer Staples, Energy, Industrials, Materials, Utilities, Real Estate, Communication Services

Example response:
{"AAPL": "Technology", "JNJ": "Healthcare", "JPM": "Financials"}`
        },
        {
          role: 'user',
          content: `Classify these tickers into sectors: ${tickers}`
        }
      ],
      max_tokens: 500,
      temperature: 0
    })
  })

  if (!response.ok) {
    return []
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || '{}'

  try {
    let jsonStr = content.trim()
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7)
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3)
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3)

    const sectorMap: Record<string, string> = JSON.parse(jsonStr.trim())

    // Aggregate by sector
    const sectorTotals: Record<string, number> = {}
    const totalValue = positions.reduce((sum, p) => sum + (p.marketValue || 0), 0)

    positions.forEach(pos => {
      const sector = sectorMap[pos.ticker] || 'Other'
      sectorTotals[sector] = (sectorTotals[sector] || 0) + (pos.marketValue || 0)
    })

    return Object.entries(sectorTotals)
      .map(([name, value]) => ({
        name,
        value,
        weight: totalValue > 0 ? (value / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.weight - a.weight)
  } catch (e) {
    return []
  }
}

function generateRecommendations(
  positions: Position[],
  sectors: { name: string; weight: number }[],
  diversificationScore: number
): string[] {
  const recommendations: string[] = []

  // Check concentration
  const topPosition = positions[0]
  if (topPosition?.weight && topPosition.weight > 25) {
    recommendations.push(`Consider reducing ${topPosition.ticker} position (${topPosition.weight.toFixed(1)}% of portfolio) to lower concentration risk`)
  }

  // Check sector concentration
  const topSector = sectors[0]
  if (topSector?.weight > 40) {
    recommendations.push(`${topSector.name} represents ${topSector.weight.toFixed(1)}% of portfolio - consider diversifying into other sectors`)
  }

  // Check diversification
  if (diversificationScore < 50) {
    recommendations.push('Portfolio is highly concentrated - consider adding more positions for better diversification')
  } else if (diversificationScore > 90) {
    recommendations.push('Portfolio may be over-diversified - consider focusing on higher conviction positions')
  }

  // Check number of positions
  if (positions.length < 5) {
    recommendations.push('Consider adding more positions to reduce single-stock risk')
  } else if (positions.length > 30) {
    recommendations.push('Large number of positions may be difficult to monitor - consider consolidating')
  }

  // Check for sector gaps
  const sectorNames = sectors.map(s => s.name)
  const missingSectors = ['Technology', 'Healthcare', 'Financials'].filter(s => !sectorNames.includes(s))
  if (missingSectors.length > 0 && positions.length >= 5) {
    recommendations.push(`No exposure to: ${missingSectors.join(', ')} - consider for diversification`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Portfolio appears well-balanced. Continue monitoring for rebalancing opportunities.')
  }

  return recommendations
}

async function getAIRecommendations(positions: Position[]): Promise<string> {
  const portfolioSummary = positions.map(p =>
    `${p.ticker}: ${p.shares} shares, ${p.weight?.toFixed(1)}% weight, ${p.gainLossPercent?.toFixed(1)}% gain/loss`
  ).join('\n')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a portfolio manager providing actionable advice. Be specific and quantitative.

Analyze the portfolio and provide:
1. Overall Assessment (2-3 sentences)
2. Strengths (2-3 bullet points)
3. Weaknesses (2-3 bullet points)
4. Specific Actions (3-5 actionable recommendations)
5. Risk Assessment (Low/Medium/High with explanation)

Use markdown formatting with ## headers.`
        },
        {
          role: 'user',
          content: `Analyze this portfolio:\n\n${portfolioSummary}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error('Failed to get AI recommendations')
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'Unable to generate recommendations.'
}
