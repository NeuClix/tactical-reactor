import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        default: 'text-primary',
        muted: 'text-slate-400',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label={label || 'Loading'}
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      <div className={cn(spinnerVariants({ size, variant }))} />
      {label && (
        <span className="ml-2 text-sm text-slate-600">{label}</span>
      )}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  )
)
LoadingSpinner.displayName = 'LoadingSpinner'

interface PageLoadingProps {
  message?: string
}

function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <LoadingSpinner size="xl" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}

interface ButtonLoadingProps {
  className?: string
}

function ButtonLoading({ className }: ButtonLoadingProps) {
  return <LoadingSpinner size="sm" variant="white" className={className} />
}

export { LoadingSpinner, PageLoading, ButtonLoading, spinnerVariants }
