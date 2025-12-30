'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, LayoutDashboard, HelpCircle } from 'lucide-react'
import Link from 'next/link'

interface DashboardErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error('Dashboard error:', error)
  }, [error])

  // Determine error type for user-friendly messaging
  const getErrorInfo = () => {
    const message = error.message.toLowerCase()

    if (message.includes('unauthorized') || message.includes('auth')) {
      return {
        title: 'Authentication Required',
        description: 'Your session may have expired. Please sign in again.',
        showLogin: true,
      }
    }

    if (message.includes('subscription') || message.includes('plan')) {
      return {
        title: 'Subscription Issue',
        description: 'There was a problem with your subscription. Please check your billing settings.',
        showBilling: true,
      }
    }

    if (message.includes('network') || message.includes('fetch')) {
      return {
        title: 'Connection Problem',
        description: 'Unable to connect to the server. Please check your internet connection.',
        showRetry: true,
      }
    }

    return {
      title: 'Dashboard Error',
      description: 'Something went wrong while loading this page.',
      showRetry: true,
    }
  }

  const errorInfo = getErrorInfo()

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-xl">{errorInfo.title}</CardTitle>
          <CardDescription>{errorInfo.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <details className="rounded-md bg-slate-100 p-3 text-sm">
            <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900">
              Technical Details
            </summary>
            <div className="mt-2 space-y-1">
              <p className="font-mono text-xs text-slate-600 break-all">
                {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p className="text-xs text-slate-500">
                  Reference: {error.digest}
                </p>
              )}
            </div>
          </details>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="flex-1 min-w-[120px]"
            onClick={reset}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link href="/dashboard" className="flex-1 min-w-[120px]">
            <Button variant="default" className="w-full">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard Home
            </Button>
          </Link>
          <Link href="/support" className="w-full">
            <Button variant="ghost" className="w-full">
              <HelpCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
