'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Cpu, Play, Square, AlertOctagon, ShieldCheck, CheckCircle2,
  TrendingUp, TrendingDown, RefreshCw, Sliders
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ReportsPanel, { ReportTab } from '@/components/dashboard/ReportsPanel'
import { useTradingStore } from '@/stores/trading-store'
import type { BotDefinition } from '@/stores/trading-store'
import { GoldmineM1State } from '@/lib/bots/goldmine-m1'
import { InfinityAlgoState } from '@/lib/bots/infinity-algo'
import { FreeBotStrategyState } from '@/lib/bots/free-bot-strategy'
import { getFreeBotRunner, getGoldmineM1Runner, getInfinityAlgoRunner, GoldmineM1Runner, InfinityAlgoRunner } from '@/lib/bots/goldmine-m1-runner'
import { FREE_BOTS_COLLECTION, getFreeBotByName, isCatalogFreeBotId, toBotDefinition } from '@/lib/free-bots'

interface AutoTraderBot {
  id: string
  name: string
  market: string
  type: string
  contract: string
  stake: number
  duration: string
}

function toAutoTraderBot(bot: BotDefinition): AutoTraderBot {
  return {
    id: bot.id,
    name: bot.name,
    market: bot.market,
    type: bot.tradeType,
    contract: bot.contractType,
    stake: bot.stake,
    duration: bot.duration.replace(/\D/g, '') || '1',
  }
}

const PRESET_BOTS = FREE_BOTS_COLLECTION.map(toAutoTraderBot)

function AutoTraderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialBot = getFreeBotByName(searchParams.get('bot'))
    ?? getFreeBotByName(useTradingStore.getState().selectedBot?.name)
    ?? FREE_BOTS_COLLECTION[0]
  const {
    isConnected,
    token,
    loginid,
    currency,
    selectedBot,
    setSelectedBot,
    recordTradeResult,
  } = useTradingStore()

  const [activeBot, setActiveBot] = useState(() => toAutoTraderBot(initialBot))

  const [running, setRunning] = useState(false)
  const [stopLoss, setStopLoss] = useState(15)
  const [takeProfit, setTakeProfit] = useState(30)
  const [maxRuns, setMaxRuns] = useState(50)
  const [goldmineState, setGoldmineState] = useState<GoldmineM1State | null>(null)
  const [infinityState, setInfinityState] = useState<InfinityAlgoState | null>(null)
  const [freeBotState, setFreeBotState] = useState<FreeBotStrategyState | null>(null)
  const [journalLogs, setJournalLogs] = useState<Array<{ time: string; text: string; type?: 'info' | 'success' | 'warning' }>>([])
  const [activeTab, setActiveTab] = useState<ReportTab>('summary')

  useEffect(() => {
    const bot = getFreeBotByName(searchParams.get('bot'))
    if (!bot) return
    setActiveBot(toAutoTraderBot(bot))
    setSelectedBot(toBotDefinition(bot))
    setGoldmineState(null)
    setInfinityState(null)
    setFreeBotState(null)
  }, [searchParams, setSelectedBot])

  const addJournalEntry = useCallback((text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const time = new Date().toTimeString().slice(0, 8)
    setJournalLogs((prev) => [{ time, text, type }, ...prev.slice(0, 49)])
  }, [])

  useEffect(() => {
    if (!running) return
    const isGoldmine = activeBot.id === 'goldmine-m1'
    const isInfinity = activeBot.id === 'infinity-algo'
    const isTexasEven = activeBot.id === 'texas-even'
    const isCatalogBot = isCatalogFreeBotId(activeBot.id)
    if (isTexasEven) {
      addJournalEntry('Run Texas Even Bot from its Bot Builder panel so its entry digit and account safety checks are applied.', 'warning')
      setRunning(false)
      return
    }
    if (!isGoldmine && !isInfinity && !isCatalogBot) return
    if (!isConnected || !token || !loginid) {
      addJournalEntry(`Connect a Deriv account before running ${activeBot.name}.`, 'warning')
      setRunning(false)
      return
    }

    let runner: GoldmineM1Runner<any> | InfinityAlgoRunner
    try {
      const onSettlement = ({ stake, payout, profit, won }: { stake: number; payout: number; profit: number; won: boolean }) => {
          if (useTradingStore.getState().loginid === loginid) recordTradeResult(stake, payout, won, profit)
      }
      if (isCatalogBot) {
        const catalogBot = FREE_BOTS_COLLECTION.find((bot) => bot.id === activeBot.id)
        if (!catalogBot) throw new Error('The selected Free Bot configuration could not be found.')
        if (!isCatalogFreeBotId(catalogBot.id)) throw new Error('The selected Free Bot strategy is not supported.')
        runner = getFreeBotRunner({
          token,
          accountId: loginid,
          currency,
          strategyName: catalogBot.name,
          config: {
            id: catalogBot.id,
            symbol: catalogBot.market,
            initialStake: catalogBot.stake,
            durationTicks: Number.parseInt(catalogBot.duration, 10) || 1,
            stopLoss,
            takeProfit,
            maxTrades: maxRuns,
          },
          onSettlement,
        })
      } else {
        runner = isInfinity ? getInfinityAlgoRunner({
          token,
          accountId: loginid,
          currency,
          onSettlement,
        }) : getGoldmineM1Runner({
          token,
          accountId: loginid,
          currency,
          onSettlement,
        })
      }
    } catch (error) {
      addJournalEntry(error instanceof Error ? error.message : `Could not start ${activeBot.name}.`, 'warning')
      setRunning(false)
      return
    }

    const unsubscribeCallbacks = runner.subscribe({
      onState: (state: any) => {
        if (useTradingStore.getState().loginid !== loginid) return
        if (isCatalogBot) {
          setFreeBotState(state)
        }
        else if (isInfinity) setInfinityState(state)
        else setGoldmineState(state)
        if (state.stopped) setRunning(false)
      },
      onLog: addJournalEntry,
      onError: (error: Error) => {
        addJournalEntry(error.message, 'warning')
        setRunning(false)
      },
    })
    void runner.start().catch(() => setRunning(false))

    return () => {
      unsubscribeCallbacks()
      runner.stop()
    }
  }, [running, activeBot, isConnected, token, loginid, currency, stopLoss, takeProfit, maxRuns, recordTradeResult, addJournalEntry])

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
                const found = FREE_BOTS_COLLECTION.find((bot) => bot.name === e.target.value)
                if (found) {
                  setActiveBot(toAutoTraderBot(found))
                  setSelectedBot(toBotDefinition(found))
                  setGoldmineState(null)
                  setInfinityState(null)
                  setFreeBotState(null)
                }
              }}
              disabled={running}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-white focus:border-primary disabled:opacity-50"
            >
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
                {freeBotState?.currentQuote?.toFixed(2) ?? '---'}
              </span>
            </div>
          </div>

          {activeBot.id === 'goldmine-m1' ? (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/80 bg-surface/50 p-3 text-xs">
              <div><span className="block text-[10px] text-muted-foreground">Entry digit</span><span className="font-mono font-bold text-white">1</span></div>
              <div><span className="block text-[10px] text-muted-foreground">Recovery barrier</span><span className="font-mono font-bold text-white">4</span></div>
              <div><span className="block text-[10px] text-muted-foreground">Take profit</span><span className="font-mono font-bold text-profit">$50.00</span></div>
              <div><span className="block text-[10px] text-muted-foreground">Stop loss</span><span className="font-mono font-bold text-loss">$1,000.00</span></div>
              <div><span className="block text-[10px] text-muted-foreground">Engine mode</span><span className="font-mono font-bold text-white">{goldmineState?.mode ?? 'WAIT_ENTRY'}</span></div>
              <div><span className="block text-[10px] text-muted-foreground">Run P/L</span><span className="font-mono font-bold text-white">${(goldmineState?.totalProfit ?? 0).toFixed(2)}</span></div>
            </div>
          ) : (
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
          )}

          {activeBot.id === 'infinity-algo' && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/80 bg-surface/50 p-3 text-xs">
              <div><span className="block text-[10px] text-muted-foreground">Current stake</span><span className="font-mono text-white">${(infinityState?.stake ?? activeBot.stake).toFixed(2)}</span></div>
              <div><span className="block text-[10px] text-muted-foreground">Prediction</span><span className="font-mono text-white">{infinityState?.prediction ?? 1}</span></div>
              <div><span className="block text-[10px] text-muted-foreground">Wins</span><span className="font-mono text-white">{infinityState?.runCount ?? 0}/5</span></div>
              <div><span className="block text-[10px] text-muted-foreground">Run P/L</span><span className="font-mono text-white">{currency} {(infinityState?.totalProfit ?? 0).toFixed(2)}</span></div>
              {infinityState?.stopped && <div className="col-span-2 text-amber-300">Stopped: {infinityState.stopped}</div>}
            </div>
          )}

          {isCatalogFreeBotId(activeBot.id) && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/80 bg-surface/50 p-3 text-xs">
              <div><span className="block text-[10px] text-muted-foreground">Current stake</span><span className="font-mono text-white">${(freeBotState?.stake ?? activeBot.stake).toFixed(2)}</span></div>
              <div><span className="block text-[10px] text-muted-foreground">Trades</span><span className="font-mono text-white">{freeBotState?.tradesPlaced ?? 0}/{maxRuns}</span></div>
              <div><span className="block text-[10px] text-muted-foreground">Wins / losses</span><span className="font-mono text-white">{freeBotState?.wins ?? 0} / {freeBotState?.losses ?? 0}</span></div>
              <div><span className="block text-[10px] text-muted-foreground">Run P/L</span><span className="font-mono text-white">{currency} {(freeBotState?.totalProfit ?? 0).toFixed(2)}</span></div>
              {freeBotState?.stopped && <div className="col-span-2 text-amber-300">Stopped: {freeBotState.stopped}</div>}
            </div>
          )}

          {/* Action Control */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => {
                if (activeBot.id === 'texas-even') {
                  router.push(`/dashboard/bot-builder?view=quick&bot=${encodeURIComponent(activeBot.name)}`)
                  return
                }
                setRunning(!running)
              }}
              disabled={(activeBot.id === 'goldmine-m1' || activeBot.id === 'infinity-algo' || isCatalogFreeBotId(activeBot.id)) && (!isConnected || !token)}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                running
                  ? 'bg-danger text-white hover:opacity-95'
                  : 'gradient-ranger text-black shadow-glow-sm hover:opacity-95'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {running ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? 'Stop Auto Trader' : activeBot.id === 'texas-even' ? 'Configure in Bot Builder' : `Run ${activeBot.name}`}
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
