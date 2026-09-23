'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ShieldCheck, X } from 'lucide-react'

export default function RiskNotice() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      {/* Persistent Floating Bottom-Left Compliance Badge */}
      <div className="fixed bottom-3 left-3 z-40">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="group flex items-center gap-2 bg-[#0d1424]/90 hover:bg-[#121829] border border-[#1e2a40] hover:border-amber-500/40 rounded-full px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur-md shadow-lg transition-all"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-warning group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline font-medium">Risk Disclaimer & Non-Custodial Notice</span>
          <span className="sm:hidden font-medium">Risk Notice</span>
        </button>
      </div>

      {/* Regulatory & Risk Disclosure Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0d1424] border border-[#1e2a40] rounded-3xl p-6 sm:p-7 text-left shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-white p-1 rounded-lg"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning/15 border border-warning/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Regulatory & Risk Notice</h3>
                <p className="text-xs text-muted-foreground">Deriv Synthetic Indices & CFD Trading</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed border-y border-border/80 py-4 my-4 max-h-[60vh] overflow-y-auto">
              <p>
                <strong className="text-white">Substantial Risk of Loss:</strong> Trading synthetic indices, digital options, and contracts for difference (CFDs) carries a high level of risk to your capital and may not be suitable for all investors. You should not invest money you cannot afford to lose.
              </p>
              <p>
                <strong className="text-white">Algorithmic & Automated Tools:</strong> Automated bots, speed scalpers, and parameter recommenders are provided for discretionary strategy execution. Past backtested performance is no guarantee of future profits. Always test setups thoroughly in virtual demo mode before risking real capital.
              </p>
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="text-slate-200">
                  <strong className="text-white">Non-Custodial Architecture:</strong> RangerTrader connects directly to Deriv official WebSockets (`ws.derivws.com`). Your account password and tokens are never sent to or stored on our servers.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Link
                href="/disclaimer"
                onClick={() => setModalOpen(false)}
                className="text-xs text-primary hover:underline"
              >
                Read full legal disclaimer →
              </Link>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 rounded-full bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
