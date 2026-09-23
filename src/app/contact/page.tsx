import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Mail, MessageCircle, Phone, MapPin, Clock, Send } from 'lucide-react'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />

      <section className="pt-4 pb-10 relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            Contact Us
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Get In <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Have a question, issue, or partnership idea? We respond fast — especially on Telegram.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-10">

          {/* Contact info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Contact Channels</h2>
              <div className="space-y-4">
                {[
                  { icon: MessageCircle, label: 'Telegram (Fastest)', value: '@RangerTraderBot', href: 'https://t.me/rangertrader', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { icon: Mail, label: 'Email Support', value: 'support@rangertrader.com', href: 'mailto:support@rangertrader.com', color: 'text-primary', bg: 'bg-primary/10' },
                  { icon: Phone, label: 'WhatsApp', value: '+254 700 000 000', href: '#', color: 'text-success', bg: 'bg-success/10' },
                ].map(({ icon: Icon, label, value, href, color, bg }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-all group">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">{label}</div>
                      <div className={`font-medium text-sm group-hover:${color} transition-colors text-white`}>{value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Response Times
              </h3>
              {[
                { channel: 'Telegram', time: 'Usually within 1 hour' },
                { channel: 'Email', time: 'Within 24 hours' },
                { channel: 'Dashboard Support', time: 'Within 4 hours' },
              ].map(({ channel, time }) => (
                <div key={channel} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{channel}</span>
                  <span className="text-white font-medium">{time}</span>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-white font-bold flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                Based In
              </h3>
              <p className="text-muted-foreground text-sm">Nairobi, Kenya 🇰🇪</p>
              <p className="text-muted-foreground text-sm mt-1">Serving traders across East Africa and beyond</p>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Send a Message</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-1.5 block">First Name</label>
                  <input type="text" placeholder="John"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-1.5 block">Last Name</label>
                  <input type="text" placeholder="Doe"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-1.5 block">Email</label>
                <input type="email" placeholder="you@example.com"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-1.5 block">Subject</label>
                <select className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors">
                  <option value="">Select a topic</option>
                  <option>Account / Login Issue</option>
                  <option>Payment / Subscription</option>
                  <option>Bot or Trading Tool Issue</option>
                  <option>Partnership / Affiliate</option>
                  <option>Feature Request</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-1.5 block">Message</label>
                <textarea rows={5} placeholder="Describe your issue or question in detail..."
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
              </div>
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-all">
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
