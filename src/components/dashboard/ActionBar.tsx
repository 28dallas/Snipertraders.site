'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock3, Languages, Maximize, Moon, Play, Sun } from 'lucide-react'
import { useTradingStore } from '@/stores/trading-store'

export default function ActionBar() {
  const router = useRouter()
  const [now, setNow] = useState(new Date())
  const [dark, setDark] = useState(true)
  const { locale, setLocale } = useTradingStore()

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const handleRun = () => {
    router.push('/dashboard/auto-trader')
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
      else await document.exitFullscreen()
    } catch {
      // Fullscreen can be blocked by browser policy or unavailable in preview mode.
    }
  }

  return (
    <div className="fixed bottom-2 left-1/2 z-40 flex w-[calc(100%-1rem)] max-w-2xl -translate-x-1/2 items-center justify-between gap-1 rounded-2xl border border-[#1e4361] bg-[#09172a]/95 p-1.5 shadow-2xl backdrop-blur-xl sm:bottom-3 sm:gap-2 sm:p-2">
      <button type="button" onClick={handleRun} className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-[11px] font-black text-black transition hover:brightness-110 sm:gap-2 sm:px-4 sm:text-xs"><Play className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" />Run</button>
      <div className="hidden items-center gap-2 border-l border-[#1e4361] pl-3 sm:flex"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Execution speed</span><span className="rounded-lg bg-[#142537] px-2 py-1 text-[10px] font-bold text-white">Normal</span></div>
      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-300 sm:gap-1.5 sm:text-xs"><Clock3 className="h-3.5 w-3.5 text-primary" />{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      <button type="button" onClick={() => setLocale(locale === 'en' ? 'sw' : 'en')} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" title="Change language"><Languages className="h-4 w-4" /><span className="sr-only">{locale === 'en' ? 'Swahili' : 'English'}</span></button>
      <button type="button" onClick={() => setDark((value) => !value)} className="hidden rounded-lg p-2 text-slate-300 hover:bg-white/10 sm:block" title="Toggle theme">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}<span className="sr-only">Toggle theme</span></button>
      <button type="button" onClick={toggleFullscreen} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" title="Fullscreen"><Maximize className="h-4 w-4" /><span className="sr-only">Fullscreen</span></button>
    </div>
  )
}