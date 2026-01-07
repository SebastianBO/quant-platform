/**
 * Yahoo Finance WebSocket Client
 *
 * FREE real-time stock quotes via Yahoo's undocumented WebSocket.
 * No API key required. No limits.
 *
 * @see https://github.com/yahoofinancelive/yliveticker
 *
 * Yahoo sends data encoded in protobuf format. We decode it to extract
 * real-time price updates for any stock.
 */

export interface YahooQuote {
  // Symbol
  id: string
  // Price
  price: number
  // Day high
  dayHigh?: number
  // Day low
  dayLow?: number
  // Change
  change?: number
  // Change percent
  changePercent?: number
  // Volume
  dayVolume?: number
  // Previous close
  previousClose?: number
  // Market hours
  marketHours?: 'REGULAR' | 'PRE' | 'POST' | 'CLOSED'
  // Timestamp
  time?: number
}

export type QuoteCallback = (quote: YahooQuote) => void
export type ErrorCallback = (error: Error) => void
export type StatusCallback = (status: 'connected' | 'disconnected' | 'reconnecting') => void

const YAHOO_WS_URL = 'wss://streamer.finance.yahoo.com/'

/**
 * Decode Yahoo's protobuf message
 * Yahoo uses a custom protobuf format. This is a simplified decoder.
 */
function decodeYahooMessage(data: ArrayBuffer): YahooQuote | null {
  try {
    // Yahoo's protobuf has a specific structure
    // This is a simplified decoder that extracts key fields
    const view = new DataView(data)
    const bytes = new Uint8Array(data)

    // Find the symbol (ASCII string after field marker)
    let symbolStart = -1
    let symbolEnd = -1

    for (let i = 0; i < bytes.length - 1; i++) {
      // Look for field 1 (wire type 2 = length-delimited string)
      if (bytes[i] === 0x0a) {
        const len = bytes[i + 1]
        if (len > 0 && len < 20) {
          symbolStart = i + 2
          symbolEnd = symbolStart + len
          break
        }
      }
    }

    if (symbolStart < 0) return null

    const symbol = String.fromCharCode(...bytes.slice(symbolStart, symbolEnd))

    // Find price (float, field 2, wire type 5)
    let price = 0
    for (let i = symbolEnd; i < bytes.length - 4; i++) {
      if (bytes[i] === 0x15) {
        // Field 2, wire type 5 (32-bit float)
        const floatView = new DataView(data, i + 1, 4)
        price = floatView.getFloat32(0, true)
        break
      }
    }

    if (price === 0) return null

    return {
      id: symbol,
      price: price
    }
  } catch (error) {
    console.error('Failed to decode Yahoo message:', error)
    return null
  }
}

/**
 * Alternative: Parse text JSON format (Yahoo sometimes sends JSON)
 */
function parseYahooJSON(text: string): YahooQuote[] {
  try {
    // Try to parse as JSON directly
    const data = JSON.parse(text)
    if (data.quoteResponse?.result) {
      return data.quoteResponse.result.map((q: any) => ({
        id: q.symbol,
        price: q.regularMarketPrice,
        dayHigh: q.regularMarketDayHigh,
        dayLow: q.regularMarketDayLow,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
        dayVolume: q.regularMarketVolume,
        previousClose: q.regularMarketPreviousClose,
        marketHours: q.marketState,
        time: q.regularMarketTime * 1000
      }))
    }
    return []
  } catch {
    return []
  }
}

export class YahooFinanceWebSocket {
  private ws: WebSocket | null = null
  private subscriptions: Set<string> = new Set()
  private callbacks: Map<string, Set<QuoteCallback>> = new Map()
  private errorCallbacks: Set<ErrorCallback> = new Set()
  private statusCallbacks: Set<StatusCallback> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000
  private isConnecting = false
  private heartbeatInterval: NodeJS.Timeout | null = null

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
        this.ws = new WebSocket(YAHOO_WS_URL)
        this.ws.binaryType = 'arraybuffer'

        this.ws.onopen = () => {
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.notifyStatus('connected')

          // Resubscribe to all symbols
          if (this.subscriptions.size > 0) {
            this.sendSubscription()
          }

          this.startHeartbeat()
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onerror = () => {
          this.isConnecting = false
          const err = new Error('Yahoo WebSocket error')
          this.notifyError(err)
          reject(err)
        }

        this.ws.onclose = () => {
          this.isConnecting = false
          this.stopHeartbeat()
          this.notifyStatus('disconnected')
          this.attemptReconnect()
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private handleMessage(data: ArrayBuffer | string) {
    let quotes: YahooQuote[] = []

    if (data instanceof ArrayBuffer) {
      // Binary protobuf data
      const quote = decodeYahooMessage(data)
      if (quote) quotes = [quote]
    } else if (typeof data === 'string') {
      // JSON data
      quotes = parseYahooJSON(data)
    }

    quotes.forEach(quote => {
      const callbacks = this.callbacks.get(quote.id)
      if (callbacks) {
        callbacks.forEach(cb => cb(quote))
      }

      // Also notify wildcard subscribers
      const wildcardCallbacks = this.callbacks.get('*')
      if (wildcardCallbacks) {
        wildcardCallbacks.forEach(cb => cb(quote))
      }
    })
  }

  subscribe(symbol: string, callback: QuoteCallback): () => void {
    const upperSymbol = symbol.toUpperCase()

    this.subscriptions.add(upperSymbol)

    if (!this.callbacks.has(upperSymbol)) {
      this.callbacks.set(upperSymbol, new Set())
    }
    this.callbacks.get(upperSymbol)!.add(callback)

    // Send subscription if connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscription()
    }

    return () => this.unsubscribe(upperSymbol, callback)
  }

  subscribeAll(callback: QuoteCallback): () => void {
    return this.subscribe('*', callback)
  }

  private sendSubscription() {
    if (this.ws?.readyState === WebSocket.OPEN && this.subscriptions.size > 0) {
      const symbols = Array.from(this.subscriptions).filter(s => s !== '*')
      this.ws.send(JSON.stringify({ subscribe: symbols }))
    }
  }

  unsubscribe(symbol: string, callback?: QuoteCallback) {
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
      this.ws.send(JSON.stringify({ unsubscribe: symbols }))
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

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Keep connection alive
      }
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  disconnect() {
    this.stopHeartbeat()
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
let instance: YahooFinanceWebSocket | null = null

export function getYahooWebSocket(): YahooFinanceWebSocket {
  if (!instance) {
    instance = new YahooFinanceWebSocket()
  }
  return instance
}

export function disconnectYahoo() {
  if (instance) {
    instance.disconnect()
    instance = null
  }
}
