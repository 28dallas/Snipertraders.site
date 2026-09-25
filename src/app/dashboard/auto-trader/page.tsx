'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Cpu, Play, Square, AlertOctagon, ShieldCheck, CheckCircle2,
  TrendingUp, TrendingDown, RefreshCw, Sliders
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ReportsPanel, { ReportTab } from '@/components/dashboard/ReportsPanel'
import { useTradingStore } from '@/stores/trading-store'
import { derivWS, DerivTick } from '@/lib/deriv-websocket'

const PRESET_BOTS = [
  { id: 'ab-1', name: 'Digit Over 1 Accumulator', market: '1HZ10V', type: 'Over/Under', contract: 'OVER', stake: 0.5, duration: '1' },
  { id: 'ab-2', name: 'Volatility 75 Sniper Trend', market: '1HZ75V', type: 'Rise/Fall', contract: 'RISE', stake: 1.0, duration: '3' },
  { id: 'ab-3', name: 'Even-Odd Matrix Scalper', market: '1HZ50V', type: 'Even/Odd', contract: 'EVEN', stake: 0.5, duration: '1' },
]

function AutoTraderContent() {
  const searchParams = useSearchParams()
  const {
    isConnected,
    currency,
    selectedBot,
    sessionPnl,
    sessionTradesCount,
    sessionWins,
    sessionLosses,
    recordTradeResult,
  } = useTradingStore()

  const [activeBot, setActiveBot] = useState(() => {
    if (selectedBot) {
      return {
        name: selectedBot.name,
        market: selectedBot.market,
        type: selectedBot.tradeType || 'Rise/Fall',
        contract: selectedBot.contractType || 'RISE',
        stake: selectedBot.stake || 0.5,
        duration: selectedBot.duration || '1',
      }
    }
    return PRESET_BOTS[0]
  })

  const [running, setRunning] = useState(false)
  const [stopLoss, setStopLoss] = useState(15)
  const [takeProfit, setTakeProfit] = useState(30)
  const [maxRuns, setMaxRuns] = useState(50)
  const [currentSpot, setCurrentSpot] = useState<number | null>(null)
  const [journalLogs, setJournalLogs] = useState<Array<{ time: string; text: string; type?: 'info' | 'success' | 'warning' }>>([])
  const [activeTab, setActiveTab] = useState<ReportTab>('summary')

  // Check URL query param
  useEffect(() => {
    const qBot = searchParams.get('bot')
    if (qBot) {
      const found = PRESET_BOTS.find((b) => b.name.toLowerCase().includes(qBot.toLowerCase()))
      if (found) setActiveBot(found)
    }
  }, [searchParams])

  const addJournalEntry = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const time = new Date().toTimeString().slice(0, 8)
    setJournalLogs((prev) => [{ time, text, type }, ...prev.slice(0, 49)])
  }

  // Automated execution engine on live Deriv WebSocket ticks
  useEffect(() => {
    if (!running) return

    addJournalEntry(`Auto Trader initiated on ${activeBot.market}`, 'info')
    let tickCount = 0

    const unsub = derivWS.subscribeTicks(activeBot.market, async (tick: DerivTick) => {
      setCurrentSpot(tick.quote)
      tickCount++

      // Execute order trigger every 4 ticks
      if (tickCount % 4 === 0) {
        addJournalEntry(`Tick #${tickCount}: ${tick.quote} -> Evaluating entry rule...`, 'info')

        if (isConnected) {
          try {
            const prop = await derivWS.proposal({
              amount: activeBot.stake,
              basis: 'stake',
              contract_type: activeBot.contract === 'RISE' ? 'CALL' : 'PUT',
              currency: currency || 'USD',
              duration: parseInt(activeBot.duration) || 1,
              duration_unit: 't',
              symbol: activeBot.market,
            })

            const pid = prop?.proposal?.id
            const askPrice = prop?.proposal?.ask_price ?? activeBot.stake
            const payout = prop?.proposal?.payout ?? activeBot.stake * 1.95

            if (pid) {
              const buyRes = await derivWS.buy(pid, askPrice)
              const cid = buyRes?.buy?.contract_id
              if (!cid) throw new Error('Deriv did not return a contract ID')
              addJournalEntry(`Deriv Contract #${cid} opened! Stake $${activeBot.stake}`, 'info')
              const unsubscribeContract = derivWS.subscribeContract(cid, (contract) => {
                const settled = contract.is_sold === 1 || ['won', 'lost', 'sold'].includes(String(contract.status))
                if (!settled) return
                const settledPayout = Number(contract.payout ?? 0)
                const profit = Number(contract.profit ?? settledPayout - activeBot.stake)
                const won = String(contract.status) === 'won' || profit > 0
                recordTradeResult(activeBot.stake, settledPayout, won)
                addJournalEntry(
                  won ? `Contract #${cid} WON! Payout: +$${settledPayout.toFixed(2)}` : `Contract #${cid} LOST`,
                  won ? 'success' : 'warning'
                )
                unsubscribeContract()
              })
            }
          } catch (err) {
            addJournalEntry(`Live order failed: ${err instanceof Error ? err.message : 'Deriv API error'}`, 'warning')
            setRunning(false)
          }
        } else {
          // Simulation when offline
          const won = Math.random() > 0.45
          recordTradeResult(activeBot.stake, won ? activeBot.stake * 1.92 : 0, won)
          addJournalEntry(`Order filled (Preview) -> ${won ? 'WIN' : 'LOSS'}`, won ? 'success' : 'warning')
        }

        // Safety Stop Checks
        if (sessionPnl <= -stopLoss) {
          setRunning(false)
          addJournalEntry(`Stop-Loss ceiling (-$${stopLoss}) reached! Automated runner halted.`, 'warning')
        } else if (sessionPnl >= takeProfit) {
          setRunning(false)
          addJournalEntry(`Take-Profit target (+$${takeProfit}) achieved! Profit secured.`, 'success')
        } else if (sessionTradesCount >= maxRuns) {
          setRunning(false)
          addJournalEntry(`Max runs limit (${maxRuns}) reached. Execution complete.`, 'info')
        }
      }
    })

    return () => {
      unsub()
      addJournalEntry(`Auto Trader runner stopped`, 'warning')
    }
  }, [running, activeBot, isConnected, currency, sessionPnl, sessionTradesCount, stopLoss, takeProfit, maxRuns, recordTradeResult])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            Auto Trader Continuous Runner
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Automated strategy execution with real-time risk guards and live settlement telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={running ? 'green' : 'default'} className="text-xs">
            {running ? 'ENGINE ACTIVE & RUNNING' : 'RUNNER IDLE'}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Bot Config & Risk Limits */}
        <Card className="lg:col-span-4 p-5 bg-[#0d1424] border-[#1e2a40] space-y-4">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            Bot & Risk Controls
          </h3>

          <div>
            <label className="text-muted-foreground text-xs font-semibold uppercase block mb-1.5">
              Active Strategy Bot
            </label>
            <select
              value={activeBot.name}
              onChange={(e) => {
                const found = PRESET_BOTS.find((b) => b.name === e.target.value)
                if (found) setActiveBot(found)
              }}
              disabled={running}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-primary disabled:opacity-50"
            >
              <option value={activeBot.name}>{activeBot.name}</option>
              {PRESET_BOTS.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} ({b.market})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-surface/50 border border-border/80">
            <div>
              <span className="text-muted-foreground block text-[10px]">Market</span>
              <span className="font-mono font-bold text-white">{activeBot.market}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Contract</span>
              <span className="font-mono font-bold text-primary">{activeBot.contract}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Base Stake</span>
              <span className="font-mono font-bold text-white">${activeBot.stake}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Live Spot</span>
              <span className="font-mono font-bold text-cyan-400">
                {currentSpot ? currentSpot.toFixed(2) : '---'}
              </span>
            </div>
          </div>

          {/* Risk Limits */}
          <div className="space-y-3 pt-2">
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

            <div>
              <label className="text-muted-foreground text-xs block mb-1">Max Runs Limit</label>
              <input
                type="number"
                min={5}
                value={maxRuns}
                onChange={(e) => setMaxRuns(parseInt(e.target.value) || 10)}
                disabled={running}
                className="w-full bg-surface border border-border rounded-xl px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Action Control */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => setRunning(!running)}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                running
                  ? 'bg-danger text-white hover:opacity-95'
                  : 'gradient-ranger text-black shadow-glow-sm hover:opacity-95'
              }`}
            >
              {running ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? 'Stop Auto Trader' : 'Start Continuous Auto Trader'}
            </button>

            {running && (
              <button
                type="button"
                onClick={() => {
                  setRunning(false)
                  addJournalEntry('EMERGENCY KILL SWITCH TRIGGERED', 'warning')
                }}
                className="w-full py-2 rounded-xl bg-danger/20 border border-danger/40 text-danger font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-danger/30 transition-colors"
              >
                <AlertOctagon className="w-4 h-4" />
                Emergency Kill Switch
              </button>
            )}
          </div>
        </Card>

        {/* Right: Telemetry & Reports */}
        <div className="lg:col-span-8 min-h-[500px]">
          <ReportsPanel
            isRunning={running}
            journalLogs={journalLogs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </div>
  )
}

export default function AutoTraderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading Auto Trader...</div>}>
      <AutoTraderContent />
    </Suspense>
  )
}
