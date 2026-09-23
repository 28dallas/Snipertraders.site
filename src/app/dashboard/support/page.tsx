'use client'
import { useState } from 'react'
import { MessageCircle, Mail, BookOpen, ChevronDown, ChevronUp, Send } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const FAQS = [
  { q: 'How do I connect my Deriv account?', a: 'Go to Settings → Connected Accounts → Click "Connect" next to Deriv Account. You will be redirected to Deriv to authorize the connection via OAuth.' },
  { q: 'My bot stopped unexpectedly. What happened?', a: 'Bots stop automatically when the Take Profit or Stop Loss limit is reached. Check your bot settings in My Bots and review the activity feed for the stop reason.' },
  { q: 'How long does M-Pesa payment take to activate?', a: 'M-Pesa payments activate within 30 seconds of completing the STK push. If your plan is not activated after 2 minutes, contact support with your M-Pesa receipt number.' },
  { q: 'Can I run multiple bots at the same time?', a: 'Yes. Pro and Elite plans support multiple simultaneous bots. Free plan is limited to 1 active bot at a time.' },
]

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setForm({ subject: '', message: '' })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support</h1>
        <p className="text-muted-foreground text-sm mt-1">We&apos;re here to help you trade smarter</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: MessageCircle, label: 'Telegram Support', sub: 'Fastest response', href: 'https://t.me/snipertraders', color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { icon: Mail, label: 'Email Support', sub: 'support@snipertraders.com', href: 'mailto:support@snipertraders.com', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: BookOpen, label: 'Documentation', sub: 'Guides & tutorials', href: '/docs', color: 'text-gold', bg: 'bg-gold/10' },
        ].map(({ icon: Icon, label, sub, href, color, bg }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer">
            <Card className="text-center hover:border-primary/50 transition-all cursor-pointer h-full">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="text-white text-sm font-semibold">{label}</div>
              <div className="text-muted-foreground text-xs mt-1">{sub}</div>
            </Card>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <Card>
        <h2 className="text-white font-bold text-lg mb-5">Common Questions</h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <span className="text-white text-sm font-medium">{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                }
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 border-t border-border">
                  <p className="text-muted-foreground text-sm leading-relaxed pt-3">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Contact form */}
      <Card>
        <h2 className="text-white font-bold text-lg mb-5">Send a Message</h2>
        {sent ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-semibold">Message sent!</p>
            <p className="text-muted-foreground text-sm mt-1">We&apos;ll reply within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-1.5 block">Subject</label>
              <input
                type="text"
                placeholder="e.g. Bot not starting"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium mb-1.5 block">Message</label>
              <textarea
                rows={5}
                placeholder="Describe your issue in detail..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
            <Button type="submit" variant="primary">
              <Send className="w-4 h-4" />
              Send Message
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
