'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, TrendingDown, Bot, Upload, Gift, Wrench, Zap, Cpu,
  Layers, LineChart, FileSpreadsheet, ArrowRight, ShieldCheck, Activity
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useTradingStore } from '@/stores/trading-store'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

const PNL_HISTORY = [
  { day: 'Mon', pnl: 45 },
  { day: 'Tue', pnl: 110 },
  { day: 'Wed', pnl: 85 },
  { day: 'Thu', pnl: 190 },
  { day: 'Fri', pnl: 165 },
  { day: 'Sat', pnl: 240 },
  { day: 'Sun', pnl: 310 },
]

export default function DashboardOverview() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    loginid,
    balance,
    currency,
    isVirtual,
    sessionPnl,
    sessionTradesCount,
    sessionWins,
    sessionLosses,
    setSelectedBot,
  } = useTradingStore()

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
        description: 'Uploaded bot configuration',
      })
      router.push('/dashboard/bot-builder?view=builder&loaded=upload')
    }
    reader.readAsText(file)
  }

  const winRate =
    sessionWins + sessionLosses > 0
      ? Math.round((sessionWins / (sessionWins + sessionLosses)) * 100)
      : 74.5

  const quickActionTiles = [
    {
      title: 'Upload Bot',
      desc: 'Load XML or JSON bot definition from your device',
      icon: Upload,
      action: () => fileInputRef.current?.click(),
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'hover:border-primary/50',
    },
    {
      title: 'Free Bots',
      desc: 'Browse 50+ pre-configured trading bots',
      icon: Gift,
      href: '/dashboard/my-bots',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'hover:border-amber-400/50',
    },
    {
      title: 'Bot Editor',
      desc: 'Create or customize blocks strategy',
      icon: Wrench,
      href: '/dashboard/bot-builder?view=builder',
      color: 'text-teal-400',
      bg: 'bg-teal-400/10',
      border: 'hover:border-teal-400/50',
    },
    {
      title: 'Quick Strategy',
      desc: 'Instant 4-parameter strategy launcher',
      icon: Zap,
      href: '/dashboard/bot-builder?view=quick',
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
      border: 'hover:border-rose-400/50',
    },
    {
      title: 'D-Trader (Manual)',
      desc: 'Execute instant manual Rise/Fall & Over/Under orders',
      icon: TrendingUp,
      href: '/dashboard/d-trader',
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      border: 'hover:border-cyan-400/50',
    },
    {
      title: 'Auto Trader',
      desc: 'Continuous automated execution with risk guards',
      icon: Cpu,
      href: '/dashboard/auto-trader',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'hover:border-purple-400/50',
    },
  ]

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml,.json"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Greeting & Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hello, {loginid ? <span className="font-mono text-primary">{loginid}</span> : 'Trader'}
            </h1>
            <Badge variant="live">LIVE DERIV API</Badge>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Direct execution trading workstation • Non-custodial WebSocket session
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/d-trader">
            <Button variant="primary" size="sm">
              <TrendingUp className="w-4 h-4" />
              Trade Now
            </Button>
          </Link>
          <Link href="/dashboard/reports">
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="w-4 h-4" />
              Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Tiles Section */}
      <div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActionTiles.map((tile) => {
            const Icon = tile.icon
            const content = (
              <div
                className={`h-full p-4 rounded-2xl bg-[#0d1424] border border-[#1e2a40] ${tile.border} flex flex-col justify-between transition-all cursor-pointer group shadow-sm`}
              >
                <div>
                  <div className={`w-9 h-9 rounded-xl ${tile.bg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-5 h-5 ${tile.color}`} />
                  </div>
                  <h3 className="text-white font-bold text-xs sm:text-sm">{tile.title}</h3>
                  <p className="text-muted-foreground text-[11px] leading-snug mt-1 line-clamp-2">
                    {tile.desc}
                  </p>
                </div>
                <div className="mt-3 flex items-center text-[10px] font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                  Launch <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            )

            if (tile.href) {
              return (
                <Link key={tile.title} href={tile.href} className="block">
                  {content}
                </Link>
              )
            }
            return (
              <div key={tile.title} onClick={tile.action}>
                {content}
              </div>
            )
          })}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Deriv Balance',
            value: `${currency} ${(balance ?? 10000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            color: 'text-primary',
            badge: isVirtual ? 'DEMO' : 'REAL',
            badgeVariant: isVirtual ? 'yellow' : 'green',
          },
          {
            label: 'Session P&L',
            value: `${sessionPnl >= 0 ? '+' : ''}$${sessionPnl.toFixed(2)}`,
            color: sessionPnl >= 0 ? 'text-profit' : 'text-loss',
            badge: sessionTradesCount > 0 ? `${sessionTradesCount} trades` : 'Session active',
            badgeVariant: sessionPnl >= 0 ? 'green' : 'red',
          },
          {
            label: 'Session Win Rate',
            value: `${winRate}%`,
            color: 'text-accent',
            badge: `${sessionWins}W / ${sessionLosses}L`,
            badgeVariant: 'default',
          },
          {
            label: 'Execution Latency',
            value: '< 45ms',
            color: 'text-cyan-400',
            badge: 'Direct WS',
            badgeVariant: 'green',
          },
        ].map((stat) => (
          <Card key={stat.label} className="bg-surface/60 border-border p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-xs font-medium">{stat.label}</span>
              <Badge variant={stat.badgeVariant as any} className="text-[10px]">
                {stat.badge}
              </Badge>
            </div>
            <div className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${stat.color}`}>
              {stat.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Chart & Live Terminals Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-surface/60 border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-sm sm:text-base">Session Cumulative Profit Curve</h3>
              <p className="text-muted-foreground text-xs">Real-time settlement tracking across active bots</p>
            </div>
            <Badge variant="green">+$310 Net</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={PNL_HISTORY}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d2b4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00d2b4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a40" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1424', borderColor: '#1e2a40', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="pnl" stroke="#00d2b4" strokeWidth={2.5} fill="url(#pnlGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Live Execution Fast Card */}
        <Card className="bg-surface/60 border-border p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-sm">Quick Trade Terminal</h3>
              <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
            </div>
            <p className="text-muted-foreground text-xs mb-4">
              Direct access to manual execution or continuous bot runner.
            </p>

            <div className="space-y-2.5">
              <Link
                href="/dashboard/d-trader"
                className="flex items-center justify-between p-3 rounded-xl bg-[#0d1424] border border-[#1e2a40] hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-profit" />
                  <span className="text-xs text-white font-semibold">D-Trader Manual</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/dashboard/auto-trader"
                className="flex items-center justify-between p-3 rounded-xl bg-[#0d1424] border border-[#1e2a40] hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span className="text-xs text-white font-semibold">Auto Trader Runner</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/dashboard/bulk-trader"
                className="flex items-center justify-between p-3 rounded-xl bg-[#0d1424] border border-[#1e2a40] hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-white font-semibold">Bulk Multi-Market</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Market Status:</span>
            <span className="text-profit font-mono font-semibold">Synthetic 24/7 OPEN</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
