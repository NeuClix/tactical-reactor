"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  ImageIcon,
  Users,
  Palette,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react"
import Link from "next/link"

interface DashboardContentProps {
  companyName: string
  subscription: {
    plan_type: string
    credits_remaining: number
  } | null
  stats: {
    contentCount: number
    mediaCount: number
    leadsCount: number
    profilesCount: number
  }
}

const quickActions = [
  {
    title: "Create SEO Content",
    description: "Generate optimized articles and blog posts",
    href: "/dashboard/content",
    icon: FileText,
  },
  {
    title: "Generate Images",
    description: "Create AI-powered visuals for your brand",
    href: "/dashboard/media",
    icon: ImageIcon,
  },
  {
    title: "Find Leads",
    description: "Discover new B2B prospects",
    href: "/dashboard/gen",
    icon: Users,
  },
  {
    title: "Setup Brand",
    description: "Configure your brand strategy",
    href: "/dashboard/brand",
    icon: Palette,
  },
]

export function DashboardContent({ companyName, subscription, stats }: DashboardContentProps) {
  const planType = subscription?.plan_type || "free"
  const credits = subscription?.credits_remaining || 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {companyName}
          </h1>
          <p className="text-muted-foreground mt-1">
            {"Here's what's happening with your marketing today"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={planType === "free" ? "secondary" : "default"}
            className={planType !== "free" ? "bg-primary text-primary-foreground" : ""}
          >
            {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan
          </Badge>
          <div className="flex items-center gap-1.5 text-sm">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{credits} credits</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Content Created
            </CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.contentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
              Articles & blog posts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Media Generated
            </CardTitle>
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.mediaCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
              Images & graphics
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Found
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.leadsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
              B2B prospects
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Brand Profiles
            </CardTitle>
            <Palette className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.profilesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {planType === "free" ? (
                <span className="text-primary">Upgrade for more</span>
              ) : (
                "Active profiles"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card
                key={action.href}
                className="bg-card border-border hover:border-primary/50 transition-colors group cursor-pointer"
              >
                <Link href={action.href}>
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-base text-card-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center text-sm text-primary">
                      Get started
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Upgrade CTA for Free Users */}
      {planType === "free" && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Unlock the Full Power of NeuClix
              </h3>
              <p className="text-muted-foreground mt-1">
                Get unlimited content generation, multiple brand profiles, and advanced features.
              </p>
            </div>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/dashboard/user?tab=billing">
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
