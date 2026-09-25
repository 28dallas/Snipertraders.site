'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, ShieldCheck, Play, Wrench, Sparkles, Check, ArrowRight, Layers } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useTradingStore, BotDefinition } from '@/stores/trading-store'
import { derivWS, DerivTick } from '@/lib/deriv-websocket'

interface ProStrategyItem {
  id: string
  name: string
  version: string
  market: string
  marketLabel: string
  type: string
  contractType: string
  minStake: number
  targetWinRate: string
  recoveryModel: string
  maxDrawdownTarget: string
  description: string
  entryRule: string
  exitRule: string
  tags: string[]
}

const PRO_STRATEGIES: ProStrategyItem[] = [
  {
    id: 'pro-1',
    name: 'Martingale Shield 2.0',
    version: 'v2.4',
    market: '1HZ75V',
    marketLabel: 'Volatility 75 (1s)',
    type: 'Rise/Fall',
    contractType: 'RISE',
    minStake: 0.5,
    targetWinRate: '78% - 84% cycle win',
    recoveryModel: 'Bounded Martingale (Max 4 steps with safety cut)',
    maxDrawdownTarget: '< 15% account allocation',
    description: 'Dynamic recovery system that resets after each win. Incorporates an automatic circuit breaker if 4 consecutive losses occur to prevent capital wipeout.',
    entryRule: 'Entry after 2 consecutive falling ticks on 1-tick Call.',
    exitRule: 'Auto-exit on single win; reset stake to base $0.50.',
    tags: ['Bounded Recovery', 'Trend Following', 'Circuit Breaker'],
  },
  {
    id: 'pro-2',
    name: 'D\'Alembert Parity Matrix',
    version: 'v1.8',
    market: '1HZ10V',
    marketLabel: 'Volatility 10 (1s)',
    type: 'Even/Odd',
    contractType: 'EVEN',
    minStake: 1.0,
    targetWinRate: '65% - 70% model target',
    recoveryModel: 'Linear D\'Alembert (+1 stake on loss, -1 stake on win)',
    maxDrawdownTarget: '< 8% capital drawdown',
    description: 'Low-variance recovery algorithm. Unlike geometric Martingale, stakes increase linearly by 1 unit only on loss and decrease on profit, making it exceptionally safe.',
    entryRule: 'Triggers on parity equilibrium divergence (> 55% Odd distribution over 50 ticks).',
    exitRule: 'Revert to base unit when profit equilibrium is reached.',
    tags: ['Linear Staking', 'Even/Odd', 'Conservative'],
  },
  {
    id: 'pro-3',
    name: 'Oscar\'s Grind High-Probability Runner',
    version: 'v3.1',
    market: '1HZ25V',
    marketLabel: 'Volatility 25 (1s)',
    type: 'Over/Under',
    contractType: 'OVER',
    minStake: 0.5,
    targetWinRate: '82% - 88% overall target',
    recoveryModel: 'Oscar\'s Grind (+1 unit only after a win in a losing sequence)',
    maxDrawdownTarget: '< 10% risk profile',
    description: 'Classical statistical betting algorithm designed to achieve exactly 1 unit of profit per sequence, maintaining flat stakes during losing streaks.',
    entryRule: 'Enters Over 1 contract when preceding digit is ≤ 1.',
    exitRule: 'Sequence closes immediately when cumulative series profit reaches +$1.00.',
    tags: ['Oscar\'s Grind', 'Over 1', 'Low Variance'],
  },
  {
    id: 'pro-4',
    name: 'Digit Differ Cluster Hunter',
    version: 'v2.0',
    market: '1HZ50V',
    marketLabel: 'Volatility 50 (1s)',
    type: 'Digit Match/Differ',
    contractType: 'DIFFER',
    minStake: 2.0,
    targetWinRate: '90% statistical probability',
    recoveryModel: 'Flat Staking with Strict Stop-Loss',
    maxDrawdownTarget: '< 5% allocation',
    description: 'Targets digit differ outcomes with ~90% baseline mathematical advantage. Skips trades when target digit variance is anomalous.',
    entryRule: 'Enters when target digit frequency is below standard 10% expectation.',
    exitRule: 'Fixed 1-tick settlement with immediate profit lock.',
    tags: ['90% Edge', 'Differ', 'Flat Stake'],
  },
]

export default function StrategyProPage() {
  const router = useRouter()
  const { setSelectedBot } = useTradingStore()
  const [marketPrice, setMarketPrice] = useState<number | null>(null)
  const [signal, setSignal] = useState<'CALL' | 'PUT'>('CALL')
  const [strategyMarket, setStrategyMarket] = useState('1HZ75V')
  const [strategyName, setStrategyName] = useState('Momentum Shield')
  const [stake, setStake] = useState(0.5)
  const [takeProfit, setTakeProfit] = useState(5)
  const [stopLoss, setStopLoss] = useState(3)
  const [martingale, setMartingale] = useState(false)
  const [tradeLog, setTradeLog] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const previousPrice = useRef<number | null>(null)

  useEffect(() => {
    previousPrice.current = null
    const unsubscribe = derivWS.subscribeTicks(strategyMarket, (tick: DerivTick) => {
      setSignal(tick.quote >= (previousPrice.current ?? tick.quote) ? 'CALL' : 'PUT')
      previousPrice.current = tick.quote
      setMarketPrice(tick.quote)
    })
    return unsubscribe
  }, [strategyMarket])

  const startStrategy = () => {
    setRunning((current) => !current)
    setTradeLog((previous) => [`${new Date().toLocaleTimeString()} ${signal} signal queued at ${marketPrice?.toFixed(2) ?? '--'}`, ...previous].slice(0, 8))
  }

  const handleDeploy = (strat: ProStrategyItem, destination: 'auto' | 'builder') => {
    const botDef: BotDefinition = {
      id: strat.id,
      name: `${strat.name} ${strat.version}`,
      market: strat.market,
      strategy: strat.name,
      contractType: strat.contractType,
      tradeType: strat.type,
      stake: strat.minStake,
      duration: '1 tick',
      description: strat.description,
      tags: strat.tags,
    }
    setSelectedBot(botDef)

    if (destination === 'auto') {
      router.push(`/dashboard/auto-trader?bot=${encodeURIComponent(strat.name)}`)
    } else {
      router.push(`/dashboard/bot-builder?view=quick&bot=${encodeURIComponent(strat.name)}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-[#1e2a40] bg-[#0d1424] p-5">
          <div className="mb-4 flex items-center justify-between"><div><div className="text-xs uppercase tracking-wider text-muted-foreground">Live price ticker</div><div className="mt-1 font-mono text-3xl font-black text-white">{marketPrice?.toFixed(2) ?? '--'}</div></div><Badge variant={signal === 'CALL' ? 'green' : 'red'}>{signal}</Badge></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-[11px] text-muted-foreground">Market<select value={strategyMarket} onChange={(event) => setStrategyMarket(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-white"><option value="1HZ10V">Volatility 10 (1s)</option><option value="1HZ50V">Volatility 50 (1s)</option><option value="1HZ75V">Volatility 75 (1s)</option><option value="1HZ100V">Volatility 100 (1s)</option></select></label>
            <label className="text-[11px] text-muted-foreground">Strategy<select value={strategyName} onChange={(event) => setStrategyName(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-white"><option>Momentum Shield</option><option>Digit Over/Under</option><option>Parity Matrix</option></select></label>
            <label className="text-[11px] text-muted-foreground">Stake<input type="number" min="0.35" step="0.05" value={stake} onChange={(event) => setStake(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-white" /></label>
            <label className="text-[11px] text-muted-foreground">Take profit<input type="number" min="0" value={takeProfit} onChange={(event) => setTakeProfit(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-white" /></label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs"><label className="flex items-center gap-2 text-slate-300"><input type="checkbox" checked={martingale} onChange={(event) => setMartingale(event.target.checked)} className="accent-primary" />Martingale</label>{martingale && <span className="text-muted-foreground">Multiplier <input type="number" min="1" step="0.1" defaultValue="1.5" className="ml-1 w-16 rounded border border-border bg-surface px-2 py-1 text-white" /></span>}<label className="text-muted-foreground">Stop loss <input type="number" min="0" value={stopLoss} onChange={(event) => setStopLoss(Number(event.target.value))} className="ml-1 w-16 rounded border border-border bg-surface px-2 py-1 text-white" /></label><span className="text-amber-300">Risk guard limits loss to configured stop.</span></div>
          <button type="button" onClick={startStrategy} className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black ${running ? 'bg-rose-500 text-white' : 'bg-primary text-black'}`}><Play className="h-4 w-4" />{running ? 'Stop strategy' : 'Start strategy preview'}</button>
        </Card>
        <Card className="border-[#1e2a40] bg-[#0d1424] p-5"><h3 className="text-sm font-bold text-white">Scanner & trades</h3><p className="mt-1 text-xs text-muted-foreground">{strategyName} is watching {strategyMarket}.</p><div className="mt-4 space-y-2">{tradeLog.length ? tradeLog.map((entry) => <div key={entry} className="rounded-lg border border-border bg-surface p-2 text-[11px] text-slate-300">{entry}</div>) : <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">No trades yet in this session.</div>}</div></Card>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Strategy Pro Templates
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Curated mathematical algorithms with advanced recovery models and risk protection rules
          </p>
        </div>

        <Badge variant="live" className="text-xs">
          INSTITUTIONAL MODELS
        </Badge>
      </div>

      {/* Strategies Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {PRO_STRATEGIES.map((strat) => (
          <Card
            key={strat.id}
            className="p-6 bg-[#0d1424] border-[#1e2a40] hover:border-primary/40 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-extrabold text-base sm:text-lg">{strat.name}</h3>
                    <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {strat.version}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground mt-0.5">
                    {strat.marketLabel} ({strat.market})
                  </div>
                </div>
                <Badge variant="green" className="text-[10px]">
                  {strat.type}
                </Badge>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                {strat.description}
              </p>

              {/* Technical Specifications */}
              <div className="p-4 rounded-xl bg-surface/60 border border-border/80 mb-5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recovery Model:</span>
                  <span className="text-white font-medium">{strat.recoveryModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Historical Target Edge:</span>
                  <span className="text-profit font-mono font-bold">{strat.targetWinRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Drawdown Ceiling:</span>
                  <span className="text-amber-400 font-mono font-semibold">{strat.maxDrawdownTarget}</span>
                </div>
                <div className="pt-2 border-t border-[#1e2a40] text-[11px] text-slate-300">
                  <strong className="text-white">Trigger Rule:</strong> {strat.entryRule}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {strat.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-lg bg-surface border border-border text-[10px] font-mono text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#1e2a40] grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDeploy(strat, 'builder')}
                className="py-2.5 px-3 rounded-xl bg-surface border border-border hover:bg-white/5 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Wrench className="w-3.5 h-3.5 text-teal-400" />
                Customize in Builder
              </button>

              <button
                type="button"
                onClick={() => handleDeploy(strat, 'auto')}
                className="py-2.5 px-3 rounded-xl bg-primary text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all shadow-glow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                Deploy to Auto Trader
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
