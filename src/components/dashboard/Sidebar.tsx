'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  Wrench,
  Cpu,
  Layers,
  Gift,
  BookOpen,
  LineChart,
  Zap,
  Bolt,
  Copy,
  FileSpreadsheet,
  Wallet,
  Settings,
  HelpCircle,
} from 'lucide-react'

const SECTIONS = [
  {
    title: 'Execution Engines',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'D-Trader (Manual)', href: '/dashboard/d-trader', icon: TrendingUp },
      { label: 'Bot Builder', href: '/dashboard/bot-builder', icon: Wrench },
      { label: 'Auto Trader', href: '/dashboard/auto-trader', icon: Cpu },
      { label: 'Bulk Trader', href: '/dashboard/bulk-trader', icon: Layers },
    ],
  },
  {
    title: 'Strategies & Analytics',
    items: [
      { label: 'Free Bots', href: '/dashboard/my-bots', icon: Gift },
      { label: 'Strategy Pro', href: '/dashboard/strategy-pro', icon: BookOpen },
      { label: 'AI Software', href: '/dashboard/ai-software', icon: Cpu },
      { label: 'Charts', href: '/dashboard/charts', icon: LineChart },
      { label: 'Smart Analysis', href: '/dashboard/smart-analysis', icon: Zap },
      { label: 'Speedbot', href: '/dashboard/speedbot', icon: Bolt },
      { label: 'Copy Trading', href: '/dashboard/copy-trading', icon: Copy },
    ],
  },
  {
    title: 'Account & Reports',
    items: [
      { label: 'Reports', href: '/dashboard/reports', icon: FileSpreadsheet },
      { label: 'Wallet & Cashier', href: '/dashboard/wallet', icon: Wallet },
      { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      { label: 'Support', href: '/dashboard/support', icon: HelpCircle },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block w-64 shrink-0 border-r border-[#1e2a40] bg-[#0c1220]/70 backdrop-blur-md">
      <div className="h-full px-3 py-5 overflow-y-auto space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              {section.title}
            </div>
            <nav className="space-y-1">
              {section.items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? 'bg-primary/15 border border-primary/30 text-white shadow-glow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-slate-400'}`} />
                    <span className="truncate">{label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  )
}
