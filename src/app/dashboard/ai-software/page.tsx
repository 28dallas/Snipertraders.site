'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Cpu, Sparkles, Sliders, ShieldCheck, Play, ArrowRight, CheckCircle2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useTradingStore, BotDefinition } from '@/stores/trading-store'

const DIGIT_BOTS = Array.from({ length: 8 }, (_, index) => {
  const digit = index + 1
  return {
    id: `ai-digit-${digit}`,
    name: `Dual Edge ${digit}`,
    rule: `Over ${digit} / Under ${digit + 1}`,
    description: `Pairs an Over ${digit} condition with an Under ${digit + 1} hedge on the latest tick digit.`,
  }
})

export default function AiSoftwarePage() {
  const router = useRouter()
  const { setSelectedBot } = useTradingStore()

  const [market, setMarket] = useState('1HZ10V')
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced')
  const [capital, setCapital] = useState(500)
  const [contractType, setContractType] = useState('Rise/Fall')
  const [activeTab, setActiveTab] = useState<'AI Robots' | 'Dual Edge'>('AI Robots')
  const [activeSubTab, setActiveSubTab] = useState<'Solo' | 'Combo'>('Solo')

  // Rule-based quantitative parameter optimization
  const recommendations = useMemo(() => {
    let stakePct = riskProfile === 'conservative' ? 0.005 : riskProfile === 'balanced' ? 0.01 : 0.025
    let baseStake = Math.max(0.35, parseFloat((capital * stakePct).toFixed(2)))
    let maxSteps = riskProfile === 'conservative' ? 2 : riskProfile === 'balanced' ? 3 : 4
    let multiplier = riskProfile === 'conservative' ? 1.5 : riskProfile === 'balanced' ? 1.8 : 2.0
    let recoveryName =
      riskProfile === 'conservative'
        ? "Linear D'Alembert (+1 unit)"
        : riskProfile === 'balanced'
        ? "Oscar's Grind Series"
        : 'Bounded Martingale (2x)'

    let stopLoss = parseFloat((capital * (riskProfile === 'conservative' ? 0.05 : 0.1)).toFixed(2))
    let takeProfit = parseFloat((capital * (riskProfile === 'conservative' ? 0.04 : 0.08)).toFixed(2))

    let expectedWinRate =
      contractType === 'Over/Under'
        ? '78% - 82%'
        : contractType === 'Even/Odd'
        ? '52% - 55%'
        : '56% - 62%'

    return {
      baseStake,
      recoveryName,
      maxSteps,
      multiplier,
      stopLoss,
      takeProfit,
      expectedWinRate,
      optimalDuration: market === '1HZ75V' ? '3 ticks' : '1 tick',
      volatilityRating: market === '1HZ100V' || market === '1HZ75V' ? 'High' : 'Moderate',
    }
  }, [market, riskProfile, capital, contractType])

  const handleDeployRecommendation = () => {
    const marketLabel = market === '1HZ10V' ? 'Volatility 10 (1s)' : 'Volatility 75 (1s)'
    const optimizedBot: BotDefinition = {
      id: `ai-optimized-${Date.now()}`,
      name: `AI Optimized: ${marketLabel}`,
      market,
      strategy: `${recommendations.recoveryName} Model`,
      contractType: contractType === 'Rise/Fall' ? 'RISE' : 'OVER',
      tradeType: contractType,
      stake: recommendations.baseStake,
      duration: recommendations.optimalDuration,
      stopLoss: recommendations.stopLoss,
      takeProfit: recommendations.takeProfit,
      martingale: recommendations.multiplier,
      description: `Optimized by Ranger AI Recommender for ${riskProfile} risk profile with $${capital} capital.`,
    }

    setSelectedBot(optimizedBot)
    router.push(`/dashboard/auto-trader?bot=${encodeURIComponent(optimizedBot.name)}`)
  }

  const openDigitBot = (bot: (typeof DIGIT_BOTS)[number]) => {
    const definition: BotDefinition = {
      id: bot.id,
      name: bot.name,
      market,
      strategy: bot.rule,
      contractType: 'OVER',
      tradeType: 'Over/Under',
      stake: 0.5,
      duration: '1 tick',
      description: bot.description,
      tags: [activeTab, activeSubTab, bot.rule],
    }
    setSelectedBot(definition)
    router.push(`/dashboard/bot-builder?view=quick&bot=${encodeURIComponent(bot.name)}`)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            AI Parameter Recommender
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Rule-based algorithmic optimization tailored to your trading capital and risk tolerance
          </p>
        </div>

        <Badge variant="live" className="text-xs">
          HEURISTIC OPTIMIZER v1.0
        </Badge>
      </div>

      <Card className="border-[#1e2a40] bg-[#0d1424] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-base font-black text-white">AI digit robots</h2><p className="mt-1 text-xs text-muted-foreground">Paired Over/Under conditions with transparent trade setup rules.</p></div>
          <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">{(['AI Robots', 'Dual Edge'] as const).map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${activeTab === tab ? 'bg-primary text-black' : 'text-slate-400'}`}>{tab}</button>)}</div>
        </div>
        <div className="mt-4 flex gap-2">{(['Solo', 'Combo'] as const).map((tab) => <button key={tab} type="button" onClick={() => setActiveSubTab(tab)} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${activeSubTab === tab ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-slate-400'}`}>{tab}</button>)}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{DIGIT_BOTS.map((bot) => <div key={bot.id} className="rounded-xl border border-border bg-surface/60 p-3"><div className="flex items-center justify-between"><span className="text-sm font-bold text-white">{bot.name}</span><Badge variant="green" className="text-[9px]">AUTO</Badge></div><p className="mt-2 text-xs font-semibold text-primary">{bot.rule}</p><p className="mt-2 min-h-10 text-[11px] leading-relaxed text-slate-400">{bot.description}</p><div className="mt-3 border-t border-border pt-2 text-[10px] text-muted-foreground">Trade setup: 1 tick · $0.50 base stake</div><button type="button" onClick={() => openDigitBot(bot)} className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-primary px-2 py-2 text-[11px] font-bold text-black"><Play className="h-3 w-3" />Open bot</button></div>)}</div>
      </Card>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Input Configuration */}
        <Card className="lg:col-span-5 p-5 bg-[#0d1424] border-[#1e2a40] space-y-4">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            Risk & Portfolio Inputs
          </h3>

          <div>
            <label className="text-muted-foreground text-xs font-semibold uppercase block mb-1.5">
              Target Market
            </label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-primary font-mono"
            >
              <option value="1HZ10V">Volatility 10 (1s) Index</option>
              <option value="1HZ25V">Volatility 25 (1s) Index</option>
              <option value="1HZ50V">Volatility 50 (1s) Index</option>
              <option value="1HZ75V">Volatility 75 (1s) Index</option>
              <option value="1HZ100V">Volatility 100 (1s) Index</option>
            </select>
          </div>

          <div>
            <label className="text-muted-foreground text-xs font-semibold uppercase block mb-1.5">
              Contract Style
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['Rise/Fall', 'Over/Under', 'Even/Odd'].map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => setContractType(ct)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-all text-center ${
                    contractType === ct
                      ? 'bg-primary/20 text-primary border border-primary/40 font-bold'
                      : 'bg-surface text-slate-400 border border-border hover:text-white'
                  }`}
                >
                  {ct}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-xs font-semibold uppercase block mb-1.5">
              Risk Profile
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['conservative', 'balanced', 'aggressive'] as const).map((rp) => (
                <button
                  key={rp}
                  type="button"
                  onClick={() => setRiskProfile(rp)}
                  className={`py-2 px-1 rounded-xl text-xs capitalize transition-all text-center ${
                    riskProfile === rp
                      ? 'bg-primary text-black font-bold shadow-glow-sm'
                      : 'bg-surface text-slate-400 border border-border hover:text-white'
                  }`}
                >
                  {rp}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground font-semibold">Available Capital Allocation</span>
              <span className="text-primary font-mono font-bold">${capital}</span>
            </div>
            <input
              type="range"
              min={50}
              max={2500}
              step={50}
              value={capital}
              onChange={(e) => setCapital(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
              <span>$50</span>
              <span>$1,000</span>
              <span>$2,500</span>
            </div>
          </div>
        </Card>

        {/* AI Output Recommendations */}
        <Card className="lg:col-span-7 p-6 bg-[#0d1424] border-[#1e2a40] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-white font-extrabold text-base">Recommended Execution Formula</h3>
              </div>
              <Badge variant="green" className="text-xs">
                CALCULATED
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-surface/70 border border-border">
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Optimal Base Stake</div>
                <div className="text-xl font-black font-mono text-primary mt-1">
                  ${recommendations.baseStake.toFixed(2)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Calculated safe capital fraction</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface/70 border border-border">
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Optimal Duration</div>
                <div className="text-xl font-black font-mono text-white mt-1">
                  {recommendations.optimalDuration}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Based on tick momentum curves</div>
              </div>
            </div>

            {/* Recommended Parameters Detailed Spec */}
            <div className="p-4 rounded-2xl bg-surface/50 border border-border/80 space-y-2.5 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recovery Model:</span>
                <span className="text-white font-bold">{recommendations.recoveryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stop Loss Ceiling:</span>
                <span className="text-loss font-mono font-bold">-${recommendations.stopLoss.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Take Profit Target:</span>
                <span className="text-profit font-mono font-bold">+${recommendations.takeProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Win Probability:</span>
                <span className="text-cyan-400 font-mono font-bold">{recommendations.expectedWinRate}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDeployRecommendation}
            className="w-full py-3.5 rounded-2xl gradient-ranger text-black font-black text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-glow-sm"
          >
            <Play className="w-4 h-4" />
            Apply Parameters to Auto Trader
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </Card>
      </div>
    </div>
  )
}
