'use client'
import { useEffect, useState } from 'react'
import { Key, Eye, EyeOff, CheckCircle, AlertTriangle, Copy, Trash2, Plus, ExternalLink, MessageCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { derivWS } from '@/lib/deriv-websocket'
import { clearDerivSession, getDerivSession, saveDerivSession } from '@/lib/deriv-session'
import { useTradingStore } from '@/stores/trading-store'

type TokenEntry = {
  id: string
  name: string
  token: string
  scopes: string[]
  account: string
  balance: string
  connected: boolean
  created: string
}

const SCOPES = [
  { key: 'read', label: 'Read', desc: 'View account info and trade history', required: true },
  { key: 'trade', label: 'Trade', desc: 'Open and close trades on your behalf', required: true },
  { key: 'payments', label: 'Payments', desc: 'View deposit/withdrawal history', required: false },
  { key: 'admin', label: 'Admin', desc: 'Full account management access', required: false },
]

export default function APITokenPage() {
  const { setAccount, logout } = useTradingStore()
  const [tokens, setTokens] = useState<TokenEntry[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newToken, setNewToken] = useState('')
  const [newName, setNewName] = useState('')
  const [showToken, setShowToken] = useState<Record<string, boolean>>({})
  const [verifying, setVerifying] = useState(false)
  const [copied, setCopied] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const session = getDerivSession()
    if (!session) return
    setTokens([{
      id: session.account,
      name: 'Connected Deriv Account',
      token: session.token,
      scopes: ['read', 'trade'],
      account: session.account,
      balance: `${session.currency || 'USD'} ${Number(session.balance ?? 0).toFixed(2)}`,
      connected: true,
      created: session.createdAt.slice(0, 10),
    }])
  }, [])

  const handleAddToken = async () => {
    if (!newToken.trim() || !newName.trim()) return
    setVerifying(true)
    setError('')
    try {
      const response = await derivWS.authorize(newToken.trim())
      const account = response?.authorize
      if (!account?.loginid) throw new Error('Deriv did not return a valid account')
      saveDerivSession({
        account: account.loginid,
        loginid: account.loginid,
        token: newToken.trim(),
        balance: Number(account.balance ?? 0),
        currency: account.currency || 'USD',
        is_virtual: Boolean(account.is_virtual),
        createdAt: new Date().toISOString(),
      })
      setAccount({
        loginid: account.loginid,
        token: newToken.trim(),
        balance: Number(account.balance ?? 0),
        currency: account.currency || 'USD',
        isVirtual: Boolean(account.is_virtual),
        isConnected: true,
      })
      setTokens([{
        id: account.loginid,
        name: newName.trim(),
        token: newToken.trim(),
        scopes: ['read', 'trade'],
        account: account.loginid,
        balance: `${account.currency || 'USD'} ${Number(account.balance ?? 0).toFixed(2)}`,
        connected: true,
        created: new Date().toISOString().slice(0, 10),
      }])
      setVerifying(false)
      setShowAddForm(false)
      setNewToken('')
      setNewName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify the Deriv token')
      setVerifying(false)
    }
  }

  const handleDelete = (id: string) => {
    setTokens((prev) => prev.filter((t) => t.id !== id))
    clearDerivSession()
    logout()
  }

  const handleCopy = (token: string, id: string) => {
    navigator.clipboard.writeText(token)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-gold" />
            API Token
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Connect your Deriv account using an API token</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4" />
          Add Token
        </Button>
      </div>

      {/* How to get token */}
      <Card className="border-gold/20 bg-gold/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-semibold text-sm mb-2">How to get your Deriv API Token</p>
            <ol className="text-muted-foreground text-xs space-y-1 mb-3">
              <li>1. Log in to your Deriv account at <span className="text-primary">deriv.com</span></li>
              <li>2. Go to <strong className="text-white">Account Settings → API Token</strong></li>
              <li>3. Create a new token with <strong className="text-white">Read</strong> and <strong className="text-white">Trade</strong> scopes</li>
              <li>4. Copy the token and paste it below</li>
            </ol>
            <div className="flex flex-wrap gap-2.5">
              <a href="https://app.deriv.com/account/api-token" target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="sm">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Deriv API Token Page
                </Button>
              </a>
              <a href="https://t.me/TRENDIF" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-[#0088cc] text-[#0088cc] hover:bg-[#0088cc] hover:text-black transition-all">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Join Telegram Community
                </Button>
              </a>
            </div>
          </div>
        </div>
      </Card>

      {/* Add token form */}
      {showAddForm && (
        <Card className="border-primary/30">
          <h2 className="text-white font-bold mb-4">Add New API Token</h2>
          {error && <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-1.5 block">Token Name</label>
              <input
                type="text"
                placeholder="e.g. Main Trading Account"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium mb-1.5 block">API Token</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Paste your Deriv API token here"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-2">Required Scopes</p>
              <div className="grid grid-cols-2 gap-2">
                {SCOPES.map(({ key, label, desc, required }) => (
                  <div key={key} className={`flex items-start gap-2 p-2.5 rounded-lg border ${required ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
                    <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${required ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <div className="text-white text-xs font-medium">{label} {required && <span className="text-primary">*</span>}</div>
                      <div className="text-muted-foreground text-xs">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddToken} disabled={!newToken.trim() || !newName.trim() || verifying}>
                {verifying ? 'Verifying...' : 'Connect Token'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Connected tokens */}
      <div className="space-y-4">
        <h2 className="text-white font-bold">Connected Accounts</h2>
        {tokens.length === 0 ? (
          <Card className="text-center py-12">
            <Key className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No tokens connected</p>
            <p className="text-muted-foreground text-sm mb-4">Add your Deriv API token to start trading</p>
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4" />
              Add API Token
            </Button>
          </Card>
        ) : (
          tokens.map((token) => (
            <Card key={token.id} className={token.connected ? 'border-primary/20' : ''}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-white font-bold text-sm">{token.name}</span>
                    {token.connected && <Badge variant="green"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                    <span>Account: <span className="text-white font-mono">{token.account}</span></span>
                    <span>Balance: <span className="text-success font-mono font-bold">{token.balance}</span></span>
                    <span>Added: {token.created}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 mb-3">
                    <span className="text-white font-mono text-xs flex-1 truncate">
                      {showToken[token.id] ? token.token : token.token.slice(0, 6) + '•'.repeat(20)}
                    </span>
                    <button onClick={() => setShowToken((p) => ({ ...p, [token.id]: !p[token.id] }))} className="text-muted-foreground hover:text-white transition-colors">
                      {showToken[token.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => handleCopy(token.token, token.id)} className="text-muted-foreground hover:text-primary transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copied === token.id && <span className="text-primary text-xs">Copied!</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {token.scopes.map((s) => (
                      <Badge key={s} variant="blue" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
                <button onClick={() => handleDelete(token.id)} className="w-8 h-8 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 flex items-center justify-center transition-all shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="border-warning/20 bg-warning/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="text-muted-foreground text-xs leading-relaxed">
            <strong className="text-warning">Security Notice:</strong> Do not paste a token into an untrusted device. This screen is a connection setup preview; use the secure Deriv OAuth connection above to keep your password private. You can revoke access anytime in Deriv account settings.
          </p>
        </div>
      </Card>
    </div>
  )
}
