import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">TrackMyMoney</h1>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md">
            Overview
          </Link>
          <Link href="/dashboard/transactions" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">
            Transactions
          </Link>
          <Link href="/dashboard/budgets" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">
            Budgets
          </Link>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm font-medium truncate">{user.email}</div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-red-600 border border-gray-200 hover:bg-red-50">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
