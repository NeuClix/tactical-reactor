'use client'

import { cn } from '@/lib/utils'
import { OPACITY_LABELS, type OpacityLevel } from '@/lib/tag-colors'

interface OpacityPickerProps {
  label: string
  value: OpacityLevel
  onChange: (level: OpacityLevel) => void
  previewColor?: string
  mode: 'light' | 'dark'
  className?: string
}

export function OpacityPicker({
  label,
  value,
  onChange,
  previewColor = '#3b82f6',
  mode,
  className,
}: OpacityPickerProps) {
  const levels: OpacityLevel[] = [1, 2, 3, 4]

  // Get opacity value for preview
  const getOpacityValue = (level: OpacityLevel): number => {
    if (mode === 'light') {
      return level === 1 ? 0.15 : level === 2 ? 0.35 : level === 3 ? 0.55 : 0.95
    }
    return level === 1 ? 0.20 : level === 2 ? 0.45 : level === 3 ? 0.70 : 0.90
  }

  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return `rgba(59, 130, 246, ${alpha})`
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-xs font-medium text-gray-500 dark:text-dark-400">
        {label}
      </label>
      <div className="flex gap-2">
        {levels.map((level) => {
          const isSelected = value === level
          const opacity = getOpacityValue(level)
          const bgColor = hexToRgba(previewColor, opacity)

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={cn(
                'flex-1 py-2 px-3 rounded-md border-2 transition-all text-xs font-medium',
                isSelected
                  ? 'border-primary-500 ring-2 ring-primary-500/20'
                  : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
              )}
            >
              <div
                className="h-4 rounded mb-1 mx-auto w-full"
                style={{ backgroundColor: bgColor }}
              />
              <span className={cn(
                'block',
                isSelected
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-dark-300'
              )}>
                {OPACITY_LABELS[level]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
