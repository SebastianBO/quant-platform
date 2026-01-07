/**
 * WebSocket Infrastructure
 *
 * FREE real-time data streaming for stocks and crypto.
 * - Yahoo Finance WebSocket for unlimited stock quotes (no API key)
 * - Binance WebSocket for unlimited crypto quotes (no API key)
 */

// ============ STOCKS ============

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

// Stock quotes hook
export {
  useRealTimeQuotes,
  useRealTimeQuote,
  type RealTimeQuote
} from './useRealTimeQuotes'

// ============ CRYPTO ============

// Binance - FREE, no API key, unlimited crypto quotes
export {
  BinanceCryptoWebSocket,
  getBinanceWebSocket,
  disconnectBinance,
  POPULAR_CRYPTO,
  type CryptoQuote,
  type CryptoCallback
} from './binance-crypto'

// Crypto quotes hook
export {
  useCryptoQuotes,
  useCryptoQuote
} from './useCryptoQuotes'

// ============ LEGACY ============

// Finnhub - requires API key, has free tier limits
export {
  FinnhubWebSocket,
  getFinnhubWebSocket,
  disconnectFinnhub,
  type FinnhubTrade,
  type FinnhubMessage,
  type TradeCallback
} from './finnhub'
