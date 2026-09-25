import {
  Activity,
  BarChart3,
  Bot,
  Calculator,
  Copy,
  Gauge,
  LayoutDashboard,
  LineChart,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wrench,
  Zap,
} from 'lucide-react'

export const DASHBOARD_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Bot Builder', href: '/dashboard/bot-builder', icon: Wrench },
  { label: 'Free Bots', href: '/dashboard/my-bots', icon: Bot },
  { label: 'Pro Scanner', href: '/dashboard/pro-scanner', icon: Search },
  { label: 'Strategy Pro', href: '/dashboard/strategy-pro', icon: Sparkles },
  { label: 'Speedbot', href: '/dashboard/speedbot', icon: Gauge },
  { label: 'AI Software', href: '/dashboard/ai-software', icon: Activity },
  { label: 'Auto Trader', href: '/dashboard/auto-trader', icon: Zap },
  { label: 'Analysis Tool', href: '/dashboard/analysis', icon: LineChart },
  { label: 'Manual Trader', href: '/dashboard/d-trader', icon: TrendingUp },
  { label: 'Bulk Trader', href: '/dashboard/bulk-trader', icon: BarChart3 },
  { label: 'Charts', href: '/dashboard/charts', icon: LineChart },
  { label: 'Copy Trader', href: '/dashboard/copy-trading', icon: Copy },
  { label: 'Risk Calculator', href: '/tools/risk-calculator', icon: Calculator },
] as const

export const DASHBOARD_NAV_SECTIONS = [
  { title: 'Trading workspace', items: DASHBOARD_NAV.slice(0, 8) },
  { title: 'Analysis & execution', items: DASHBOARD_NAV.slice(8, 13) },
  {
    title: 'Account',
    items: [
      { label: 'Wallet & Cashier', href: '/dashboard/wallet', icon: ShieldCheck },
      { label: 'Reports', href: '/dashboard/reports', icon: LineChart },
      { label: 'Settings', href: '/dashboard/settings', icon: Wrench },
      { label: 'Support', href: '/dashboard/support', icon: ShieldCheck },
    ],
  },
] as const