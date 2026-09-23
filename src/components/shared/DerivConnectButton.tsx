'use client'

import { useState } from 'react'
import { Link2 } from 'lucide-react'
import ConnectingOverlay from './ConnectingOverlay'

export default function DerivConnectButton({
  className = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-black gradient-ranger shadow-glow-sm hover:scale-[1.02] transition-all",
  children,
  showIcon = true,
  label,
}: {
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
  label?: string
}) {
  const [connecting, setConnecting] = useState(false)
  const content = label || children || 'Start Trading Now'

  return (
    <>
      <button
        type="button"
        onClick={() => setConnecting(true)}
        className={className}
      >
        {showIcon && <Link2 className="w-4 h-4 shrink-0" />}
        {content}
      </button>

      <ConnectingOverlay isOpen={connecting} onClose={() => setConnecting(false)} />
    </>
  )
}
