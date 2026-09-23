import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

const SECTIONS = [
  {
    title: '1. No Financial Advice',
    body: 'SniperTraders is a software application providing non-custodial trading companion tools, automation scripts, analytical dashboards, and educational content. Nothing on this platform constitutes financial advice, investment advice, or a recommendation to buy or sell any financial instrument. All content is strictly for informational and educational purposes.',
  },
  {
    title: '2. Trading Risk Warning',
    body: 'Trading synthetic indices, forex, and other financial instruments on Deriv involves a high level of risk and may not be suitable for all investors. You may lose some or all of your invested capital. You should never trade with money you cannot afford to lose. The high degree of leverage available in trading can work against you as well as for you.',
  },
  {
    title: '3. Past Performance',
    body: 'Past performance of any bot, strategy, algorithm, or analytical model shown on this platform is not indicative of future results. Win rates, ROI figures, and P&L statistics displayed are historical data and do not guarantee similar future performance. Market conditions change constantly and strategies that worked previously may not work in the future.',
  },
  {
    title: '4. Bot & Automation Risk',
    body: 'Automated trading bots and continuous execution loops can execute trades rapidly and may amplify both gains and losses. A bot that performs well in certain market conditions may cause significant drawdowns in different conditions. Always test bots on Virtual/Demo accounts before deploying live capital. Monitor automated tools actively.',
  },
  {
    title: '5. Copy Trading Strategy Risk',
    body: 'When you execute automated strategy templates, you are running rules against live market conditions. Market spikes, connection interruptions, or slippage can impact execution. SniperTraders does not endorse or guarantee the performance of any strategy. You are solely responsible for setting your stake sizes, stop losses, and risk boundaries.',
  },
  {
    title: '6. Non-Custodial Architecture',
    body: 'SniperTraders operates non-custodially: your Deriv authentication token remains within your client browser and connects directly to Deriv’s official WebSocket gateway. SniperTraders does not receive, store, or hold your trading capital.',
  },
  {
    title: '7. Independent Platform Notice',
    body: 'SniperTraders is an independent third-party trading companion that interfaces with Deriv via their public API and OAuth protocol. SniperTraders is not affiliated with, officially endorsed by, or responsible for Deriv’s platform, pricing, availability, or execution policies.',
  },
  {
    title: '8. User Responsibility',
    body: 'You are solely responsible for all trading decisions made using this platform. This includes the selection of bots, stake sizes, risk management rules, and execution engines. SniperTraders provides client-side automation tools — the decisions and financial outcomes are exclusively yours.',
  },
  {
    title: '9. Regulatory Notice',
    body: 'SniperTraders is a software tools provider and is not a licensed financial advisor, broker, or investment manager. Users are responsible for ensuring that their trading activities comply with the laws and regulations of their jurisdiction.',
  },
]

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />

      <section className="pt-4 pb-10 relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-warning mb-6">
            Risk Notice
          </span>
          <h1 className="text-4xl font-extrabold text-white mb-4">Risk Disclaimer</h1>
          <p className="text-muted-foreground">Last updated: 2025</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-5 mb-8 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-warning font-semibold text-sm mb-1">High Risk Warning</p>
            <p className="text-warning/80 text-sm leading-relaxed">
              Deriv products include synthetic indices and options with a high risk of capital loss and are not suitable for all investors. Ensure you understand all risks before trading. Never trade with capital you cannot afford to lose completely.
            </p>
          </div>
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
          <p className="text-muted-foreground text-sm mb-4">
            By using SniperTraders, you confirm that you have read and understood this disclaimer and accept full responsibility for your trading decisions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className="text-primary hover:underline text-sm font-medium">Open Trading Dashboard</Link>
            <Link href="/tools/risk-calculator" className="text-muted-foreground hover:text-white text-sm">Risk Calculator</Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
