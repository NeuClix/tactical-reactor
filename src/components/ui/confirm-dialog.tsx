'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { AlertTriangle, Info, AlertCircle, CheckCircle, X } from 'lucide-react'

type DialogVariant = 'default' | 'destructive' | 'warning' | 'success'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  variant?: DialogVariant
  loading?: boolean
}

const variantConfig: Record<DialogVariant, { icon: React.ReactNode; iconBg: string; buttonVariant: 'default' | 'destructive' }> = {
  default: {
    icon: <Info className="h-6 w-6 text-primary-400" />,
    iconBg: 'bg-primary-500/20',
    buttonVariant: 'default',
  },
  destructive: {
    icon: <AlertCircle className="h-6 w-6 text-red-400" />,
    iconBg: 'bg-red-500/20',
    buttonVariant: 'destructive',
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-amber-400" />,
    iconBg: 'bg-amber-500/20',
    buttonVariant: 'default',
  },
  success: {
    icon: <CheckCircle className="h-6 w-6 text-green-400" />,
    iconBg: 'bg-green-500/20',
    buttonVariant: 'default',
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = React.useState(false)
  const [isConfirming, setIsConfirming] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isConfirming) {
        onOpenChange(false)
        onCancel?.()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange, onCancel, isConfirming])

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Confirmation action failed:', error)
    } finally {
      setIsConfirming(false)
    }
  }

  const handleCancel = () => {
    if (isConfirming) return
    onOpenChange(false)
    onCancel?.()
  }

  const config = variantConfig[variant]

  if (!mounted || !open) return null

  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative z-50 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-lg shadow-xl bg-gray-50 border border-gray-200 dark:bg-dark-900 dark:border-primary-500/20" style={{ boxShadow: '0 0 40px rgba(91, 135, 255, 0.1)' }}>
          {/* Close button */}
          <button
            onClick={handleCancel}
            disabled={isConfirming}
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:pointer-events-none text-gray-400 hover:text-gray-600 ring-offset-white dark:text-dark-400 dark:hover:text-dark-200 dark:ring-offset-dark-900"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-6">
            {/* Icon */}
            <div className={cn('mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full', config.iconBg)}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="text-center">
              <h2
                id="confirm-dialog-title"
                className="text-lg font-semibold text-gray-900 dark:text-dark-50"
              >
                {title}
              </h2>
              {description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-dark-300">
                  {description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
                disabled={isConfirming}
              >
                {cancelText}
              </Button>
              <Button
                variant={config.buttonVariant}
                className="flex-1"
                onClick={handleConfirm}
                disabled={isConfirming || loading}
              >
                {isConfirming ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}

// Hook for easier usage
interface UseConfirmDialogOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: DialogVariant
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean
    options: UseConfirmDialogOptions | null
    resolve: ((value: boolean) => void) | null
  }>({
    open: false,
    options: null,
    resolve: null,
  })

  const confirm = React.useCallback((options: UseConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        options,
        resolve,
      })
    })
  }, [])

  const handleConfirm = React.useCallback(() => {
    dialogState.resolve?.(true)
    setDialogState({ open: false, options: null, resolve: null })
  }, [dialogState])

  const handleCancel = React.useCallback(() => {
    dialogState.resolve?.(false)
    setDialogState({ open: false, options: null, resolve: null })
  }, [dialogState])

  const ConfirmDialogComponent = React.useMemo(() => {
    if (!dialogState.options) return null

    return (
      <ConfirmDialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) handleCancel()
        }}
        title={dialogState.options.title}
        description={dialogState.options.description}
        confirmText={dialogState.options.confirmText}
        cancelText={dialogState.options.cancelText}
        variant={dialogState.options.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )
  }, [dialogState, handleConfirm, handleCancel])

  return { confirm, ConfirmDialog: ConfirmDialogComponent }
}
