import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Sparkles, Palette, Image as ImageIcon, Rocket, Brain } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-dark-50">
          Welcome to <span className="gradient-text-tech">NeuClix Tactical Reactor</span>
        </h2>
        <p className="text-lg max-w-2xl text-gray-600 dark:text-dark-300">
          Your comprehensive AI-powered SaaS platform for business intelligence and content creation
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Content"
          value="12"
          description="Articles and posts"
        />
        <StatCard
          title="AI Generations"
          value="234"
          description="This month"
        />
        <StatCard
          title="Team Members"
          value="3"
          description="Active users"
        />
        <StatCard
          title="Storage Used"
          value="2.4 GB"
          description="Of 10 GB"
        />
      </div>

      {/* Features Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Content Hub"
          description="Create, edit, and manage your content"
          href="/dashboard/content"
          status="ready"
        />
        <FeatureCard
          title="Gen Hub"
          description="Generate content using AI"
          href="/dashboard/gen"
          status="ready"
        />
        <FeatureCard
          title="Brand Hub"
          description="Manage your brand identity"
          href="/dashboard/brand"
          status="ready"
        />
        <FeatureCard
          title="Media Hub"
          description="Coming soon"
          href="#"
          status="coming"
        />
        <FeatureCard
          title="Distribution Hub"
          description="Coming soon"
          href="#"
          status="coming"
        />
        <FeatureCard
          title="Intel Hub"
          description="Coming soon"
          href="#"
          status="coming"
        />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <div className="p-6 space-y-2 transition-all duration-300 rounded-lg border bg-gray-50 border-gray-200 hover:shadow-md dark:bg-dark-900 dark:border-dark-700 dark:hover:shadow-glow">
      <p className="text-sm font-medium text-gray-500 dark:text-dark-400">{title}</p>
      <div className="text-3xl font-bold text-primary-600 dark:text-primary-300">{value}</div>
      <p className="text-xs text-gray-500 dark:text-dark-400">{description}</p>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  href,
  status,
}: {
  title: string
  description: string
  href: string
  status: 'ready' | 'coming'
}) {
  const icons: Record<string, React.ReactNode> = {
    'Content Hub': <Sparkles className="w-6 h-6" aria-hidden="true" />,
    'Gen Hub': <Zap className="w-6 h-6" aria-hidden="true" />,
    'Brand Hub': <Palette className="w-6 h-6" aria-hidden="true" />,
    'Media Hub': <ImageIcon className="w-6 h-6" aria-hidden="true" />,
    'Distribution Hub': <Rocket className="w-6 h-6" aria-hidden="true" />,
    'Intel Hub': <Brain className="w-6 h-6" aria-hidden="true" />,
  }

  return (
    <a
      href={href}
      className={`p-6 space-y-4 transition-all duration-300 cursor-pointer group rounded-lg border bg-gray-50 border-gray-200 hover:shadow-md dark:bg-dark-900 dark:border-dark-700 dark:hover:shadow-glow-purple ${
        status === 'coming' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="text-primary-500 group-hover:text-primary-600 dark:text-accent-400 dark:group-hover:text-accent-300 transition-colors">
          {icons[title] || <Zap className="w-6 h-6" />}
        </div>
        <Badge
          variant={status === 'ready' ? 'default' : 'secondary'}
          className={status === 'ready' ? 'bg-primary-500/80' : 'bg-gray-200 text-gray-600 dark:bg-dark-700/80 dark:text-dark-300'}
        >
          {status === 'ready' ? 'Ready' : 'Coming Soon'}
        </Badge>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50">{title}</h3>
        <p className="text-sm mt-1 text-gray-500 dark:text-dark-400">{description}</p>
      </div>
    </a>
  )
}
