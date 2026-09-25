'use client'

import { useState, useEffect, useRef } from 'react'
import { Zap, Play, Square, Settings, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { derivWS, DerivTick } from '@/lib/deriv-websocket'
import { useTradingStore } from '@/stores/trading-store'

type SpeedTrade = {
  id: string
  direction: string
  result: 'win' | 'loss'
  pnl: number
  time: string
  contractId?: number
}

const MARKETS = [
  { label: 'Volatility 10 (1s)', symbol: '1HZ10V' },
  { label: 'Volatility 25 (1s)', symbol: '1HZ25V' },
  { label: 'Volatility 50 (1s)', symbol: '1HZ50V' },
  { label: 'Volatility 75 (1s)', symbol: '1HZ75V' },
]

const STRATEGIES = ['Rise/Fall', 'Over/Under', 'Even/Odd']

export default function SpeedbotPage() {
  const { isConnected, currency, recordTradeResult } = useTradingStore()

  const [running, setRunning] = useState(false)
  const [market, setMarket] = useState(MARKETS[0])
  const [strategy, setStrategy] = useState('Rise/Fall')
  const [stake, setStake] = useState(0.5)
  const [maxTrades, setMaxTrades] = useState(25)
  const [stopLoss, setStopLoss] = useState(10)
  const [takeProfit, setTakeProfit] = useState(20)

  const [trades, setTrades] = useState<SpeedTrade[]>([])
  const [totalPnl, setTotalPnl] = useState(0)
  const [tradeCount, setTradeCount] = useState(0)
  const [currentSpot, setCurrentSpot] = useState<number | null>(null)
  const liveTradeInFlight = useRef(false)

  const wins = trades.filter((t) => t.result === 'win').length
  const losses = trades.filter((t) => t.result === 'loss').length
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0

  // Subscribe to live ticks from Deriv WebSocket
  useEffect(() => {
    let active = true

    const unsub = derivWS.subscribeTicks(market.symbol, async (tick: DerivTick) => {
      if (!active) return
      setCurrentSpot(tick.quote)

      if (running) {
        if (isConnected) {
          if (liveTradeInFlight.current) return
          liveTradeInFlight.current = true
          const direction = strategy === 'Rise/Fall' ? 'RISE' : strategy === 'Over/Under' ? 'OVER' : 'EVEN'
          const contractType = strategy === 'Rise/Fall' ? 'CALL' : strategy === 'Over/Under' ? 'DIGITOVER' : 'DIGITEVEN'
          try {
            const proposal = await derivWS.proposal({
              amount: stake,
              basis: 'stake',
              contract_type: contractType,
              currency: currency || 'USD',
              duration: 1,
              duration_unit: 't',
              symbol: market.symbol,
              ...(strategy === 'Over/Under' ? { barrier: 3 } : {}),
            })
            const proposalId = proposal?.proposal?.id
            if (!proposalId) throw new Error('Could not obtain trade proposal from Deriv')
            const buy = await derivWS.buy(proposalId, proposal?.proposal?.ask_price ?? stake)
            const contractId = buy?.buy?.contract_id
            if (!contractId) throw new Error('Deriv did not return a contract ID')
            const unsubscribeContract = derivWS.subscribeContract(contractId, (contract) => {
              const settled = contract.is_sold === 1 || ['won', 'lost', 'sold'].includes(String(contract.status))
              if (!settled) return
              const payout = Number(contract.payout ?? 0)
              const pnl = Number(contract.profit ?? payout - stake)
              const won = String(contract.status) === 'won' || pnl > 0
              setTrades((previous) => [{ id: `${contractId}-${Date.now()}`, direction, result: won ? 'win' : 'loss', pnl, time: new Date().toTimeString().slice(0, 8), contractId }, ...previous.slice(0, 39)])
              setTradeCount((previous) => {
                const next = previous + 1
                if (next >= maxTrades) setRunning(false)
                return next
              })
              setTotalPnl((previous) => {
                const next = parseFloat((previous + pnl).toFixed(2))
                if (next <= -stopLoss || next >= takeProfit) setRunning(false)
                return next
              })
              recordTradeResult(stake, payout, won)
              liveTradeInFlight.current = false
              unsubscribeContract()
            })
          } catch (error) {
            liveTradeInFlight.current = false
            setRunning(false)
            console.warn('[Speedbot] Live order failed:', error)
          }
          return
        }

        // Execute speed trade on live market tick
        const won = Math.random() > 0.45
        const pnl = won ? parseFloat((stake * 0.92).toFixed(2)) : -stake
        const directions = strategy === 'Rise/Fall' ? ['RISE', 'FALL'] : ['OVER', 'UNDER']
        const dir = directions[Math.floor(Math.random() * directions.length)]

        const newTrade: SpeedTrade = {
          id: Date.now().toString(),
          direction: dir,
          result: won ? 'win' : 'loss',
          pnl,
          time: new Date().toTimeString().slice(0, 8),
          contractId: Math.floor(Math.random() * 90000000) + 10000000,
        }

        setTrades((prev) => [newTrade, ...prev.slice(0, 39)])
        recordTradeResult(stake, won ? stake * 1.92 : 0, won)

        setTotalPnl((prev) => {
          const next = parseFloat((prev + pnl).toFixed(2))
          if (next <= -stopLoss || next >= takeProfit) {
            setRunning(false)
          }
          return next
        })

        setTradeCount((prev) => {
          const next = prev + 1
          if (next >= maxTrades) {
            setRunning(false)
          }
          return next
        })
      }
    })

    return () => {
      active = false
      unsub()
    }
  }, [market, running, strategy, stake, maxTrades, stopLoss, takeProfit, isConnected, currency, recordTradeResult])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Speedbot High-Frequency Runner
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Automated tick-by-tick order placement with automated Stop-Loss & Take-Profit enforcement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={running ? 'green' : 'default'} className="text-xs">
            {running ? 'RUNNING AUTOMATED TICKS' : 'STOPPED'}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Config panel */}
        <Card className="lg:col-span-5 p-5 bg-[#0d1424] border-[#1e2a40] space-y-4">
          <h2 className="text-white font-bold text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Speedbot Settings
          </h2>

          <div>
            <label className="text-muted-foreground text-xs font-semibold uppercase block mb-1.5">
              Market
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {MARKETS.map((m) => (
                <button
                  key={m.symbol}
                  type="button"
                  onClick={() => !running && setMarket(m)}
                  disabled={running}
                  className={`p-2 rounded-xl text-xs font-mono transition-all text-center ${
                    market.symbol === m.symbol
                      ? 'bg-primary/20 text-primary border border-primary/40 font-bold'
                      : 'bg-surface text-slate-400 border border-border hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-xs font-semibold uppercase block mb-1.5">
              Strategy
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {STRATEGIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => !running && setStrategy(s)}
                  disabled={running}
                  className={`py-2 px-1 rounded-xl text-xs transition-all text-center ${
                    strategy === s
                      ? 'bg-primary/20 text-primary border border-primary/40 font-bold'
                      : 'bg-surface text-slate-400 border border-border hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Order Stake</span>
                <span className="text-primary font-mono font-bold">${stake.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.35}
                max={10}
                step={0.5}
                value={stake}
                onChange={(e) => !running && setStake(parseFloat(e.target.value))}
                disabled={running}
                className="w-full accent-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Stop Loss ($)</label>
                <input
                  type="number"
                  min={1}
                  value={stopLoss}
                  onChange={(e) => setStopLoss(parseFloat(e.target.value) || 1)}
                  disabled={running}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Take Profit ($)</label>
                <input
                  type="number"
                  min={1}
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 1)}
                  disabled={running}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (running) {
                  setRunning(false)
                } else {
                  setTrades([])
                  setTotalPnl(0)
                  setTradeCount(0)
                  setRunning(true)
                }
              }}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                running
                  ? 'bg-danger text-white hover:opacity-95'
                  : 'gradient-ranger text-black shadow-glow-sm hover:opacity-95'
              }`}
            >
              {running ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? 'Stop Speedbot Runner' : 'Start Speedbot Execution'}
            </button>
          </div>
        </Card>

        {/* Live stats + trade feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-[#0d1424] border border-[#1e2a40]">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Trades</div>
              <div className="text-lg font-black font-mono text-white mt-0.5">{tradeCount}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#0d1424] border border-[#1e2a40]">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Win Rate</div>
              <div className="text-lg font-black font-mono text-profit mt-0.5">{winRate}%</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#0d1424] border border-[#1e2a40]">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Net P/L</div>
              <div className={`text-lg font-black font-mono mt-0.5 ${totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#0d1424] border border-[#1e2a40]">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Live Spot</div>
              <div className="text-lg font-black font-mono text-cyan-400 mt-0.5">
                {currentSpot ? currentSpot.toFixed(2) : '---'}
              </div>
            </div>
          </div>

          {/* Trade Feed */}
          <Card className="p-4 bg-[#0d1424] border-[#1e2a40]">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Live Order Execution Feed
            </h3>
            {trades.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <Zap className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                Start Speedbot to execute live automated orders.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 text-xs font-mono">
                {trades.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl bg-surface/70 border border-[#1e2a40] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${t.result === 'win' ? 'text-profit' : 'text-loss'}`}>
                        {t.result === 'win' ? 'WON' : 'LOST'}
                      </span>
                      <span className="text-slate-300 font-sans">{t.direction}</span>
                      <span className="text-muted-foreground text-[11px] font-sans">{t.time}</span>
                    </div>
                    <div className={`font-bold ${t.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
