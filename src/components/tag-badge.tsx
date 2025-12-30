'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTagColorStyles, type OpacityLevel } from '@/lib/tag-colors'
import { useEffect, useState } from 'react'

interface TagBadgeProps {
  name: string
  color: string
  onRemove?: () => void
  size?: 'sm' | 'md'
  className?: string
  lightOpacity?: OpacityLevel  // Optional - uses default if not specified
  darkOpacity?: OpacityLevel   // Optional - uses default if not specified
  lightTextOverride?: string | null  // Optional text color override for light mode
  darkTextOverride?: string | null   // Optional text color override for dark mode
}

export function TagBadge({
  name,
  color,
  onRemove,
  size = 'sm',
  className,
  lightOpacity,
  darkOpacity,
  lightTextOverride,
  darkTextOverride,
}: TagBadgeProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkDarkMode()

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  // Pass opacity and text override values to getTagColorStyles
  const colors = getTagColorStyles(color, lightOpacity, darkOpacity, lightTextOverride, darkTextOverride)

  const style = {
    backgroundColor: isDark ? colors.darkBg : colors.lightBg,
    color: isDark ? colors.darkText : colors.lightText,
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-full font-medium transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-xs min-w-[5rem]' : 'px-2.5 py-1 text-sm min-w-[6rem]',
        className
      )}
      style={style}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label={`Remove ${name} tag`}
        >
          <X className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
        </button>
      )}
    </span>
  )
}
