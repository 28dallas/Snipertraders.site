'use client'

import Navbar from '@/components/layout/Navbar'
import RiskNotice from '@/components/shared/RiskNotice'
import PwaPrompt from '@/components/shared/PwaPrompt'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="pt-24 min-h-screen flex flex-col justify-between">
        <div className="flex-1">{children}</div>
        <RiskNotice />
      </div>
      <PwaPrompt />
    </>
  )
}
