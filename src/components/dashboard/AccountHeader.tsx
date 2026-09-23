'use client'

import { useEffect, useState } from 'react'
import { Wallet, DollarSign, ArrowUpRight, RefreshCw, ChevronDown, Check, ShieldCheck } from 'lucide-react'
import { useTradingStore } from '@/stores/trading-store'
import { derivWS } from '@/lib/deriv-websocket'
import { DERIV_CASHIER_DEPOSIT_URL, DERIV_CASHIER_WITHDRAW_URL } from '@/lib/constants'
import DerivConnectButton from '@/components/shared/DerivConnectButton'

export default function AccountHeader() {
  const {
    loginid,
    balance,
    currency,
    isVirtual,
    accounts,
    isConnected,
    initFromSession,
    setBalance,
    switchAccount,
  } = useTradingStore()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [switching, setSwitching] = useState(false)

  // Initialize session and subscribe to real-time balance
  useEffect(() => {
    initFromSession()
  }, [initFromSession])

  useEffect(() => {
    if (!isConnected) return

    // Subscribe to live balance updates via WebSocket
    const unsub = derivWS.subscribeBalance((balanceData) => {
      if (balanceData?.balance !== undefined) {
        setBalance(balanceData.balance, balanceData.currency)
      }
    })

    return () => {
      unsub()
    }
  }, [isConnected, setBalance])

  const handleSwitch = async (acc: any) => {
    setSwitching(true)
    setDropdownOpen(false)
    await switchAccount(acc)
    setSwitching(false)
  }

  if (!isConnected || !loginid) {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-surface to-accent/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">Demo / Preview Mode Active</div>
            <div className="text-muted-foreground text-xs">Connect your Deriv account to enable real-time order execution & live balance synchronization.</div>
          </div>
        </div>
        <DerivConnectButton className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-black gradient-ranger shadow-glow-sm hover:scale-[1.02] transition-all shrink-0">
          Connect Deriv Now
        </DerivConnectButton>
      </div>
    )
  }

  return (
    <div className="mb-6 bg-[#0d1424] border border-[#1e2a40] rounded-2xl p-3.5 sm:p-4 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Account Selector & ID */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border hover:border-primary/40 text-left transition-all"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-profit animate-pulse" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-white text-xs font-bold">{loginid}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                      isVirtual
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-profit/20 text-profit border border-profit/30'
                    }`}
                  >
                    {isVirtual ? 'DEMO' : 'REAL'}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Account Switcher Dropdown */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#121829] border border-[#1e2a40] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Select Account
                </div>
                <div className="space-y-1 mt-1">
                  {accounts.map((acc) => {
                    const isCurrent = acc.account === loginid
                    return (
                      <button
                        key={acc.account}
                        type="button"
                        onClick={() => handleSwitch(acc)}
                        disabled={switching}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-mono transition-colors ${
                          isCurrent
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${acc.isVirtual ? 'bg-amber-400' : 'bg-profit'}`} />
                          <span>{acc.account}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] opacity-70">
                            {acc.isVirtual ? 'Demo' : 'Real'}
                          </span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-surface/40 px-2.5 py-1.5 rounded-lg border border-border">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Encrypted WebSocket</span>
          </div>
        </div>

        {/* Right: Balance & Cashier Shortcuts */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5 bg-surface px-3.5 py-1.5 rounded-xl border border-border">
            <span className="text-muted-foreground text-xs font-medium">Balance:</span>
            <span className="text-base sm:text-lg font-extrabold font-mono text-white">
              {currency}{' '}
              {balance !== null
                ? balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '10,000.00'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={DERIV_CASHIER_DEPOSIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-profit text-black font-bold text-xs hover:bg-profit/90 transition-all shadow-glow-sm"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Deposit
              <ArrowUpRight className="w-3 h-3" />
            </a>

            <a
              href={DERIV_CASHIER_WITHDRAW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface border border-border hover:bg-white/5 text-slate-300 font-semibold text-xs transition-all"
            >
              Withdraw
              <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
