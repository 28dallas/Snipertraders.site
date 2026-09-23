'use client'

import { Bot, TrendingUp, Layers, Cpu, ShieldCheck, BarChart2 } from 'lucide-react'
import Card from '@/components/ui/Card'

const TRADING_MODULES = [
  {
    icon: TrendingUp,
    title: 'Manual Trader (D-Trader)',
    description: 'High-speed execution interface with real-time ticks subscription, live price charts, and instant proposal-to-buy order placement for Rise/Fall, Over/Under, and Even/Odd.',
  },
  {
    icon: Bot,
    title: 'Bot Builder & Free Bots',
    description: 'Build custom strategies or load pre-tested bots. Walk algorithmic definitions against live market streams with automated stop-loss and take-profit rules.',
  },
  {
    icon: Cpu,
    title: 'Auto Trader Engine',
    description: 'Hands-off continuous execution terminal. Select your bot, set risk boundaries, and watch trades trigger automatically with real-time P/L and session logs.',
  },
  {
    icon: Layers,
    title: 'Multi-Market Bulk Trader',
    description: 'Distribute orders across multiple synthetic contracts and indices in a single synchronized execution pass with custom per-contract stakes.',
  },
  {
    icon: BarChart2,
    title: 'Smart Digit Analysis',
    description: 'Real-time statistical frequency tracker for last digits 0-9 over 100+ ticks. Ideal for digit match/differ, even/odd, and over/under strategies.',
  },
  {
    icon: ShieldCheck,
    title: 'Non-Custodial Architecture',
    description: 'Tokens remain in your browser storage. SniperTraders connects directly to official Deriv WebSocket servers without intermediary server custody.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-24 border-t border-border bg-[#0a0e1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            Trading Suite
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Institutional-Grade Deriv Companion Tools
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mt-3 max-w-2xl mx-auto">
            Everything you need for manual precision, algorithmic automation, and live market intelligence in one cohesive workstation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRADING_MODULES.map(({ icon: Icon, title, description }) => (
            <Card key={title} glow="emerald" className="group p-6 bg-surface/50 border-border hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
