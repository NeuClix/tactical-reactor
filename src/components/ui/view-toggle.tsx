'use client'

import { cn } from '@/lib/utils'
import { LayoutGrid, Table } from 'lucide-react'

type ViewMode = 'grid' | 'table'

interface ViewToggleProps {
  mode: ViewMode
  onModeChange: (mode: ViewMode) => void
  className?: string
}

export function ViewToggle({ mode, onModeChange, className }: ViewToggleProps) {
  return (
    <div className={cn('inline-flex rounded-lg border p-1 bg-white border-gray-200 dark:bg-dark-800 dark:border-dark-600', className)}>
      <button
        onClick={() => onModeChange('grid')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
          mode === 'grid'
            ? 'bg-primary-500 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-dark-300 dark:hover:text-dark-100 dark:hover:bg-dark-700'
        )}
        aria-label="Grid view"
        aria-pressed={mode === 'grid'}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </button>
      <button
        onClick={() => onModeChange('table')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
          mode === 'table'
            ? 'bg-primary-500 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-dark-300 dark:hover:text-dark-100 dark:hover:bg-dark-700'
        )}
        aria-label="Table view"
        aria-pressed={mode === 'table'}
      >
        <Table className="h-4 w-4" />
        <span className="hidden sm:inline">Table</span>
      </button>
    </div>
  )
}
