import Link from 'next/link'
import { Users, MessageCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function CommunityCTASection() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-primary/10 via-card to-primary/5 border border-primary/20 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Join the RangerTrader Community
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Get live algorithmic setups, strategy updates, execution insights, and connect with active Deriv traders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://t.me/TRENDIF" target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="lg">
                  <MessageCircle className="w-5 h-5" />
                  Join Telegram Group
                </Button>
              </a>
              <Link href="/community">
                <Button variant="outline" size="lg">
                  View Community →
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="text-xs">✅</span> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-xs">🎮</span> Free demo account included
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-xs">❌</span> Cancel anytime
              </span>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-border/40 text-sm text-muted-foreground">
              <span>💬 WhatsApp Group</span>
              <span>🎮 Discord Server</span>
              <span>📺 YouTube Channel</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
