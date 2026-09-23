import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const SECTIONS = [
  {
    title: '1. Information We Process',
    body: 'SniperTraders operates as a client-side trading companion. When you connect your Deriv account via OAuth, your access token is returned directly to your browser. It is stored locally in your browser (via secure cookies/localStorage) to maintain your active trading session and authenticate WebSocket connections to Deriv.',
  },
  {
    title: '2. Client-Side Non-Custodial Security',
    body: 'We do NOT store your Deriv credentials or API tokens on remote centralized servers. Your tokens never touch an intermediary database for trade execution; commands are dispatched directly from your browser to Deriv’s official WebSocket servers (ws.derivws.com).',
  },
  {
    title: '3. Trading Activity & Financial Data',
    body: 'All balance lookups, profit table statements, and trade executions are queried directly through Deriv’s WebSocket API in real time. We do not aggregate, log, or sell your private trading records.',
  },
  {
    title: '4. Telegram & Alert Integrations',
    body: 'If you choose to link Telegram for notification webhooks, we use your Chat ID solely to transmit trade signals and alerts you have explicitly configured.',
  },
  {
    title: '5. Analytics & Session Cookies',
    body: 'We utilize essential session cookies solely to preserve your active UI preferences (active market, layout configuration, and selected account ID) across page reloads. We do not use intrusive cross-site tracking cookies.',
  },
  {
    title: '6. Revocation of Access',
    body: 'You retain full control over your credentials at all times. Disconnecting your session clears your browser session immediately. Furthermore, you can revoke application authorization at any time in your Deriv Account Settings under API Tokens.',
  },
  {
    title: '7. Policy Revisions',
    body: 'We may revise this privacy notice as new platform capabilities or security updates are introduced. Any updates will be reflected directly on this page.',
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />

      <section className="pt-4 pb-10 relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            Legal
          </span>
          <h1 className="text-4xl font-extrabold text-white mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
          <p className="text-primary text-sm">
            We collect only what we need to operate the platform. We do not sell your data. You can delete your account and data at any time.
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
          <p className="text-muted-foreground text-sm mb-4">Privacy questions or data requests?</p>
          <Link href="/contact" className="text-primary hover:underline text-sm font-medium">Contact our support team</Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
