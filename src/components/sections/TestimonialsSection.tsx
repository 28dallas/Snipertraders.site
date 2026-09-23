'use client'

import { Star } from 'lucide-react'
import Card from '@/components/ui/Card'

const TRADER_TESTIMONIALS = [
  {
    id: '1',
    name: 'Alexandre K.',
    role: 'Quantitative Trader',
    country: 'United Kingdom',
    flag: '🇬🇧',
    rating: 5,
    quote: 'The WebSocket execution speed on SniperTraders is night and day compared to standard web terminals. My digit match scalper runs flawlessly without lag.',
    avatar: 'AK',
  },
  {
    id: '2',
    name: 'Sandra Mwangi',
    role: 'Synthetic Indices Specialist',
    country: 'Kenya',
    flag: '🇰🇪',
    rating: 5,
    quote: 'Having the Auto Trader engine with real stop-loss controls and instant proposal execution keeps my risk tightly managed on Volatility 75.',
    avatar: 'SM',
  },
  {
    id: '3',
    name: 'Marcus Tanaka',
    role: 'Algorithmic Bot Creator',
    country: 'Japan',
    flag: '🇯🇵',
    rating: 5,
    quote: 'Cleanest companion interface for Deriv. I love having D-Trader for discretionary trades and the bot runner active side-by-side in one workspace.',
    avatar: 'MT',
  },
  {
    id: '4',
    name: 'Daniel Roitman',
    role: 'Full-time Day Trader',
    country: 'South Africa',
    flag: '🇿🇦',
    rating: 5,
    quote: 'Bulk Trader is a game changer for hedging simultaneous contracts across Volatility 10 and Crash 500. Everything is non-custodial and secure.',
    avatar: 'DR',
  },
  {
    id: '5',
    name: 'Chloe Laurent',
    role: 'Prop Trading Analyst',
    country: 'France',
    flag: '🇫🇷',
    rating: 5,
    quote: 'Direct Deriv OAuth connection means I never have to expose API keys to a remote backend. All session tokens remain safely in the browser.',
    avatar: 'CL',
  },
]

export default function TestimonialsSection() {
  const doubled = [...TRADER_TESTIMONIALS, ...TRADER_TESTIMONIALS]

  return (
    <section className="py-24 overflow-hidden border-t border-border bg-[#080d1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
          Trader Feedback
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Trusted by Professional Synthetic Traders
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mt-3 max-w-xl mx-auto">
          High-performance execution, automated risk containment, and client-side security.
        </p>
      </div>

      {/* Auto-scrolling carousel */}
      <div className="relative">
        <div className="flex gap-6 animate-scroll" style={{ width: 'max-content' }}>
          {doubled.map((t, i) => (
            <div key={`${t.id}-${i}`} className="w-80 shrink-0">
              <Card className="h-full bg-surface/70 border-border p-6 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                    ))}
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white text-sm font-bold">{t.name}</div>
                    <div className="text-muted-foreground text-xs">{t.role} · {t.flag}</div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Soft edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#080d1a] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#080d1a] to-transparent pointer-events-none" />
      </div>
    </section>
  )
}
