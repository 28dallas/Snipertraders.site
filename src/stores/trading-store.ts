'use client'

import { create } from 'zustand'
import { LiveMarketSnapshot, OpenTrade, Strategy } from '@/types'
import { DerivAccountItem, DerivSession, getDerivSession, saveDerivSession, clearDerivSession } from '@/lib/deriv-session'
import { derivWS } from '@/lib/deriv-websocket'

export interface BotDefinition {
  id: string
  name: string
  market: string
  strategy: string
  contractType: string
  tradeType: string
  stake: number
  duration: string
  barrier?: number
  martingale?: number
  stopLoss?: number
  takeProfit?: number
  description?: string
  tags?: string[]
}

interface TradingState {
  // Deriv Account Info
  loginid: string | null
  token: string | null
  balance: number | null
  currency: string
  isVirtual: boolean
  accounts: DerivAccountItem[]
  isConnected: boolean

  // Market & Trading
  activeMarket: string
  currentPrice: number | null
  marketPrices: Record<string, number>
  selectedBot: BotDefinition | null

  // Session Statistics (for reports & run trackers)
  sessionPnl: number
  sessionTradesCount: number
  sessionWins: number
  sessionLosses: number
  sessionStake: number
  sessionPayout: number

  // Legacy snapshot / store compat
  snapshot: LiveMarketSnapshot | null
  isLoading: boolean
  isLive: boolean
  copiedStrategies: string[]
  error: string | null

  // Actions
  initFromSession: () => void
  setAccount: (data: Partial<TradingState>) => void
  setBalance: (balance: number, currency?: string) => void
  switchAccount: (account: DerivAccountItem) => Promise<void>
  logout: () => void
  setActiveMarket: (symbol: string) => void
  setMarketPrice: (symbol: string, price: number) => void
  setSelectedBot: (bot: BotDefinition | null) => void
  recordTradeResult: (stake: number, payout: number, isWin: boolean) => void
  resetSessionStats: () => void

  // Copy trading & Polling helpers
  fetchLiveData: () => Promise<void>
  startPolling: (intervalMs?: number) => () => void
  copyStrategy: (strategyId: string) => void
  removeCopiedStrategy: (strategyId: string) => void
}

const defaultSnapshot: LiveMarketSnapshot = {
  timestamp: new Date().toISOString(),
  balance: 10000.00,
  today_pnl: 0.00,
  win_rate: 0,
  active_trades: 0,
  strategies: [],
  open_trades: [],
}

const pollCleanupRef: { current: (() => void) | null } = { current: null }

export const useTradingStore = create<TradingState>((set, get) => ({
  loginid: null,
  token: null,
  balance: null,
  currency: 'USD',
  isVirtual: true,
  accounts: [],
  isConnected: false,

  activeMarket: '1HZ10V',
  currentPrice: null,
  marketPrices: {},
  selectedBot: null,

  sessionPnl: 0,
  sessionTradesCount: 0,
  sessionWins: 0,
  sessionLosses: 0,
  sessionStake: 0,
  sessionPayout: 0,

  snapshot: null,
  isLoading: false,
  isLive: false,
  copiedStrategies: [],
  error: null,

  initFromSession: () => {
    const session = getDerivSession()
    if (session && session.token) {
      set({
        loginid: session.loginid || session.account,
        token: session.token,
        balance: session.balance ?? get().balance ?? 10000,
        currency: session.currency || 'USD',
        isVirtual: session.is_virtual ?? session.account.startsWith('VRT'),
        accounts: session.accounts || [
          {
            account: session.account,
            token: session.token,
            currency: session.currency || 'USD',
            isVirtual: session.is_virtual ?? session.account.startsWith('VRT'),
          },
        ],
        isConnected: true,
      })
    }
  },

  setAccount: (data) => {
    set((state) => ({ ...state, ...data }))
  },

  setBalance: (balance, currency) => {
    set((state) => {
      const updatedCurrency = currency || state.currency
      const session = getDerivSession()
      if (session) {
        saveDerivSession({ ...session, balance, currency: updatedCurrency })
      }
      return { balance, currency: updatedCurrency }
    })
  },

  switchAccount: async (accountItem: DerivAccountItem) => {
    try {
      set({ isLoading: true })
      // Re-authorize with new account token
      await derivWS.connect()
      const authRes = await derivWS.authorize(accountItem.token)

      const balance = authRes?.authorize?.balance ?? 0
      const currency = authRes?.authorize?.currency ?? accountItem.currency
      const isVirtual = Boolean(authRes?.authorize?.is_virtual ?? accountItem.isVirtual)

      const updatedSession: DerivSession = {
        account: accountItem.account,
        token: accountItem.token,
        createdAt: new Date().toISOString(),
        loginid: accountItem.account,
        balance,
        currency,
        is_virtual: isVirtual,
        accounts: get().accounts,
      }
      saveDerivSession(updatedSession)

      set({
        loginid: accountItem.account,
        token: accountItem.token,
        balance,
        currency,
        isVirtual,
        isConnected: true,
        isLoading: false,
      })
    } catch (err) {
      console.error('[TradingStore] Error switching account:', err)
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to switch account' })
    }
  },

  logout: () => {
    derivWS.disconnect()
    clearDerivSession()
    set({
      loginid: null,
      token: null,
      balance: null,
      isConnected: false,
      accounts: [],
    })
  },

  setActiveMarket: (symbol: string) => {
    set({ activeMarket: symbol })
  },

  setMarketPrice: (symbol: string, price: number) => {
    set((state) => ({
      marketPrices: { ...state.marketPrices, [symbol]: price },
      currentPrice: symbol === state.activeMarket ? price : state.currentPrice,
    }))
  },

  setSelectedBot: (bot: BotDefinition | null) => {
    set({ selectedBot: bot })
  },

  recordTradeResult: (stake: number, payout: number, isWin: boolean) => {
    const netPnl = isWin ? payout - stake : -stake
    set((state) => ({
      sessionTradesCount: state.sessionTradesCount + 1,
      sessionWins: state.sessionWins + (isWin ? 1 : 0),
      sessionLosses: state.sessionLosses + (isWin ? 0 : 1),
      sessionStake: parseFloat((state.sessionStake + stake).toFixed(2)),
      sessionPayout: parseFloat((state.sessionPayout + payout).toFixed(2)),
      sessionPnl: parseFloat((state.sessionPnl + netPnl).toFixed(2)),
      balance: state.balance !== null ? parseFloat((state.balance + netPnl).toFixed(2)) : null,
    }))
  },

  resetSessionStats: () => {
    set({
      sessionPnl: 0,
      sessionTradesCount: 0,
      sessionWins: 0,
      sessionLosses: 0,
      sessionStake: 0,
      sessionPayout: 0,
    })
  },

  fetchLiveData: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/market/live')
      if (!res.ok) throw new Error('Failed to fetch live data')
      const data: LiveMarketSnapshot = await res.json()
      set({ snapshot: data, isLoading: false, isLive: true })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false,
        snapshot: get().snapshot ?? defaultSnapshot,
      })
    }
  },

  startPolling: (intervalMs = 4000) => {
    if (pollCleanupRef.current) pollCleanupRef.current()

    get().fetchLiveData()

    const interval = setInterval(() => get().fetchLiveData(), intervalMs)
    set({ isLive: true })

    const cleanup = () => {
      clearInterval(interval)
      pollCleanupRef.current = null
      set({ isLive: false })
    }

    pollCleanupRef.current = cleanup
    return cleanup
  },

  copyStrategy: (strategyId: string) => {
    const current = get().copiedStrategies
    if (!current.includes(strategyId)) {
      set({ copiedStrategies: [...current, strategyId] })
    }
  },

  removeCopiedStrategy: (strategyId: string) => {
    set({ copiedStrategies: get().copiedStrategies.filter((id) => id !== strategyId) })
  },
}))

export function selectStrategies(state: TradingState): Strategy[] {
  return state.snapshot?.strategies ?? []
}

export function selectOpenTrades(state: TradingState): OpenTrade[] {
  return state.snapshot?.open_trades ?? []
}
