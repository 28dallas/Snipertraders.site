import Sidebar from '@/components/dashboard/Sidebar'
import AccountHeader from '@/components/dashboard/AccountHeader'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-6rem)]">
      <Sidebar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full overflow-x-hidden">
        <AccountHeader />
        {children}
      </main>
    </div>
  )
}
