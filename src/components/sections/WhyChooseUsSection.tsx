'use client'
import { Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { DERIV_AFFILIATE_LINK } from '@/lib/constants'

const CHECKLIST = [
  "Instant M-Pesa deposits and fast withdrawals",
  "No hidden fees or commissions",
  "500+ free bots, no credit card needed",
  "Free demo mode to test strategies risk-free",
  "Copy trading from Africa's top Deriv traders",
  "Automated bot integration with Deriv API",
  "Real-time risk management and drawdown alerts",
  "Multi-currency support (KES, USD, TZS, UGX)",
]

export default function WhyChooseUsSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
              Why Choose Us
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Why Choose Pips <span className="gradient-text">Dollar Printer</span>
            </h2>
            
            <p className="text-gold font-medium text-sm md:text-base">
              Built by traders, for traders across Africa
            </p>
            
            <p className="text-muted-foreground text-base leading-relaxed">
              Our platform bridges the gap between complex algorithmic trading and everyday convenience. By integrating directly with Deriv&apos;s robust API and localized payments like M-Pesa, we make running and building automated trading systems seamless, secure, and accessible to everyone.
            </p>
            
            <div className="pt-2">
              <a
                href={DERIV_AFFILIATE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto"
              >
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Open Free Account &rarr;
                </Button>
              </a>
            </div>
          </div>
          
          {/* Right Column (7 cols) */}
          <div className="lg:col-span-7">
            <Card glow="emerald" className="border-primary/20 bg-card/65 backdrop-blur-md">
              <div className="grid sm:grid-cols-2 gap-4">
                {CHECKLIST.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-1">
                    <div className="w-5.5 h-5.5 rounded-full bg-success/20 border border-success/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#00E676]" />
                    </div>
                    <span className="text-white text-sm leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
