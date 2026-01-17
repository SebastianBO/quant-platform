#!/usr/bin/env node

/**
 * Lician MCP Server
 *
 * Model Context Protocol server for the Lician Financial Data API.
 * Enables AI agents to access stock prices, financials, insider trades,
 * institutional holdings, and more.
 *
 * https://lician.com/developers
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Base URL for Lician API
const BASE_URL = "https://lician.com";

// Optional API key from environment
const API_KEY = process.env.LICIAN_API_KEY;

/**
 * Helper function to make API requests
 */
async function fetchLician(
  endpoint: string,
  params: Record<string, string | number | undefined>
): Promise<unknown> {
  const url = new URL(endpoint, BASE_URL);

  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "lician-mcp-server/1.0.0",
  };

  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Lician API error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Tool definitions for Lician API
 */
const TOOLS: Tool[] = [
  // Stock Prices
  {
    name: "get_stock_price",
    description:
      "Get the current stock price, daily change, volume, and market cap for a ticker symbol. Use this when users ask about current stock prices or want to know how a stock is performing today.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "get_historical_prices",
    description:
      "Get historical daily price data (OHLCV) for a stock over a date range. Use this for price history, charts, or trend analysis.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
        start_date: {
          type: "string",
          description: "Start date in YYYY-MM-DD format",
        },
        end_date: {
          type: "string",
          description: "End date in YYYY-MM-DD format",
        },
        limit: {
          type: "number",
          description: "Number of data points to return (default: 30)",
        },
      },
      required: ["ticker"],
    },
  },

  // Financial Statements
  {
    name: "get_income_statement",
    description:
      "Get income statement data including revenue, gross profit, operating income, net income, and EPS. Use this when users ask about a company's revenue, profits, earnings, or profitability.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
        period: {
          type: "string",
          enum: ["quarterly", "annual"],
          description: "Reporting period type (default: quarterly)",
        },
        limit: {
          type: "number",
          description: "Number of periods to return (default: 4)",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "get_balance_sheet",
    description:
      "Get balance sheet data including total assets, liabilities, shareholders equity, cash, and debt. Use this when users ask about a company's financial position, assets, debt, or equity.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
        period: {
          type: "string",
          enum: ["quarterly", "annual"],
          description: "Reporting period type (default: quarterly)",
        },
        limit: {
          type: "number",
          description: "Number of periods to return (default: 4)",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "get_cash_flow",
    description:
      "Get cash flow statement data including operating, investing, and financing cash flows, plus free cash flow. Use this when users ask about cash generation, capital expenditures, or dividends.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
        period: {
          type: "string",
          enum: ["quarterly", "annual"],
          description: "Reporting period type (default: quarterly)",
        },
        limit: {
          type: "number",
          description: "Number of periods to return (default: 4)",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "get_financial_metrics",
    description:
      "Get key financial ratios and metrics including P/E ratio, P/B ratio, ROE, ROA, debt-to-equity, margins, and dividend yield. Use this when users ask about valuation, profitability ratios, or financial health.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
      },
      required: ["ticker"],
    },
  },

  // Insider Trading
  {
    name: "get_insider_trades",
    description:
      "Get SEC Form 4 insider trading activity showing buys and sells by executives and directors. Use this when users ask about insider trading, whether insiders are buying or selling, or executive stock transactions.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description:
            "Stock ticker symbol (optional - returns all recent trades if omitted)",
        },
        limit: {
          type: "number",
          description: "Number of trades to return (default: 50)",
        },
        transaction_type: {
          type: "string",
          enum: ["P-Purchase", "S-Sale", "A-Award", "M-Exercise"],
          description: "Filter by transaction type",
        },
      },
      required: [],
    },
  },

  // Institutional Holdings
  {
    name: "get_institutional_holders",
    description:
      "Get 13F institutional ownership data showing which funds and institutions hold a stock. Use this when users ask about institutional ownership, who owns a stock, or hedge fund holdings.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
        limit: {
          type: "number",
          description: "Number of holders to return (default: 20)",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "get_investor_portfolio",
    description:
      "Get all stock holdings for a specific institutional investor from their 13F filing. Use this when users ask about what stocks a specific fund or investor owns.",
    inputSchema: {
      type: "object" as const,
      properties: {
        investor: {
          type: "string",
          description:
            "Investor name (e.g., 'Berkshire Hathaway', 'Vanguard', 'BlackRock')",
        },
        limit: {
          type: "number",
          description: "Number of holdings to return (default: 50)",
        },
      },
      required: ["investor"],
    },
  },

  // Analyst Data
  {
    name: "get_analyst_ratings",
    description:
      "Get analyst buy/hold/sell ratings and price targets for a stock. Use this when users ask about analyst opinions, price targets, or whether analysts recommend buying a stock.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "get_analyst_estimates",
    description:
      "Get analyst EPS and revenue estimates for upcoming quarters. Use this when users ask about earnings expectations, revenue forecasts, or analyst estimates.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
        limit: {
          type: "number",
          description: "Number of quarters to return (default: 4)",
        },
      },
      required: ["ticker"],
    },
  },

  // Company Info
  {
    name: "get_company_info",
    description:
      "Get company profile information including sector, industry, description, CEO, employees, and headquarters. Use this when users ask about what a company does or want general company information.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
      },
      required: ["ticker"],
    },
  },

  // News & Filings
  {
    name: "get_stock_news",
    description:
      "Get recent news articles about a stock or the market. Use this when users ask about news, headlines, or recent developments for a stock.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol (optional - returns market news if omitted)",
        },
        limit: {
          type: "number",
          description: "Number of articles to return (default: 20)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_sec_filings",
    description:
      "Get SEC filings for a company including 10-K annual reports, 10-Q quarterly reports, and 8-K current reports. Use this when users ask about SEC filings or regulatory documents.",
    inputSchema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol",
        },
        type: {
          type: "string",
          enum: ["10-K", "10-Q", "8-K", "4", "13F"],
          description: "Filter by filing type",
        },
        limit: {
          type: "number",
          description: "Number of filings to return (default: 20)",
        },
      },
      required: ["ticker"],
    },
  },

  // Crypto
  {
    name: "get_crypto_prices",
    description:
      "Get current cryptocurrency prices including Bitcoin, Ethereum, and other major cryptos. Use this when users ask about crypto prices or cryptocurrency data.",
    inputSchema: {
      type: "object" as const,
      properties: {
        symbol: {
          type: "string",
          description: "Crypto symbol (e.g., BTC, ETH) - optional, returns all if omitted",
        },
      },
      required: [],
    },
  },

  // Macro
  {
    name: "get_interest_rates",
    description:
      "Get current Treasury yields and interest rate data including fed funds rate and yields across maturities. Use this when users ask about interest rates, Treasury yields, or the yield curve.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

/**
 * Tool execution handlers
 */
async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "get_stock_price":
      return fetchLician("/api/v1/prices/snapshot", {
        ticker: args.ticker as string,
      });

    case "get_historical_prices":
      return fetchLician("/api/v1/prices", {
        ticker: args.ticker as string,
        start_date: args.start_date as string | undefined,
        end_date: args.end_date as string | undefined,
        limit: args.limit as number | undefined,
      });

    case "get_income_statement":
      return fetchLician("/api/v1/financials/income-statements", {
        ticker: args.ticker as string,
        period: args.period as string | undefined,
        limit: args.limit as number | undefined,
      });

    case "get_balance_sheet":
      return fetchLician("/api/v1/financials/balance-sheets", {
        ticker: args.ticker as string,
        period: args.period as string | undefined,
        limit: args.limit as number | undefined,
      });

    case "get_cash_flow":
      return fetchLician("/api/v1/financials/cash-flow-statements", {
        ticker: args.ticker as string,
        period: args.period as string | undefined,
        limit: args.limit as number | undefined,
      });

    case "get_financial_metrics":
      return fetchLician("/api/v1/financial-metrics", {
        ticker: args.ticker as string,
      });

    case "get_insider_trades":
      return fetchLician("/api/v1/insider-trades", {
        ticker: args.ticker as string | undefined,
        limit: args.limit as number | undefined,
        transaction_type: args.transaction_type as string | undefined,
      });

    case "get_institutional_holders":
      return fetchLician("/api/v1/institutional-ownership", {
        ticker: args.ticker as string,
        limit: args.limit as number | undefined,
      });

    case "get_investor_portfolio":
      return fetchLician("/api/v1/institutional-ownership/investors", {
        investor: args.investor as string,
        limit: args.limit as number | undefined,
      });

    case "get_analyst_ratings":
      return fetchLician("/api/v1/analyst-ratings", {
        ticker: args.ticker as string,
      });

    case "get_analyst_estimates":
      return fetchLician("/api/v1/analyst-estimates", {
        ticker: args.ticker as string,
        limit: args.limit as number | undefined,
      });

    case "get_company_info":
      return fetchLician("/api/v1/company/facts", {
        ticker: args.ticker as string,
      });

    case "get_stock_news":
      return fetchLician("/api/v1/news", {
        ticker: args.ticker as string | undefined,
        limit: args.limit as number | undefined,
      });

    case "get_sec_filings":
      return fetchLician("/api/v1/filings", {
        ticker: args.ticker as string,
        type: args.type as string | undefined,
        limit: args.limit as number | undefined,
      });

    case "get_crypto_prices":
      return fetchLician("/api/v1/crypto/prices", {
        symbol: args.symbol as string | undefined,
      });

    case "get_interest_rates":
      return fetchLician("/api/v1/macro/interest-rates", {});

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/**
 * Main server setup
 */
async function main() {
  const server = new Server(
    {
      name: "lician-financial-data",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Execute tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await executeTool(name, args as Record<string, unknown>);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is used for MCP communication)
  console.error("Lician MCP Server running");
  console.error("API Key:", API_KEY ? "Configured" : "Not set (using free tier)");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
