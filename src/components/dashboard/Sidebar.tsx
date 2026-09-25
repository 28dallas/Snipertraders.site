'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DASHBOARD_NAV_SECTIONS } from './dashboard-nav'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block w-64 shrink-0 border-r border-[#1e2a40] bg-[#0c1220]/70 backdrop-blur-md">
      <div className="h-full px-3 py-5 overflow-y-auto space-y-6">
        {DASHBOARD_NAV_SECTIONS.map((section) => (
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
