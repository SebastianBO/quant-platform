import { NextRequest, NextResponse } from 'next/server'

/**
 * Lician MCP HTTP Endpoint
 *
 * This endpoint implements the Model Context Protocol over HTTP,
 * allowing AI agents to discover and call Lician financial data tools.
 *
 * https://lician.com/api/mcp
 */

const BASE_URL = 'https://lician.com'

// Tool definitions
const TOOLS = [
  {
    name: 'get_stock_price',
    description: 'Get current stock price, daily change, volume, and market cap for a ticker symbol',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: { type: 'string', description: 'Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)' }
      },
      required: ['ticker']
    }
  },
  {
    name: 'get_income_statement',
    description: 'Get income statement data including revenue, gross profit, operating income, net income, and EPS',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: { type: 'string', description: 'Stock ticker symbol' },
        period: { type: 'string', enum: ['quarterly', 'annual'], description: 'Reporting period (default: quarterly)' },
        limit: { type: 'number', description: 'Number of periods (default: 4)' }
      },
      required: ['ticker']
    }
  },
  {
    name: 'get_balance_sheet',
    description: 'Get balance sheet data including assets, liabilities, equity, cash, and debt',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: { type: 'string', description: 'Stock ticker symbol' },
        period: { type: 'string', enum: ['quarterly', 'annual'], description: 'Reporting period' },
        limit: { type: 'number', description: 'Number of periods' }
      },
      required: ['ticker']
    }
  },
  {
    name: 'get_cash_flow',
    description: 'Get cash flow statement including operating, investing, financing flows and free cash flow',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: { type: 'string', description: 'Stock ticker symbol' },
        period: { type: 'string', enum: ['quarterly', 'annual'], description: 'Reporting period' },
        limit: { type: 'number', description: 'Number of periods' }
      },
      required: ['ticker']
    }
  },
  {
    name: 'get_financial_metrics',
    description: 'Get key ratios: P/E, P/B, ROE, ROA, debt-to-equity, margins, dividend yield',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: { type: 'string', description: 'Stock ticker symbol' }
      },
      required: ['ticker']
    }
  },
  {
    name: 'get_insider_trades',
    description: 'Get SEC Form 4 insider trading activity - buys and sells by executives',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: { type: 'string', description: 'Stock ticker (optional - all if omitted)' },
        limit: { type: 'number', description: 'Number of trades (default: 50)' },
        transaction_type: { type: 'string', enum: ['P-Purchase', 'S-Sale', 'A-Award', 'M-Exercise'] }
      },
      required: []
    }
  },
  {
    name: 'get_institutional_holders',
    description: 'Get 13F institutional ownership data showing major fund holders',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: { type: 'string', description: 'Stock ticker symbol' },
        limit: { type: 'number', description: 'Number of holders (default: 20)' }
      },
      required: ['ticker']
    }
  },
  {
    name: 'get_investor_portfolio',
    description: 'Get all holdings for a specific institutional investor from 13F filing',
    inputSchema: {
      type: 'object',
      properties: {
        investor: { type: 'string', description: 'Investor name (e.g., Berkshire Hathaway, Vanguard)' },
        limit: { type: 'number', description: 'Number of holdings (default: 50)' }
      },
      required: ['investor']
    }
  },
  {
    name: 'get_analyst_ratings',
    description: 'Get analyst buy/hold/sell ratings and price targets',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: { type: 'string', description: 'Stock ticker symbol' }
      },
      required: ['ticker']
    }
  },
  {
    name: 'get_company_info',
    description: 'Get company profile: sector, industry, description, CEO, employees',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: { type: 'string', description: 'Stock ticker symbol' }
      },
      required: ['ticker']
    }
  },
  {
    name: 'get_stock_news',
    description: 'Get recent news articles about a stock or the market',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: { type: 'string', description: 'Stock ticker (optional)' },
        limit: { type: 'number', description: 'Number of articles (default: 20)' }
      },
      required: []
    }
  },
  {
    name: 'get_sec_filings',
    description: 'Get SEC filings: 10-K, 10-Q, 8-K reports',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: { type: 'string', description: 'Stock ticker symbol' },
        type: { type: 'string', enum: ['10-K', '10-Q', '8-K', '4', '13F'] },
        limit: { type: 'number', description: 'Number of filings (default: 20)' }
      },
      required: ['ticker']
    }
  }
]

// API endpoint mapping
const ENDPOINT_MAP: Record<string, string> = {
  get_stock_price: '/api/v1/prices/snapshot',
  get_income_statement: '/api/v1/financials/income-statements',
  get_balance_sheet: '/api/v1/financials/balance-sheets',
  get_cash_flow: '/api/v1/financials/cash-flow-statements',
  get_financial_metrics: '/api/v1/financial-metrics',
  get_insider_trades: '/api/v1/insider-trades',
  get_institutional_holders: '/api/v1/institutional-ownership',
  get_investor_portfolio: '/api/v1/institutional-ownership/investors',
  get_analyst_ratings: '/api/v1/analyst-ratings',
  get_company_info: '/api/v1/company/facts',
  get_stock_news: '/api/v1/news',
  get_sec_filings: '/api/v1/filings',
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const endpoint = ENDPOINT_MAP[name]
  if (!endpoint) {
    throw new Error(`Unknown tool: ${name}`)
  }

  const url = new URL(endpoint, BASE_URL)
  Object.entries(args).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// Handle MCP JSON-RPC requests
async function handleJsonRpc(request: { method: string; params?: unknown; id?: string | number }) {
  const { method, params, id } = request

  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'lician-financial-data',
              version: '1.0.0'
            },
            capabilities: {
              tools: {}
            }
          }
        }

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: { tools: TOOLS }
        }

      case 'tools/call': {
        const { name, arguments: args } = params as { name: string; arguments: Record<string, unknown> }
        const result = await callTool(name, args || {})
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
          }
        }
      }

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${method}` }
        }
    }
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      }
    }
  }
}

// GET - Server info and SSE connection
export async function GET(request: NextRequest) {
  const accept = request.headers.get('accept') || ''

  // SSE connection for streaming
  if (accept.includes('text/event-stream')) {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection event
        controller.enqueue(encoder.encode(`event: open\ndata: {"status":"connected"}\n\n`))
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }

  // Return server info for regular GET
  return NextResponse.json({
    name: 'lician-financial-data',
    version: '1.0.0',
    description: 'Lician Financial Data MCP Server - Access stock prices, financials, insider trades, and institutional holdings for 141,000+ companies',
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: TOOLS.map(t => t.name)
    },
    documentation: 'https://lician.com/api-docs',
    openapi: 'https://lician.com/openapi.json'
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}

// POST - Handle MCP JSON-RPC requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle batch requests
    if (Array.isArray(body)) {
      const results = await Promise.all(body.map(handleJsonRpc))
      return NextResponse.json(results, {
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
    }

    // Handle single request
    const result = await handleJsonRpc(body)
    return NextResponse.json(result, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  } catch (error) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Parse error'
      }
    }, {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
