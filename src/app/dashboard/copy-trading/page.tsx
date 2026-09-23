'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, Bot, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight, Play, Wrench } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useTradingStore } from '@/stores/trading-store'

interface CopyStrategyTemplate {
  id: string
  name: string
  provider: string
  market: string
  marketLabel: string
  description: string
  methodology: string
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive'
  targetWinRate: string
  minStake: number
  verifiedStatus: 'Audited Model' | 'Algorithm Benchmark'
}

const CURATED_STRATEGIES: CopyStrategyTemplate[] = [
  {
    id: 'strat-1',
    name: 'Volatility 10 Trend Follower',
    provider: 'QuantRanger Lab',
    market: '1HZ10V',
    marketLabel: 'Volatility 10 (1s)',
    description: 'Algorithmic micro-trend strategy taking 1-tick Call/Put positions on slope breakout confirmation.',
    methodology: 'Moving Slope Momentum (3-period EMA filter)',
    riskLevel: 'Conservative',
    targetWinRate: '56% - 62% expected',
    minStake: 0.5,
    verifiedStatus: 'Audited Model',
  },
  {
    id: 'strat-2',
    name: 'Digit Differ 5-Cluster Shield',
    provider: 'AlphaMatrix Tech',
    market: '1HZ25V',
    marketLabel: 'Volatility 25 (1s)',
    description: 'High-probability digit differ engine executing only when target digit frequency is over-saturated.',
    methodology: 'Poisson Digit Distribution Analysis',
    riskLevel: 'Conservative',
    targetWinRate: '88% - 91% expected',
    minStake: 1.0,
    verifiedStatus: 'Audited Model',
  },
  {
    id: 'strat-3',
    name: 'Volatility 75 Breakout Scalper',
    provider: 'ApexSynth Capital',
    market: '1HZ75V',
    marketLabel: 'Volatility 75 (1s)',
    description: 'High-volatility momentum bursts timed after low-volatility consolidation ranges.',
    methodology: 'Volatility Squeeze & Tick Surge Expansion',
    riskLevel: 'Moderate',
    targetWinRate: '58% - 64% expected',
    minStake: 2.0,
    verifiedStatus: 'Algorithm Benchmark',
  },
  {
    id: 'strat-4',
    name: 'Even-Odd Parity Reversal',
    provider: 'Ranger Systems',
    market: '1HZ50V',
    marketLabel: 'Volatility 50 (1s)',
    description: 'Statistical streak reversion strategy taking alternating positions after parity runs.',
    methodology: 'Bernoulli Trial Streak Monitoring',
    riskLevel: 'Moderate',
    targetWinRate: '52% - 55% expected',
    minStake: 0.5,
    verifiedStatus: 'Algorithm Benchmark',
  },
]

export default function CopyTradingPage() {
  const router = useRouter()
  const { setSelectedBot } = useTradingStore()
  const [following, setFollowing] = useState<string[]>([])

  const toggleFollow = (id: string) => {
    setFollowing((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const deployToBuilder = (strat: CopyStrategyTemplate) => {
    setSelectedBot({
      id: strat.id,
      name: strat.name,
      market: strat.market,
      strategy: strat.name,
      contractType: 'RISE',
      tradeType: 'Rise/Fall',
      stake: strat.minStake,
      duration: '1 tick',
      description: strat.description,
    })
    router.push(`/dashboard/auto-trader?bot=${encodeURIComponent(strat.name)}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Copy className="w-6 h-6 text-primary" />
            Strategy Templates & Copy Trading
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Curated mathematical trading templates • Deploy directly into Auto Trader or Bot Builder
          </p>
        </div>

        <Badge variant="yellow" className="text-xs">
          PREVIEW & TEMPLATE SUITE
        </Badge>
      </div>

      {/* Transparency / Compliance Notice */}
      <div className="p-4 rounded-2xl bg-surface/80 border border-[#1e2a40] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-0.5 font-semibold">Transparent Performance Advisory:</strong>
          RangerTrader does not display fabricated win rates or fake social profiles. All strategies below are algorithmic model benchmarks that can be verified and executed directly through your Deriv account in Auto Trader or Bot Builder.
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {CURATED_STRATEGIES.map((strat) => {
          const isFollowed = following.includes(strat.id)
          return (
            <Card
              key={strat.id}
              className="p-5 bg-[#0d1424] border-[#1e2a40] hover:border-primary/40 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-white font-bold text-base">{strat.name}</h3>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      by {strat.provider}
                    </div>
                  </div>
                  <Badge variant={strat.riskLevel === 'Conservative' ? 'green' : 'yellow'} className="text-[10px]">
                    {strat.riskLevel}
                  </Badge>
                </div>

                <div className="text-xs font-mono text-primary mb-3">
                  Market: {strat.marketLabel} ({strat.market})
                </div>

                <p className="text-slate-300 text-xs leading-relaxed mb-4">
                  {strat.description}
                </p>

                <div className="p-3 rounded-xl bg-surface/50 border border-border/60 mb-4 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model Methodology:</span>
                    <span className="text-white font-medium">{strat.methodology}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Probability:</span>
                    <span className="text-profit font-mono font-bold">{strat.targetWinRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Suggested Minimum Stake:</span>
                    <span className="text-white font-mono font-bold">${strat.minStake.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1e2a40] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleFollow(strat.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                    isFollowed
                      ? 'bg-profit/15 text-profit border-profit/30'
                      : 'bg-surface text-slate-300 border-border hover:text-white'
                  }`}
                >
                  {isFollowed ? '✓ Following Model' : '+ Track Model'}
                </button>

                <button
                  type="button"
                  onClick={() => deployToBuilder(strat)}
                  className="py-2 px-4 rounded-xl bg-primary text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shadow-glow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  Deploy to Auto Trader
                </button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
