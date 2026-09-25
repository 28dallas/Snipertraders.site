import AccountHeader from '@/components/dashboard/AccountHeader'
import ActionBar from '@/components/dashboard/ActionBar'
import RunPanel from '@/components/dashboard/RunPanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-6rem)]">
      <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        <AccountHeader />
        {children}
      </main>
      <RunPanel />
      <ActionBar />
    </div>
  )
}
