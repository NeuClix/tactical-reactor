import { createServerComponentClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
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
      <aside className="w-64 border-r shadow-lg flex flex-col border-gray-200 bg-white dark:border-primary-500/10 dark:bg-gradient-to-b dark:from-dark-900 dark:to-dark-950">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-primary-500/10">
          <Logo size="md" showTagline linkToHome />
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
        <div className="border-t p-4 space-y-4 border-gray-200 dark:border-primary-500/10">
          <div className="p-3 rounded bg-gray-100 dark:bg-dark-800/50">
            <p className="text-xs truncate text-gray-600 dark:text-dark-400">{user.email}</p>
          </div>
          <form action={handleLogout} className="w-full">
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 text-gray-600 border border-gray-300 hover:border-primary-500/50 hover:text-primary-600 dark:text-dark-300 dark:border-primary-500/20 dark:hover:border-primary-400/50 dark:hover:text-primary-300"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-100 dark:bg-transparent">
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
      className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium group text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-dark-300 dark:hover:text-dark-50 dark:hover:bg-primary-500/10"
    >
      {icon && <span className="text-primary-500 group-hover:text-primary-600 dark:text-primary-400 dark:group-hover:text-primary-300 transition-colors">{icon}</span>}
      {label}
    </Link>
  )
}
