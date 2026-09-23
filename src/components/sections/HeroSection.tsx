'use client'

import Link from 'next/link'
import { Play, TrendingUp, ShieldCheck, Zap, Bot, BarChart3, ArrowRight } from 'lucide-react'
import DerivConnectButton from '@/components/shared/DerivConnectButton'

function AnimatedLiveChart() {
  return (
    <div className="relative w-full h-72 sm:h-84 md:h-96">
      {/* Chart container */}
      <div className="absolute inset-0 bg-[#0d1424] border border-[#1e2a40] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        {/* Grid lines */}
        <div className="absolute inset-0 grid-bg opacity-40" />

        {/* Dynamic decorative price path */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d2b4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00d2b4" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points="0,170 35,150 70,135 110,145 150,110 190,95 230,105 270,75 310,60 355,45 400,30 400,220 0,220"
            fill="url(#chartGradient)"
          />
          <polyline
            points="0,170 35,150 70,135 110,145 150,110 190,95 230,105 270,75 310,60 355,45 400,30"
            fill="none"
            stroke="#00d2b4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Live floating stat badge: Current Market */}
        <div className="absolute top-4 left-4 bg-[#0a0e1a]/90 backdrop-blur-md border border-[#1e2a40] rounded-xl px-3.5 py-2">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Volatility 75 (1s)</div>
          <div className="text-white font-mono font-extrabold text-base sm:text-lg flex items-center gap-2">
            1,429.84
            <span className="text-profit text-xs font-bold font-mono">+1.82%</span>
          </div>
        </div>

        {/* Live floating stat badge: Execution Speed */}
        <div className="absolute top-4 right-4 bg-[#0a0e1a]/90 backdrop-blur-md border border-[#1e2a40] rounded-xl px-3 py-2 text-right">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Execution Latency</div>
          <div className="text-primary font-mono font-bold text-sm flex items-center justify-end gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            &lt; 50ms
          </div>
        </div>

        {/* Bot active execution preview badge */}
        <div className="absolute bottom-4 left-4 bg-primary/10 border border-primary/30 rounded-xl px-3.5 py-2 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">Auto Trader Engine</div>
              <div className="text-profit text-[11px] font-mono font-semibold">+14.2% today</div>
            </div>
          </div>
        </div>

        {/* Real-time Order Fill pill */}
        <div className="absolute bottom-4 right-4 bg-[#121829]/95 border border-[#1e2a40] rounded-xl px-3 py-2 text-xs font-mono text-slate-300">
          <span className="text-profit font-bold">WON</span> · Digit Match (7) · +$8.50
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-12 pb-20">
      {/* Dynamic ambient backdrop */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/5 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7">
            {/* Top pill tags */}
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Direct Deriv WebSocket Client
              </div>
              <div className="inline-flex items-center gap-1.5 bg-surface border border-border rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                100% Non-Custodial
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
              Precision Deriv Trading.{' '}
              <span className="gradient-text">Automated & Manual.</span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-normal">
              Execute manual contracts with sub-second order routing, run algorithmic bots with automated risk guards, and track institutional trade statistics on Deriv synthetic indices.
            </p>

            {/* Direct Entry CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
              <DerivConnectButton className="inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-base sm:text-lg font-bold text-black gradient-ranger shadow-[0_0_35px_rgba(0,210,180,0.35)] hover:scale-[1.02] hover:shadow-[0_0_45px_rgba(0,210,180,0.45)] transition-all">
                Start Trading Now
                <ArrowRight className="w-5 h-5" />
              </DerivConnectButton>

              <Link
                href="/dashboard/d-trader"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1e2a40] bg-surface/80 hover:bg-white/5 px-6 py-4 text-sm sm:text-base font-semibold text-white transition-all"
              >
                <BarChart3 className="w-4 h-4 text-primary" />
                Explore Terminal
              </Link>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-10">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-profit inline-block" />
                Official OAuth 2.0
              </span>
              <span>•</span>
              <span>Tokens stay in your browser</span>
              <span>•</span>
              <span>Free Demo & Real accounts</span>
            </div>

            {/* Platform Feature Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/80">
              <div>
                <div className="text-white font-extrabold text-lg sm:text-xl font-mono">&lt; 50ms</div>
                <div className="text-muted-foreground text-xs mt-0.5">Execution Latency</div>
              </div>
              <div>
                <div className="text-white font-extrabold text-lg sm:text-xl font-mono">24 / 7</div>
                <div className="text-muted-foreground text-xs mt-0.5">Synthetic Markets</div>
              </div>
              <div>
                <div className="text-white font-extrabold text-lg sm:text-xl font-mono">100%</div>
                <div className="text-muted-foreground text-xs mt-0.5">Non-Custodial</div>
              </div>
            </div>
          </div>

          {/* Right Chart Preview */}
          <div className="lg:col-span-5 relative">
            <AnimatedLiveChart />
          </div>
        </div>
      </div>
    </section>
  )
}
