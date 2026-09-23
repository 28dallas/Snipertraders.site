'use client'

import { useEffect, useState } from 'react'
import { RotateCcw, TrendingUp, TrendingDown, RefreshCw, FileText, CheckCircle, AlertTriangle } from 'lucide-react'
import { useTradingStore } from '@/stores/trading-store'
import { derivWS } from '@/lib/deriv-websocket'
import Badge from '@/components/ui/Badge'

export type ReportTab = 'summary' | 'transactions' | 'journal'

interface ReportsPanelProps {
  isRunning?: boolean
  journalLogs?: Array<{ time: string; text: string; type?: 'info' | 'success' | 'warning' }>
  onResetSession?: () => void
  activeTab?: ReportTab
  onTabChange?: (tab: ReportTab) => void
}

export default function ReportsPanel({
  isRunning = false,
  journalLogs = [],
  onResetSession,
  activeTab = 'summary',
  onTabChange,
}: ReportsPanelProps) {
  const [tab, setTab] = useState<ReportTab>(activeTab)
  const [derivTransactions, setDerivTransactions] = useState<any[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  const {
    isConnected,
    sessionStake,
    sessionPayout,
    sessionPnl,
    sessionTradesCount,
    sessionWins,
    sessionLosses,
    resetSessionStats,
  } = useTradingStore()

  useEffect(() => {
    setTab(activeTab)
  }, [activeTab])

  const handleTabSelect = (newTab: ReportTab) => {
    setTab(newTab)
    onTabChange?.(newTab)
  }

  // Fetch real transaction history from Deriv profitTable
  useEffect(() => {
    if (tab === 'transactions' && isConnected) {
      setLoadingTransactions(true)
      derivWS
        .profitTable({ limit: 25 })
        .then((res: any) => {
          const txs = res?.profit_table?.transactions
          if (Array.isArray(txs)) {
            setDerivTransactions(txs)
          }
        })
        .catch((err) => {
          console.warn('[ReportsPanel] Could not load Deriv profit table:', err.message)
        })
        .finally(() => {
          setLoadingTransactions(false)
        })
    }
  }, [tab, isConnected])

  const handleReset = () => {
    resetSessionStats()
    onResetSession?.()
  }

  return (
    <div className="h-full flex flex-col bg-[#121829] border border-[#1e2a40] rounded-2xl overflow-hidden shadow-lg">
      {/* Tabs Header */}
      <div className="flex border-b border-[#1e2a40] bg-[#0c1220]">
        {(['summary', 'transactions', 'journal'] as ReportTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTabSelect(t)}
            className={`flex-1 py-3 text-xs font-bold capitalize transition-all border-b-2 ${
              tab === t
                ? 'border-primary text-primary bg-primary/10'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-auto p-4 flex flex-col justify-between">
        {tab === 'summary' && (
          <div className="space-y-4">
            {isRunning && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-2.5 text-xs text-primary font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping inline-block" />
                Execution Engine is actively evaluating tick rules...
              </div>
            )}

            {/* Performance Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-[#0d1424] border border-[#1e2a40]">
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Total Stake</div>
                <div className="text-base font-extrabold font-mono text-white mt-0.5">
                  ${sessionStake.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1424] border border-[#1e2a40]">
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Total Payout</div>
                <div className="text-base font-extrabold font-mono text-white mt-0.5">
                  ${sessionPayout.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1424] border border-[#1e2a40]">
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">No. of Runs</div>
                <div className="text-base font-extrabold font-mono text-white mt-0.5">
                  {sessionTradesCount}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1424] border border-[#1e2a40]">
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Won</div>
                <div className="text-base font-extrabold font-mono text-profit mt-0.5">
                  {sessionWins}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1424] border border-[#1e2a40]">
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Lost</div>
                <div className="text-base font-extrabold font-mono text-loss mt-0.5">
                  {sessionLosses}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1424] border border-[#1e2a40]">
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Net P/L</div>
                <div
                  className={`text-base font-extrabold font-mono mt-0.5 ${
                    sessionPnl >= 0 ? 'text-profit' : 'text-loss'
                  }`}
                >
                  {sessionPnl >= 0 ? '+' : ''}${sessionPnl.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Win Rate Meter */}
            <div className="p-3.5 rounded-xl bg-[#0d1424] border border-[#1e2a40]">
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-muted-foreground">Session Win Rate</span>
                <span className="text-primary font-mono font-bold">
                  {sessionTradesCount > 0
                    ? `${Math.round((sessionWins / sessionTradesCount) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${sessionTradesCount > 0 ? (sessionWins / sessionTradesCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl border border-[#1e2a40] bg-[#0d1424] hover:bg-white/5 text-xs text-slate-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
              Reset Local Session Stats
            </button>
          </div>
        )}

        {tab === 'transactions' && (
          <div className="space-y-2 flex-1 overflow-y-auto">
            {loadingTransactions ? (
              <div className="text-center py-10 text-xs text-muted-foreground flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                Loading Deriv profit table records...
              </div>
            ) : derivTransactions.length > 0 ? (
              derivTransactions.map((tx: any, idx: number) => {
                const profit = parseFloat(tx.sell_price) - parseFloat(tx.buy_price)
                const won = profit > 0
                return (
                  <div
                    key={tx.transaction_id || idx}
                    className="p-2.5 rounded-xl bg-[#0d1424] border border-[#1e2a40] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white">#{tx.contract_id}</span>
                      <span
                        className={`font-mono font-extrabold ${won ? 'text-profit' : 'text-loss'}`}
                      >
                        {won ? '+' : ''}${profit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>Buy: ${parseFloat(tx.buy_price).toFixed(2)}</span>
                      <span>Payout: ${parseFloat(tx.sell_price).toFixed(2)}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 text-xs text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No transactions recorded yet in this session.
              </div>
            )}
          </div>
        )}

        {tab === 'journal' && (
          <div className="space-y-2 flex-1 overflow-y-auto font-mono text-[11px]">
            {journalLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-sans text-xs">
                Journal is empty. Start a bot or manual trade to view execution ticks.
              </div>
            ) : (
              journalLogs.map((log, index) => (
                <div
                  key={index}
                  className="p-2 rounded-lg bg-[#0d1424] border border-[#1e2a40] flex items-start gap-2"
                >
                  <span className="text-muted-foreground shrink-0">{log.time}</span>
                  <span
                    className={
                      log.type === 'success'
                        ? 'text-profit'
                        : log.type === 'warning'
                        ? 'text-warning'
                        : 'text-slate-300'
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
