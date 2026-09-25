import { getRequiredDerivAppId } from '@/lib/constants'

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
  private subscriptionListeners = new Map<string, number>()
  private contractSubscriptions = new Map<number, string>()
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

    const appId = getRequiredDerivAppId()
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
              if (response.proposal_open_contract?.contract_id) {
                this.contractSubscriptions.set(response.proposal_open_contract.contract_id, response.subscription.id)
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
            if (response.proposal_open_contract?.contract_id) {
              this.emit(`contract_${response.proposal_open_contract.contract_id}`, response.proposal_open_contract)
            }
          } catch (err) {
            console.error('[DerivWS] Error parsing message:', err)
          }
        }

        this.socket.onclose = () => {
          this.isConnecting = false
          this.connectionPromise = null
          this.activeSubscriptions.clear()
          this.subscriptionListeners.clear()
          this.contractSubscriptions.clear()
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

  subscribeContract(contractId: number, onUpdate: (contract: Record<string, any>) => void): () => void {
    const event = `contract_${contractId}`
    const unsubscribe = this.on(event, onUpdate)
    this.request({ proposal_open_contract: 1, contract_id: contractId, subscribe: 1 }, true).catch((err) => {
      console.warn(`[DerivWS] Could not subscribe to contract ${contractId}:`, err.message)
    })
    return () => {
      unsubscribe()
      const subscriptionId = this.contractSubscriptions.get(contractId)
      if (subscriptionId) {
        this.request({ forget: subscriptionId }).catch(() => undefined)
        this.contractSubscriptions.delete(contractId)
      }
    }
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
    let active = true
    const unsubEvent = this.on(`tick_${symbol}`, onTick)
    const listenerCount = (this.subscriptionListeners.get(symbol) ?? 0) + 1
    this.subscriptionListeners.set(symbol, listenerCount)
    if (listenerCount === 1) {
      this.ticks(symbol).then((response) => {
        if (!active || (this.subscriptionListeners.get(symbol) ?? 0) > 0) return
        const subscriptionId = response?.subscription?.id || this.activeSubscriptions.get(`tick_${symbol}`)
        if (subscriptionId) {
          this.request({ forget: subscriptionId }).catch(() => undefined)
          this.activeSubscriptions.delete(`tick_${symbol}`)
        }
      }).catch((err) => {
        console.warn(`[DerivWS] Could not subscribe to ticks for ${symbol}:`, err.message)
      })
    }
    return () => {
      active = false
      unsubEvent()
      const remaining = (this.subscriptionListeners.get(symbol) ?? 1) - 1
      if (remaining > 0) {
        this.subscriptionListeners.set(symbol, remaining)
        return
      }
      this.subscriptionListeners.delete(symbol)
      const subscriptionId = this.activeSubscriptions.get(`tick_${symbol}`)
      if (subscriptionId) {
        this.request({ forget: subscriptionId }).catch(() => undefined)
        this.activeSubscriptions.delete(`tick_${symbol}`)
      }
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
    this.subscriptionListeners.clear()
    this.contractSubscriptions.clear()
    this.isConnecting = false
    this.connectionPromise = null
  }
}

export const derivWS = DerivWebSocket.getInstance()
