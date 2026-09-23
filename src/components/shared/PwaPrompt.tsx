'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = sessionStorage.getItem('ranger_pwa_dismissed')
    if (isDismissed) return

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowCard(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setShowCard(false)
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      sessionStorage.setItem('ranger_pwa_dismissed', 'true')
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowCard(false)
    sessionStorage.setItem('ranger_pwa_dismissed', 'true')
  }

  if (!showCard) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] bg-[#0d1424] border border-[#1e2a40] rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-card border border-border p-1.5 flex items-center justify-center shrink-0">
            <Image
              src="/img/ranger-logo.svg"
              alt="RangerTrader"
              width={28}
              height={28}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h4 className="text-white text-sm font-bold">Install RangerTrader</h4>
            <p className="text-muted-foreground text-xs mt-0.5">
              Launch directly from your desktop or mobile home screen
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-black bg-primary hover:bg-primary/90 transition-all shadow-glow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Install
        </button>
      </div>
    </div>
  )
}
