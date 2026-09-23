import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By connecting your Deriv account or using any part of the RangerTrader companion platform, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.',
  },
  {
    title: '2. Platform Architecture & Custody',
    body: 'RangerTrader is a non-custodial software interface. We do not hold deposits, maintain custody of user funds, or execute trades on our own servers. All transactions and authorizations are conducted client-side via Deriv’s official WebSocket gateway using your credentials.',
  },
  {
    title: '3. Platform Access & Tools',
    body: 'RangerTrader grants you access to automated trading runners, manual execution tools (D-Trader), analytical dashboards, and institutional strategy templates. All tools are unlocked upon authenticating with your authorized Deriv account.',
  },
  {
    title: '4. Acceptable Use',
    body: 'You may not use the platform to engage in abusive market practices, malicious automation that violates Deriv’s terms of service, or unauthorized security testing. Reverse-engineering or redistributing platform code without written permission is prohibited.',
  },
  {
    title: '5. Trading Risk Acknowledgment',
    body: 'Trading synthetic indices and other financial instruments involves substantial risk of loss. RangerTrader provides software automation and analytical interfaces — not financial advice. Past performance of any bot, strategy, or algorithm is not indicative of future results. You acknowledge that you may lose some or all of your trading capital.',
  },
  {
    title: '6. Bot & Strategy Automation',
    body: 'Automated trading tools, bots, and scripts execute orders according to programmatic rules. Market volatility, execution latency, and network connection drops may affect outcomes. You are solely responsible for setting your stake amounts, stop-loss limits, and risk boundaries.',
  },
  {
    title: '7. Copy Trading & Strategy Templates',
    body: 'Strategy templates provide pre-configured algorithmic frameworks. Market conditions vary and theoretical win rates do not guarantee future profitability. You retain full control over your account and can halt automation or disconnect at any time.',
  },
  {
    title: '8. Intellectual Property',
    body: 'All platform code, user interface designs, proprietary indicators, and documentation are the intellectual property of RangerTrader. Unauthorized duplication or redistribution is strictly prohibited.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'RangerTrader shall not be liable for any trading losses, missed executions, market slippage, API connection disruptions, or indirect damages resulting from your use of the platform. You use all tools at your own risk.',
  },
  {
    title: '10. Third-Party Integration (Deriv)',
    body: 'RangerTrader is an independent third-party companion connecting via Deriv API. Any changes, outages, or restrictions imposed by Deriv are outside of our control and subject to Deriv’s own terms and conditions.',
  },
  {
    title: '11. Changes to Terms',
    body: 'We may update these terms periodically to reflect new features or regulatory requirements. Continued use of RangerTrader after updates constitutes acceptance of the modified terms.',
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />

      <section className="pt-4 pb-10 relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            Legal
          </span>
          <h1 className="text-4xl font-extrabold text-white mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-8">
          <p className="text-warning text-sm font-medium">
            ⚠️ Important: Trading involves substantial risk of loss. Please read Section 5 (Trading Risk Acknowledgment) carefully before using any trading tools on this platform.
          </p>
        </div>

        <div className="space-y-8">
          {SECTIONS.map(({ title, body }) => (
            <div key={title} className="border-b border-border pb-8 last:border-0">
              <h2 className="text-white font-bold text-lg mb-3">{title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm mb-4">Questions about these terms?</p>
          <Link href="/contact" className="text-primary hover:underline text-sm font-medium">Contact our support team</Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
