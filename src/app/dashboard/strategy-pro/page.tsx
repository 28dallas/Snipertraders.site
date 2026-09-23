'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, ShieldCheck, Play, Wrench, Sparkles, Check, ArrowRight, Layers } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useTradingStore, BotDefinition } from '@/stores/trading-store'

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
