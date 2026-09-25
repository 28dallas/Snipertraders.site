'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, Play, RefreshCw, Search, ShieldCheck, Target, TrendingDown, TrendingUp } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

type Signal = {
  market: string
  symbol: string
  direction: 'CALL' | 'PUT'
  confidence: number
  streak: number
  price: string
  updated: string
}

const MARKETS = [
  { market: 'Volatility 10 (1s)', symbol: '1HZ10V', base: 4821.42 },
  { market: 'Volatility 25 (1s)', symbol: '1HZ25V', base: 2398.16 },
  { market: 'Volatility 50 (1s)', symbol: '1HZ50V', base: 3467.81 },
  { market: 'Volatility 75 (1s)', symbol: '1HZ75V', base: 1254.09 },
  { market: 'Volatility 100 (1s)', symbol: '1HZ100V', base: 578.64 },
  { market: 'Step Index', symbol: 'stpRNG', base: 1002.11 },
]

const METRICS: Array<{ label: string; value: string; Icon: typeof Activity }> = [
  { label: 'Markets monitored', value: '06', Icon: Activity },
  { label: 'Active signals', value: '06', Icon: Target },
  { label: 'Average confidence', value: '74%', Icon: ShieldCheck },
  { label: 'Scanner status', value: 'Live', Icon: Activity },
]

function createSignals(): Signal[] {
  return MARKETS.map((item, index) => {
    const direction = index % 3 === 1 ? 'PUT' : 'CALL'
    const confidence = 62 + ((index * 7) % 25)
    return {
      market: item.market,
      symbol: item.symbol,
      direction,
      confidence,
      streak: 2 + (index % 4),
      price: (item.base + (Math.random() - 0.5) * 3).toFixed(2),
      updated: 'just now',
    }
  })
}

export default function ProScannerPage() {
  const [scanning, setScanning] = useState(true)
  const [signals, setSignals] = useState<Signal[]>(createSignals)
  const [filter, setFilter] = useState<'all' | 'CALL' | 'PUT'>('all')

  const metrics = METRICS.map((metric) =>
    metric.label === 'Active signals'
      ? { ...metric, value: String(signals.length) }
      : metric.label === 'Average confidence'
        ? { ...metric, value: `${Math.round(signals.reduce((sum, signal) => sum + signal.confidence, 0) / signals.length)}%` }
        : metric.label === 'Scanner status'
          ? { ...metric, value: scanning ? 'Live' : 'Paused' }
          : metric,
  )

  useEffect(() => {
    if (!scanning) return
    const interval = window.setInterval(() => setSignals(createSignals()), 4000)
    return () => window.clearInterval(interval)
  }, [scanning])

  const visibleSignals = useMemo(
    () => signals.filter((signal) => filter === 'all' || signal.direction === filter),
    [filter, signals],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-black tracking-tight text-white">Pro Scanner</h1>
            <Badge variant={scanning ? 'live' : 'default'}>{scanning ? 'SCANNING' : 'PAUSED'}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Scan synthetic markets for momentum, streaks, and high-confidence entry conditions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSignals(createSignals())}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setScanning((current) => !current)}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${scanning ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-primary text-black hover:bg-primary/90'}`}
          >
            {scanning ? <Activity className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {scanning ? 'Pause scan' : 'Start scan'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(({ label, value, Icon }) => (
          <Card key={String(label)} className="border-[#1e2a40] bg-[#0d1424] p-4">
            <Icon className="mb-3 h-4 w-4 text-primary" />
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 font-mono text-xl font-black text-white">{value}</div>
          </Card>
        ))}
      </div>

      <Card className="border-[#1e2a40] bg-[#0d1424] p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-white">Market signals</h2>
            <p className="text-xs text-muted-foreground">Signals are analytical prompts, not guaranteed trade outcomes.</p>
          </div>
          <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
            {(['all', 'CALL', 'PUT'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${filter === value ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
              >
                {value === 'all' ? 'All' : value}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleSignals.map((signal) => {
            const bullish = signal.direction === 'CALL'
            return (
              <div key={signal.symbol} className="rounded-2xl border border-border bg-surface/60 p-4 transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{signal.market}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{signal.symbol}</div>
                  </div>
                  <div className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black ${bullish ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>
                    {bullish ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {signal.direction}
                  </div>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</div>
                    <div className="mt-1 font-mono text-2xl font-black text-primary">{signal.confidence}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Spot</div>
                    <div className="mt-1 font-mono text-sm font-bold text-white">{signal.price}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <span>{signal.streak} tick momentum streak</span>
                  <span>{signal.updated}</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}