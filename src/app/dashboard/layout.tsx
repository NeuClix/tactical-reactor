import { createServerComponentClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const handleLogout = async () => {
    'use server'
    const supabase = await createServerComponentClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-xl font-bold text-slate-900">NeuClix</h1>
            <p className="text-xs text-slate-500 mt-1">Tactical Reactor</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            <SidebarLink href="/dashboard" label="Dashboard" />
            <SidebarLink href="/dashboard/content" label="Content Hub" />
            <SidebarLink href="/dashboard/gen" label="Gen Hub" />
            <SidebarLink href="/dashboard/brand" label="Brand Hub" />
            <SidebarLink href="/dashboard/settings" label="Settings" />
          </nav>

          {/* User Section */}
          <div className="border-t border-slate-200 p-4 space-y-4">
            <div className="text-sm">
              <p className="font-medium text-slate-900">{user.email}</p>
            </div>
            <form action={handleLogout}>
              <Button type="submit" variant="outline" className="w-full">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors text-sm font-medium"
    >
      {label}
    </Link>
  )
}
