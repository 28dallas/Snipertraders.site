import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { DollarSign, Users, BarChart2, CheckCircle, ArrowRight, Gift } from 'lucide-react'
import Link from 'next/link'
import EducationalCTA from '@/components/learn/EducationalCTA'
import AffiliateDisclosure from '@/components/learn/AffiliateDisclosure'
import Newsletter from '@/components/learn/Newsletter'
import { REFERRAL_TIERS } from '@/lib/learn-data'

const TIERS = [
  { name: 'Starter', commission: '20%', desc: 'For new affiliates getting started', min: '0 referrals/mo' },
  { name: 'Growth', commission: '25%', desc: 'For consistent referrers', min: '5+ referrals/mo' },
  { name: 'Pro Partner', commission: '30%', desc: 'For high-volume partners', min: '20+ referrals/mo' },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Apply & Get Approved', desc: 'Fill out the affiliate application. We review within 48 hours and send your unique referral link.' },
  { step: '2', title: 'Share Your Link', desc: 'Share your referral link on Telegram, YouTube, TikTok, WhatsApp, or any channel your audience trusts.' },
  { step: '3', title: 'Earn Commissions', desc: 'Earn recurring commissions every month your referrals stay subscribed. Paid via M-Pesa or bank transfer.' },
]

const GOOD_FIT = [
  'Telegram trading group admins',
  'YouTube / TikTok trading creators',
  'Forex and Deriv educators',
  'Trading signal providers',
  'Finance bloggers and writers',
  'WhatsApp community leaders',
]

export default function AffiliatePage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />

      {/* Hero */}
      <section className="pt-4 pb-16 relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            Affiliate Program
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Earn Recurring Income by <span className="gradient-text">Referring Traders</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Join the SniperTraders affiliate program and partner with the leading Deriv execution companion — earn commissions as your network trades.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="px-6 py-3 bg-primary text-black font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2">
              Apply Now <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="px-6 py-3 border border-border text-white font-semibold rounded-xl hover:border-primary/40 hover:bg-white/5 transition-all">
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-border bg-surface/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: 'Up to 30%', label: 'Recurring Commission' },
              { value: 'Monthly', label: 'Payout Schedule' },
              { value: 'M-Pesa', label: 'Payment Method' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl md:text-3xl font-extrabold text-primary">{value}</div>
                <div className="text-muted-foreground text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="bg-card border border-border rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-extrabold text-lg mx-auto mb-4">
                {step}
              </div>
              <h3 className="text-white font-bold mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Commission tiers */}
      <section className="py-16 bg-surface/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Commission Tiers</h2>
          <p className="text-muted-foreground text-center mb-12">The more you refer, the more you earn. Tiers are reviewed monthly.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {TIERS.map(({ name, commission, desc, min }, i) => (
              <div key={name} className={`bg-card border rounded-2xl p-6 text-center ${i === 2 ? 'border-primary/40 shadow-[0_0_20px_rgba(0,230,118,0.1)]' : 'border-border'}`}>
                {i === 2 && <div className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">Best Rate</div>}
                <h3 className="text-white font-bold text-lg mb-2">{name}</h3>
                <div className="text-4xl font-extrabold text-primary mb-2">{commission}</div>
                <p className="text-muted-foreground text-sm mb-3">{desc}</p>
                <div className="text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5 inline-block">{min}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is a good fit */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Who Is a Good Fit?</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The best affiliates are people who already have an engaged audience of traders or aspiring traders. We reward quality referrals, not just volume.
            </p>
            <div className="space-y-3">
              {GOOD_FIT.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 space-y-5">
            <h3 className="text-white font-bold text-lg">What You Get</h3>
            {[
              { icon: DollarSign, title: 'Recurring commissions', desc: 'Earn every month your referrals stay subscribed — not just on the first payment.' },
              { icon: BarChart2, title: 'Real-time dashboard', desc: 'Track clicks, signups, conversions, and earnings in your affiliate dashboard.' },
              { icon: Users, title: 'Dedicated support', desc: 'A dedicated affiliate manager to help you maximize your earnings.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{title}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* Referral rewards */}
      <section className="py-16 bg-surface/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold text-white">Unlock Premium by Referring Friends</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mb-10">
            Beyond cash commissions, our referral program rewards you with premium platform features. Every friend you invite unlocks something valuable — including a free personalized AI bot.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {REFERRAL_TIERS.map(({ name, reward, desc, icon, featured }) => (
              <div
                key={name}
                className={`bg-card border rounded-2xl p-6 text-center ${featured ? 'border-primary/40 shadow-[0_0_20px_rgba(0,230,118,0.1)]' : 'border-border'}`}
              >
                <div className="text-3xl mb-3">{icon}</div>
                {featured && <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Most Popular</div>}
                <h3 className="text-white font-bold text-sm mb-2">{name}</h3>
                <div className="text-primary font-extrabold text-base mb-2">{reward}</div>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/refer" className="inline-flex items-center gap-2 px-6 py-3 bg-[#00c853] text-black font-bold rounded-xl hover:bg-[#00e676] transition-all">
              See Full Referral Program <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

{/* CTA */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <div className="bg-gradient-to-br from-primary/10 to-card border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to start earning?</h2>
          <p className="text-muted-foreground mb-6">Apply via the contact page with your audience type, size, and how you plan to promote the platform responsibly.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-semibold rounded-xl hover:opacity-90 transition-all">
            Apply As Affiliate <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AffiliateDisclosure />
      </div>

      <EducationalCTA
        title="Start trading while you earn"
        description="Open a free Deriv account, trade with proven bots, and refer friends to unlock premium features and commissions."
        secondaryHref="/refer"
        secondaryLabel="See Referral Rewards"
        utmSource="affiliate"
      />

      <Footer />
    </main>
  )
}
