'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import RiskNotice from '@/components/shared/RiskNotice'
import PwaPrompt from '@/components/shared/PwaPrompt'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicHome = pathname === '/'

  return (
    <>
      {!isPublicHome && <Navbar />}
      <div className={`${isPublicHome ? '' : 'pt-24'} min-h-screen flex flex-col justify-between`}>
        <div className="flex-1">{children}</div>
        {!isPublicHome && <RiskNotice />}
      </div>
      <PwaPrompt />
    </>
  )
}
