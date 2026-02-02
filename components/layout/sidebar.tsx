"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  ImageIcon,
  Brain,
  RefreshCw,
  Users,
  Calendar,
  Link2,
  Palette,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Content Hub",
    href: "/dashboard/content",
    icon: FileText,
  },
  {
    name: "Media Hub",
    href: "/dashboard/media",
    icon: ImageIcon,
  },
  {
    name: "Intel Hub",
    href: "/dashboard/intel",
    icon: Brain,
  },
  {
    name: "Refresh Hub",
    href: "/dashboard/refresh",
    icon: RefreshCw,
  },
  {
    name: "Gen Hub",
    href: "/dashboard/gen",
    icon: Users,
  },
  {
    name: "Distribution Hub",
    href: "/dashboard/distribution",
    icon: Calendar,
  },
  {
    name: "Connection Hub",
    href: "/dashboard/connections",
    icon: Link2,
  },
  {
    name: "Brand Strategy",
    href: "/dashboard/brand",
    icon: Palette,
  },
  {
    name: "User Hub",
    href: "/dashboard/user",
    icon: User,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <Image
                src="/images/icon.png"
                alt="Tactical Reactor"
                width={36}
                height={36}
                className="w-9 h-9 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-sidebar-foreground leading-tight">
                  Tactical Reactor
                </span>
                <span className="text-[10px] text-sidebar-foreground/50 leading-tight">
                  by NeuClix
                </span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto group">
              <Image
                src="/images/icon.png"
                alt="Tactical Reactor"
                width={32}
                height={32}
                className="w-8 h-8 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
              />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              const Icon = item.icon

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              )

              return (
                <li key={item.href}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" className="bg-card text-card-foreground">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    linkContent
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-sidebar-border space-y-1">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="w-full text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card text-card-foreground">
                Sign Out
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full text-sidebar-foreground/50 hover:text-sidebar-foreground"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
