import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { AlertTriangle, TrendingUp, ShieldCheck, Scale } from 'lucide-react'
import RiskCalculator from '@/components/learn/RiskCalculator'
import EducationalCTA from '@/components/learn/EducationalCTA'
import RelatedTools from '@/components/learn/RelatedTools'
import AffiliateDisclosure from '@/components/learn/AffiliateDisclosure'
import Newsletter from '@/components/learn/Newsletter'
import Link from 'next/link'

export default function RiskCalculatorPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />

      {/* Hero */}
      <section className="pt-4 pb-14 relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-6">
            Tools
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Risk & Stake <span className="gradient-text">Calculator</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Plan your stakes and compare Martingale, Alembert, and Oscar&apos;s Grind recovery sequences before you risk a single dollar.
            Adjust the sliders to see your potential loss at every level.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <RiskCalculator />
      </section>

      {/* Educational content */}
      <section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base mb-2">What is Martingale?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Martingale is a recovery strategy that multiplies your stake after each loss so that a single win recovers all previous losses plus a
              profit. It&apos;s powerful but risky — a long losing streak can quickly exceed your budget. Use the calculator above to see exactly how fast
              the risk grows.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="w-11 h-11 rounded-xl bg-warning/15 flex items-center justify-center text-warning mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base mb-2">The Risks</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every recovery level multiplies your total risk. With a 1.5x multiplier and 5 levels, your total stake can reach over 13x your base
              stake. Always cap your levels and set a strict daily budget.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="w-11 h-11 rounded-xl bg-gold/15 flex items-center justify-center text-gold mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base mb-2">Safer Alternatives</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Martingale isn&apos;t your only option — the calculator now supports <strong className="text-white">Alembert</strong> (adds a fixed
              unit after losses) and <strong className="text-white">Oscar&apos;s Grind</strong> (stake stays flat on losses). Both grow risk far more
              slowly and are much safer for beginners.
            </p>
          </div>
        </div>
      </section>

      {/* Stop loss advice */}
      <section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Understanding Stop Loss & Take Profit</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-primary font-bold text-base mb-3">Stop Loss</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                A stop loss automatically ends trading when your losses reach a set amount. It&apos;s your safety net that prevents a single bad
                streak from wiping out your account. We recommend setting it to 20-30% of your daily budget.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Example: With a $50 daily budget, set your stop loss at $10-$15. The bot stops trading once you lose that amount, preserving your
                capital for another day.
              </p>
            </div>
            <div>
              <h3 className="text-primary font-bold text-base mb-3">Take Profit</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                A take profit automatically ends trading when your profits reach a set target. It locks in your gains and prevents greed from
                giving back winnings. A common rule is to set take profit at 2x your daily target.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Example: With a $20 daily target, set your take profit at $40. The bot stops once you&apos;re up $40, securing your profit.
              </p>
            </div>
          </div>
        </div>
      </section>

{/* Recovery strategy comparison */}
      <section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-6 h-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Choosing a Recovery Strategy</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">
            Martingale isn&apos;t your only option. Two gentler recovery systems — <strong className="text-white">Alembert</strong> and{' '}
            <strong className="text-white">Oscar&apos;s Grind</strong> — increase risk far more slowly and are much safer for beginners. Compare
            them below.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Martingale',
                risk: 'High',
                riskColor: 'text-danger border-danger/40 bg-danger/10',
                how: 'Doubles your stake after every loss.',
                best: 'Best for short, aggressive sessions with a large budget.',
                cons: 'Exponential risk — a losing streak can wipe out your bankroll fast.',
              },
              {
                name: 'Alembert',
                risk: 'Low',
                riskColor: 'text-primary border-primary/40 bg-primary/10',
                how: 'Adds one fixed unit after a loss; subtracts one after a win.',
                best: 'Best for beginners who want slow, linear risk growth.',
                cons: 'Recovers losses more slowly, needs many trades.',
              },
              {
                name: 'Oscar\u2019s Grind',
                risk: 'Low',
                riskColor: 'text-warning border-warning/40 bg-warning/10',
                how: 'Increases stake only after a win; resets on target profit.',
                best: 'Best for steady, conservative grinders who hate chasing losses.',
                cons: 'Slowest to grow profits, requires patience and volume.',
              },
            ].map((s) => (
              <div key={s.name} className="bg-background/50 border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-lg">{s.name}</h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${s.riskColor}`}>{s.risk} Risk</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{s.how}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-2"><span className="text-primary font-semibold">Tip:</span> {s.best}</p>
                <p className="text-muted-foreground text-sm leading-relaxed"><span className="text-warning font-semibold">Watch out:</span> {s.cons}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/strategies/alembert" className="inline-flex items-center gap-1 text-primary text-sm font-semibold hover:underline">
              Learn Alembert in depth →
            </Link>
            <Link href="/strategies/oscars-grind" className="inline-flex items-center gap-1 text-primary text-sm font-semibold hover:underline">
              Learn Oscar&apos;s Grind in depth →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AffiliateDisclosure />
      </div>

      <EducationalCTA
        title="Trade with confidence"
        description="Use these risk principles to trade responsibly on a free Deriv account."
        secondaryHref="/tools/trading-times"
        secondaryLabel="Best Trading Times"
        utmSource="tools-risk-calculator"
      />
      <Newsletter className="pt-4" />
      <RelatedTools />
      <Footer />
    </main>
  )
}
