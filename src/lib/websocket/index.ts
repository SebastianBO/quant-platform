/**
 * WebSocket Infrastructure
 *
 * Real-time data streaming for stocks, forex, and crypto.
 * Uses Yahoo Finance's FREE undocumented WebSocket for unlimited real-time quotes.
 */

// Yahoo Finance - FREE, no API key, unlimited quotes
export {
  YahooFinanceWebSocket,
  getYahooWebSocket,
  disconnectYahoo,
  type YahooQuote,
  type QuoteCallback,
  type ErrorCallback,
  type StatusCallback
} from './yahoo-finance'

// Finnhub - requires API key, has free tier limits
export {
  FinnhubWebSocket,
  getFinnhubWebSocket,
  disconnectFinnhub,
  type FinnhubTrade,
  type FinnhubMessage,
  type TradeCallback
} from './finnhub'

export {
  useRealTimeQuotes,
  useRealTimeQuote,
  type RealTimeQuote
} from './useRealTimeQuotes'
