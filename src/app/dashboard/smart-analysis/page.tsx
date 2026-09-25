'use client'

import { useState, useEffect } from 'react'
import {
  Play, RotateCcw, AlertTriangle, X, ChevronRight, Zap, CheckCircle, BarChart2
} from 'lucide-react'
import ReportsPanel, { ReportTab } from '@/components/dashboard/ReportsPanel'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { derivWS, DerivTick } from '@/lib/deriv-websocket'
import { useTradingStore } from '@/stores/trading-store'

const MARKETS = [
  { label: 'Volatility 10 (1s)', symbol: '1HZ10V' },
  { label: 'Volatility 25 (1s)', symbol: '1HZ25V' },
  { label: 'Volatility 50 (1s)', symbol: '1HZ50V' },
  { label: 'Volatility 75 (1s)', symbol: '1HZ75V' },
  { label: 'Volatility 100 (1s)', symbol: '1HZ100V' },
  { label: 'Volatility 10', symbol: 'R_10' },
  { label: 'Volatility 50', symbol: 'R_50' },
  { label: 'Volatility 75', symbol: 'R_75' },
]

export default function SmartAnalysisPage() {
  const { isConnected, currency, recordTradeResult } = useTradingStore()

  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0])
  const [running, setRunning] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('summary')
  const [journalLogs, setJournalLogs] = useState<Array<{ time: string; text: string; type?: 'info' | 'success' | 'warning' }>>([])

  const [price, setPrice] = useState<number | null>(null)
  const [digits, setDigits] = useState<number[]>([])
  const [selectedDigit, setSelectedDigit] = useState<number | null>(7)
  const [stake, setStake] = useState(0.5)

  const addJournalEntry = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const time = new Date().toTimeString().slice(0, 8)
    setJournalLogs((prev) => [{ time, text, type }, ...prev.slice(0, 49)])
  }

  // Subscribe to real Deriv ticks and populate actual last digits
  useEffect(() => {
    let active = true

    // Fetch initial history for 100 digits
    derivWS
      .tickHistory(selectedMarket.symbol, 100)
      .then((res: any) => {
        if (!active) return
        const prices = res?.history?.prices
        if (Array.isArray(prices) && prices.length > 0) {
          const parsedDigits = prices.map((p: any) => {
            const str = String(p)
            const parts = str.split('.')
            const lastChar = parts[1] ? parts[1].slice(-1) : str.slice(-1)
            return parseInt(lastChar) || 0
          })
          setDigits(parsedDigits.reverse())
          setPrice(parseFloat(prices[prices.length - 1]))
        }
      })
      .catch((err) => {
        console.warn('[SmartAnalysis] History fallback:', err.message)
      })

    // Listen to real-time incoming ticks
    const unsub = derivWS.subscribeTicks(selectedMarket.symbol, (tick: DerivTick) => {
      if (!active) return
      setPrice(tick.quote)
      const pipSize = tick.pip_size ?? 2
      const formatted = tick.quote.toFixed(pipSize)
      const lastDigit = parseInt(formatted.slice(-1)) || 0

      setDigits((prev) => [lastDigit, ...prev.slice(0, 99)])

      if (running) {
        if (isConnected) {
          if (lastDigit === selectedDigit) {
            addJournalEntry(`Live signal: target digit ${selectedDigit} hit at ${tick.quote}. No order placed.`, 'info')
          }
          return
        }
        // Evaluate digit match or digit over
        if (lastDigit === selectedDigit) {
          addJournalEntry(`Target digit ${selectedDigit} hit! Spot: ${tick.quote}`, 'success')
          recordTradeResult(stake, stake * 8, true)
        } else {
          recordTradeResult(stake, 0, false)
        }
      }
    })

    return () => {
      active = false
      unsub()
    }
  }, [selectedMarket, running, selectedDigit, stake, isConnected, recordTradeResult])

  // Digit stats calculation
  const digitStats = Array.from({ length: 10 }, (_, i) => {
    const count = digits.filter((d) => d === i).length
    const pct = digits.length > 0 ? (count / digits.length) * 100 : 0
    return { digit: i, count, pct }
  })

  const evenCount = digits.filter((d) => d % 2 === 0).length
  const oddCount = digits.filter((d) => d % 2 !== 0).length
  const overCount = digits.filter((d) => d > 4).length
  const underCount = digits.filter((d) => d <= 4).length

  const evenPct = digits.length > 0 ? (evenCount / digits.length) * 100 : 50
  const oddPct = digits.length > 0 ? (oddCount / digits.length) * 100 : 50
  const overPct = digits.length > 0 ? (overCount / digits.length) * 100 : 50
  const underPct = digits.length > 0 ? (underCount / digits.length) * 100 : 50

  return (
    <div className="flex h-[calc(100vh-135px)] bg-[#0A0E1A] text-white rounded-3xl overflow-hidden border border-[#1e2a40] relative">
      {/* Main Analysis Body */}
      <div className="flex-1 flex flex-col overflow-auto p-5 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" />
              Smart Digit Frequency Analysis
            </h1>
            <p className="text-muted-foreground text-xs">
              Live Deriv ticks stream • Statistical breakdown of the last 100 ticks
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMarket.symbol}
              onChange={(e) => {
                const found = MARKETS.find((m) => m.symbol === e.target.value)
                if (found) setSelectedMarket(found)
              }}
              className="bg-[#0d1424] border border-[#1e2a40] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-primary"
            >
              {MARKETS.map((m) => (
                <option key={m.symbol} value={m.symbol}>
                  {m.label} ({m.symbol})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface border border-border text-xs font-mono">
              <span className="text-muted-foreground">Spot:</span>
              <span className="text-primary font-bold">{price ? price.toFixed(4) : 'Loading...'}</span>
            </div>
          </div>
        </div>

        {/* 0-9 Digit Distribution Histogram */}
        <Card className="p-5 bg-[#0d1424] border-[#1e2a40]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">
              Last Digit Distribution (100 Ticks)
            </h3>
            <span className="text-xs text-muted-foreground font-mono">Sample: {digits.length} ticks</span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {digitStats.map((stat) => {
              const isSelected = selectedDigit === stat.digit
              const isHot = stat.pct >= 14
              const isCold = stat.pct <= 6
              return (
                <button
                  key={stat.digit}
                  type="button"
                  onClick={() => setSelectedDigit(stat.digit)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/15 shadow-glow-sm'
                      : 'bg-surface border-border hover:border-primary/40'
                  }`}
                >
                  <div className="text-xl font-black font-mono text-white mb-1">
                    {stat.digit}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-primary">
                    {stat.pct.toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {stat.count} hits
                  </div>
                  {isHot && (
                    <span className="mt-1 inline-block text-[9px] font-bold text-amber-400 bg-amber-400/15 px-1 rounded">
                      HOT
                    </span>
                  )}
                  {isCold && (
                    <span className="mt-1 inline-block text-[9px] font-bold text-cyan-400 bg-cyan-400/15 px-1 rounded">
                      COLD
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Even/Odd & Over/Under Analysis Meters */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="p-5 bg-[#0d1424] border-[#1e2a40]">
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">
              Parity Ratio (Even vs Odd)
            </h4>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-profit font-bold">EVEN: {evenPct.toFixed(1)}% ({evenCount})</span>
              <span className="text-cyan-400 font-bold">ODD: {oddPct.toFixed(1)}% ({oddCount})</span>
            </div>
            <div className="w-full h-3 bg-cyan-500/20 rounded-full overflow-hidden flex">
              <div className="h-full bg-profit transition-all" style={{ width: `${evenPct}%` }} />
            </div>
          </Card>

          <Card className="p-5 bg-[#0d1424] border-[#1e2a40]">
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">
              Threshold Ratio (Under 5 vs Over 4)
            </h4>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-amber-400 font-bold">≤ 4: {underPct.toFixed(1)}% ({underCount})</span>
              <span className="text-primary font-bold">&gt; 4: {overPct.toFixed(1)}% ({overCount})</span>
            </div>
            <div className="w-full h-3 bg-primary/20 rounded-full overflow-hidden flex">
              <div className="h-full bg-amber-400 transition-all" style={{ width: `${underPct}%` }} />
            </div>
          </Card>
        </div>

        {/* Live Rolling Tape */}
        <Card className="p-4 bg-[#0d1424] border-[#1e2a40]">
          <div className="text-muted-foreground text-xs font-semibold mb-2">
            Incoming Digits Tape (Newest → Oldest)
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
            {digits.slice(0, 30).map((d, i) => (
              <span
                key={i}
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono font-bold text-xs ${
                  i === 0
                    ? 'bg-primary text-black font-black scale-105'
                    : d % 2 === 0
                    ? 'bg-surface text-profit border border-profit/30'
                    : 'bg-surface text-cyan-400 border border-cyan-400/30'
                }`}
              >
                {d}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Right Execution & Report Panel */}
      {rightPanelOpen && (
        <div className="w-80 border-l border-[#1E2A40] bg-[#121829] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#1E2A40] flex items-center justify-between bg-[#0c1220]">
            <button
              type="button"
              onClick={() => {
                setRunning(!running)
                addJournalEntry(running ? 'Digit bot runner stopped' : `Digit bot started targeting digit ${selectedDigit}`, running ? 'warning' : 'info')
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                running ? 'bg-danger text-white' : 'gradient-ranger text-black'
              }`}
            >
              {running ? 'Stop Strategy' : 'Run Digit Match'}
            </button>

            <span className="text-xs font-semibold text-muted-foreground font-mono">
              Target: <strong className="text-white">{selectedDigit}</strong>
            </span>
          </div>

          <div className="flex-1 overflow-hidden p-2">
            <ReportsPanel
              isRunning={running}
              journalLogs={journalLogs}
              activeTab={activeReportTab}
              onTabChange={setActiveReportTab}
            />
          </div>
        </div>
      )}

      {/* Panel Toggle */}
      <button
        type="button"
        onClick={() => setRightPanelOpen(!rightPanelOpen)}
        className="absolute top-1/2 -translate-y-1/2 w-4 h-9 bg-[#1E2A40] border border-[#1E2A40] rounded-l flex items-center justify-center hover:bg-[#2a3a50] transition-all z-10"
        style={{ right: rightPanelOpen ? '320px' : '0' }}
        aria-label="Toggle execution reports panel"
      >
        <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${rightPanelOpen ? '' : 'rotate-180'}`} />
      </button>
    </div>
  )
}
