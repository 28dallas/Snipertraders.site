'use client'

import { create } from 'zustand'
import { LiveMarketSnapshot, OpenTrade, Strategy } from '@/types'
import { DerivAccountItem, DerivSession, getDerivSession, saveDerivSession, clearDerivSession } from '@/lib/deriv-session'
import { fetchDerivAccounts } from '@/lib/deriv-accounts'
import { derivWS } from '@/lib/deriv-websocket'
import { hasActiveGoldmineRunner, hasActiveInfinityAlgoRunner, hasActiveTexasEvenRunner } from '@/lib/bots/goldmine-m1-runner'

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

export const GOLDMINE_M1_BOT: BotDefinition = {
  id: 'goldmine-m1',
  name: 'Advanced Goldmine M1',
  market: '1HZ10V',
  strategy: 'Digit Over Recovery',
  contractType: 'DIGITOVER',
  tradeType: 'Digit Over',
  stake: 4,
  duration: '1 tick',
  barrier: 3,
  martingale: 1.7,
  takeProfit: 50,
  stopLoss: 1000,
  description: 'Waits for last digit 1, then trades DIGITOVER with recovery prediction 4 and a 1.7x loss progression.',
  tags: ['Digit Over', '1.7x Recovery', '1 Tick', 'High Risk'],
}

export const INFINITY_ALGO_BOT: BotDefinition = {
  id: 'infinity-algo',
  name: 'Infinity Algo',
  market: 'R_10',
  strategy: 'Digit Over Recovery',
  contractType: 'DIGITOVER',
  tradeType: 'Digit Over',
  stake: 0.5,
  duration: '1 tick',
  barrier: 1,
  martingale: 2,
  stopLoss: 50,
  description: 'Starts on a 4-digit entry gate, recovers losses with a 2x martingale, and keeps trading until the session limit or stop-loss bound is hit.',
  tags: ['Digit Over', 'Entry Gate', 'Martingale', 'Session Control'],
}

export const TEXAS_EVEN_BOT: BotDefinition = {
  id: 'texas-even',
  name: 'Texas Even Bot',
  market: '1HZ10V',
  strategy: 'Entry-gated Even/Odd Burst',
  contractType: 'DIGITEVEN',
  tradeType: 'Even/Odd',
  stake: 4,
  duration: '1 tick',
  martingale: 2,
  takeProfit: 20,
  stopLoss: 50,
  description: 'Arms a ten-trade even-digit burst on a chosen entry digit and stops at the configured profit or loss limit.',
  tags: ['Even', 'Entry Gate', '2x Martingale', 'Burst Trading', 'High Risk'],
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
  locale: 'en' | 'sw'

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
  setLocale: (locale: 'en' | 'sw') => void
  switchAccount: (account: DerivAccountItem) => Promise<void>
  logout: () => void
  setActiveMarket: (symbol: string) => void
  setMarketPrice: (symbol: string, price: number) => void
  setSelectedBot: (bot: BotDefinition | null) => void
  recordTradeResult: (stake: number, payout: number, isWin: boolean, actualProfit?: number) => void
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
  locale: 'en',

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

  initFromSession: async () => {
    const session = getDerivSession()
    if (!session?.token) return

    try {
      const accounts = await fetchDerivAccounts(session.token)
      const account = accounts.find((item) => item.account === (session.loginid || session.account))
      if (!account) throw new Error('Deriv did not return the saved account. Please connect again.')
      const accountHasActiveBot = hasActiveGoldmineRunner(account.account) || hasActiveInfinityAlgoRunner(account.account) || hasActiveTexasEvenRunner(account.account)
      if (get().loginid !== account.account && accountHasActiveBot) {
        set({ error: 'Wait for the open bot contract to settle before switching accounts.' })
        return
      }
      set({
        loginid: account.account,
        token: session.token,
        balance: Number(account.balance ?? session.balance ?? 0),
        currency: account.currency || session.currency || 'USD',
        isVirtual: account.isVirtual,
        accounts,
        isConnected: true,
        error: null,
      })
    } catch (err) {
      // Older Deriv OAuth callbacks return per-account tokens for the legacy API.
      try {
        const accountItem = session.accounts?.find((item) => item.account === (session.loginid || session.account))
        const token = accountItem?.token || session.token
        const expectedAccount = accountItem?.account || session.loginid || session.account
        const expectedAccountHasActiveBot = hasActiveGoldmineRunner(expectedAccount) || hasActiveInfinityAlgoRunner(expectedAccount) || hasActiveTexasEvenRunner(expectedAccount)
        if (get().loginid !== expectedAccount && expectedAccountHasActiveBot) {
          set({ error: 'Wait for the open bot contract to settle before switching accounts.' })
          return
        }
        await derivWS.connect()
        const response = await derivWS.authorize(token)
        const account = response?.authorize
        if (!account?.loginid) throw new Error('Deriv did not confirm the saved account.')
        const authorizedAccountHasActiveBot = hasActiveGoldmineRunner(account.loginid) || hasActiveInfinityAlgoRunner(account.loginid) || hasActiveTexasEvenRunner(account.loginid)
        if (get().loginid !== account.loginid && authorizedAccountHasActiveBot) {
          if (get().token) await derivWS.authorize(get().token!)
          set({ error: 'Wait for the open bot contract to settle before switching accounts.' })
          return
        }
        set({
          loginid: account.loginid,
          token,
          balance: Number(account.balance ?? session.balance ?? 0),
          currency: account.currency || session.currency || 'USD',
          isVirtual: Boolean(account.is_virtual ?? session.is_virtual ?? false),
          accounts: session.accounts || [],
          isConnected: true,
          error: null,
        })
      } catch (legacyErr) {
        set({ isConnected: false, error: legacyErr instanceof Error ? legacyErr.message : (err instanceof Error ? err.message : 'Could not reconnect to Deriv.') })
      }
    }
  },

  setAccount: (data) => {
    const current = get()
    const identityChanged = ('loginid' in data && data.loginid !== current.loginid)
      || ('token' in data && data.token !== current.token)
      || ('currency' in data && data.currency !== current.currency)
    if (identityChanged && (hasActiveGoldmineRunner() || hasActiveInfinityAlgoRunner() || hasActiveTexasEvenRunner())) {
      set({ error: 'Stop Advanced Goldmine M1, Infinity Algo, or Texas Even Bot and settle any open contract before switching accounts.' })
      return
    }
    set((state) => ({ ...state, ...data }))
  },

  setBalance: (balance, currency) => {
    set((state) => {
      const updatedCurrency = currency || state.currency
      const session = getDerivSession()
      if (session) {
        void saveDerivSession({ ...session, balance, currency: updatedCurrency }).catch(() => undefined)
      }
      return { balance, currency: updatedCurrency }
    })
  },

  setLocale: (locale) => {
    try {
      localStorage.setItem('ranger-dashboard-locale', locale)
    } catch {
      // Browser storage may be unavailable in preview contexts.
    }
    set({ locale })
  },

  switchAccount: async (accountItem: DerivAccountItem) => {
    try {
      if (hasActiveGoldmineRunner(accountItem.account) || hasActiveInfinityAlgoRunner(accountItem.account) || hasActiveTexasEvenRunner(accountItem.account)) {
        set({ error: 'Stop Advanced Goldmine M1, Infinity Algo, or Texas Even Bot and settle any open contract before switching accounts.' })
        return
      }
      set({ isLoading: true, error: null })
      const balance = accountItem.balance ?? 0
      const currency = accountItem.currency
      const isVirtual = accountItem.isVirtual

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
      await saveDerivSession(updatedSession)

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
    if (hasActiveGoldmineRunner() || hasActiveInfinityAlgoRunner() || hasActiveTexasEvenRunner()) {
      set({ error: 'Stop Advanced Goldmine M1, Infinity Algo, or Texas Even Bot and settle any open contract before disconnecting.' })
      return
    }
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

  recordTradeResult: (stake: number, payout: number, isWin: boolean, actualProfit?: number) => {
    const netPnl = actualProfit ?? (isWin ? payout - stake : -stake)
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
