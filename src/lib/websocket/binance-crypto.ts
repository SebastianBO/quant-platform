/**
 * Binance WebSocket Client for Crypto
 *
 * FREE real-time crypto prices via Binance's public WebSocket.
 * NO API KEY REQUIRED!
 *
 * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams
 */

export interface BinanceTrade {
  // Event type
  e: 'trade'
  // Event time
  E: number
  // Symbol (e.g., BTCUSDT)
  s: string
  // Trade ID
  t: number
  // Price
  p: string
  // Quantity
  q: string
  // Buyer order ID
  b: number
  // Seller order ID
  a: number
  // Trade time
  T: number
  // Is buyer the market maker?
  m: boolean
  // Ignore
  M: boolean
}

export interface BinanceTicker {
  // Event type
  e: '24hrTicker'
  // Event time
  E: number
  // Symbol
  s: string
  // Price change
  p: string
  // Price change percent
  P: string
  // Weighted average price
  w: string
  // First trade price
  x: string
  // Last price
  c: string
  // Last quantity
  Q: string
  // Best bid price
  b: string
  // Best bid quantity
  B: string
  // Best ask price
  a: string
  // Best ask quantity
  A: string
  // Open price
  o: string
  // High price
  h: string
  // Low price
  l: string
  // Total traded base asset volume
  v: string
  // Total traded quote asset volume
  q: string
  // Statistics open time
  O: number
  // Statistics close time
  C: number
  // First trade ID
  F: number
  // Last trade ID
  L: number
  // Total number of trades
  n: number
}

export interface CryptoQuote {
  symbol: string
  price: number
  change24h?: number
  changePercent24h?: number
  high24h?: number
  low24h?: number
  volume24h?: number
  lastUpdate: number
}

export type CryptoCallback = (quote: CryptoQuote) => void
export type ErrorCallback = (error: Error) => void
export type StatusCallback = (status: 'connected' | 'disconnected' | 'reconnecting') => void

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws'

export class BinanceCryptoWebSocket {
  private ws: WebSocket | null = null
  private subscriptions: Set<string> = new Set()
  private callbacks: Map<string, Set<CryptoCallback>> = new Map()
  private errorCallbacks: Set<ErrorCallback> = new Set()
  private statusCallbacks: Set<StatusCallback> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000
  private isConnecting = false
  private pingInterval: NodeJS.Timeout | null = null

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        const checkConnection = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection)
            resolve()
          }
        }, 100)
        return
      }

      this.isConnecting = true

      try {
        // Build stream URL with all subscriptions
        const streams = this.buildStreamParams()
        const url = streams.length > 0
          ? `${BINANCE_WS_URL}/${streams.join('/')}`
          : BINANCE_WS_URL

        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.notifyStatus('connected')
          this.startPingPong()
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onerror = () => {
          this.isConnecting = false
          const err = new Error('Binance WebSocket error')
          this.notifyError(err)
          reject(err)
        }

        this.ws.onclose = () => {
          this.isConnecting = false
          this.stopPingPong()
          this.notifyStatus('disconnected')
          this.attemptReconnect()
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private buildStreamParams(): string[] {
    const streams: string[] = []
    this.subscriptions.forEach(symbol => {
      // Subscribe to both ticker and trade streams
      streams.push(`${symbol.toLowerCase()}@ticker`)
    })
    return streams
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data)

      // Handle ping
      if (message.ping) {
        this.ws?.send(JSON.stringify({ pong: message.ping }))
        return
      }

      // Handle combined stream format
      const streamData = message.data || message

      if (streamData.e === '24hrTicker') {
        const ticker = streamData as BinanceTicker
        const quote: CryptoQuote = {
          symbol: ticker.s,
          price: parseFloat(ticker.c),
          change24h: parseFloat(ticker.p),
          changePercent24h: parseFloat(ticker.P),
          high24h: parseFloat(ticker.h),
          low24h: parseFloat(ticker.l),
          volume24h: parseFloat(ticker.v),
          lastUpdate: ticker.E
        }

        this.notifyQuote(quote)
      } else if (streamData.e === 'trade') {
        const trade = streamData as BinanceTrade
        const quote: CryptoQuote = {
          symbol: trade.s,
          price: parseFloat(trade.p),
          lastUpdate: trade.T
        }

        this.notifyQuote(quote)
      }
    } catch (error) {
      console.error('Failed to parse Binance message:', error)
    }
  }

  private notifyQuote(quote: CryptoQuote) {
    const callbacks = this.callbacks.get(quote.symbol)
    if (callbacks) {
      callbacks.forEach(cb => cb(quote))
    }

    // Also notify wildcard subscribers
    const wildcardCallbacks = this.callbacks.get('*')
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach(cb => cb(quote))
    }
  }

  subscribe(symbol: string, callback: CryptoCallback): () => void {
    const upperSymbol = symbol.toUpperCase()

    const wasEmpty = this.subscriptions.size === 0
    this.subscriptions.add(upperSymbol)

    if (!this.callbacks.has(upperSymbol)) {
      this.callbacks.set(upperSymbol, new Set())
    }
    this.callbacks.get(upperSymbol)!.add(callback)

    // If this is a new subscription while connected, need to reconnect with new streams
    if (this.ws?.readyState === WebSocket.OPEN && !wasEmpty) {
      // Send subscription message
      this.sendSubscription([upperSymbol])
    }

    return () => this.unsubscribe(upperSymbol, callback)
  }

  private sendSubscription(symbols: string[]) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const params = symbols.map(s => `${s.toLowerCase()}@ticker`)
      this.ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params,
        id: Date.now()
      }))
    }
  }

  unsubscribe(symbol: string, callback?: CryptoCallback) {
    const upperSymbol = symbol.toUpperCase()

    if (callback) {
      const callbacks = this.callbacks.get(upperSymbol)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.callbacks.delete(upperSymbol)
          this.subscriptions.delete(upperSymbol)
          this.sendUnsubscription([upperSymbol])
        }
      }
    } else {
      this.callbacks.delete(upperSymbol)
      this.subscriptions.delete(upperSymbol)
      this.sendUnsubscription([upperSymbol])
    }
  }

  private sendUnsubscription(symbols: string[]) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const params = symbols.map(s => `${s.toLowerCase()}@ticker`)
      this.ws.send(JSON.stringify({
        method: 'UNSUBSCRIBE',
        params,
        id: Date.now()
      }))
    }
  }

  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback)
    return () => this.errorCallbacks.delete(callback)
  }

  onStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback)
    return () => this.statusCallbacks.delete(callback)
  }

  private notifyError(error: Error) {
    this.errorCallbacks.forEach(cb => cb(error))
  }

  private notifyStatus(status: 'connected' | 'disconnected' | 'reconnecting') {
    this.statusCallbacks.forEach(cb => cb(status))
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.notifyError(new Error('Max reconnection attempts reached'))
      return
    }

    this.reconnectAttempts++
    this.notifyStatus('reconnecting')

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    setTimeout(() => this.connect().catch(() => {}), delay)
  }

  private startPingPong() {
    this.stopPingPong()
    // Binance sends ping every 20 seconds, we respond with pong
    // Also send our own ping every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ ping: Date.now() }))
      }
    }, 30000)
  }

  private stopPingPong() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  disconnect() {
    this.stopPingPong()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.subscriptions.clear()
    this.callbacks.clear()
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get subscribedSymbols(): string[] {
    return Array.from(this.subscriptions)
  }
}

// Singleton instance
let instance: BinanceCryptoWebSocket | null = null

export function getBinanceWebSocket(): BinanceCryptoWebSocket {
  if (!instance) {
    instance = new BinanceCryptoWebSocket()
  }
  return instance
}

export function disconnectBinance() {
  if (instance) {
    instance.disconnect()
    instance = null
  }
}

// Popular crypto symbols for convenience
export const POPULAR_CRYPTO = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'DOGEUSDT',
  'ADAUSDT',
  'AVAXUSDT',
  'DOTUSDT',
  'MATICUSDT'
]
