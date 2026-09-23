'use client'

import { useState } from 'react'
import { FileSpreadsheet, Download, RefreshCw, BarChart2 } from 'lucide-react'
import ReportsPanel, { ReportTab } from '@/components/dashboard/ReportsPanel'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useTradingStore } from '@/stores/trading-store'

export default function ReportsPage() {
  const { isConnected, sessionTradesCount, sessionWins, sessionLosses, sessionPnl, currency } = useTradingStore()
  const [activeTab, setActiveTab] = useState<ReportTab>('summary')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-primary" />
            Trade Reports & Audit Statements
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Real-time settlement statements from Deriv profit table & session telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'green' : 'yellow'}>
            {isConnected ? 'DERIV API CONNECTED' : 'LOCAL SESSION PREVIEW'}
          </Badge>
        </div>
      </div>

      {/* Main Reports Grid */}
      <div className="grid lg:grid-cols-12 gap-6 min-h-[560px]">
        <div className="lg:col-span-8">
          <ReportsPanel activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Right Audit Info */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 bg-[#0d1424] border-[#1e2a40]">
            <h3 className="text-white font-bold text-sm mb-3">Audit Summary</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Settlement Currency</span>
                <span className="text-white font-mono font-bold">{currency}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Session Total Trades</span>
                <span className="text-white font-mono font-bold">{sessionTradesCount}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Win / Loss Ratio</span>
                <span className="text-white font-mono font-bold">
                  {sessionLosses > 0 ? (sessionWins / sessionLosses).toFixed(2) : sessionWins}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Net Cumulative Return</span>
                <span className={`font-mono font-bold ${sessionPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {sessionPnl >= 0 ? '+' : ''}${sessionPnl.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-[#0d1424] border-[#1e2a40] space-y-2">
            <h4 className="text-white font-bold text-xs">Non-Destructive Reset</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Resetting local session statistics only clears this browser workstation view. Your historical Deriv account ledger remains securely preserved on Deriv servers.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
