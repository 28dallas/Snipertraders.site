'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, Bot, Play, Wrench, Search, Zap, Check, ArrowRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { FREE_BOTS_COLLECTION, FreeBotItem, toBotDefinition } from '@/lib/free-bots'
import { useTradingStore } from '@/stores/trading-store'

export default function FreeBotsPage() {
  const router = useRouter()
  const { setSelectedBot } = useTradingStore()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'digits' | 'volatility' | 'scalpers'>('all')

  const filteredBots = FREE_BOTS_COLLECTION.filter((bot) => {
    const matchesCat = selectedCategory === 'all' || bot.category === selectedCategory
    const matchesSearch =
      bot.name.toLowerCase().includes(search.toLowerCase()) ||
      bot.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      bot.ruleDescription.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const handleOpenBot = (bot: FreeBotItem, target: 'builder' | 'auto') => {
    setSelectedBot(toBotDefinition(bot))
    if (target === 'auto') {
      if (bot.id === 'texas-even') {
        router.push(`/dashboard/bot-builder?view=quick&bot=${encodeURIComponent(bot.name)}`)
        return
      }
      router.push(`/dashboard/auto-trader?bot=${encodeURIComponent(bot.name)}`)
    } else {
      router.push(`/dashboard/bot-builder?view=quick&bot=${encodeURIComponent(bot.name)}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-400" />
            Free Bots Library
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Pre-configured algorithmic strategies ready for instant deployment in Bot Builder or Auto Trader
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bots or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0d1424] border border-[#1e2a40] text-xs text-white placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-[#1e2a40] pb-2">
        {[
          { label: 'All Bots', value: 'all' },
          { label: 'Digit Strategies', value: 'digits' },
          { label: 'Volatility Trends', value: 'volatility' },
          { label: 'High-Payout Scalpers', value: 'scalpers' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedCategory(tab.value as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === tab.value
                ? 'bg-primary text-black shadow-glow-sm'
                : 'bg-surface text-slate-400 hover:text-white border border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBots.map((bot) => (
          <Card
            key={bot.id}
            className="p-5 bg-[#0d1424] border-[#1e2a40] hover:border-primary/40 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div><div className="mb-1 text-[9px] font-black uppercase tracking-wider text-primary">AUTO</div><h3 className="text-white font-bold text-sm leading-snug">{bot.name}</h3></div>
                <Badge
                  variant={
                    bot.recommendedRisk === 'Low' ? 'green' : bot.recommendedRisk === 'Medium' ? 'yellow' : 'red'
                  }
                  className="text-[10px]"
                >
                  {bot.recommendedRisk} Risk
                </Badge>
              </div>

              <div className="text-[11px] font-mono text-primary mb-3">
                {bot.marketLabel} ({bot.market})
              </div>

              <p className="text-slate-300 text-xs leading-relaxed mb-4 min-h-[48px]">
                {bot.ruleDescription}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {bot.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-surface border border-[#1e2a40] text-[10px] text-slate-300 font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Launch Actions */}
            <div className="pt-3 border-t border-[#1e2a40] grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleOpenBot(bot, 'builder')}
                className="py-2 px-3 rounded-xl bg-surface border border-border hover:bg-white/5 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Wrench className="w-3.5 h-3.5 text-teal-400" />
                Open in Builder
              </button>

              <button
                type="button"
                onClick={() => handleOpenBot(bot, 'auto')}
                className="py-2 px-3 rounded-xl bg-primary text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all shadow-glow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                Run Bot
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
