'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu, X, LayoutDashboard, Wrench, Gift,
  TrendingUp, Cpu, Zap, Layers, LineChart, Bolt,
  BookOpen, Calculator, DollarSign, ArrowUpRight, LogOut, Search
} from 'lucide-react'
import { DERIV_CASHIER_DEPOSIT_URL, TELEGRAM_URL, WHATSAPP_URL } from '@/lib/constants'
import { getDerivSession, clearDerivSession, DerivSession } from '@/lib/deriv-session'
import { useTradingStore } from '@/stores/trading-store'
import DerivConnectButton from '@/components/shared/DerivConnectButton'
import { DASHBOARD_NAV } from '@/components/dashboard/dashboard-nav'

const MAIN_NAV = DASHBOARD_NAV

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { loginid, balance, currency, isVirtual, isConnected, initFromSession, logout } = useTradingStore()

  useEffect(() => {
    initFromSession()
  }, [initFromSession])

  const handleLogout = () => {
    logout()
    clearDerivSession()
    window.location.href = '/'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-md border-b border-[#1e2a40]">
      {/* Top bar: Brand + Session Status + Quick Actions */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-[#1e2a40]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 leading-tight group">
          <div className="w-8 h-8 rounded-xl bg-[#121829] border border-[#1e2a40] p-1 flex items-center justify-center group-hover:border-primary/50 transition-colors">
            <Image
              src="/img/ranger-logo.svg"
              alt="SniperTraders logo"
              width={26}
              height={26}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="flex flex-col">
            <span className="text-white font-extrabold text-base tracking-wide flex items-center gap-1">
              Sniper<span className="text-primary">Traders</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              direct deriv companion
            </span>
          </span>
        </Link>

        {/* Right side: Account Info / Auth Buttons */}
        <div className="flex items-center gap-2.5">
          {isConnected && loginid ? (
            <div className="hidden sm:flex items-center gap-2">
              {/* Account details pill */}
              <div className="flex items-center gap-2 bg-[#121829] border border-[#1e2a40] rounded-xl px-3 py-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
                <span className="font-mono text-white font-semibold">{loginid}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${isVirtual ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-profit/20 text-profit border border-profit/30'}`}>
                  {isVirtual ? 'DEMO' : 'REAL'}
                </span>
                {balance !== null && (
                  <span className="font-mono font-bold text-primary pl-1 border-l border-border">
                    {currency} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {/* Cashier deep-link */}
              <a
                href={DERIV_CASHIER_DEPOSIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-profit/15 text-profit border border-profit/30 text-xs font-bold hover:bg-profit/25 transition-all"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Deposit
                <ArrowUpRight className="w-3 h-3" />
              </a>

              {/* Disconnect button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
                title="Disconnect account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <DerivConnectButton className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-black text-xs font-bold gradient-ranger shadow-glow-sm hover:scale-[1.02] transition-all">
                Connect Deriv
              </DerivConnectButton>
            </div>
          )}

          <Link href="/dashboard/reports" className="hidden items-center gap-1.5 border-l border-[#1e2a40] px-3 text-xs font-semibold text-slate-300 hover:text-white sm:flex">
            Reports
          </Link>

          {/* Social Links */}
          <div className="hidden md:flex items-center gap-1 pl-2 border-l border-[#1e2a40]">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="p-1.5 rounded-lg text-[#0088cc] hover:bg-[#0088cc]/10 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.75-.75 4.35-1.06 6.03-.13.71-.39.95-.64.97-.56.05-1.03-.38-1.57-.74-.85-.56-1.33-.9-2.16-1.45-.96-.64-.34-.99.21-1.56.14-.15 2.65-2.42 2.7-2.63.01-.03.01-.14-.05-.2-.06-.06-.15-.04-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.91-1.27 4.85-2.11 5.83-2.52 2.77-1.17 3.35-1.38 3.73-1.38.08 0 .27.02.39.12.1.08.13.19.14.28.01.07.01.21 0 .28z" />
              </svg>
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-all"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Bottom Horizontal Nav Strip: Fast access to trading tools */}
      <div className="hidden sm:flex items-center gap-0 px-3 h-10 overflow-x-auto scrollbar-hide bg-[#0c1220]">
        {MAIN_NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 h-full text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                active
                  ? 'text-primary border-primary bg-primary/10'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </Link>
          )
        })}

      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="sm:hidden bg-[#0d1424] border-t border-[#1e2a40] p-4 max-h-[80vh] overflow-y-auto space-y-2">
          {isConnected && loginid && (
            <div className="p-3 rounded-xl bg-surface border border-border text-xs mb-3 space-y-1">
              <div className="text-muted-foreground">Connected Account:</div>
              <div className="font-mono text-white font-bold flex items-center justify-between">
                <span>{loginid} ({isVirtual ? 'Demo' : 'Real'})</span>
                {balance !== null && <span className="text-primary">{currency} {balance.toFixed(2)}</span>}
              </div>
            </div>
          )}

          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 pt-1">Trading Tools</div>
          <div className="grid grid-cols-2 gap-1.5">
            {MAIN_NAV.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-surface/60 hover:bg-surface border border-border text-xs font-medium text-slate-200"
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {!isConnected ? (
              <DerivConnectButton className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-black gradient-ranger">
                Connect Deriv Account
              </DerivConnectButton>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl text-center text-xs font-semibold text-danger border border-danger/30 hover:bg-danger/10"
              >
                Disconnect Account
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
