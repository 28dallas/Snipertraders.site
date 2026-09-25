'use client'

import { useState } from 'react'
import { BookOpen, ChevronRight, ListChecks, RotateCcw, X } from 'lucide-react'
import { useTradingStore } from '@/stores/trading-store'

type RunPanelTab = 'Summary' | 'Transactions' | 'Journal'

export default function RunPanel() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<RunPanelTab>('Summary')
  const { sessionPnl, sessionTradesCount, sessionWins, sessionLosses, sessionStake, sessionPayout, resetSessionStats } = useTradingStore()
  const stats: Array<[string, number]> = [['Total stake', sessionStake], ['Total payout', sessionPayout], ['No. of runs', sessionTradesCount], ['Contracts lost', sessionLosses], ['Contracts won', sessionWins], ['Total profit/loss', sessionPnl]]

  return (
    <>
      {!open && <button type="button" onClick={() => setOpen(true)} className="fixed right-0 top-1/2 z-30 flex -translate-y-1/2 items-center gap-1 rounded-l-xl border border-[#1e4361] bg-[#0b1b30] px-2 py-4 text-[10px] font-bold uppercase tracking-wider text-primary shadow-xl [writing-mode:vertical-rl]">Run panel <ChevronRight className="h-3.5 w-3.5" /></button>}
      {open && <aside className="fixed right-0 top-1/2 z-50 w-72 -translate-y-1/2 rounded-l-2xl border border-[#1e4361] bg-[#09172a]/98 p-4 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between"><div><div className="text-sm font-black text-white">Run panel</div><div className="text-[10px] text-slate-400">Live session results</div></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close run panel"><X className="h-4 w-4" /></button></div>
        <div className="mb-4 flex gap-1 rounded-xl bg-[#101f32] p-1">{(['Summary', 'Transactions', 'Journal'] as RunPanelTab[]).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`flex-1 rounded-lg px-2 py-2 text-[10px] font-bold ${tab === item ? 'bg-primary text-black' : 'text-slate-400'}`}>{item}</button>)}</div>
        {tab === 'Summary' ? <div className="space-y-2">{stats.map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-[#1e2f43] pb-2 text-xs"><span className="text-slate-400">{label}</span><span className={`font-mono font-bold ${label === 'Total profit/loss' ? (Number(value) >= 0 ? 'text-profit' : 'text-loss') : 'text-white'}`}>{typeof value === 'number' && !['No. of runs', 'Contracts lost', 'Contracts won'].includes(label) ? `$${value.toFixed(2)}` : value}</span></div>)}</div> : <div className="flex min-h-28 flex-col items-center justify-center gap-2 text-center text-xs text-slate-500">{tab === 'Transactions' ? <ListChecks className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}No {tab.toLowerCase()} recorded in this session.</div>}
        <button type="button" onClick={resetSessionStats} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/10"><RotateCcw className="h-3.5 w-3.5" /> Reset session</button>
      </aside>}
    </>
  )
}