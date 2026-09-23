'use client'

import { useEffect, useState } from 'react'
import {
  Wallet, DollarSign, ArrowUpRight, ShieldCheck, RefreshCw,
  CreditCard, Landmark, Coins, ArrowRightLeft, FileText
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useTradingStore } from '@/stores/trading-store'
import { derivWS } from '@/lib/deriv-websocket'
import {
  DERIV_CASHIER_DEPOSIT_URL,
  DERIV_CASHIER_WITHDRAW_URL,
  DERIV_CASHIER_TRANSFER_URL,
} from '@/lib/constants'

export default function WalletPage() {
  const { loginid, balance, currency, isVirtual, isConnected } = useTradingStore()
  const [statementRows, setStatementRows] = useState<any[]>([])
  const [loadingStatement, setLoadingStatement] = useState(false)

  useEffect(() => {
    if (isConnected) {
      setLoadingStatement(true)
      derivWS
        .statement({ limit: 15 })
        .then((res: any) => {
          const txs = res?.statement?.transactions
          if (Array.isArray(txs)) {
            setStatementRows(txs)
          }
        })
        .catch((err) => {
          console.warn('[Wallet] Statement fetch error:', err.message)
        })
        .finally(() => {
          setLoadingStatement(false)
        })
    }
  }, [isConnected])

  const cashierLinks = [
    {
      title: 'Deposit Funds',
      desc: 'Credit cards, crypto, e-wallets, and regional payment agents',
      url: DERIV_CASHIER_DEPOSIT_URL,
      icon: DollarSign,
      color: 'text-profit',
      bg: 'bg-profit/10',
      actionText: 'Open Deriv Deposit',
      primary: true,
    },
    {
      title: 'Withdraw Funds',
      desc: 'Cash out directly to your bank, crypto wallet, or payment agent',
      url: DERIV_CASHIER_WITHDRAW_URL,
      icon: Landmark,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      actionText: 'Open Deriv Withdrawal',
      primary: false,
    },
    {
      title: 'Payment Agents',
      desc: 'Local currency deposits & withdrawals via verified Deriv agents',
      url: 'https://app.deriv.com/cashier/payment-agent',
      icon: CreditCard,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      actionText: 'Find Payment Agent',
      primary: false,
    },
    {
      title: 'Account Transfer',
      desc: 'Transfer balances between Deriv CFD, MT5, and synthetic accounts',
      url: DERIV_CASHIER_TRANSFER_URL,
      icon: ArrowRightLeft,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      actionText: 'Transfer Balances',
      primary: false,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" />
          Wallet & Deriv Cashier
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
          Direct non-custodial gateway to Deriv official deposit, withdrawal, and balance services
        </p>
      </div>

      {/* Account Balance Card */}
      <Card className="p-6 bg-gradient-to-r from-[#0d1424] via-[#121829] to-[#0d1424] border-[#1e2a40] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Current Trading Balance
              </span>
              <Badge variant={isVirtual ? 'yellow' : 'green'}>
                {isVirtual ? 'VIRTUAL DEMO' : 'LIVE REAL'}
              </Badge>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              {currency}{' '}
              {balance !== null
                ? balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '10,000.00'}
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              Account ID: <strong className="text-slate-200">{loginid || 'VRTC_DEMO'}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={DERIV_CASHIER_DEPOSIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-profit text-black font-extrabold text-xs sm:text-sm hover:bg-profit/90 transition-all shadow-glow-sm"
            >
              Deposit Funds
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <a
              href={DERIV_CASHIER_WITHDRAW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-surface border border-border hover:bg-white/5 text-slate-200 font-semibold text-xs sm:text-sm transition-all"
            >
              Withdraw
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </a>
          </div>
        </div>
      </Card>

      {/* Cashier Direct Action Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cashierLinks.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="p-5 rounded-2xl bg-[#0d1424] border border-[#1e2a40] hover:border-primary/40 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                  {item.desc}
                </p>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  item.primary
                    ? 'bg-primary text-black hover:opacity-90 shadow-glow-sm'
                    : 'bg-surface text-slate-300 hover:text-white border border-border hover:bg-white/5'
                }`}
              >
                <span>{item.actionText}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )
        })}
      </div>

      {/* Non-Custodial Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white font-semibold block mb-0.5">Non-Custodial Guarantee:</strong>
          All transactions are executed exclusively through Deriv&apos;s regulated cashier gateway. SniperTraders never processes, handles, or stores payment credentials or customer funds.
        </div>
      </div>

      {/* Real-time Account Statement Ledger */}
      <Card className="p-5 bg-[#0d1424] border-[#1e2a40]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-sm">Recent Account Statement</h3>
            <p className="text-muted-foreground text-xs">Official transaction ledger synced from Deriv API</p>
          </div>
          <Badge variant="live">LIVE STATEMENT</Badge>
        </div>

        {loadingStatement ? (
          <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            Fetching statement records from Deriv...
          </div>
        ) : statementRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e2a40] text-muted-foreground text-[11px] uppercase">
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a40]/60 font-mono">
                {statementRows.map((tx: any) => {
                  const amt = parseFloat(tx.amount || 0)
                  const isPositive = amt >= 0
                  return (
                    <tr key={tx.transaction_id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 text-white font-bold">#{tx.transaction_id}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">{tx.action_type || 'Contract'}</td>
                      <td className="py-2.5 px-3 text-muted-foreground font-sans text-[11px]">
                        {tx.transaction_time
                          ? new Date(tx.transaction_time * 1000).toLocaleString()
                          : 'Recent'}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isPositive ? 'text-profit' : 'text-loss'}`}>
                        {isPositive ? '+' : ''}${amt.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        ${parseFloat(tx.balance_after || 0).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            No historical transactions returned for this session. Use D-Trader or deposit funds to view ledger entries.
          </div>
        )}
      </Card>
    </div>
  )
}
