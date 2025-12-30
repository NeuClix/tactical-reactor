'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { TagBadge } from './tag-badge'
import { ChevronDown, X, Tag as TagIcon } from 'lucide-react'
import type { Tag } from '@/types'

interface TagFilterProps {
  tags: Tag[]
  selectedTagIds: string[]
  onSelectionChange: (tagIds: string[]) => void
  className?: string
}

export function TagFilter({
  tags,
  selectedTagIds,
  onSelectionChange,
  className,
}: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id))

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onSelectionChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onSelectionChange([...selectedTagIds, tagId])
    }
  }

  const clearAll = () => {
    onSelectionChange([])
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors',
          'bg-white border-gray-300 hover:bg-gray-50',
          'dark:bg-dark-800 dark:border-dark-600 dark:hover:bg-dark-700',
          selectedTagIds.length > 0 && 'border-primary-300 dark:border-primary-700'
        )}
      >
        <TagIcon className="h-4 w-4 text-gray-400 dark:text-dark-400" />
        {selectedTagIds.length === 0 ? (
          <span className="text-gray-600 dark:text-dark-300">Filter by tags</span>
        ) : (
          <span className="text-gray-900 dark:text-dark-100">
            {selectedTagIds.length} tag{selectedTagIds.length !== 1 ? 's' : ''}
          </span>
        )}
        <ChevronDown className={cn(
          'h-4 w-4 text-gray-400 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 rounded-md border shadow-lg bg-white border-gray-200 dark:bg-dark-800 dark:border-dark-700">
          {/* Header with clear button */}
          {selectedTagIds.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-100 dark:border-dark-700 flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-dark-400">
                {selectedTagIds.length} selected
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Tag list */}
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {tags.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-dark-400">
                No tags available
              </div>
            ) : (
              tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      'w-full px-2 py-1.5 rounded-md text-left flex items-center justify-between transition-colors',
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-dark-700'
                    )}
                  >
                    <TagBadge
                      name={tag.name}
                      color={tag.color}
                      lightOpacity={tag.light_opacity}
                      darkOpacity={tag.dark_opacity}
                      lightTextOverride={tag.light_text_override}
                      darkTextOverride={tag.dark_text_override}
                    />
                    {isSelected && (
                      <div className="w-4 h-4 rounded bg-primary-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Selected tags display (below the filter) */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color}
              lightOpacity={tag.light_opacity}
              darkOpacity={tag.dark_opacity}
              lightTextOverride={tag.light_text_override}
              darkTextOverride={tag.dark_text_override}
              onRemove={() => toggleTag(tag.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
