'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface Notification {
  type: NotificationType
  message: string
}

interface UseNotificationOptions {
  autoDismiss?: boolean
  dismissAfter?: number
}

interface UseNotificationReturn {
  notification: Notification | null
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showInfo: (message: string) => void
  showWarning: (message: string) => void
  dismiss: () => void
  isVisible: boolean
}

export function useNotification(options: UseNotificationOptions = {}): UseNotificationReturn {
  const { autoDismiss = true, dismissAfter = 5000 } = options
  const [notification, setNotification] = useState<Notification | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const show = useCallback((type: NotificationType, message: string) => {
    clearTimer()
    setNotification({ type, message })

    if (autoDismiss) {
      timeoutRef.current = setTimeout(() => {
        setNotification(null)
      }, dismissAfter)
    }
  }, [autoDismiss, dismissAfter, clearTimer])

  const dismiss = useCallback(() => {
    clearTimer()
    setNotification(null)
  }, [clearTimer])

  const showSuccess = useCallback((message: string) => show('success', message), [show])
  const showError = useCallback((message: string) => show('error', message), [show])
  const showInfo = useCallback((message: string) => show('info', message), [show])
  const showWarning = useCallback((message: string) => show('warning', message), [show])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  return {
    notification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismiss,
    isVisible: notification !== null,
  }
}

// Helper component for rendering notifications with Alert
export function getAlertVariant(type: NotificationType): 'default' | 'destructive' {
  return type === 'error' ? 'destructive' : 'default'
}
