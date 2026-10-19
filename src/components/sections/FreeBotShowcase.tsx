'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Download, Star, AlertTriangle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { MOCK_BOTS, MARKET_LABELS, STRATEGY_LABELS } from '@/lib/data'
import { DERIV_AFFILIATE_LINK } from '@/lib/constants'

const FILTER_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Volatility Index', value: 'volatility' },
  { label: 'Forex', value: 'forex' },
  { label: 'Crash & Boom', value: 'crash_boom' },
  { label: 'Step Index', value: 'step_index' },
]

function getWinRateBadge(rate: number) {
  if (rate >= 60) return 'green'
  if (rate >= 50) return 'yellow'
  return 'red'
}

function getRiskBadge(risk: string) {
  if (risk === 'low') return 'green'
  if (risk === 'medium') return 'yellow'
  return 'red'
}

export default function FreeBotShowcase() {
  const [activeTab, setActiveTab] = useState('all')
  const [activeBot, setActiveBot] = useState<typeof MOCK_BOTS[number] | null>(null)

  const filtered = MOCK_BOTS.filter((bot) => {
    if (!bot.is_free) return false
    if (activeTab === 'all') return true
    if (activeTab === 'volatility') return bot.market.startsWith('volatility')
    if (activeTab === 'forex') return bot.market === 'forex'
    if (activeTab === 'crash_boom') return bot.market.startsWith('crash') || bot.market.startsWith('boom')
    if (activeTab === 'step_index') return bot.market === 'step_index'
    return true
  })

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="section-heading">Download Free Trading Bots</h2>
            <p className="text-muted-foreground mt-2">500+ ready-made strategies. Download and deploy instantly.</p>
          </div>
          <Link href="/bots" className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1 shrink-0">
            View All Bots →
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.value
                  ? 'bg-primary text-black'
                  : 'bg-card border border-border text-muted-foreground hover:text-white hover:border-primary/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bot cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((bot) => (
            <Card key={bot.id} glow="emerald" className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold text-base mb-1">{bot.name}</h3>
                  <p className="text-muted-foreground text-xs">{MARKET_LABELS[bot.market]}</p>
                </div>
                {!bot.is_free && (
                  <Badge variant="gold">Pro</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {typeof bot.win_rate === 'number' ? (
                  <Badge variant={getWinRateBadge(bot.win_rate)}>
                    <Star className="w-3 h-3 mr-1" />
                    {bot.win_rate}% Win Rate
                  </Badge>
                ) : (
                  <Badge variant="default">Performance unverified</Badge>
                )}
                <Badge variant="default">{STRATEGY_LABELS[bot.strategy_type]}</Badge>
                <Badge variant={getRiskBadge(bot.risk_level)}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {bot.risk_level.charAt(0).toUpperCase() + bot.risk_level.slice(1)} Risk
                </Badge>
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed flex-1">{bot.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                {bot.download_count > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Download className="w-3.5 h-3.5" />
                    {bot.download_count.toLocaleString()} downloads
                  </div>
                )}
                {bot.is_free ? (
                  <button
                    type="button"
                    onClick={() => setActiveBot(bot)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#00c853] px-4 py-2.5 text-sm font-semibold text-black transition-all hover:scale-[1.01] hover:shadow-[0_0_18px_rgba(0,200,83,0.25)]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Free
                  </button>
                ) : (
                  <Button variant="outline" size="sm">
                    <Download className="w-3.5 h-3.5" />
                    Unlock Pro
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {activeBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Create a Free Deriv Account</h2>
                <p className="text-muted-foreground mt-2 text-sm max-w-xl">
                  To download this bot you need a free Deriv account — it only takes 2 minutes to sign up.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveBot(null)}
                className="text-muted-foreground hover:text-white text-2xl leading-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <a
                href={DERIV_AFFILIATE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#00c853] px-6 py-4 text-base font-semibold text-black shadow-[0_0_30px_rgba(0,200,83,0.25)] hover:shadow-[0_0_38px_rgba(0,200,83,0.38)] transition-all"
              >
                Create Free Deriv Account →
              </a>
              <button
                type="button"
                onClick={() => setActiveBot(null)}
                className="text-sm text-muted-foreground underline underline-offset-4"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
