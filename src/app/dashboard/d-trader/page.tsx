'use client'

import { useState, useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle, CheckCircle, Zap, ShieldCheck } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { derivWS, DerivTick } from '@/lib/deriv-websocket'
import { useTradingStore } from '@/stores/trading-store'

const MARKETS = [
  { label: 'Volatility 10 (1s)', symbol: '1HZ10V', base: 4920.50 },
  { label: 'Volatility 25 (1s)', symbol: '1HZ25V', base: 2345.60 },
  { label: 'Volatility 50 (1s)', symbol: '1HZ50V', base: 3456.80 },
  { label: 'Volatility 75 (1s)', symbol: '1HZ75V', base: 1429.80 },
  { label: 'Volatility 100 (1s)', symbol: '1HZ100V', base: 567.90 },
  { label: 'Volatility 10', symbol: 'R_10', base: 3120.10 },
  { label: 'Volatility 50', symbol: 'R_50', base: 215.40 },
  { label: 'Volatility 75', symbol: 'R_75', base: 845.20 },
  { label: 'Volatility 100', symbol: 'R_100', base: 1980.50 },
]

const CONTRACT_TYPES = ['Rise/Fall', 'Over/Under', 'Even/Odd', 'Digit Match']
const DURATIONS = ['1 tick', '2 ticks', '3 ticks', '5 ticks', '10 ticks']

type TradeRecord = {
  id: string
  contractId?: number
  market: string
  type: string
  direction: string
  stake: number
  payout: number
  result: 'win' | 'loss' | 'pending'
  pnl: number
  time: string
  longcode?: string
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={65}>
      <LineChart data={chartData}>
        <YAxis domain={['auto', 'auto']} hide />
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function DTraderPage() {
  const { isConnected, currency, recordTradeResult } = useTradingStore()

  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0])
  const [contractType, setContractType] = useState('Rise/Fall')
  const [duration, setDuration] = useState('1 tick')
  const [stake, setStake] = useState(1)
  const [targetDigit, setTargetDigit] = useState(5)

  const [price, setPrice] = useState<number>(selectedMarket.base)
  const [priceHistory, setPriceHistory] = useState<number[]>(
    Array.from({ length: 40 }, () => selectedMarket.base)
  )
  const [trades, setTrades] = useState<TradeRecord[]>([])
  const [placing, setPlacing] = useState(false)
  const [totalPnl, setTotalPnl] = useState(0)
  const [wsLive, setWsLive] = useState(false)
  const [executionMessage, setExecutionMessage] = useState<string | null>(null)

  // Subscribe to live ticks from Deriv WebSocket
  useEffect(() => {
    let active = true
    setWsLive(false)

    // First fetch recent history if available
    derivWS
      .tickHistory(selectedMarket.symbol, 40)
      .then((res: any) => {
        if (!active) return
        const historyPrices = res?.history?.prices
        if (Array.isArray(historyPrices) && historyPrices.length > 0) {
          const parsed = historyPrices.map((p: any) => parseFloat(p))
          setPriceHistory(parsed)
          setPrice(parsed[parsed.length - 1])
          setWsLive(true)
        }
      })
      .catch((err) => {
        console.warn('[D-Trader] History fallback:', err.message)
      })

    // Subscribe to streaming ticks
    const unsub = derivWS.subscribeTicks(selectedMarket.symbol, (tick: DerivTick) => {
      if (!active) return
      setWsLive(true)
      const newQuote = tick.quote
      setPrice(newQuote)
      setPriceHistory((prev) => [...prev.slice(-39), newQuote])
    })

    return () => {
      active = false
      unsub()
    }
  }, [selectedMarket])

  // Fallback price ticker if WebSocket isn't live yet
  useEffect(() => {
    if (wsLive) return
    const interval = setInterval(() => {
      setPrice((prev) => {
        const next = parseFloat((prev + (Math.random() - 0.49) * prev * 0.001).toFixed(4))
        setPriceHistory((h) => [...h.slice(-39), next])
        return next
      })
    }, 800)
    return () => clearInterval(interval)
  }, [wsLive])

  // Place Trade via Deriv proposal -> buy
  const placeTrade = async (direction: string) => {
    setPlacing(true)
    setExecutionMessage(null)

    const tradeId = Date.now().toString()
    const durationTicks = parseInt(duration) || 1

    const newTrade: TradeRecord = {
      id: tradeId,
      market: selectedMarket.symbol,
      type: contractType,
      direction,
      stake,
      payout: parseFloat((stake * 1.92).toFixed(2)),
      result: 'pending',
      pnl: 0,
      time: new Date().toTimeString().slice(0, 8),
    }
    setTrades((prev) => [newTrade, ...prev])

    // Build Deriv contract type parameters
    let derivContractType = 'CALL'
    let extraParams: Record<string, unknown> = {}

    if (contractType === 'Rise/Fall') {
      derivContractType = direction === 'RISE' ? 'CALL' : 'PUT'
    } else if (contractType === 'Over/Under') {
      derivContractType = direction === 'OVER' ? 'DIGITOVER' : 'DIGITUNDER'
      extraParams.barrier = targetDigit
    } else if (contractType === 'Even/Odd') {
      derivContractType = direction === 'EVEN' ? 'DIGITEVEN' : 'DIGITODD'
    } else if (contractType === 'Digit Match') {
      derivContractType = 'DIGITMATCH'
      extraParams.barrier = targetDigit
    }

    if (isConnected) {
      try {
        // 1. Request live proposal
        const proposalRes = await derivWS.proposal({
          amount: stake,
          basis: 'stake',
          contract_type: derivContractType,
          currency: currency || 'USD',
          duration: durationTicks,
          duration_unit: 't',
          symbol: selectedMarket.symbol,
          ...extraParams,
        })

        const proposalId = proposalRes?.proposal?.id
        const askPrice = proposalRes?.proposal?.ask_price ?? stake
        const expectedPayout = proposalRes?.proposal?.payout ?? stake * 1.92

        if (!proposalId) throw new Error('Could not obtain trade proposal from Deriv')

        // 2. Execute buy
        const buyRes = await derivWS.buy(proposalId, askPrice)
        const contractId = buyRes?.buy?.contract_id
        if (!contractId) throw new Error('Deriv did not return a contract ID')

        setExecutionMessage(`Order placed! Contract ID: #${contractId}`)

        const unsubscribeContract = derivWS.subscribeContract(contractId, (contract) => {
          const settled = contract.is_sold === 1 || ['won', 'lost', 'sold'].includes(String(contract.status))
          if (!settled) return
          const settledPayout = Number(contract.payout ?? 0)
          const netPnl = Number(contract.profit ?? settledPayout - stake)
          const won = String(contract.status) === 'won' || netPnl > 0
          setTrades((prev) =>
            prev.map((t) =>
              t.id === tradeId
                ? {
                    ...t,
                    contractId,
                    result: won ? 'win' : 'loss',
                    pnl: netPnl,
                    payout: settledPayout,
                  }
                : t
            )
          )

          setTotalPnl((prev) => parseFloat((prev + netPnl).toFixed(2)))
          recordTradeResult(stake, settledPayout, won)
          setPlacing(false)
          unsubscribeContract()
        })

        return
      } catch (err) {
        console.warn('[D-Trader] Live buy exception:', err)
        setTrades((prev) => prev.filter((trade) => trade.id !== tradeId))
        setExecutionMessage(`Live order failed: ${err instanceof Error ? err.message : 'Deriv API error'}`)
        setPlacing(false)
        return
      }
    }

    // Graceful fallback simulation
    setTimeout(() => {
      const won = Math.random() > 0.45
      const netPnl = won ? parseFloat((stake * 0.92).toFixed(2)) : -stake

      setTrades((prev) =>
        prev.map((t) =>
          t.id === tradeId
            ? {
                ...t,
                result: won ? 'win' : 'loss',
                pnl: netPnl,
                payout: won ? parseFloat((stake * 1.92).toFixed(2)) : 0,
              }
            : t
        )
      )

      setTotalPnl((prev) => parseFloat((prev + netPnl).toFixed(2)))
      recordTradeResult(stake, won ? stake * 1.92 : 0, won)
      setPlacing(false)
    }, durationTicks * 1000 + 400)
  }

  const prevPrice = priceHistory[priceHistory.length - 2] ?? price
  const rising = price >= prevPrice

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Manual Trader <span className="text-primary font-mono text-sm">(D-Trader)</span>
          </h1>
          <p className="text-muted-foreground text-xs">
            Direct Deriv WebSocket execution • Instant proposal & contract fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${wsLive ? 'bg-profit animate-pulse' : 'bg-warning'}`} />
          <span className="text-xs font-mono font-semibold text-slate-300">
            {wsLive ? 'DERIV WS STREAMING' : 'CONNECTING WS FEED'}
          </span>
        </div>
      </div>

      {executionMessage && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-xs text-primary flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{executionMessage}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-5">
        {/* Left: Market Picker + Chart + Recent Trades */}
        <div className="lg:col-span-8 space-y-4">
          {/* Market Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {MARKETS.map((m) => (
              <button
                key={m.symbol}
                onClick={() => setSelectedMarket(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all shrink-0 ${
                  selectedMarket.symbol === m.symbol
                    ? 'bg-primary text-black shadow-glow-sm'
                    : 'bg-[#0d1424] border border-[#1e2a40] text-slate-400 hover:text-white hover:border-primary/40'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Live Price Display & Mini Chart */}
          <Card className="p-5 bg-[#0d1424] border-[#1e2a40]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  {selectedMarket.label} ({selectedMarket.symbol})
                </div>
                <div
                  className={`text-4xl sm:text-5xl font-black font-mono mt-1.5 transition-colors ${
                    rising ? 'text-profit' : 'text-loss'
                  }`}
                >
                  {price.toFixed(4)}
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-mono font-bold mt-1.5 ${rising ? 'text-profit' : 'text-loss'}`}>
                  {rising ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{rising ? '+' : ''}{(price - (priceHistory[0] || price)).toFixed(4)}</span>
                  <span className="text-muted-foreground font-normal ml-1">over 40 ticks</span>
                </div>
              </div>

              <div className="w-full sm:w-56">
                <MiniChart data={priceHistory} color={rising ? '#00E676' : '#EF4444'} />
              </div>
            </div>
          </Card>

          {/* Execution History */}
          <Card className="p-5 bg-[#0d1424] border-[#1e2a40]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-sm">Recent Trades</h2>
              <div className={`text-xs font-bold font-mono ${totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                Session Total: {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </div>
            </div>

            {trades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No trades placed in this session. Select a contract type on the right to trade.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {trades.map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface/70 border border-[#1e2a40] text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          trade.result === 'pending'
                            ? 'bg-warning/20 text-warning'
                            : trade.result === 'win'
                            ? 'bg-profit/20 text-profit'
                            : 'bg-loss/20 text-loss'
                        }`}
                      >
                        {trade.result === 'pending' ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : trade.result === 'win' ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-bold font-mono">
                          {trade.market} · {trade.direction}
                        </div>
                        <div className="text-muted-foreground text-[11px]">
                          {trade.type} · Stake ${trade.stake} · {trade.time}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-mono font-bold ${
                          trade.result === 'pending'
                            ? 'text-warning'
                            : trade.result === 'win'
                            ? 'text-profit'
                            : 'text-loss'
                        }`}
                      >
                        {trade.result === 'pending' ? 'PENDING...' : `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl}`}
                      </div>
                      {trade.contractId && (
                        <div className="text-[10px] text-muted-foreground font-mono">
                          #{trade.contractId}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Order Configuration Panel */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 bg-[#0d1424] border-[#1e2a40]">
            <h3 className="text-white font-bold text-sm mb-4">Contract Parameters</h3>

            {/* Contract Type Selection */}
            <div className="mb-4">
              <label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block mb-2">
                Contract Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CONTRACT_TYPES.map((ct) => (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => setContractType(ct)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all text-center ${
                      contractType === ct
                        ? 'bg-primary/15 text-primary border border-primary/40 font-bold'
                        : 'bg-surface text-slate-400 border border-border hover:text-white'
                    }`}
                  >
                    {ct}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="mb-4">
              <label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block mb-2">
                Duration (Ticks)
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      duration === d
                        ? 'bg-primary text-black font-bold'
                        : 'bg-surface text-slate-400 border border-border hover:text-white'
                    }`}
                  >
                    {d.replace(' tick', 'T').replace('s', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Digit Selection if applicable */}
            {(contractType === 'Over/Under' || contractType === 'Digit Match') && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-semibold">Prediction Digit</span>
                  <span className="text-primary font-mono font-bold">{targetDigit}</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTargetDigit(d)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        targetDigit === d
                          ? 'bg-amber-400 text-black shadow-glow-sm'
                          : 'bg-surface text-slate-400 border border-border hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stake Input */}
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-semibold">Stake ({currency || 'USD'})</span>
                <span className="text-primary font-mono font-bold">${stake.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.35}
                max={50}
                step={0.5}
                value={stake}
                onChange={(e) => setStake(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex gap-1.5 mt-2">
                {[0.5, 1, 2, 5, 10].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setStake(v)}
                    className="flex-1 py-1 rounded-lg bg-surface border border-border text-[11px] font-mono text-slate-300 hover:text-white hover:border-primary/40 transition-colors"
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Payout Forecast Box */}
            <div className="bg-[#090f1d] border border-[#1e2a40] rounded-xl p-3 mb-5 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Stake</span>
                <span className="text-white font-mono font-bold">${stake.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Payout</span>
                <span className="text-profit font-mono font-bold">+${(stake * 0.92).toFixed(2)} (192%)</span>
              </div>
            </div>

            {/* Action Buttons based on contract type */}
            {contractType === 'Rise/Fall' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => placeTrade('RISE')}
                  disabled={placing}
                  className="flex flex-col items-center gap-1 py-3.5 rounded-2xl bg-profit text-black font-extrabold text-sm hover:opacity-95 transition-all shadow-glow-sm disabled:opacity-50"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>RISE (CALL)</span>
                </button>
                <button
                  type="button"
                  onClick={() => placeTrade('FALL')}
                  disabled={placing}
                  className="flex flex-col items-center gap-1 py-3.5 rounded-2xl bg-loss text-white font-extrabold text-sm hover:opacity-95 transition-all disabled:opacity-50"
                >
                  <TrendingDown className="w-5 h-5" />
                  <span>FALL (PUT)</span>
                </button>
              </div>
            )}

            {contractType === 'Over/Under' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => placeTrade('OVER')}
                  disabled={placing}
                  className="flex flex-col items-center gap-1 py-3.5 rounded-2xl bg-primary text-black font-extrabold text-sm hover:opacity-95 transition-all shadow-glow-sm disabled:opacity-50"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>OVER {targetDigit}</span>
                </button>
                <button
                  type="button"
                  onClick={() => placeTrade('UNDER')}
                  disabled={placing}
                  className="flex flex-col items-center gap-1 py-3.5 rounded-2xl bg-amber-400 text-black font-extrabold text-sm hover:opacity-95 transition-all disabled:opacity-50"
                >
                  <TrendingDown className="w-5 h-5" />
                  <span>UNDER {targetDigit}</span>
                </button>
              </div>
            )}

            {contractType === 'Even/Odd' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => placeTrade('EVEN')}
                  disabled={placing}
                  className="flex flex-col items-center gap-1 py-3.5 rounded-2xl bg-cyan-400 text-black font-extrabold text-sm hover:opacity-95 transition-all disabled:opacity-50"
                >
                  <span className="text-xl">2,4,6</span>
                  <span>EVEN</span>
                </button>
                <button
                  type="button"
                  onClick={() => placeTrade('ODD')}
                  disabled={placing}
                  className="flex flex-col items-center gap-1 py-3.5 rounded-2xl bg-purple-400 text-black font-extrabold text-sm hover:opacity-95 transition-all disabled:opacity-50"
                >
                  <span className="text-xl">1,3,5</span>
                  <span>ODD</span>
                </button>
              </div>
            )}

            {contractType === 'Digit Match' && (
              <button
                type="button"
                onClick={() => placeTrade(`MATCH ${targetDigit}`)}
                disabled={placing}
                className="w-full py-4 rounded-2xl gradient-ranger text-black font-black text-sm hover:opacity-95 transition-all shadow-glow-sm disabled:opacity-50"
              >
                MATCH DIGIT {targetDigit}
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
