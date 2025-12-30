'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { TagBadge } from './tag-badge'
import { ColorPicker } from './ui/color-picker'
import { Plus, X, Search } from 'lucide-react'
import { TAG_COLOR_PRESETS, DEFAULT_LIGHT_OPACITY, DEFAULT_DARK_OPACITY } from '@/lib/tag-colors'
import { Button } from './ui/button'
import type { Tag } from '@/types'

interface TagInputProps {
  selectedTags: Tag[]
  availableTags: Tag[]
  onTagAdd: (tag: Tag) => void
  onTagRemove: (tagId: string) => void
  onTagCreate: (name: string, color: string) => Promise<Tag | null>
  className?: string
  placeholder?: string
}

export function TagInput({
  selectedTags,
  availableTags,
  onTagAdd,
  onTagRemove,
  onTagCreate,
  className,
  placeholder = 'Search tags...',
}: TagInputProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState<string>(TAG_COLOR_PRESETS[5])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const newTagInputRef = useRef<HTMLInputElement>(null)

  // Filter available tags based on search query and exclude already selected
  const unselectedTags = availableTags.filter(
    (tag) => !selectedTags.some((st) => st.id === tag.id)
  )

  const filteredTags = searchQuery.trim()
    ? unselectedTags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : unselectedTags

  // Check if search matches an existing tag exactly
  const exactMatch = availableTags.find(
    (tag) => tag.name.toLowerCase() === searchQuery.toLowerCase()
  )

  // Focus new tag input when creating
  useEffect(() => {
    if (isCreating && newTagInputRef.current) {
      newTagInputRef.current.focus()
    }
  }, [isCreating])

  const handleAddTag = useCallback((tag: Tag) => {
    onTagAdd(tag)
    setSearchQuery('')
  }, [onTagAdd])

  const handleCreateTag = useCallback(async () => {
    if (!newTagName.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const newTag = await onTagCreate(newTagName.trim(), newTagColor)
      if (newTag) {
        onTagAdd(newTag)
        setNewTagName('')
        setNewTagColor(TAG_COLOR_PRESETS[5])
        setIsCreating(false)
        setSearchQuery('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [newTagName, newTagColor, onTagCreate, onTagAdd, isSubmitting])

  const handleStartCreate = useCallback(() => {
    setIsCreating(true)
    // Pre-fill with search query if no exact match exists
    if (searchQuery.trim() && !exactMatch) {
      setNewTagName(searchQuery.trim())
    }
  }, [searchQuery, exactMatch])

  const handleCancelCreate = useCallback(() => {
    setIsCreating(false)
    setNewTagName('')
    setNewTagColor(TAG_COLOR_PRESETS[5])
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isCreating) {
      handleCancelCreate()
    }
  }

  return (
    <div ref={containerRef} className={cn('space-y-3', className)} onKeyDown={handleKeyDown}>
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color}
              lightOpacity={tag.light_opacity}
              darkOpacity={tag.dark_opacity}
              lightTextOverride={tag.light_text_override}
              darkTextOverride={tag.dark_text_override}
              onRemove={() => onTagRemove(tag.id)}
            />
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-dark-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-4 py-2 rounded-md border text-sm transition-colors',
            'bg-white border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'dark:bg-dark-800 dark:border-dark-600 dark:focus:ring-primary-400 dark:focus:border-primary-400',
            'text-gray-900 dark:text-dark-100 placeholder:text-gray-400 dark:placeholder:text-dark-500',
            'outline-none'
          )}
        />
      </div>

      {/* Available tags - click to add */}
      {filteredTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 dark:text-dark-400">
            Click to add
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="cursor-pointer hover:scale-105 transition-transform"
              >
                <TagBadge
                  name={tag.name}
                  color={tag.color}
                  lightOpacity={tag.light_opacity}
                  darkOpacity={tag.dark_opacity}
                  lightTextOverride={tag.light_text_override}
                  darkTextOverride={tag.dark_text_override}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No tags found message */}
      {filteredTags.length === 0 && unselectedTags.length === 0 && !isCreating && (
        <div className="text-center py-4 text-sm text-gray-500 dark:text-dark-400">
          No tags available. Create your first tag below.
        </div>
      )}

      {/* No matches for search */}
      {filteredTags.length === 0 && unselectedTags.length > 0 && searchQuery.trim() && !isCreating && (
        <div className="text-center py-2 text-sm text-gray-500 dark:text-dark-400">
          No tags match &quot;{searchQuery}&quot;
        </div>
      )}

      {/* Create new tag section */}
      {isCreating ? (
        <div className="p-3 rounded-lg border border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-dark-100">
              Create New Tag
            </span>
            <button
              type="button"
              onClick={handleCancelCreate}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <input
              ref={newTagInputRef}
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
              placeholder="Tag name"
              className={cn(
                'w-full px-3 py-2 rounded-md border text-sm transition-colors',
                'bg-white border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                'dark:bg-dark-800 dark:border-dark-600 dark:focus:ring-primary-400 dark:focus:border-primary-400',
                'text-gray-900 dark:text-dark-100 placeholder:text-gray-400 dark:placeholder:text-dark-500',
                'outline-none'
              )}
            />

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-dark-400 mb-2">
                Color
              </label>
              <ColorPicker value={newTagColor} onChange={setNewTagColor} />
            </div>

            {/* Preview */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-dark-400">Preview:</span>
              <TagBadge
                name={newTagName || 'Tag Name'}
                color={newTagColor}
                lightOpacity={DEFAULT_LIGHT_OPACITY}
                darkOpacity={DEFAULT_DARK_OPACITY}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelCreate}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create & Add'}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleStartCreate}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border border-dashed transition-colors',
            'border-gray-300 text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50',
            'dark:border-dark-600 dark:text-dark-400 dark:hover:border-primary-700 dark:hover:text-primary-400 dark:hover:bg-primary-900/20'
          )}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Create new tag</span>
        </button>
      )}
    </div>
  )
}
