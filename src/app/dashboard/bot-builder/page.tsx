'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Monitor, Play, Square, RotateCcw, ChevronRight, AlertTriangle, X,
  FolderOpen, Save, Wrench, Zap, CheckCircle
  , Search, Undo2, Redo2, ZoomIn, ZoomOut
} from 'lucide-react'
import ReportsPanel, { ReportTab } from '@/components/dashboard/ReportsPanel'
import { derivWS, DerivTick } from '@/lib/deriv-websocket'
import { useTradingStore, BotDefinition, GOLDMINE_M1_BOT, INFINITY_ALGO_BOT, TEXAS_EVEN_BOT } from '@/stores/trading-store'
import { GoldmineM1State } from '@/lib/bots/goldmine-m1'
import { InfinityAlgoState } from '@/lib/bots/infinity-algo'
import { calculateWorstCaseExposure, TexasEvenConfig, TexasEvenState } from '@/lib/bots/texas-even'
import { getGoldmineM1Runner, getInfinityAlgoRunner, getTexasEvenRunner, GoldmineM1Runner, InfinityAlgoRunner, TexasEvenRunner } from '@/lib/bots/goldmine-m1-runner'

type View = 'home' | 'builder' | 'quick'

const BLOCK_CATEGORIES = {
  Logics: ['If condition', 'Compare digits', 'And / Or'],
  'Trade parameters': ['Trade parameters', 'Market selector', 'Stake and duration'],
  'Purchase conditions': ['Purchase action', 'Buy on signal', 'Trade again'],
  'Sell conditions': ['Sell when available', 'Take profit', 'Stop loss'],
  'Restart trading conditions': ['Restart on error', 'Reset after win', 'Trade again'],
  Analysis: ['Tick analysis', 'Digit frequency', 'Trend direction'],
  Utility: ['Log message', 'Set variable', 'Notification'],
} as const

function BotBuilderContent() {
  const searchParams = useSearchParams()
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    isConnected,
    token,
    loginid,
    balance,
    currency,
    isVirtual,
    selectedBot,
    setSelectedBot,
    recordTradeResult,
  } = useTradingStore()

  const [view, setView] = useState<View>(() => {
    const qView = searchParams.get('view')
    if (qView === 'builder' || qView === 'quick') return qView
    return 'home'
  })

  const [running, setRunning] = useState(false)
  const [goldmineState, setGoldmineState] = useState<GoldmineM1State | null>(null)
  const [infinityState, setInfinityState] = useState<InfinityAlgoState | null>(null)
  const [texasState, setTexasState] = useState<TexasEvenState | null>(null)
  const [entryDigit, setEntryDigit] = useState<number | null>(null)
  const [texasConfig, setTexasConfig] = useState<Omit<TexasEvenConfig, 'entryDigit'>>({
    symbol: '1HZ10V',
    side: 'EVEN',
    durationTicks: 1,
    initialStake: 4,
    martingale: 2,
    runsPerBurst: 10,
    takeProfit: 20,
    stopLoss: 50,
    minStake: 0.35,
    maxStake: 500,
  })
  const [showTexasRealConfirmation, setShowTexasRealConfirmation] = useState(false)
  const [confirmedTexasRiskKey, setConfirmedTexasRiskKey] = useState<string | null>(null)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('summary')
  const [journalLogs, setJournalLogs] = useState<Array<{ time: string; text: string; type?: 'info' | 'success' | 'warning' }>>([])
  const [blockSearch, setBlockSearch] = useState('')
  const [activeBlockCategory, setActiveBlockCategory] = useState<keyof typeof BLOCK_CATEGORIES>('Trade parameters')
  const [canvasBlocks, setCanvasBlocks] = useState<string[]>(['Trade parameters', 'Purchase action', 'Trade again'])
  const [zoom, setZoom] = useState(100)
  const [history, setHistory] = useState<string[][]>([])
  const [future, setFuture] = useState<string[][]>([])

  // Quick strategy state
  const [quickMarket, setQuickMarket] = useState('1HZ10V')
  const [quickType, setQuickType] = useState('Rise/Fall')
  const [quickContract, setQuickContract] = useState('Rise')
  const [quickDuration, setQuickDuration] = useState('1')
  const [quickStake, setQuickStake] = useState(0.5)

  const addJournalEntry = useCallback((text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const time = new Date().toTimeString().slice(0, 8)
    setJournalLogs((prev) => [{ time, text, type }, ...prev.slice(0, 49)])
  }, [])

  const texasWorstCaseExposure = calculateWorstCaseExposure(texasConfig)
  const texasRiskKey = JSON.stringify({ loginid, entryDigit, ...texasConfig, exposure: texasWorstCaseExposure })

  const handleRunToggle = () => {
    if (running) {
      setRunning(false)
      return
    }
    if (selectedBot?.id === TEXAS_EVEN_BOT.id && !isVirtual) {
      setShowTexasRealConfirmation(true)
      return
    }
    setRunning(true)
  }

  const confirmTexasRealTrading = () => {
    setConfirmedTexasRiskKey(texasRiskKey)
    setShowTexasRealConfirmation(false)
    setRunning(true)
  }

  // Pre-load bot if passed in query param or store
  useEffect(() => {
    const botName = searchParams.get('bot')
    if (botName) {
      setView('quick')
      if (botName === GOLDMINE_M1_BOT.name && selectedBot?.id !== GOLDMINE_M1_BOT.id) {
        setSelectedBot(GOLDMINE_M1_BOT)
        return
      }
      if (botName === INFINITY_ALGO_BOT.name && selectedBot?.id !== INFINITY_ALGO_BOT.id) {
        setSelectedBot(INFINITY_ALGO_BOT)
        return
      }
      if (botName === TEXAS_EVEN_BOT.name && selectedBot?.id !== TEXAS_EVEN_BOT.id) {
        setSelectedBot(TEXAS_EVEN_BOT)
        return
      }
      addJournalEntry(`Pre-loaded bot template: ${botName}`, 'info')
    }
  }, [searchParams, selectedBot?.id, setSelectedBot, addJournalEntry])

  const addBlock = (block: string) => {
    setHistory((previous) => [...previous, canvasBlocks])
    setFuture([])
    setCanvasBlocks((previous) => [...previous, block])
  }

  const undo = () => {
    const previous = history[history.length - 1]
    if (!previous) return
    setFuture((current) => [canvasBlocks, ...current])
    setCanvasBlocks(previous)
    setHistory((current) => current.slice(0, -1))
  }

  const redo = () => {
    const next = future[0]
    if (!next) return
    setHistory((current) => [...current, canvasBlocks])
    setCanvasBlocks(next)
    setFuture((current) => current.slice(1))
  }

  // Live execution loop when running
  useEffect(() => {
    if (!running) return

    if (selectedBot?.id === GOLDMINE_M1_BOT.id || selectedBot?.id === INFINITY_ALGO_BOT.id || selectedBot?.id === TEXAS_EVEN_BOT.id) {
      const isInfinity = selectedBot.id === INFINITY_ALGO_BOT.id
      const isTexasEven = selectedBot.id === TEXAS_EVEN_BOT.id
      if (!isConnected || !token || !loginid) {
        addJournalEntry(`Connect a Deriv account before running ${isTexasEven ? 'Texas Even Bot' : isInfinity ? 'Infinity Algo' : 'Advanced Goldmine M1'}.`, 'warning')
        setRunning(false)
        return
      }
      if (isTexasEven && entryDigit === null) {
        addJournalEntry('Choose an entry digit from 0 to 9 before starting Texas Even Bot.', 'warning')
        setRunning(false)
        return
      }
      if (isTexasEven && !isVirtual && confirmedTexasRiskKey !== texasRiskKey) {
        setShowTexasRealConfirmation(true)
        setRunning(false)
        return
      }

      let runner: GoldmineM1Runner<any> | InfinityAlgoRunner | TexasEvenRunner
      try {
        runner = isTexasEven ? getTexasEvenRunner({
          token,
          accountId: loginid,
          currency,
          config: { ...texasConfig, entryDigit: entryDigit as number },
          onSettlement: ({ stake, payout, profit, won }) => {
            if (useTradingStore.getState().loginid === loginid) recordTradeResult(stake, payout, won, profit)
          },
        }) : isInfinity ? getInfinityAlgoRunner({
          token,
          accountId: loginid,
          currency,
          onSettlement: ({ stake, payout, profit, won }) => {
            if (useTradingStore.getState().loginid === loginid) recordTradeResult(stake, payout, won, profit)
          },
        }) : getGoldmineM1Runner({
          token,
          accountId: loginid,
          currency,
          onSettlement: ({ stake, payout, profit, won }) => {
            if (useTradingStore.getState().loginid === loginid) recordTradeResult(stake, payout, won, profit)
          },
        })
      } catch (error) {
        addJournalEntry(error instanceof Error ? error.message : `Could not resume ${isTexasEven ? 'Texas Even Bot' : isInfinity ? 'Infinity Algo' : 'Advanced Goldmine M1'}.`, 'warning')
        setRunning(false)
        return
      }

      const unsubscribeCallbacks = runner.subscribe({
        onState: (state: any) => {
          if (useTradingStore.getState().loginid !== loginid) return
          if (isTexasEven) setTexasState(state)
          else if (isInfinity) setInfinityState(state)
          else setGoldmineState(state)
          if (state.stopped) setRunning(false)
        },
        onLog: addJournalEntry,
        onError: (error: Error) => {
          addJournalEntry(error.message, 'warning')
          if (isTexasEven) setActiveReportTab('journal')
          setRunning(false)
        },
      })
      void runner.start().catch(() => setRunning(false))

      return () => {
        unsubscribeCallbacks()
        runner.stop()
      }
    }

    const marketSymbol = quickMarket || '1HZ10V'
    addJournalEntry(`Started bot execution on ${marketSymbol}`, 'info')

    let tickCount = 0

    const unsub = derivWS.subscribeTicks(marketSymbol, async (tick: DerivTick) => {
      tickCount++
      // Evaluate trigger rule every 3 ticks
      if (tickCount % 3 === 0) {
        const spot = tick.quote
        addJournalEntry(`Tick #${tickCount}: ${spot} -> Evaluating ${quickType} conditions...`, 'info')

        if (isConnected) {
          try {
            const proposal = await derivWS.proposal({
              amount: quickStake,
              basis: 'stake',
              contract_type: quickContract === 'Rise' ? 'CALL' : 'PUT',
              currency: currency || 'USD',
              duration: parseInt(quickDuration) || 1,
              duration_unit: 't',
              symbol: marketSymbol,
            })

            const pid = proposal?.proposal?.id
            const askPrice = proposal?.proposal?.ask_price ?? quickStake
            const payout = proposal?.proposal?.payout ?? quickStake * 1.95

            if (pid) {
              const buyRes = await derivWS.buy(pid, askPrice)
              const cid = buyRes?.buy?.contract_id
              addJournalEntry(`Order placed #${cid}! Stake: $${quickStake}`, 'success')
              addJournalEntry(`Contract #${cid} is awaiting Deriv settlement.`, 'info')
            }
          } catch (err) {
            addJournalEntry(`Live order failed: ${err instanceof Error ? err.message : 'Deriv API error'}`, 'warning')
            setRunning(false)
          }
        } else {
          // Simulation when not connected
          const won = Math.random() > 0.45
          const returnPayout = won ? quickStake * 1.92 : 0
          recordTradeResult(quickStake, returnPayout, won)
          addJournalEntry(`Executed trade [Preview mode] -> ${won ? 'WIN' : 'LOSS'}`, won ? 'success' : 'warning')
        }
      }
    })

    return () => {
      unsub()
      addJournalEntry(`Stopped bot execution`, 'warning')
    }
  }, [running, selectedBot, quickMarket, quickType, quickContract, quickDuration, quickStake, isConnected, token, loginid, currency, isVirtual, entryDigit, texasConfig, texasRiskKey, confirmedTexasRiskKey, recordTradeResult, addJournalEntry])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedBot({
        id: `upload-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        market: '1HZ10V',
        strategy: 'Over/Under',
        contractType: 'OVER',
        tradeType: 'Over/Under',
        stake: 0.5,
        duration: '1 tick',
      })
      setView('builder')
      addJournalEntry(`Loaded bot definition from ${file.name}`, 'success')
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex h-[calc(100vh-135px)] bg-[#0A0E1A] text-white rounded-3xl overflow-hidden border border-[#1e2a40] relative">
      {/* Main Builder & Work Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E2A40] bg-[#121829]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setView('home')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                view === 'home' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setView('builder')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                view === 'builder' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Blocks Editor
            </button>
            <button
              type="button"
              onClick={() => setView('quick')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                view === 'quick' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Quick Strategy
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-xs flex items-center gap-1"
              title="Import XML/JSON"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <input ref={fileRef} type="file" accept=".xml,.json" className="hidden" onChange={handleFileUpload} />
          </div>
        </div>

        {/* View Contents */}
        <div className="flex-1 overflow-auto bg-[#0A0E1A]">
          {view === 'home' && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <h2 className="text-2xl font-bold text-white mb-2">Build or Load Your Strategy</h2>
              <p className="text-muted-foreground text-xs sm:text-sm mb-8 max-w-md">
                Import an existing Deriv bot XML definition, construct with block rules, or launch a quick multi-market strategy.
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center gap-2.5 p-5 rounded-2xl bg-[#121829] border border-[#1e2a40] hover:border-primary/50 transition-all group w-36"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white">Upload File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setView('builder')}
                  className="flex flex-col items-center gap-2.5 p-5 rounded-2xl bg-[#121829] border border-[#1e2a40] hover:border-teal-400/50 transition-all group w-36"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-400/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white">Bot Builder</span>
                </button>

                <button
                  type="button"
                  onClick={() => setView('quick')}
                  className="flex flex-col items-center gap-2.5 p-5 rounded-2xl bg-[#121829] border border-[#1e2a40] hover:border-amber-400/50 transition-all group w-36"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white">Quick Strategy</span>
                </button>
              </div>
            </div>
          )}

          {view === 'builder' && (
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setView('home')} className="text-primary hover:underline text-xs">
                    ← Back
                  </button>
                  <span className="text-muted-foreground text-xs">/ Visual Strategy Workspace</span>
                </div>
                {selectedBot && (
                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                    Active: {selectedBot.name}
                  </span>
                )}
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#1e2a40] bg-[#121829] p-2">
                <button type="button" onClick={undo} disabled={!history.length} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 disabled:opacity-30" title="Undo"><Undo2 className="h-4 w-4" /></button>
                <button type="button" onClick={redo} disabled={!future.length} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 disabled:opacity-30" title="Redo"><Redo2 className="h-4 w-4" /></button>
                <button type="button" onClick={() => setZoom((value) => Math.min(130, value + 10))} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" title="Zoom in"><ZoomIn className="h-4 w-4" /></button>
                <button type="button" onClick={() => setZoom((value) => Math.max(70, value - 10))} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" title="Zoom out"><ZoomOut className="h-4 w-4" /></button>
                <span className="text-[10px] font-mono text-slate-500">{zoom}%</span>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-primary">Drag blocks into the canvas</span>
              </div>

              <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[190px_minmax(0,1fr)]">
                <div className="overflow-y-auto rounded-xl border border-[#1e2a40] bg-[#121829] p-2">
                  <div className="relative mb-2"><Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-500" /><input value={blockSearch} onChange={(event) => setBlockSearch(event.target.value)} placeholder="Search blocks" className="w-full rounded-lg border border-[#1e2a40] bg-[#0d1424] py-2 pl-8 pr-2 text-[10px] text-white outline-none focus:border-primary" /></div>
                  <div className="space-y-1">{(Object.keys(BLOCK_CATEGORIES) as Array<keyof typeof BLOCK_CATEGORIES>).map((category) => <button key={category} type="button" onClick={() => setActiveBlockCategory(category)} className={`w-full rounded-lg px-2 py-2 text-left text-[10px] font-bold ${activeBlockCategory === category ? 'bg-primary/15 text-primary' : 'text-slate-400 hover:bg-white/5'}`}>{category}</button>)}</div>
                </div>

                <div className="min-w-0 overflow-auto rounded-xl border-2 border-dashed border-[#1e2a40] bg-[#0d1424] p-3" style={{ fontSize: `${zoom}%` }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const block = event.dataTransfer.getData('text/plain'); if (block) addBlock(block) }}>
                  <div className="mb-3 text-[10px] uppercase tracking-wider text-slate-500">Strategy canvas</div>
                  <div className="space-y-2">{canvasBlocks.map((block, index) => <div key={`${block}-${index}`} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', block)} className="max-w-md cursor-grab rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-white shadow-lg active:cursor-grabbing"><div className="flex items-center justify-between"><span className="font-bold">{index + 1}. {block}</span><button type="button" onClick={() => { setHistory((previous) => [...previous, canvasBlocks]); setCanvasBlocks((previous) => previous.filter((_, itemIndex) => itemIndex !== index)) }} className="text-slate-500 hover:text-rose-300" aria-label={`Remove ${block}`}><X className="h-3.5 w-3.5" /></button></div><div className="mt-1 text-[10px] text-slate-400">{block === 'Trade parameters' ? 'Market, contract, interval and restart settings' : block === 'Purchase action' ? 'Purchase action and stake conditions' : 'Continue the strategy flow'}</div></div>)}</div>
                  {BLOCK_CATEGORIES[activeBlockCategory].filter((block) => block.toLowerCase().includes(blockSearch.toLowerCase())).map((block) => <button key={block} type="button" draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', block)} onClick={() => addBlock(block)} className="mt-3 mr-2 rounded-lg border border-[#2c4860] bg-[#142537] px-3 py-2 text-[10px] font-semibold text-slate-200 hover:border-primary hover:text-primary">+ {block}</button>)}
                </div>
              </div>
            </div>
          )}

          {view === 'quick' && (
            <div className="p-6 max-w-lg mx-auto h-full flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setView('home')} className="text-primary hover:underline text-xs">
                  ← Back
                </button>
                <span className="text-muted-foreground text-xs">/ Quick Strategy Launcher</span>
              </div>

              <div className="bg-[#121829] border border-[#1e2a40] rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white mb-2">
                  {selectedBot?.id === GOLDMINE_M1_BOT.id
                    ? GOLDMINE_M1_BOT.name
                    : selectedBot?.id === INFINITY_ALGO_BOT.id
                      ? INFINITY_ALGO_BOT.name
                      : 'Configure Strategy'}
                </h3>

                {selectedBot?.id === GOLDMINE_M1_BOT.id ? (
                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#1e2a40] bg-[#0d1424] p-4 text-xs">
                    <div><span className="block text-slate-500">Market</span><span className="font-mono text-white">1HZ10V</span></div>
                    <div><span className="block text-slate-500">Contract</span><span className="font-mono text-white">DIGITOVER, 1 tick</span></div>
                    <div><span className="block text-slate-500">Entry / barrier</span><span className="font-mono text-white">Digit 1 / 3</span></div>
                    <div><span className="block text-slate-500">Recovery</span><span className="font-mono text-white">Barrier 4, 1.7x</span></div>
                    <div><span className="block text-slate-500">Take profit</span><span className="font-mono text-white">$50.00</span></div>
                    <div><span className="block text-slate-500">Stop loss</span><span className="font-mono text-white">$1,000.00</span></div>
                    <div className="col-span-2 border-t border-[#1e2a40] pt-3 text-slate-300">
                      {goldmineState?.mode ?? 'WAIT_ENTRY'} · Run P/L ${ (goldmineState?.totalProfit ?? 0).toFixed(2) }
                    </div>
                    {(!isConnected || !token) && <p className="col-span-2 text-amber-300">Connect a Deriv account to run this bot.</p>}
                  </div>
                ) : selectedBot?.id === INFINITY_ALGO_BOT.id ? (
                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#1e2a40] bg-[#0d1424] p-4 text-xs">
                    <div><span className="block text-slate-500">Market</span><span className="font-mono text-white">R_10</span></div>
                    <div><span className="block text-slate-500">Contract</span><span className="font-mono text-white">DIGITOVER, 1 tick</span></div>
                    <div><span className="block text-slate-500">Entry gate</span><span className="font-mono text-white">Digit {INFINITY_ALGO_BOT.barrier ?? 4}</span></div>
                    <div><span className="block text-slate-500">Recovery</span><span className="font-mono text-white">Prediction 4, 2x</span></div>
                    <div><span className="block text-slate-500">Stake</span><span className="font-mono text-white">${(infinityState?.stake ?? INFINITY_ALGO_BOT.stake ?? 0.5).toFixed(2)}</span></div>
                    <div><span className="block text-slate-500">Session</span><span className="font-mono text-white">{infinityState?.runCount ?? 0}/{INFINITY_ALGO_BOT.stopLoss ?? 50}</span></div>
                    <div className="col-span-2 border-t border-[#1e2a40] pt-3 text-slate-300">
                      {infinityState?.stopped ?? 'ACTIVE'} · Run P/L ${ (infinityState?.totalProfit ?? 0).toFixed(2) }
                    </div>
                    {(!isConnected || !token) && <p className="col-span-2 text-amber-300">Connect a Deriv account to run this bot.</p>}
                  </div>
                ) : selectedBot?.id === TEXAS_EVEN_BOT.id ? (
                  <div className="space-y-3 text-xs">
                    <div className="rounded-xl border border-[#1e2a40] bg-[#0d1424] p-3">
                      <div className="text-[10px] font-semibold uppercase text-slate-500">Active Deriv Account</div>
                      <div className={`mt-1 font-mono font-bold ${isVirtual ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {isVirtual ? 'DEMO' : 'REAL'} · {loginid ?? 'Not connected'} · {currency}
                      </div>
                    </div>

                    <label className="block text-slate-300">
                      Required entry digit
                      <select
                        required
                        value={entryDigit ?? ''}
                        onChange={(event) => setEntryDigit(event.target.value === '' ? null : Number(event.target.value))}
                        disabled={running}
                        className="mt-1 w-full rounded-lg border border-[#1e2a40] bg-[#0d1424] px-3 py-2 font-mono text-white"
                      >
                        <option value="">Choose digit</option>
                        {Array.from({ length: 10 }, (_, digit) => <option key={digit} value={digit}>{digit}</option>)}
                      </select>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-slate-400">Side
                        <select value={texasConfig.side} onChange={(event) => setTexasConfig((config) => ({ ...config, side: event.target.value as TexasEvenConfig['side'] }))} disabled={running} className="mt-1 w-full rounded-lg border border-[#1e2a40] bg-[#0d1424] px-2 py-2 text-white">
                          <option value="EVEN">Even</option><option value="ODD">Odd</option>
                        </select>
                      </label>
                      <label className="text-slate-400">Initial stake ({currency})
                        <input type="number" min="0.35" max={texasConfig.maxStake} step="0.01" value={texasConfig.initialStake} onChange={(event) => setTexasConfig((config) => ({ ...config, initialStake: Math.max(0.35, Number(event.target.value) || 0.35) }))} disabled={running} className="mt-1 w-full rounded-lg border border-[#1e2a40] bg-[#0d1424] px-2 py-2 font-mono text-white" />
                      </label>
                      <label className="text-slate-400">Martingale
                        <input type="number" min="1" step="0.1" value={texasConfig.martingale} onChange={(event) => setTexasConfig((config) => ({ ...config, martingale: Math.max(1, Number(event.target.value) || 1) }))} disabled={running} className="mt-1 w-full rounded-lg border border-[#1e2a40] bg-[#0d1424] px-2 py-2 font-mono text-white" />
                      </label>
                      <label className="text-slate-400">Trades per burst
                        <input type="number" min="1" max="100" step="1" value={texasConfig.runsPerBurst} onChange={(event) => setTexasConfig((config) => ({ ...config, runsPerBurst: Math.min(100, Math.max(1, Math.floor(Number(event.target.value) || 1))) }))} disabled={running} className="mt-1 w-full rounded-lg border border-[#1e2a40] bg-[#0d1424] px-2 py-2 font-mono text-white" />
                      </label>
                      <label className="text-slate-400">Take profit ({currency})
                        <input type="number" min="0.01" step="0.01" value={texasConfig.takeProfit} onChange={(event) => setTexasConfig((config) => ({ ...config, takeProfit: Math.max(0.01, Number(event.target.value) || 0.01) }))} disabled={running} className="mt-1 w-full rounded-lg border border-[#1e2a40] bg-[#0d1424] px-2 py-2 font-mono text-white" />
                      </label>
                      <label className="text-slate-400">Stop loss ({currency})
                        <input type="number" min="0.01" step="0.01" value={texasConfig.stopLoss} onChange={(event) => setTexasConfig((config) => ({ ...config, stopLoss: Math.max(0.01, Number(event.target.value) || 0.01) }))} disabled={running} className="mt-1 w-full rounded-lg border border-[#1e2a40] bg-[#0d1424] px-2 py-2 font-mono text-white" />
                      </label>
                    </div>

                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-100">
                      Worst-case exposure through the stop-loss: <strong>${texasWorstCaseExposure.toFixed(2)} {currency}</strong>.
                      Martingale losses can exceed the configured stop loss before the bot can stop.
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#1e2a40] bg-[#0d1424] p-3">
                      <div><span className="block text-slate-500">Current stake</span><span className="font-mono text-white">${(texasState?.stake ?? texasConfig.initialStake).toFixed(2)}</span></div>
                      <div><span className="block text-slate-500">Burst progress</span><span className="font-mono text-white">{texasState?.burstRemaining ? `${texasConfig.runsPerBurst - texasState.burstRemaining}/${texasConfig.runsPerBurst} · ARMED` : texasState?.awaitingSettle ? `IN TRADE · ${texasConfig.runsPerBurst}/${texasConfig.runsPerBurst}` : 'IDLE'}</span></div>
                      <div><span className="block text-slate-500">Run P/L</span><span className={`font-mono ${(texasState?.totalProfit ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{(texasState?.totalProfit ?? 0) >= 0 ? '+' : ''}${(texasState?.totalProfit ?? 0).toFixed(2)}</span></div>
                      <div><span className="block text-slate-500">Wins / Losses</span><span className="font-mono text-white">{texasState?.wins ?? 0} / {texasState?.losses ?? 0}</span></div>
                      <div className="col-span-2 border-t border-[#1e2a40] pt-2 text-slate-300">Trades placed: {texasState?.tradesPlaced ?? 0} · {texasState?.stopped ?? 'Session active'}</div>
                    </div>

                    <p className="text-[10px] leading-relaxed text-amber-200">The entry digit does not change the odds. Martingale can lose more than the stop loss. Results are not guaranteed.</p>
                    {(!isConnected || !token) && <p className="text-amber-300">Connect a Deriv account to run this bot.</p>}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Market</label>
                      <select
                        value={quickMarket}
                        onChange={(e) => setQuickMarket(e.target.value)}
                        className="w-full bg-[#0d1424] border border-[#1e2a40] rounded-xl px-3 py-2 text-xs text-white focus:border-primary"
                      >
                        <option value="1HZ10V">Volatility 10 (1s) Index</option>
                        <option value="1HZ25V">Volatility 25 (1s) Index</option>
                        <option value="1HZ50V">Volatility 50 (1s) Index</option>
                        <option value="1HZ75V">Volatility 75 (1s) Index</option>
                        <option value="1HZ100V">Volatility 100 (1s) Index</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Contract</label>
                        <select
                          value={quickContract}
                          onChange={(e) => setQuickContract(e.target.value)}
                          className="w-full bg-[#0d1424] border border-[#1e2a40] rounded-xl px-3 py-2 text-xs text-white focus:border-primary"
                        >
                          <option value="Rise">Rise (Call)</option>
                          <option value="Fall">Fall (Put)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Duration (Ticks)</label>
                        <select
                          value={quickDuration}
                          onChange={(e) => setQuickDuration(e.target.value)}
                          className="w-full bg-[#0d1424] border border-[#1e2a40] rounded-xl px-3 py-2 text-xs text-white focus:border-primary"
                        >
                          <option value="1">1 Tick</option>
                          <option value="2">2 Ticks</option>
                          <option value="3">3 Ticks</option>
                          <option value="5">5 Ticks</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Stake (USD)</label>
                      <input
                        type="number"
                        min={0.35}
                        step={0.5}
                        value={quickStake}
                        onChange={(e) => setQuickStake(parseFloat(e.target.value) || 0.35)}
                        className="w-full bg-[#0d1424] border border-[#1e2a40] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-primary"
                      />
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleRunToggle}
                  disabled={((selectedBot?.id === GOLDMINE_M1_BOT.id || selectedBot?.id === INFINITY_ALGO_BOT.id || selectedBot?.id === TEXAS_EVEN_BOT.id) && (!isConnected || !token)) || (selectedBot?.id === TEXAS_EVEN_BOT.id && entryDigit === null && !running)}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    running ? 'bg-danger text-white' : 'gradient-ranger text-black shadow-glow-sm'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {running ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {running
                    ? 'Stop Strategy Runner'
                    : selectedBot?.id === GOLDMINE_M1_BOT.id
                      ? 'Run Advanced Goldmine M1'
                      : selectedBot?.id === INFINITY_ALGO_BOT.id
                        ? 'Run Infinity Algo'
                        : selectedBot?.id === TEXAS_EVEN_BOT.id
                          ? 'Run Texas Even Bot'
                          : 'Run Strategy on Live Feed'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Reports & Execution Panel */}
      {rightPanelOpen && (
        <div className="w-80 border-l border-[#1E2A40] bg-[#121829] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#1E2A40] flex items-center justify-between bg-[#0c1220]">
            <button
              type="button"
              onClick={handleRunToggle}
              disabled={((selectedBot?.id === GOLDMINE_M1_BOT.id || selectedBot?.id === INFINITY_ALGO_BOT.id || selectedBot?.id === TEXAS_EVEN_BOT.id) && (!isConnected || !token)) || (selectedBot?.id === TEXAS_EVEN_BOT.id && entryDigit === null && !running)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                running ? 'bg-danger text-white' : 'gradient-ranger text-black'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {running ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {running
                ? 'Stop Run'
                : selectedBot?.id === GOLDMINE_M1_BOT.id
                  ? 'Run Goldmine'
                  : selectedBot?.id === INFINITY_ALGO_BOT.id
                    ? 'Run Infinity'
                    : selectedBot?.id === TEXAS_EVEN_BOT.id
                      ? 'Run Texas Even'
                      : 'Run'}
            </button>

            <span className="text-[11px] font-semibold flex items-center gap-1.5">
              {running ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
                  <span className="text-profit">Running</span>
                </>
              ) : (
                <span className="text-slate-400">Idle</span>
              )}
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

      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={() => setRightPanelOpen(!rightPanelOpen)}
        className="absolute top-1/2 -translate-y-1/2 w-4 h-9 bg-[#1E2A40] border border-[#1E2A40] rounded-l flex items-center justify-center hover:bg-[#2a3a50] transition-all z-10"
        style={{ right: rightPanelOpen ? '320px' : '0' }}
        aria-label="Toggle execution reports panel"
      >
        <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${rightPanelOpen ? '' : 'rotate-180'}`} />
      </button>

      {showTexasRealConfirmation && selectedBot?.id === TEXAS_EVEN_BOT.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-labelledby="texas-real-confirm-title">
          <div className="w-full max-w-md rounded-xl border border-rose-400/40 bg-[#121829] p-5 shadow-2xl">
            <div className="mb-3 text-xs font-bold uppercase text-rose-300">Real account risk confirmation</div>
            <h2 id="texas-real-confirm-title" className="text-lg font-bold text-white">Start Texas Even Bot on {loginid}?</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">This configuration can expose up to <strong className="text-rose-200">${texasWorstCaseExposure.toFixed(2)} {currency}</strong> across the losses needed to cross its ${texasConfig.stopLoss.toFixed(2)} stop loss. Four default losses total $60, which exceeds the $50 stop loss.</p>
            <p className="mt-2 text-xs text-slate-400">Martingale can lose more than the stop loss. The entry digit does not change the odds. Results are not guaranteed.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowTexasRealConfirmation(false)} className="rounded-lg border border-[#334155] px-4 py-2 text-xs font-semibold text-slate-200">Cancel</button>
              <button type="button" onClick={confirmTexasRealTrading} className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-bold text-white">Confirm real trading</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BotBuilderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading Bot Builder...</div>}>
      <BotBuilderContent />
    </Suspense>
  )
}
