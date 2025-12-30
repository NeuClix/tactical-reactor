'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showTagline?: boolean
  linkToHome?: boolean
}

export function Logo({ size = 'md', className, showTagline = false, linkToHome = true }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  const taglineSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  }

  const content = (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center gap-1">
        {/* Logo Icon */}
        <div className={cn(
          'flex items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-purple-600',
          size === 'sm' && 'h-6 w-6',
          size === 'md' && 'h-8 w-8',
          size === 'lg' && 'h-12 w-12'
        )}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={cn(
              'text-white',
              size === 'sm' && 'h-4 w-4',
              size === 'md' && 'h-5 w-5',
              size === 'lg' && 'h-7 w-7'
            )}
          >
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Logo Text */}
        <div className="flex flex-col">
          <span className={cn(
            'font-bold tracking-tight leading-none',
            sizeClasses[size]
          )}>
            <span className="text-gray-900 dark:text-dark-50">Neu</span>
            <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 dark:from-primary-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Clix
            </span>
          </span>
          {showTagline && (
            <span className={cn(
              'font-medium tracking-wide uppercase mt-0.5 text-gray-500 dark:text-dark-400',
              taglineSizes[size]
            )}>
              Tactical Reactor
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (linkToHome) {
    return (
      <Link href="/dashboard" className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
