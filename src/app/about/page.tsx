import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Users, Target, Globe, TrendingUp, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import DerivConnectButton from '@/components/shared/DerivConnectButton'

const STATS = [
  { value: '10,000+', label: 'Connected Traders' },
  { value: '50+', label: 'Automated Bots' },
  { value: '0ms', label: 'Server Latency (Direct Client WS)' },
  { value: '99.9%', label: 'Platform Availability' },
]

const VALUES = [
  { icon: Target, title: 'Direct Deriv Companion', desc: 'Every feature connects straight to Deriv’s official WebSocket gateway without middlemen or hidden markups.' },
  { icon: Zap, title: 'Non-Custodial Architecture', desc: 'Your tokens and funds remain client-side in your browser. SniperTraders never touches or holds your capital.' },
  { icon: Globe, title: 'Modern Precision Tools', desc: 'Built for synthetic index traders globally, supporting Volatility 100, Boom/Crash, Step indices, and more.' },
  { icon: Shield, title: 'Transparent Execution', desc: 'Real tick analysis, genuine probability models, and unvarnished risk warnings. No fake win rates or hollow promises.' },
  { icon: Users, title: 'Community Driven', desc: 'Continuous enhancements powered by real traders exchanging proven algorithmic concepts and custom strategies.' },
  { icon: TrendingUp, title: 'Institutional Automation', desc: 'From D-Trader and Speedbot to Multi-Market Bulk Execution, we give individual traders professional-grade capabilities.' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />

      {/* Hero */}
      <section className="pt-4 pb-16 relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            About SniperTraders
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Engineered for <span className="gradient-text">Precision Trading</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            SniperTraders is a non-custodial trading companion for Deriv synthetic indices, combining real-time tick analysis, automated execution engines, and algorithmic risk management.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-border bg-surface/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-extrabold text-primary font-mono">{value}</div>
                <div className="text-muted-foreground text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Modern synthetic index trading demands sub-second precision, rigorous risk control, and automation. Yet most tools force traders through clunky interfaces, locked ecosystems, or black-box servers.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              SniperTraders was engineered as a direct-execution companion. By keeping your authentication token strictly in your browser and dispatching orders directly over WebSocket to Deriv’s high-speed nodes, you get zero custodian risk and ultra-low latency.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you are testing algorithmic strategies on Virtual accounts or deploying multi-market bulk orders on Real accounts, SniperTraders provides complete transparency and power.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="space-y-4">
              {[
                { year: 'Phase 1', event: 'Direct WebSocket integration & real-time tick streaming' },
                { year: 'Phase 2', event: 'No-code bot runner, D-Trader, and digit analysis' },
                { year: 'Phase 3', event: 'Speedbot, Auto Trader, and Bulk multi-market execution' },
                { year: 'Phase 4', event: 'Strategy Pro institutional risk models & AI optimizer' },
              ].map(({ year, event }) => (
                <div key={year} className="flex gap-4">
                  <div className="w-20 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">{year}</div>
                  <div className="flex-1 flex items-center">
                    <p className="text-muted-foreground text-sm">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-surface/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Core Principles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <div className="bg-gradient-to-br from-primary/10 to-card border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to upgrade your trading workflow?</h2>
          <p className="text-muted-foreground mb-6">Connect your Deriv account in seconds. Safe, non-custodial, and free to get started.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <DerivConnectButton label="Start Trading Now" />
            <Link href="/dashboard" className="px-6 py-3 border border-border text-white font-semibold rounded-xl hover:border-primary/40 hover:bg-white/5 transition-all">
              Explore Dashboard
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
