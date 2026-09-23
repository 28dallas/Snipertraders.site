import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { BookOpen, Key, Bot, Copy, Bell, BarChart2, Wallet, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import DerivConnectButton from '@/components/shared/DerivConnectButton'

const SECTIONS = [
  {
    icon: Key,
    title: 'Getting Started',
    color: 'text-primary',
    bg: 'bg-primary/10',
    articles: [
      { title: 'Connect your Deriv account (OAuth)', href: '/auth/deriv' },
      { title: 'Understanding your dashboard', href: '/dashboard' },
      { title: 'Virtual vs Real trading modes', href: '/dashboard/wallet' },
    ],
  },
  {
    icon: Bot,
    title: 'Bot Builder & Automation',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    articles: [
      { title: 'Free bots catalog & deployment', href: '/dashboard/my-bots' },
      { title: 'Continuous Auto Trader engine', href: '/dashboard/auto-trader' },
      { title: 'Bulk Trader parallel execution', href: '/dashboard/bulk-trader' },
      { title: 'No-code bot builder workshop', href: '/dashboard/bot-builder' },
    ],
  },
  {
    icon: Zap,
    title: 'Execution & Strategies',
    color: 'text-accent',
    bg: 'bg-accent/10',
    articles: [
      { title: 'D-Trader single-click manual execution', href: '/dashboard/d-trader' },
      { title: 'Strategy Pro institutional models', href: '/dashboard/strategy-pro' },
      { title: 'AI Software parameter optimizer', href: '/dashboard/ai-software' },
      { title: 'Speedbot high-frequency runner', href: '/dashboard/speedbot' },
    ],
  },
  {
    icon: BarChart2,
    title: 'Analysis & Real-time Data',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    articles: [
      { title: 'Smart Analysis & last digit statistics', href: '/dashboard/smart-analysis' },
      { title: 'Real-time WebSocket tick charts', href: '/dashboard/charts' },
      { title: 'Audit reports & transaction ledger', href: '/dashboard/reports' },
    ],
  },
  {
    icon: Copy,
    title: 'Copy Trading Strategies',
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
    articles: [
      { title: 'How copy trading works on SniperTraders', href: '/dashboard/copy-trading' },
      { title: 'Reviewing strategy risk & strike rate', href: '/dashboard/copy-trading' },
      { title: 'Deploying strategy to Auto Trader', href: '/dashboard/auto-trader' },
    ],
  },
  {
    icon: Wallet,
    title: 'Deriv Cashier & Wallet',
    color: 'text-warning',
    bg: 'bg-warning/10',
    articles: [
      { title: 'Official Deriv Cashier deposit/withdrawal', href: '/dashboard/wallet' },
      { title: 'Account balance & statement auditing', href: '/dashboard/reports' },
      { title: 'Risk management & position sizing', href: '/tools/risk-calculator' },
    ],
  },
]

const QUICK_STEPS = [
  { step: '1', title: 'One-Click Connect', desc: 'Securely link Deriv via OAuth' },
  { step: '2', title: 'Choose Market', desc: 'Volatility indices, Boom/Crash, Step' },
  { step: '3', title: 'Pick Tool or Bot', desc: 'D-Trader, Auto Trader, or Strategy Pro' },
  { step: '4', title: 'Execute Safely', desc: 'Client-side WebSocket non-custodial' },
]

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />

      <section className="pt-4 pb-10 relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            Documentation
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            How to Use <span className="gradient-text">SniperTraders</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Direct Deriv execution companion — live WebSockets, automated strategies, and institutional trading tools.
          </p>
        </div>
      </section>

      {/* Quick start */}
      <section className="py-10 border-y border-border bg-surface/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-white font-bold text-center mb-8">Quick Start (4 Steps)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_STEPS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-extrabold mx-auto mb-3">{step}</div>
                <div className="text-white font-semibold text-sm">{title}</div>
                <div className="text-muted-foreground text-xs mt-1">{desc}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 flex justify-center">
            <DerivConnectButton label="Start Trading Now" />
          </div>
        </div>
      </section>

      {/* Doc sections */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map(({ icon: Icon, title, color, bg, articles }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-6">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="text-white font-bold mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {articles.map(({ title: articleTitle, href }) => (
                  <li key={articleTitle}>
                    <Link href={href} className="flex items-center gap-2 text-muted-foreground text-sm hover:text-primary transition-colors group">
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      {articleTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-card border border-border rounded-2xl p-8 text-center">
          <BookOpen className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Need assistance with your setup?</h3>
          <p className="text-muted-foreground text-sm mb-5">Our community and technical documentation channels are open 24/7.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className="px-5 py-2.5 bg-primary text-black font-semibold rounded-xl hover:opacity-90 transition-all text-sm">
              Open Trading Dashboard
            </Link>
            <a href="https://t.me/snipertraders" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 border border-border text-white font-semibold rounded-xl hover:border-primary/40 hover:bg-white/5 transition-all text-sm">
              Community Telegram
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
