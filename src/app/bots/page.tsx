'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Play, RotateCcw, ChevronLeft, AlertTriangle, X, Search } from 'lucide-react'
import DemoModeNotice from '@/components/shared/DemoModeNotice'

type Tab = 'summary' | 'transactions' | 'journal'

const FREE_BOTS = [
  'Barriers Accumulator Master',
  'BINARY FLIPPER AI ROBOT PLUS +',
  'Candle-Mine Version 3.1 (1)',
  'DeepSeek Auto Pro',
  'DERIV KILLER BOT WITH ENTRY POINT',
  'ExpertEdge V1',
  'Market Switcher Robot by BinarytoolLite',
  'Marvel SPLIT ORIGINAL',
  'MatchTOOL_PROBOT (2)',
  'Mkprean SV7 2025',
  'Over Under Pro Bot',
  'ROCKET DIFFER ANALYZER(BY DERIV KILLER).XML',
  'WEALTH GENERATOR V2',
]

export default function FreeBotsPage() {
  const [tab, setTab] = useState<Tab>('summary')
  const [running, setRunning] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [search, setSearch] = useState('')
  const [loadedBot, setLoadedBot] = useState<string | null>(null)

  const filtered = FREE_BOTS.filter((b) => b.toLowerCase().includes(search.toLowerCase()))

return (
    <div className="flex h-[calc(100vh-96px)] bg-[#0A0E1A] overflow-hidden relative">
      {/* Educational banner */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-primary/10 via-transparent to-gold/10 border-b border-primary/20 px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
        <span className="text-muted-foreground font-medium">New to Deriv bots?</span>
        <Link href="/learn" className="text-primary hover:underline font-semibold">Learn the basics</Link>
        <span className="text-[#8899AA] hidden sm:inline">·</span>
        <Link href="/bots/recommended" className="text-primary hover:underline font-semibold">View recommended bots</Link>
        <span className="text-[#8899AA] hidden sm:inline">·</span>
        <Link href="/strategies" className="text-primary hover:underline font-semibold">Browse strategies</Link>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-3"><DemoModeNotice /></div>
        {/* Search */}
        <div className="px-4 py-3 border-b border-[#1E2A40] bg-[#121829]">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899AA]" />
            <input
              type="text"
              placeholder="Search bots..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0E1A] border border-[#1E2A40] rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder:text-[#8899AA] focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Bot grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((name) => (
              <div
                key={name}
                className={`flex flex-col rounded-lg overflow-hidden border transition-all ${
                  loadedBot === name
                    ? 'border-primary shadow-[0_0_12px_rgba(0,230,118,0.3)]'
                    : 'border-[#1E2A40] hover:border-primary/50'
                }`}
                style={{ background: 'linear-gradient(180deg, #0d1340 0%, #0a0e2e 100%)' }}
              >
                <div className="px-3 pt-3 pb-1">
                  <p className="text-[#8899AA] text-xs font-medium leading-snug line-clamp-2 min-h-[32px]">{name}</p>
                </div>
                <div className="flex-1 mx-3 my-2 rounded bg-[#060918] min-h-[80px]" />
                <div className="p-2.5 flex flex-col gap-1.5 border-t border-[#1e2a40]">
                  <Link
                    href={`/dashboard/bot-builder?view=quick&bot=${encodeURIComponent(name)}`}
                    className="py-1.5 text-center text-xs font-semibold rounded-lg bg-surface border border-border text-white hover:border-primary/50 transition-colors"
                  >
                    Open in Builder
                  </Link>
                  <Link
                    href={`/dashboard/auto-trader?bot=${encodeURIComponent(name)}`}
                    className="py-1.5 text-center text-xs font-bold rounded-lg bg-primary text-black hover:opacity-90 transition-all shadow-glow-sm"
                  >
                    Open in Auto Trader
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#8899AA]">No bots found for &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      {rightPanelOpen && (
        <div className="w-72 border-l border-[#1E2A40] bg-[#121829] flex flex-col shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2A40]">
            <button
              onClick={() => { if (loadedBot) setRunning(!running) }}
              className={`flex items-center gap-2 px-5 py-2 rounded font-semibold text-sm transition-all ${
                running ? 'bg-danger hover:bg-danger/90 text-white' : 'bg-primary hover:bg-primary/90 text-black'
              } ${!loadedBot ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Play className="w-4 h-4" style={{ fill: running ? 'white' : 'black' }} />
              {running ? 'Stop Preview' : 'Run Preview'}
            </button>
            <span className="text-xs">
              {running
                ? <span className="flex items-center gap-1 text-primary font-medium"><span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />Preview is running</span>
                : <span className="text-[#8899AA]">Preview is not running</span>}
            </span>
          </div>

          <div className="flex border-b border-[#1E2A40]">
            {(['summary', 'transactions', 'journal'] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-medium capitalize transition-all border-b-2 ${tab === t ? 'border-primary text-primary' : 'border-transparent text-[#8899AA] hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto flex flex-col">
            {tab === 'summary' && (
              <>
                <div className="flex-1 flex items-center justify-center p-6 text-center">
                  {running
                    ? <div><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-[#8899AA] text-sm">Bot is running...</p></div>
                    : <p className="text-[#8899AA] text-sm leading-relaxed">When you&apos;re ready to trade, hit <strong className="text-white">Run</strong>.<br />You&apos;ll be able to track your bot&apos;s performance here.</p>
                  }
                </div>
                <div className="border-t border-[#1E2A40] p-4">
                  <div className="flex justify-end mb-2"><button className="text-xs text-primary hover:underline">What&apos;s this?</button></div>
                  <div className="grid grid-cols-3 gap-3 text-center mb-3">
                    {[['Total stake','0.00'],['Total payout','0.00'],['No. of runs','0']].map(([l,v]) => (
                      <div key={l}><div className="text-xs text-[#8899AA]">{l}</div><div className="text-sm font-semibold text-white">{v}</div></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[['Contracts lost','0'],['Contracts won','0'],['Profit/loss','0.00']].map(([l,v]) => (
                      <div key={l}><div className="text-xs text-[#8899AA]">{l}</div><div className="text-sm font-semibold text-white">{v}</div></div>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-2 border border-[#1E2A40] rounded text-sm text-[#8899AA] hover:bg-white/5 flex items-center justify-center gap-1 transition-all">
                    <RotateCcw className="w-3.5 h-3.5" />Reset
                  </button>
                </div>
              </>
            )}
            {tab === 'transactions' && <div className="flex-1 flex items-center justify-center p-6 text-center"><p className="text-[#8899AA] text-sm">No transactions yet.</p></div>}
            {tab === 'journal' && <div className="flex-1 flex items-center justify-center p-6 text-center"><p className="text-[#8899AA] text-sm">Journal is empty.</p></div>}
          </div>
        </div>
      )}

      <button
        onClick={() => setRightPanelOpen(!rightPanelOpen)}
        className="absolute top-1/2 -translate-y-1/2 w-5 h-10 bg-[#1E2A40] border border-[#1E2A40] rounded-l flex items-center justify-center hover:bg-[#2a3a50] transition-all z-10"
        style={{ right: rightPanelOpen ? '288px' : '0' }}
      >
        <ChevronLeft className={`w-3 h-3 text-[#8899AA] transition-transform ${!rightPanelOpen ? 'rotate-180' : ''}`} />
      </button>

      {showDisclaimer && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="flex items-center gap-2 bg-warning text-black px-3 py-2 rounded-lg text-xs font-semibold shadow-lg">
            <AlertTriangle className="w-3.5 h-3.5" />Risk Disclaimer
            <button onClick={() => setShowDisclaimer(false)} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
