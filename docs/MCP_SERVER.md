# Lician MCP Server Documentation

## Overview

The Lician MCP Server enables AI agents to access financial data through the Model Context Protocol (MCP). It's published on multiple registries for maximum discoverability.

## Published Locations

| Registry | URL | Name |
|----------|-----|------|
| **MCP Registry** | https://registry.modelcontextprotocol.io | `io.github.SebastianBO/financial-data` |
| **Smithery** | https://smithery.ai/server/@lician/financial-data | `@lician/financial-data` |
| **NPM** | https://www.npmjs.com/package/@lician/mcp-server | `@lician/mcp-server` |

## HTTP Endpoint

**URL:** `https://lician.com/api/mcp`

Implements MCP over HTTP with JSON-RPC 2.0:
- `POST /api/mcp` - JSON-RPC requests
- `GET /api/mcp` - Server info / SSE streaming

### Discovery Files

| File | URL |
|------|-----|
| Server Card | `https://lician.com/.well-known/mcp/server-card.json` |
| OpenAPI Spec | `https://lician.com/openapi.json` |
| Agent Discovery | `https://lician.com/agent.json` |
| AI Plugin | `https://lician.com/.well-known/ai-plugin.json` |

## Installation

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lician": {
      "command": "npx",
      "args": ["-y", "@lician/mcp-server"]
    }
  }
}
```

### NPX (any MCP client)

```bash
npx -y @lician/mcp-server
```

### Environment Variables

```bash
LICIAN_API_KEY=your_key  # Optional - for higher rate limits
```

## Available Tools (12)

| Tool | Description |
|------|-------------|
| `get_stock_price` | Current price, change, volume, market cap |
| `get_income_statement` | Revenue, profit, EPS (quarterly/annual) |
| `get_balance_sheet` | Assets, liabilities, equity, debt |
| `get_cash_flow` | Operating, investing, financing flows |
| `get_financial_metrics` | P/E, ROE, margins, dividend yield |
| `get_insider_trades` | SEC Form 4 insider transactions |
| `get_institutional_holders` | 13F institutional ownership |
| `get_investor_portfolio` | Holdings for specific investors |
| `get_analyst_ratings` | Buy/hold/sell ratings, price targets |
| `get_company_info` | Sector, industry, description, CEO |
| `get_stock_news` | Recent news articles |
| `get_sec_filings` | 10-K, 10-Q, 8-K filings |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AI AGENTS                               │
│   Claude Desktop │ ChatGPT │ Custom Agents │ Smithery       │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│   NPM Package (stdio)   │     │   HTTP Endpoint             │
│   @lician/mcp-server    │     │   lician.com/api/mcp        │
│   mcp-server/src/       │     │   src/app/api/mcp/route.ts  │
└─────────────────────────┘     └─────────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Lician REST API                           │
│                  https://lician.com/api/v1                   │
│                                                              │
│   /prices/snapshot    /financials/*    /insider-trades       │
│   /institutional-ownership    /analyst-ratings    /news      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                                │
│              839K+ financial records                         │
│        US: 5,345 companies │ EU: 106,975 companies          │
└─────────────────────────────────────────────────────────────┘
```

## Publishing Updates

### 1. Update Version

Edit both files:
- `mcp-server/package.json` - bump `version`
- `mcp-server/server.json` - bump `version` and `packages[0].version`

### 2. Publish to NPM

```bash
cd mcp-server
npm run build
npm publish --access public
# Enter OTP when prompted
```

### 3. Publish to MCP Registry

```bash
# Login (if token expired)
./mcp-publisher login github
# Follow GitHub device flow

# Publish
cd mcp-server
../mcp-publisher publish
```

### 4. Update Smithery

Smithery reads from NPM automatically. For metadata changes, update `smithery.yaml`.

## Key Files

| File | Purpose |
|------|---------|
| `mcp-server/src/index.ts` | Main stdio server (NPM package) |
| `mcp-server/package.json` | NPM config with `mcpName` |
| `mcp-server/server.json` | MCP Registry metadata |
| `mcp-server/smithery.yaml` | Smithery marketplace config |
| `src/app/api/mcp/route.ts` | HTTP endpoint for Smithery |
| `public/.well-known/mcp/server-card.json` | HTTP discovery |

## Rate Limits

| Tier | Requests/Day | Price |
|------|--------------|-------|
| Free | 100 | $0 |
| Basic | 10,000 | $29/mo |
| Pro | 100,000 | $99/mo |
| Enterprise | Unlimited | Custom |

Get API key: https://lician.com/developers/signup
