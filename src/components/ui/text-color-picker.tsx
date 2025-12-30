'use client'

import { cn } from '@/lib/utils'
import { TEXT_COLOR_DARK, TEXT_COLOR_LIGHT } from '@/lib/tag-colors'

interface TextColorPickerProps {
  value: string | null
  autoValue: string
  onChange: (value: string | null) => void
  mode: 'light' | 'dark'
  previewBgColor: string
  className?: string
}

const TEXT_COLORS = [
  { value: TEXT_COLOR_DARK, label: 'Dark', preview: TEXT_COLOR_DARK },
  { value: TEXT_COLOR_LIGHT, label: 'Light', preview: TEXT_COLOR_LIGHT },
]

export function TextColorPicker({
  value,
  autoValue,
  onChange,
  mode,
  previewBgColor,
  className,
}: TextColorPickerProps) {
  const isAuto = value === null || value === undefined
  const currentColor = isAuto ? autoValue : value

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <label className="block text-xs font-medium text-gray-500 dark:text-dark-400">
          {mode === 'light' ? 'Light Mode Text' : 'Dark Mode Text'}
        </label>
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            'text-xs px-2 py-0.5 rounded-full transition-colors',
            isAuto
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-400 dark:hover:bg-dark-600'
          )}
        >
          Auto
        </button>
      </div>

      <div className="flex items-center gap-2">
        {TEXT_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md border transition-colors',
              !isAuto && value === color.value
                ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                : 'border-gray-200 hover:border-gray-300 dark:border-dark-600 dark:hover:border-dark-500'
            )}
          >
            <span
              className="w-4 h-4 rounded border border-gray-300 dark:border-dark-500"
              style={{ backgroundColor: color.preview }}
            />
            <span className="text-xs text-gray-600 dark:text-dark-300">{color.label}</span>
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 dark:text-dark-500">Preview:</span>
        <span
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{
            backgroundColor: previewBgColor,
            color: currentColor,
          }}
        >
          Sample Text
        </span>
        {isAuto && (
          <span className="text-xs text-gray-400 dark:text-dark-500 italic">(auto)</span>
        )}
      </div>
    </div>
  )
}
