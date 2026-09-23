'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getDerivOAuthUrl } from '@/lib/constants'
import { ShieldCheck, Zap, Activity } from 'lucide-react'

interface ConnectingOverlayProps {
  isOpen: boolean
  onClose?: () => void
}

const TICKER_ITEMS = [
  { symbol: 'BTC/USD', price: '$91,480.20', change: '+2.4%', up: true },
  { symbol: 'Volatility 75', price: '1,429.85', change: '+1.8%', up: true },
  { symbol: 'EUR/USD', price: '1.0852', change: '+0.15%', up: true },
  { symbol: 'Crash 500', price: '5,420.10', change: '-1.4%', up: false },
  { symbol: 'Volatility 10 (1s)', price: '4,912.30', change: '+0.9%', up: true },
  { symbol: 'Boom 1000', price: '8,750.40', change: '+3.2%', up: true },
  { symbol: 'GBP/USD', price: '1.2940', change: '-0.3%', up: false },
]

export default function ConnectingOverlay({ isOpen, onClose }: ConnectingOverlayProps) {
  const [progress, setProgress] = useState(15)
  const [stage, setStage] = useState('Initializing market feed...')

  useEffect(() => {
    if (!isOpen) {
      setProgress(15)
      setStage('Initializing market feed...')
      return
    }

    const t1 = setTimeout(() => {
      setProgress(45)
      setStage('Connecting to Deriv WebSocket (ws.derivws.com)...')
    }, 300)

    const t2 = setTimeout(() => {
      setProgress(85)
      setStage('Establishing client-side non-custodial session...')
    }, 700)

    const t3 = setTimeout(() => {
      setProgress(100)
      setStage('Redirecting to Deriv OAuth authorization...')
      const url = getDerivOAuthUrl(window.location.origin)
      if (url) {
        window.location.assign(url)
      } else {
        alert('Deriv App ID is not configured. Please check .env.local.')
      }
    }, 1200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0d1424] border border-[#1e2a40] rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.6)] text-center relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand mark */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border p-2.5 shadow-glow flex items-center justify-center">
            <Image
              src="/img/ranger-logo.svg"
              alt="RangerTrader"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Connecting to Markets...
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 font-medium">
          {stage}
        </p>

        {/* Progress bar */}
        <div className="mt-6 mb-6">
          <div className="flex justify-between text-xs text-muted-foreground font-mono mb-2">
            <span>WebSocket Bridge</span>
            <span className="text-primary font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-border">
            <div
              className="h-full gradient-ranger rounded-full transition-all duration-300 ease-out shadow-glow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Scrolling Ticker Strip */}
        <div className="mt-4 border-y border-[#1e2a40] py-2.5 overflow-hidden bg-[#0a0e1a]/80">
          <div className="flex items-center gap-6 whitespace-nowrap animate-scroll">
            {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-300">{item.symbol}</span>
                <span className="font-mono text-white">{item.price}</span>
                <span className={`font-mono text-[11px] font-bold ${item.up ? 'text-profit' : 'text-loss'}`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security / Non-custodial guarantee badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-surface/60 border border-border rounded-xl py-2 px-3">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>Non-custodial: tokens remain encrypted in your browser.</span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 text-xs text-muted-foreground hover:text-white underline underline-offset-4"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
