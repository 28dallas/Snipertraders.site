'use client'

import { useState } from 'react'
import { Layers, Play, CheckCircle, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { derivWS } from '@/lib/deriv-websocket'
import { useTradingStore } from '@/stores/trading-store'

interface BulkMarketRow {
  symbol: string
  name: string
  enabled: boolean
  stake: number
  duration: number
  status: 'idle' | 'executing' | 'filled' | 'error'
  contractId?: number
  pnl?: number
  payout?: number
}

const INITIAL_MARKETS: BulkMarketRow[] = [
  { symbol: '1HZ10V', name: 'Volatility 10 (1s)', enabled: true, stake: 0.5, duration: 1, status: 'idle' },
  { symbol: '1HZ25V', name: 'Volatility 25 (1s)', enabled: true, stake: 0.5, duration: 1, status: 'idle' },
  { symbol: '1HZ50V', name: 'Volatility 50 (1s)', enabled: true, stake: 1.0, duration: 1, status: 'idle' },
  { symbol: '1HZ75V', name: 'Volatility 75 (1s)', enabled: true, stake: 1.0, duration: 3, status: 'idle' },
  { symbol: '1HZ100V', name: 'Volatility 100 (1s)', enabled: false, stake: 0.5, duration: 1, status: 'idle' },
]

export default function BulkTraderPage() {
  const { isConnected, currency, recordTradeResult } = useTradingStore()
  const [markets, setMarkets] = useState<BulkMarketRow[]>(INITIAL_MARKETS)
  const [globalDirection, setGlobalDirection] = useState<'RISE' | 'FALL' | 'OVER' | 'UNDER'>('RISE')
  const [executing, setExecuting] = useState(false)
  const [executionSummary, setExecutionSummary] = useState<string | null>(null)

  const activeMarkets = markets.filter((m) => m.enabled)
  const totalStake = activeMarkets.reduce((sum, m) => sum + m.stake, 0)

  const toggleMarket = (symbol: string) => {
    setMarkets((prev) =>
      prev.map((m) => (m.symbol === symbol ? { ...m, enabled: !m.enabled } : m))
    )
  }

  const updateMarketStake = (symbol: string, stake: number) => {
    setMarkets((prev) =>
      prev.map((m) => (m.symbol === symbol ? { ...m, stake } : m))
    )
  }

  const executeBulkTrades = async () => {
    setExecuting(true)
    setExecutionSummary(null)

    // Mark active markets as executing
    setMarkets((prev) =>
      prev.map((m) => (m.enabled ? { ...m, status: 'executing' } : m))
    )

    const contractType =
      globalDirection === 'RISE'
        ? 'CALL'
        : globalDirection === 'FALL'
        ? 'PUT'
        : globalDirection === 'OVER'
        ? 'DIGITOVER'
        : 'DIGITUNDER'

    const tradePromises = activeMarkets.map(async (m) => {
      try {
        if (isConnected) {
          // Request proposal for this market
          const prop = await derivWS.proposal({
            amount: m.stake,
            basis: 'stake',
            contract_type: contractType,
            currency: currency || 'USD',
            duration: m.duration,
            duration_unit: 't',
            symbol: m.symbol,
            ...(globalDirection === 'OVER' ? { barrier: 3 } : globalDirection === 'UNDER' ? { barrier: 7 } : {}),
          })

          const pid = prop?.proposal?.id
          const askPrice = prop?.proposal?.ask_price ?? m.stake
          if (pid) {
            const buyRes = await derivWS.buy(pid, askPrice)
            const cid = buyRes?.buy?.contract_id
            if (!cid) throw new Error('Deriv did not return a contract ID')
            const unsubscribeContract = derivWS.subscribeContract(cid, (contract) => {
              const settled = contract.is_sold === 1 || ['won', 'lost', 'sold'].includes(String(contract.status))
              if (!settled) return
              const settledPayout = Number(contract.payout ?? 0)
              const net = Number(contract.profit ?? settledPayout - m.stake)
              const won = String(contract.status) === 'won' || net > 0
              recordTradeResult(m.stake, settledPayout, won)
              setMarkets((prev) =>
                prev.map((item) =>
                  item.symbol === m.symbol
                    ? { ...item, status: 'filled', contractId: cid, pnl: net, payout: settledPayout }
                    : item
                )
              )
              unsubscribeContract()
            })

            return { symbol: m.symbol, success: true, contractId: cid }
          }
          throw new Error('Could not obtain a live trade proposal')
        }

        // Simulated fill when offline / preview
        setTimeout(() => {
          const won = Math.random() > 0.45
          const payout = m.stake * 1.92
          const net = won ? payout - m.stake : -m.stake
          recordTradeResult(m.stake, won ? payout : 0, won)
          setMarkets((prev) =>
            prev.map((item) =>
              item.symbol === m.symbol
                ? { ...item, status: 'filled', contractId: Math.floor(Math.random() * 80000000) + 10000000, pnl: net, payout }
                : item
            )
          )
        }, m.duration * 1000 + 400)

        return { symbol: m.symbol, success: true }
      } catch (err) {
        setMarkets((prev) =>
          prev.map((item) =>
            item.symbol === m.symbol ? { ...item, status: 'error' } : item
          )
        )
        return { symbol: m.symbol, success: false }
      }
    })

    await Promise.allSettled(tradePromises)
    setExecuting(false)
    setExecutionSummary(`Dispatched ${activeMarkets.length} contracts across selected markets.`)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Bulk Multi-Market Trader
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Place coordinated orders across multiple synthetic indices simultaneously with per-contract stake configuration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="green" className="text-xs">
            PARALLEL EXECUTION
          </Badge>
        </div>
      </div>

      {executionSummary && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-xs text-primary flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{executionSummary}</span>
        </div>
      )}

      {/* Control Bar: Direction & Aggregate Stake */}
      <Card className="p-5 bg-[#0d1424] border-[#1e2a40]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block mb-2">
              Synchronized Direction
            </label>
            <div className="flex gap-2">
              {(['RISE', 'FALL', 'OVER', 'UNDER'] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setGlobalDirection(dir)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    globalDirection === dir
                      ? dir === 'RISE' || dir === 'OVER'
                        ? 'bg-profit text-black shadow-glow-sm'
                        : 'bg-loss text-white'
                      : 'bg-surface text-slate-400 border border-border hover:text-white'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-muted-foreground text-xs font-semibold">Total Portfolio Allocation</div>
              <div className="text-2xl font-black font-mono text-primary">
                ${totalStake.toFixed(2)}
              </div>
            </div>

            <button
              type="button"
              onClick={executeBulkTrades}
              disabled={executing || activeMarkets.length === 0}
              className="py-3 px-6 rounded-2xl gradient-ranger text-black font-black text-xs sm:text-sm flex items-center gap-2 hover:opacity-95 transition-all shadow-glow-sm disabled:opacity-50"
            >
              {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Execute {activeMarkets.length} Markets
            </button>
          </div>
        </div>
      </Card>

      {/* Markets Selection Table */}
      <Card className="p-0 bg-[#0d1424] border-[#1e2a40] overflow-hidden">
        <div className="p-4 border-b border-[#1e2a40] flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">Target Markets & Staking Allocation</h3>
          <span className="text-xs text-muted-foreground font-mono">
            {activeMarkets.length} of {markets.length} selected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e2a40] text-muted-foreground text-[11px] uppercase bg-surface/40">
                <th className="py-3 px-4 w-12 text-center">Enable</th>
                <th className="py-3 px-4">Market Symbol</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Per-Contract Stake</th>
                <th className="py-3 px-4 text-right">Status / Contract</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a40]/60 font-mono">
              {markets.map((m) => (
                <tr key={m.symbol} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={m.enabled}
                      onChange={() => toggleMarket(m.symbol)}
                      className="rounded accent-primary w-4 h-4"
                    />
                  </td>
                  <td className="py-3 px-4 text-white font-bold">{m.symbol}</td>
                  <td className="py-3 px-4 font-sans text-slate-300">{m.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{m.duration} Tick{m.duration > 1 ? 's' : ''}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 w-32">
                      <span className="text-muted-foreground">$</span>
                      <input
                        type="number"
                        min={0.35}
                        step={0.5}
                        value={m.stake}
                        onChange={(e) => updateMarketStake(m.symbol, parseFloat(e.target.value) || 0.35)}
                        className="w-full bg-surface border border-border rounded-lg px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {m.status === 'executing' ? (
                      <span className="text-warning flex items-center justify-end gap-1 font-sans">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Placing...
                      </span>
                    ) : m.status === 'filled' ? (
                      <span className="font-bold flex items-center justify-end gap-1.5">
                        <span className={m.pnl && m.pnl >= 0 ? 'text-profit' : 'text-loss'}>
                          {m.pnl && m.pnl >= 0 ? '+' : ''}${m.pnl?.toFixed(2)}
                        </span>
                        {m.contractId && <span className="text-muted-foreground font-normal">#{m.contractId}</span>}
                      </span>
                    ) : m.status === 'error' ? (
                      <span className="text-loss font-sans font-bold">Failed</span>
                    ) : (
                      <span className="text-muted-foreground font-sans">Ready</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
