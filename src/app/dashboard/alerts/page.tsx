'use client'
import { useState } from 'react'
import { MessageCircle, Send, CheckCircle, Copy } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

const BOT_LINK = 'https://t.me/RangerTraderBot'

const ALERT_SETTINGS = [
  { key: 'on_trade_open', label: 'On Trade Open', sub: 'Alert when a bot opens a new trade' },
  { key: 'on_trade_close', label: 'On Trade Close', sub: 'Alert when a trade is closed' },
  { key: 'on_win', label: 'On Win', sub: 'Alert only on winning trades' },
  { key: 'on_loss', label: 'On Loss', sub: 'Alert only on losing trades' },
  { key: 'daily_summary', label: 'Daily Summary', sub: 'Receive a daily P&L summary at midnight' },
]

export default function AlertsPage() {
  const [connected, setConnected] = useState(false)
  const [chatId, setChatId] = useState('')
  const [testing, setTesting] = useState(false)
  const [testSent, setTestSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [alerts, setAlerts] = useState({
    on_trade_open: true,
    on_trade_close: true,
    on_win: true,
    on_loss: false,
    daily_summary: true,
  })

  const handleConnect = () => {
    if (chatId.trim()) setConnected(true)
  }

  const handleTestAlert = () => {
    setTesting(true)
    setTimeout(() => {
      setTesting(false)
      setTestSent(true)
      setTimeout(() => setTestSent(false), 3000)
    }, 1500)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(BOT_LINK)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleAlert = (key: string) => {
    setAlerts((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Telegram Alerts</h1>
        <p className="text-muted-foreground text-sm mt-1">Get notified on every trade via Telegram</p>
      </div>

      {/* Connection card */}
      <Card className={connected ? 'border-primary/30 bg-primary/5' : ''}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-bold">Connect Telegram</h2>
            <div className="mt-0.5">
              {connected
                ? <Badge variant="green">Connected</Badge>
                : <Badge variant="default">Not Connected</Badge>
              }
            </div>
          </div>
        </div>

        {connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
              <CheckCircle className="w-5 h-5 text-success shrink-0" />
              <div>
                <div className="text-white text-sm font-medium">Telegram Connected</div>
                <div className="text-muted-foreground text-xs">Chat ID: {chatId}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleTestAlert} disabled={testing}>
                <Send className="w-4 h-4" />
                {testing ? 'Sending...' : testSent ? '✓ Sent!' : 'Send Test Alert'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConnected(false)}>
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-background rounded-xl border border-border p-4 space-y-2">
              <p className="text-white text-sm font-semibold">Setup Instructions:</p>
              <ol className="space-y-2 text-muted-foreground text-sm">
                <li className="flex gap-2"><span className="text-primary font-bold shrink-0">1.</span>Open Telegram and search for our bot</li>
                <li className="flex gap-2"><span className="text-primary font-bold shrink-0">2.</span>Start a chat with <span className="text-primary font-mono">@RangerTraderBot</span></li>
                <li className="flex gap-2"><span className="text-primary font-bold shrink-0">3.</span>Send the command <span className="text-primary font-mono">/start</span></li>
                <li className="flex gap-2"><span className="text-primary font-bold shrink-0">4.</span>Paste your Chat ID from the bot reply below</li>
              </ol>
            </div>
            <div className="flex gap-2">
              <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="primary" className="w-full">
                  <MessageCircle className="w-4 h-4" />
                  Open Telegram Bot
                </Button>
              </a>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
            <div>
              <label className="text-white text-sm font-medium mb-1.5 block">Your Telegram Chat ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 123456789"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <Button variant="primary" onClick={handleConnect} disabled={!chatId.trim()}>
                  Connect
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Alert toggles */}
      <Card className={!connected ? 'opacity-50 pointer-events-none' : ''}>
        <h2 className="text-white font-bold text-lg mb-5">Alert Settings</h2>
        <div className="space-y-1">
          {ALERT_SETTINGS.map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
              <div>
                <div className="text-white text-sm font-medium">{label}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{sub}</div>
              </div>
              <button
                onClick={() => toggleAlert(key)}
                className={`relative w-11 h-6 rounded-full transition-all ${alerts[key as keyof typeof alerts] ? 'bg-primary' : 'bg-border'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${alerts[key as keyof typeof alerts] ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
        {connected && <Button variant="primary" className="mt-5">Save Alert Settings</Button>}
      </Card>

      {/* Sample preview */}
      <Card>
        <h2 className="text-white font-bold text-lg mb-4">Sample Alert Preview</h2>
        <div className="bg-background rounded-xl border border-border p-4 font-mono text-xs text-muted-foreground leading-relaxed">
          <p className="text-success font-bold">✅ TRADE WIN — RangerTrader</p>
          <p className="mt-1">🤖 Bot: Volatility Crusher v3</p>
          <p>📊 Market: Volatility 10 Index</p>
          <p>📈 Direction: Over 5</p>
          <p>💰 Stake: $2.00</p>
          <p className="text-success">💵 Profit: +$1.74</p>
          <p>⏰ Time: 14:32:05 UTC</p>
          <p className="mt-1">📊 Session: +$14.20 | Win Rate: 72.0%</p>
        </div>
      </Card>
    </div>
  )
}
