import Link from 'next/link'
import { Zap, Sparkles, Palette, Rocket } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <Logo size="lg" showTagline linkToHome={false} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl gradient-text-tech">
          AI-Powered Business Intelligence
        </h1>
        <p className="mt-6 text-xl text-dark-200 dark:text-dark-200">
          Your AI-powered SaaS platform for business intelligence and content creation
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="btn-primary text-center">
            Get Started
          </Link>
          <Link href="/dashboard/settings" className="btn-secondary text-center">
            View Settings
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto px-4">
        <FeatureCard
          icon={<Zap className="w-8 h-8" aria-hidden="true" />}
          title="Gen Hub"
          description="Generate AI-powered content with advanced language models"
        />
        <FeatureCard
          icon={<Sparkles className="w-8 h-8" aria-hidden="true" />}
          title="Content Hub"
          description="Create, edit, and manage all your content in one place"
        />
        <FeatureCard
          icon={<Palette className="w-8 h-8" aria-hidden="true" />}
          title="Brand Hub"
          description="Maintain consistent brand identity across all outputs"
        />
        <FeatureCard
          icon={<Rocket className="w-8 h-8" aria-hidden="true" />}
          title="Distribution Hub"
          description="Publish and distribute content across platforms"
        />
      </div>

      {/* Footer Note */}
      <div className="mt-20 text-center">
        <p className="text-sm text-dark-400 dark:text-dark-400">
          Built with Next.js, Supabase, and AI
        </p>
      </div>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="card-gradient p-6 text-center hover:shadow-glow transition-all duration-300 hover:scale-105">
      <div className="flex justify-center text-primary-400 dark:text-primary-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-dark-50 dark:text-dark-50">
        {title}
      </h3>
      <p className="mt-2 text-sm text-dark-300 dark:text-dark-300">
        {description}
      </p>
    </div>
  )
}
