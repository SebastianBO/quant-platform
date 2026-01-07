/**
 * Finnhub WebSocket Client
 *
 * Provides real-time stock quotes via WebSocket connection.
 * Free tier: US stocks, forex, crypto - real-time trades
 *
 * @see https://finnhub.io/docs/api/websocket-trades
 */

export interface FinnhubTrade {
  // Symbol
  s: string
  // Price
  p: number
  // Timestamp (ms)
  t: number
  // Volume
  v: number
  // Trade conditions
  c?: string[]
}

export interface FinnhubMessage {
  type: 'trade' | 'ping' | 'error'
  data?: FinnhubTrade[]
  msg?: string
}

export type TradeCallback = (trade: FinnhubTrade) => void
export type ErrorCallback = (error: Error) => void
export type StatusCallback = (status: 'connected' | 'disconnected' | 'reconnecting') => void

const FINNHUB_WS_URL = 'wss://ws.finnhub.io'

export class FinnhubWebSocket {
  private ws: WebSocket | null = null
  private apiKey: string
  private subscriptions: Set<string> = new Set()
  private callbacks: Map<string, Set<TradeCallback>> = new Map()
  private errorCallbacks: Set<ErrorCallback> = new Set()
  private statusCallbacks: Set<StatusCallback> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        // Wait for existing connection
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
        this.ws = new WebSocket(`${FINNHUB_WS_URL}?token=${this.apiKey}`)

        this.ws.onopen = () => {
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.notifyStatus('connected')

          // Resubscribe to all symbols
          this.subscriptions.forEach(symbol => {
            this.sendSubscribe(symbol)
          })

          // Start heartbeat
          this.startHeartbeat()

          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onerror = (error) => {
          this.isConnecting = false
          const err = new Error('WebSocket error')
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

  private handleMessage(data: string) {
    try {
      const message: FinnhubMessage = JSON.parse(data)

      if (message.type === 'trade' && message.data) {
        message.data.forEach(trade => {
          const callbacks = this.callbacks.get(trade.s)
          if (callbacks) {
            callbacks.forEach(cb => cb(trade))
          }
        })
      } else if (message.type === 'error') {
        this.notifyError(new Error(message.msg || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to parse Finnhub message:', error)
    }
  }

  subscribe(symbol: string, callback: TradeCallback): () => void {
    const upperSymbol = symbol.toUpperCase()

    // Add to subscriptions
    this.subscriptions.add(upperSymbol)

    // Add callback
    if (!this.callbacks.has(upperSymbol)) {
      this.callbacks.set(upperSymbol, new Set())
    }
    this.callbacks.get(upperSymbol)!.add(callback)

    // Send subscription if connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(upperSymbol)
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(upperSymbol, callback)
    }
  }

  private sendSubscribe(symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        symbol: symbol
      }))
    }
  }

  unsubscribe(symbol: string, callback?: TradeCallback) {
    const upperSymbol = symbol.toUpperCase()

    if (callback) {
      // Remove specific callback
      const callbacks = this.callbacks.get(upperSymbol)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.callbacks.delete(upperSymbol)
          this.subscriptions.delete(upperSymbol)
          this.sendUnsubscribe(upperSymbol)
        }
      }
    } else {
      // Remove all callbacks for symbol
      this.callbacks.delete(upperSymbol)
      this.subscriptions.delete(upperSymbol)
      this.sendUnsubscribe(upperSymbol)
    }
  }

  private sendUnsubscribe(symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        symbol: symbol
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

    setTimeout(() => {
      this.connect().catch(() => {
        // Error already handled
      })
    }, delay)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    // Finnhub sends pings, we just need to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Connection is alive
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

// Singleton instance (client-side only)
let instance: FinnhubWebSocket | null = null

export function getFinnhubWebSocket(apiKey: string): FinnhubWebSocket {
  if (!instance) {
    instance = new FinnhubWebSocket(apiKey)
  }
  return instance
}

export function disconnectFinnhub() {
  if (instance) {
    instance.disconnect()
    instance = null
  }
}
