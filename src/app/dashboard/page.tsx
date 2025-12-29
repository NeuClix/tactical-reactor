import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome to NeuClix Tactical Reactor
        </h2>
        <p className="mt-2 text-slate-600">
          Your comprehensive SaaS platform for business intelligence and content creation
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </CardContent>
    </Card>
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
  return (
    <Card className={status === 'coming' ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={status === 'ready' ? 'default' : 'secondary'}>
            {status === 'ready' ? 'Ready' : 'Coming Soon'}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
