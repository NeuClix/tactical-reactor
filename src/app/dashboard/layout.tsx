import { createServerComponentClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, FileText, Zap, Palette, Settings, LogOut } from 'lucide-react'

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
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-primary-500/10 bg-gradient-to-b from-dark-900 to-dark-950 shadow-lg flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-primary-500/10">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-tech bg-clip-text text-transparent">
              NeuClix
            </h1>
            <p className="text-xs text-dark-400">Tactical Reactor</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          <SidebarLink
            href="/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard className="w-4 h-4" />}
          />
          <SidebarLink
            href="/dashboard/content"
            label="Content Hub"
            icon={<FileText className="w-4 h-4" />}
          />
          <SidebarLink
            href="/dashboard/gen"
            label="Gen Hub"
            icon={<Zap className="w-4 h-4" />}
          />
          <SidebarLink
            href="/dashboard/brand"
            label="Brand Hub"
            icon={<Palette className="w-4 h-4" />}
          />
          <SidebarLink
            href="/dashboard/settings"
            label="Settings"
            icon={<Settings className="w-4 h-4" />}
          />
        </nav>

        {/* User Section */}
        <div className="border-t border-primary-500/10 p-4 space-y-4">
          <div className="card-glass p-3 rounded">
            <p className="text-xs text-dark-400 truncate">{user.email}</p>
          </div>
          <form action={handleLogout} className="w-full">
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg text-sm font-medium text-dark-300 border border-primary-500/20 hover:border-primary-400/50 hover:text-primary-300 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
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

function SidebarLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon?: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 rounded-lg text-dark-300 hover:text-dark-50 hover:bg-primary-500/10 transition-all text-sm font-medium group"
    >
      {icon && <span className="text-primary-400 group-hover:text-primary-300 transition-colors">{icon}</span>}
      {label}
    </Link>
  )
}
