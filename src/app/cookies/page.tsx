import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const COOKIE_TYPES = [
  {
    name: 'Essential Cookies',
    required: true,
    desc: 'These cookies are required for the platform to function. They manage your login session, authentication state, and security tokens. You cannot opt out of essential cookies.',
    examples: ['Session token', 'Authentication state', 'CSRF protection token'],
  },
  {
    name: 'Preference Cookies',
    required: false,
    desc: 'These cookies remember your settings and preferences so you don\'t have to reconfigure them on every visit.',
    examples: ['Dashboard layout preferences', 'Dismissed notices and banners', 'Selected market and timeframe'],
  },
  {
    name: 'Analytics Cookies',
    required: false,
    desc: 'These cookies help us understand how the platform is used so we can improve it. Data is aggregated and anonymized.',
    examples: ['Pages visited', 'Features used', 'Session duration', 'Error tracking'],
  },
]

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />

      <section className="pt-4 pb-10 relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            Legal
          </span>
          <h1 className="text-4xl font-extrabold text-white mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-8">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-muted-foreground text-sm leading-relaxed">
            RangerTrader uses cookies and local browser storage to keep you connected to Deriv, remember your trading layout preferences, and ensure optimal performance. This policy explains what we use and how you can manage it.
          </p>
        </div>

        <div>
          <h2 className="text-white font-bold text-xl mb-2">What Are Cookies?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Cookies are small text files stored in your browser when you visit a website. They allow the site to remember information about your visit — like whether you&apos;re logged in or what settings you&apos;ve chosen. Some cookies are deleted when you close your browser (session cookies); others persist until they expire or you delete them (persistent cookies).
          </p>
        </div>

        <div className="space-y-5">
          <h2 className="text-white font-bold text-xl">Cookies We Use</h2>
          {COOKIE_TYPES.map(({ name, required, desc, examples }) => (
            <div key={name} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-white font-bold">{name}</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${required ? 'bg-primary/20 text-primary' : 'bg-border text-muted-foreground'}`}>
                  {required ? 'Required' : 'Optional'}
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">{desc}</p>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <span key={ex} className="text-xs bg-background border border-border rounded-lg px-3 py-1 text-muted-foreground">{ex}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-white font-bold text-xl mb-3">Third-Party Cookies</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Some third-party services we use may set their own cookies. These include Supabase (authentication), Vercel (performance monitoring), and analytics tools. These providers have their own privacy policies governing their use of cookies.
          </p>
        </div>

        <div>
          <h2 className="text-white font-bold text-xl mb-3">Managing Cookies</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
            You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that blocking essential cookies will prevent you from logging in and using the platform.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            To manage cookies in your browser: go to Settings → Privacy & Security → Cookies. The exact steps vary by browser (Chrome, Firefox, Safari, Edge).
          </p>
        </div>

        <div>
          <h2 className="text-white font-bold text-xl mb-3">Changes to This Policy</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We may update this Cookie Policy as the platform evolves. We will notify you of material changes via in-platform notification. Continued use of the platform after changes constitutes acceptance.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm mb-4">Questions about our cookie usage?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="text-primary hover:underline text-sm font-medium">Contact Support</Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-white text-sm">View Privacy Policy</Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
