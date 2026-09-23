'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ChevronRight, Maximize, Sun } from 'lucide-react'
import { getDerivSession } from '@/lib/deriv-session'
import DerivConnectButton from '@/components/shared/DerivConnectButton'

const TICKERS = [
  ['VOL 10', 'Loading...'], ['VOL 25', 'Loading...'], ['VOL 50', 'Loading...'],
  ['VOL 75', 'Loading...'], ['VOL 100', 'Loading...'], ['VOL 10 (1S)', 'Loading...'],
  ['VOL 100 (1S)', 'Loading...'], ['BULL MARKET', 'Loading...'], ['BEAR MARKET', 'Loading...'],
]

const TESTIMONIALS = [
  { initials: 'MG', name: 'Maya Gonzales', role: 'Financial Day Trader', tone: 'cyan', quote: "SniperTraders transformed my trading. The automated bots handle my trades flawlessly, and I've seen consistent profits." },
  { initials: 'KM', name: 'Kelvin Maxwell', role: 'Crypto Investor', tone: 'teal', quote: 'Copy trading feature is incredible! I follow top performers and my portfolio has grown 40% in 3 months.' },
  { initials: 'DG', name: 'Delvoux Glen', role: 'Forex Specialist', tone: 'violet', quote: 'Lightning-fast execution and professional-grade tools. The risk management features saved me from major losses.' },
  { initials: 'AK', name: 'Aisha Khan', role: 'Algorithmic Trader', tone: 'pink', quote: 'The strategy builder makes writing and testing a strategy feel effortless. The results speak for themselves.' },
]

const STATS = [
  ['16K+', 'Active Traders'], ['0.8B+', 'Trading Volume'], ['32.0%', 'Uptime'], ['45+', 'Trading Pairs'],
]

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [typedText, setTypedText] = useState('')
  const [hasSession, setHasSession] = useState(false)
  const greeting = useMemo(() => 'Welcome to SniperTraders', [])

  useEffect(() => {
    setHasSession(Boolean(getDerivSession()))
    const loadingTimer = window.setTimeout(() => setLoading(false), 1800)
    let character = 0
    const typingTimer = window.setInterval(() => {
      character += 1
      setTypedText(greeting.slice(0, character))
      if (character >= greeting.length) window.clearInterval(typingTimer)
    }, 95)

    return () => {
      window.clearTimeout(loadingTimer)
      window.clearInterval(typingTimer)
    }
  }, [greeting])

  if (loading) {
    return (
      <main className="public-home public-loading min-h-screen">
        <div className="loading-panel">
          <BrandMark />
          <div className="loading-divider" />
          <h1>Welcome to SniperTraders</h1>
          <p>Empowering your financial journey.</p>
          <div className="loading-progress"><span /></div>
          <div className="loading-status"><span /> Connecting to Volatility Markets...</div>
          <div className="loading-features">
            <Feature icon="📊" label="Advanced Charts" />
            <Feature icon="🤖" label="Trading Bots" />
            <Feature icon="▣" label="Copy Trading" />
          </div>
          <em>Preparing a seamless trading experience for you</em>
        </div>
      </main>
    )
  }

  return (
    <main className="public-home min-h-screen">
      <header className="public-header">
        <Link href="/" aria-label="SniperTraders home"><BrandMark compact /></Link>
        <div className="public-actions">
          {hasSession ? <Link href="/dashboard" className="public-login">Open Dashboard <ChevronRight /></Link> : <DerivConnectButton showIcon={false} className="public-login">Login Now <ChevronRight /></DerivConnectButton>}
          {!hasSession && <Link href="/auth/signup" className="public-signup">Sign Up</Link>}
        </div>
      </header>
      <div className="market-ticker" aria-label="Live market prices">
        <div className="ticker-track">{[...TICKERS, ...TICKERS].map(([name, value], index) => <span key={`${name}-${index}`}><b>{name}</b> {value}</span>)}</div>
      </div>
      <section className="public-hero">
        <p className="hero-greeting">Good evening</p>
        <h1>{typedText.split('SniperTraders')[0]}<strong>Sniper<span>Traders</span></strong><i /></h1>
        <div className="testimonial-window">
          <div className="testimonial-track">{[...TESTIMONIALS, ...TESTIMONIALS].map((item, index) => <Testimonial key={`${item.initials}-${index}`} {...item} />)}</div>
        </div>
        <div className="public-stats">{STATS.map(([value, label]) => <div className="public-stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
      </section>
      <footer className="public-footer"><span className="footer-live" /><span>2026-09-23 20:07:59 GMT</span><ArrowDown /><Sun /><span>🇬🇧 EN</span><Maximize /></footer>
    </main>
  )
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return <div className={`brand-mark ${compact ? 'brand-mark-compact' : ''}`}><strong><span>SNIPER</span>TRADERS</strong>{!compact && <small>TRADING HUB <b>● LIVE</b></small>}</div>
}

function Feature({ icon, label }: { icon: string; label: string }) {
  return <div><span>{icon}</span><small>{label}</small></div>
}

function Testimonial({ initials, name, role, tone, quote }: (typeof TESTIMONIALS)[number]) {
  return <article className={`testimonial-card testimonial-${tone}`}><div className="avatar">{initials}</div><b className="quote-mark">&rdquo;</b><p>&ldquo;{quote}&rdquo;</p><div className="testimonial-person"><strong>{name}</strong><small>{role}</small><span>★★★★★</span></div></article>
}
