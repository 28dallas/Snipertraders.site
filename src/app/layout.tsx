import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import SiteShell from '@/components/layout/SiteShell'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rangertrader.com'

export const metadata: Metadata = {
  title: 'RangerTrader — Direct Execution Deriv Trading Companion',
  description: 'Precision automated bot builder, manual execution terminal, real-time risk controls, and algorithmic strategy execution powered directly by Deriv.',
  keywords: 'RangerTrader, Deriv trading bots, Deriv bot builder, manual trader, automated trading, synthetic indices, Deriv API, D-Trader companion',
  metadataBase: new URL(siteUrl),
  manifest: '/manifest.json',
  icons: {
    icon: '/img/ranger-logo.svg',
    shortcut: '/img/ranger-logo.svg',
    apple: '/img/ranger-logo.svg',
  },
  openGraph: {
    title: 'RangerTrader — Direct Execution Deriv Trading Companion',
    description: 'Precision automated bot builder, manual execution terminal, real-time risk controls, and algorithmic strategy execution powered directly by Deriv.',
    type: 'website',
    siteName: 'RangerTrader',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@rangertrader',
    title: 'RangerTrader — Direct Execution Deriv Trading Companion',
    description: 'Precision automated bot builder, manual execution terminal, real-time risk controls, and algorithmic strategy execution powered directly by Deriv.',
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: 'RangerTrader' }],
  publisher: 'RangerTrader',
  creator: 'RangerTrader',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-white antialiased">
        <Suspense fallback={<>{children}</>}>
          <SiteShell>{children}</SiteShell>
        </Suspense>
      </body>
    </html>
  )
}
