'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react'
import HeroSection from '@/components/sections/HeroSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import DerivConnectButton from '@/components/shared/DerivConnectButton'
import { getDerivSession, DerivSession } from '@/lib/deriv-session'

export default function HomePage() {
  const [session, setSession] = useState<DerivSession | null>(null)

  useEffect(() => {
    setSession(getDerivSession())
  }, [])

  return (
    <main className="min-h-screen bg-background text-white selection:bg-primary/30 selection:text-white">
      {/* Active Session Notification Bar */}
      {session && (
        <div className="bg-gradient-to-r from-primary/15 via-[#121829] to-accent/15 border-b border-primary/25 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-profit animate-pulse" />
              <span className="text-slate-200 font-medium">
                Deriv Account Connected:{' '}
                <strong className="text-white font-mono">{session.loginid || session.account}</strong>
                {session.is_virtual && (
                  <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                    DEMO
                  </span>
                )}
              </span>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all"
            >
              Open Trading Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection />

      {/* Core Features / Modules Showcase */}
      <FeaturesSection />

      {/* Trader Testimonials */}
      <TestimonialsSection />

      {/* Bottom Conversion CTA */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#0a0e1a] to-[#0d1424] border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-7 h-7 text-primary" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Trade with Real-Time Precision Today
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8">
            Connect securely via official Deriv OAuth 2.0 in seconds. No credit card required, instant access to virtual demo and real trading.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <DerivConnectButton className="inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-base sm:text-lg font-bold text-black gradient-ranger shadow-[0_0_35px_rgba(0,210,180,0.35)] hover:scale-[1.02] transition-all w-full sm:w-auto">
              Start Trading Now
              <ArrowRight className="w-5 h-5" />
            </DerivConnectButton>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Non-custodial tokens
            </span>
            <span>•</span>
            <span>24/7 Synthetic Indices</span>
            <span>•</span>
            <span>Direct WebSocket</span>
          </div>
        </div>
      </section>
    </main>
  )
}
