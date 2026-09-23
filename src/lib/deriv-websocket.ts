import { DERIV_APP_ID } from '@/lib/constants'

export interface DerivTick {
  ask: number
  bid: number
  epoch: number
  id: string
  pip_size: number
  quote: number
  symbol: string
}

export interface DerivCandle {
  close: number
  epoch: number
  high: number
  low: number
  open: number
}

export interface DerivProposal {
  id: string
  ask_price: number
  payout: number
  display_value: string
  spot: number
  spot_time: number
}

export interface DerivBuyResponse {
  buy: {
    balance_after: number
    contract_id: number
    longcode: string
    payout: number
    purchase_time: number
    shortcode: string
    start_time: number
    transaction_id: number
  }
}

/**
 * Browser-only Deriv API WebSocket client.
 * Tokens stay purely on the client side and are never sent to intermediate servers.
 */
export class DerivWebSocket {
  private static instance: DerivWebSocket | null = null
  private socket: WebSocket | null = null
  private sequence = 0
  private pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void; isSubscription?: boolean }>()
  private listeners = new Map<string, Set<(data: any) => void>>()
  private activeSubscriptions = new Map<string, string>() // symbol/key -> subscription_id
  private isConnecting = false
  private connectionPromise: Promise<void> | null = null

  static getInstance(): DerivWebSocket {
    if (!DerivWebSocket.instance) {
      DerivWebSocket.instance = new DerivWebSocket()
    }
    return DerivWebSocket.instance
  }

  get isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN
  }

  connect(): Promise<void> {
    if (this.isConnected) return Promise.resolve()
    if (this.isConnecting && this.connectionPromise) return this.connectionPromise

    const appId = DERIV_APP_ID || '1089'
    this.isConnecting = true

    this.connectionPromise = new Promise<void>((resolve, reject) => {
      try {
        this.socket = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${encodeURIComponent(appId)}`)

        this.socket.onopen = () => {
          this.isConnecting = false
          resolve()
        }

        this.socket.onmessage = ({ data }) => {
          try {
            const response = JSON.parse(data)
            const reqId = response.req_id

            // Handle pending request promises
            if (reqId && this.pending.has(reqId)) {
              const req = this.pending.get(reqId)!
              if (response.error) {
                this.pending.delete(reqId)
                req.reject(new Error(response.error.message || 'Deriv API error'))
              } else {
                if (!req.isSubscription) {
                  this.pending.delete(reqId)
                }
                req.resolve(response)
              }
            }

            // Track subscription IDs
            if (response.subscription?.id) {
              if (response.tick?.symbol) {
                this.activeSubscriptions.set(`tick_${response.tick.symbol}`, response.subscription.id)
              }
            }

            // Dispatch to registered event listeners
            const msgType = response.msg_type
            if (msgType) {
              this.emit(msgType, response)
            }
            if (response.tick) {
              this.emit(`tick_${response.tick.symbol}`, response.tick)
              this.emit('tick', response.tick)
            }
            if (response.balance) {
              this.emit('balance', response.balance)
            }
          } catch (err) {
            console.error('[DerivWS] Error parsing message:', err)
          }
        }

        this.socket.onclose = () => {
          this.isConnecting = false
          this.connectionPromise = null
          this.pending.forEach(({ reject }) => reject(new Error('Deriv connection closed.')))
          this.pending.clear()
          this.emit('close', {})
        }

        this.socket.onerror = (e) => {
          this.isConnecting = false
          this.connectionPromise = null
          reject(new Error('Unable to connect to Deriv WebSocket.'))
        }
      } catch (err) {
        this.isConnecting = false
        this.connectionPromise = null
        reject(err instanceof Error ? err : new Error('WebSocket connection error'))
      }
    })

    return this.connectionPromise
  }

  request<T = any>(payload: Record<string, unknown>, isSubscription = false): Promise<T> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return this.connect().then(() => this.request<T>(payload, isSubscription))
    }
    const req_id = ++this.sequence
    const message = JSON.stringify({ ...payload, req_id })
    this.socket.send(message)
    return new Promise((resolve, reject) => {
      this.pending.set(req_id, { resolve, reject, isSubscription })
    })
  }

  // Event listener system
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
    return () => this.off(event, callback)
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback)
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(data)
      } catch (err) {
        console.error(`[DerivWS] Error in listener for ${event}:`, err)
      }
    })
  }

  // Auth & Account
  authorize(token: string) {
    return this.request({ authorize: token })
  }

  balance() {
    return this.request({ balance: 1, subscribe: 1 }, true)
  }

  // Market Ticks & History
  ticks(symbol: string) {
    return this.request({ ticks: symbol, subscribe: 1 }, true)
  }

  tickHistory(symbol: string, count = 100) {
    return this.request({
      ticks_history: symbol,
      count,
      end: 'latest',
      style: 'ticks',
    })
  }

  candlesHistory(symbol: string, count = 60, granularity = 60) {
    return this.request({
      ticks_history: symbol,
      count,
      end: 'latest',
      style: 'candles',
      granularity,
    })
  }

  // Trading Execution
  proposal(params: Record<string, unknown>) {
    return this.request({ proposal: 1, subscribe: 1, ...params }, true)
  }

  buy(proposalId: string, price: number): Promise<DerivBuyResponse> {
    return this.request<DerivBuyResponse>({ buy: proposalId, price })
  }

  // Reporting & Portfolio
  portfolio() {
    return this.request({ portfolio: 1, subscribe: 1 }, true)
  }

  profitTable(params: Record<string, unknown> = {}) {
    return this.request({
      profit_table: 1,
      description: 1,
      limit: 50,
      sort: 'DESC',
      ...params,
    })
  }

  statement(params: Record<string, unknown> = {}) {
    return this.request({
      statement: 1,
      description: 1,
      limit: 50,
      ...params,
    })
  }

  // Utility to subscribe and listen to ticks
  subscribeTicks(symbol: string, onTick: (tick: DerivTick) => void): () => void {
    const unsubEvent = this.on(`tick_${symbol}`, onTick)
    this.ticks(symbol).catch((err) => {
      console.warn(`[DerivWS] Could not subscribe to ticks for ${symbol}:`, err.message)
    })
    return () => {
      unsubEvent()
    }
  }

  // Utility to subscribe to live balance
  subscribeBalance(onBalance: (balanceData: any) => void): () => void {
    const unsubEvent = this.on('balance', onBalance)
    this.balance().catch((err) => {
      console.warn('[DerivWS] Could not subscribe to balance:', err.message)
    })
    return () => {
      unsubEvent()
    }
  }

  disconnect() {
    this.socket?.close()
    this.socket = null
    this.pending.clear()
    this.listeners.clear()
    this.activeSubscriptions.clear()
    this.isConnecting = false
    this.connectionPromise = null
  }
}

export const derivWS = DerivWebSocket.getInstance()
