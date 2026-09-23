import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rangertrader.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/bots',
    '/strategies',
    '/learn',
    '/copy-trading',
    '/dashboard',
    '/dashboard/d-trader',
    '/dashboard/bot-builder',
    '/dashboard/my-bots',
    '/dashboard/speedbot',
    '/dashboard/smart-analysis',
    '/dashboard/auto-trader',
    '/dashboard/bulk-trader',
    '/dashboard/strategy-pro',
    '/dashboard/ai-software',
    '/dashboard/reports',
    '/dashboard/charts',
    '/dashboard/wallet',
    '/tools/risk-calculator',
    '/tools/trading-times',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/disclaimer',
  ]

  return staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith('/dashboard') ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route.startsWith('/dashboard') ? 0.9 : 0.7,
  }))
}
