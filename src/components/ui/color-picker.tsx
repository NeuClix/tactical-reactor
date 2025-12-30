'use client'

import { cn } from '@/lib/utils'
import { TAG_COLOR_PRESETS, TAG_COLOR_NAMES } from '@/lib/tag-colors'
import { Check } from 'lucide-react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {TAG_COLOR_PRESETS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center transition-all',
            'ring-offset-white dark:ring-offset-dark-900',
            'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2',
            value === color && 'ring-2 ring-offset-2'
          )}
          style={{
            backgroundColor: color,
            '--tw-ring-color': color,
          } as React.CSSProperties}
          title={TAG_COLOR_NAMES[color] || color}
          aria-label={`Select ${TAG_COLOR_NAMES[color] || color} color`}
          aria-pressed={value === color}
        >
          {value === color && (
            <Check className="h-4 w-4 text-white drop-shadow-sm" />
          )}
        </button>
      ))}
    </div>
  )
}
