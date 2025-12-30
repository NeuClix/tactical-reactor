'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorPicker } from '@/components/ui/color-picker'
import { OpacityPicker } from '@/components/ui/opacity-picker'
import { TagBadge } from '@/components/tag-badge'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { Pencil, Trash2, Plus, X, Check, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { TAG_COLOR_PRESETS, DEFAULT_LIGHT_OPACITY, DEFAULT_DARK_OPACITY, getTagColorStyles, OPACITY_LEVELS, type OpacityLevel } from '@/lib/tag-colors'
import { TextColorPicker } from '@/components/ui/text-color-picker'
import type { Tag } from '@/types'

interface TagManagementProps {
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export function TagManagement({ onSuccess, onError }: TagManagementProps) {
  const supabase = createClient()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editLightOpacity, setEditLightOpacity] = useState<OpacityLevel>(DEFAULT_LIGHT_OPACITY)
  const [editDarkOpacity, setEditDarkOpacity] = useState<OpacityLevel>(DEFAULT_DARK_OPACITY)
  const [editLightTextOverride, setEditLightTextOverride] = useState<string | null>(null)
  const [editDarkTextOverride, setEditDarkTextOverride] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState<string>(TAG_COLOR_PRESETS[5])
  const [newLightOpacity, setNewLightOpacity] = useState<OpacityLevel>(DEFAULT_LIGHT_OPACITY)
  const [newDarkOpacity, setNewDarkOpacity] = useState<OpacityLevel>(DEFAULT_DARK_OPACITY)
  const [newLightTextOverride, setNewLightTextOverride] = useState<string | null>(null)
  const [newDarkTextOverride, setNewDarkTextOverride] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { confirm, ConfirmDialog } = useConfirmDialog()

  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Filter tags by search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags
    const query = searchQuery.toLowerCase()
    return tags.filter(tag => tag.name.toLowerCase().includes(query))
  }, [tags, searchQuery])

  // Pagination calculations
  const totalPages = Math.ceil(filteredTags.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTags = filteredTags.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('ellipsis')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis')
      if (!pages.includes(totalPages)) pages.push(totalPages)
    }
    return pages
  }

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) {
        console.error('Error fetching tags:', error)
        onError?.('Failed to load tags')
      } else {
        setTags(data || [])
      }
      setLoading(false)
    }
    fetchTags()
  }, [supabase, onError])

  const handleCreateTag = useCallback(async () => {
    if (!newTagName.trim() || saving) return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('tags')
        .insert({
          user_id: user.id,
          name: newTagName.trim(),
          color: newTagColor,
          light_opacity: newLightOpacity,
          dark_opacity: newDarkOpacity,
          light_text_override: newLightTextOverride,
          dark_text_override: newDarkTextOverride,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          onError?.('A tag with this name already exists')
        } else {
          throw error
        }
      } else {
        setTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
        setNewTagName('')
        setNewTagColor(TAG_COLOR_PRESETS[5])
        setNewLightOpacity(DEFAULT_LIGHT_OPACITY)
        setNewDarkOpacity(DEFAULT_DARK_OPACITY)
        setNewLightTextOverride(null)
        setNewDarkTextOverride(null)
        setIsCreating(false)
        onSuccess?.('Tag created successfully')
      }
    } catch (error) {
      console.error('Error creating tag:', error)
      onError?.('Failed to create tag')
    } finally {
      setSaving(false)
    }
  }, [supabase, newTagName, newTagColor, newLightOpacity, newDarkOpacity, newLightTextOverride, newDarkTextOverride, saving, onSuccess, onError])

  const handleEditStart = (tag: Tag) => {
    setEditingTag(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
    setEditLightOpacity(tag.light_opacity ?? DEFAULT_LIGHT_OPACITY)
    setEditDarkOpacity(tag.dark_opacity ?? DEFAULT_DARK_OPACITY)
    setEditLightTextOverride(tag.light_text_override ?? null)
    setEditDarkTextOverride(tag.dark_text_override ?? null)
  }

  const handleEditCancel = () => {
    setEditingTag(null)
    setEditName('')
    setEditColor('')
    setEditLightOpacity(DEFAULT_LIGHT_OPACITY)
    setEditDarkOpacity(DEFAULT_DARK_OPACITY)
    setEditLightTextOverride(null)
    setEditDarkTextOverride(null)
  }

  const handleEditSave = useCallback(async (tagId: string) => {
    if (!editName.trim() || saving) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('tags')
        .update({
          name: editName.trim(),
          color: editColor,
          light_opacity: editLightOpacity,
          dark_opacity: editDarkOpacity,
          light_text_override: editLightTextOverride,
          dark_text_override: editDarkTextOverride,
        })
        .eq('id', tagId)

      if (error) {
        if (error.code === '23505') {
          onError?.('A tag with this name already exists')
        } else {
          throw error
        }
      } else {
        setTags((prev) =>
          prev.map((t) =>
            t.id === tagId
              ? { ...t, name: editName.trim(), color: editColor, light_opacity: editLightOpacity, dark_opacity: editDarkOpacity, light_text_override: editLightTextOverride, dark_text_override: editDarkTextOverride }
              : t
          ).sort((a, b) => a.name.localeCompare(b.name))
        )
        setEditingTag(null)
        setEditName('')
        setEditColor('')
        setEditLightOpacity(DEFAULT_LIGHT_OPACITY)
        setEditDarkOpacity(DEFAULT_DARK_OPACITY)
        setEditLightTextOverride(null)
        setEditDarkTextOverride(null)
        onSuccess?.('Tag updated successfully')
      }
    } catch (error) {
      console.error('Error updating tag:', error)
      onError?.('Failed to update tag')
    } finally {
      setSaving(false)
    }
  }, [supabase, editName, editColor, editLightOpacity, editDarkOpacity, editLightTextOverride, editDarkTextOverride, saving, onSuccess, onError])

  const handleDelete = useCallback(async (tag: Tag) => {
    const confirmed = await confirm({
      title: 'Delete Tag',
      description: `Are you sure you want to delete the tag "${tag.name}"? This will remove it from all content items.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    })

    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tag.id)

      if (error) throw error

      setTags((prev) => prev.filter((t) => t.id !== tag.id))
      onSuccess?.('Tag deleted successfully')
    } catch (error) {
      console.error('Error deleting tag:', error)
      onError?.('Failed to delete tag')
    }
  }, [supabase, confirm, onSuccess, onError])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Tags</CardTitle>
          <CardDescription>Create, edit, and delete your content tags</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Manage Tags</CardTitle>
              <CardDescription>Create, edit, and delete your content tags</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {!isCreating && (
                <Button onClick={() => setIsCreating(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Tag
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search input */}
          {tags.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-dark-400" />
              <Input
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-dark-400 dark:hover:text-dark-200"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Results count */}
          {tags.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-dark-400">
              {filteredTags.length === tags.length
                ? `${tags.length} tag${tags.length !== 1 ? 's' : ''}`
                : `Showing ${filteredTags.length} of ${tags.length} tags`
              }
            </p>
          )}

          {/* Create new tag form */}
          {isCreating && (
            <div className="p-4 rounded-lg border border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-dark-100">
                  Create New Tag
                </span>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewTagName('')
                    setNewTagColor(TAG_COLOR_PRESETS[5])
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                />
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-dark-400 mb-2">
                    Color
                  </label>
                  <ColorPicker value={newTagColor} onChange={setNewTagColor} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <OpacityPicker
                    label="Light Mode Opacity"
                    value={newLightOpacity}
                    onChange={setNewLightOpacity}
                    previewColor={newTagColor}
                    mode="light"
                  />
                  <OpacityPicker
                    label="Dark Mode Opacity"
                    value={newDarkOpacity}
                    onChange={setNewDarkOpacity}
                    previewColor={newTagColor}
                    mode="dark"
                  />
                </div>
                {/* Text Color Pickers */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-dark-700">
                  <TextColorPicker
                    value={newLightTextOverride}
                    autoValue={getTagColorStyles(newTagColor, newLightOpacity, newDarkOpacity).lightTextAuto}
                    onChange={setNewLightTextOverride}
                    mode="light"
                    previewBgColor={`rgba(${parseInt(newTagColor.slice(1, 3), 16)}, ${parseInt(newTagColor.slice(3, 5), 16)}, ${parseInt(newTagColor.slice(5, 7), 16)}, ${OPACITY_LEVELS.light[newLightOpacity]})`}
                  />
                  <TextColorPicker
                    value={newDarkTextOverride}
                    autoValue={getTagColorStyles(newTagColor, newLightOpacity, newDarkOpacity).darkTextAuto}
                    onChange={setNewDarkTextOverride}
                    mode="dark"
                    previewBgColor={`rgba(${parseInt(newTagColor.slice(1, 3), 16)}, ${parseInt(newTagColor.slice(3, 5), 16)}, ${parseInt(newTagColor.slice(5, 7), 16)}, ${OPACITY_LEVELS.dark[newDarkOpacity]})`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-dark-400">Preview:</span>
                  <TagBadge
                    name={newTagName || 'Tag Name'}
                    color={newTagColor}
                    lightOpacity={newLightOpacity}
                    darkOpacity={newDarkOpacity}
                    lightTextOverride={newLightTextOverride}
                    darkTextOverride={newDarkTextOverride}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false)
                    setNewTagName('')
                    setNewTagColor(TAG_COLOR_PRESETS[5])
                    setNewLightOpacity(DEFAULT_LIGHT_OPACITY)
                    setNewDarkOpacity(DEFAULT_DARK_OPACITY)
                    setNewLightTextOverride(null)
                    setNewDarkTextOverride(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || saving}
                >
                  {saving ? 'Creating...' : 'Create Tag'}
                </Button>
              </div>
            </div>
          )}

          {/* Tags list */}
          {tags.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-dark-400">
              <p>No tags created yet.</p>
              <p className="text-sm mt-1">Create your first tag to organize your content.</p>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-dark-400">
              <p>No tags match &quot;{searchQuery}&quot;</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors"
                >
                  {editingTag === tag.id ? (
                    // Edit mode
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave(tag.id)
                            if (e.key === 'Escape') handleEditCancel()
                          }}
                          className="max-w-xs"
                        />
                      </div>
                      <ColorPicker value={editColor} onChange={setEditColor} />
                      <div className="grid grid-cols-2 gap-4">
                        <OpacityPicker
                          label="Light Mode Opacity"
                          value={editLightOpacity}
                          onChange={setEditLightOpacity}
                          previewColor={editColor}
                          mode="light"
                        />
                        <OpacityPicker
                          label="Dark Mode Opacity"
                          value={editDarkOpacity}
                          onChange={setEditDarkOpacity}
                          previewColor={editColor}
                          mode="dark"
                        />
                      </div>
                      {/* Text Color Pickers */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-dark-700">
                        <TextColorPicker
                          value={editLightTextOverride}
                          autoValue={getTagColorStyles(editColor || '#6b7280', editLightOpacity, editDarkOpacity).lightTextAuto}
                          onChange={setEditLightTextOverride}
                          mode="light"
                          previewBgColor={editColor ? `rgba(${parseInt(editColor.slice(1, 3), 16)}, ${parseInt(editColor.slice(3, 5), 16)}, ${parseInt(editColor.slice(5, 7), 16)}, ${OPACITY_LEVELS.light[editLightOpacity]})` : 'rgba(107, 114, 128, 0.2)'}
                        />
                        <TextColorPicker
                          value={editDarkTextOverride}
                          autoValue={getTagColorStyles(editColor || '#6b7280', editLightOpacity, editDarkOpacity).darkTextAuto}
                          onChange={setEditDarkTextOverride}
                          mode="dark"
                          previewBgColor={editColor ? `rgba(${parseInt(editColor.slice(1, 3), 16)}, ${parseInt(editColor.slice(3, 5), 16)}, ${parseInt(editColor.slice(5, 7), 16)}, ${OPACITY_LEVELS.dark[editDarkOpacity]})` : 'rgba(107, 114, 128, 0.3)'}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-dark-400">Preview:</span>
                        <TagBadge
                          name={editName || 'Tag Name'}
                          color={editColor}
                          lightOpacity={editLightOpacity}
                          darkOpacity={editDarkOpacity}
                          lightTextOverride={editLightTextOverride}
                          darkTextOverride={editDarkTextOverride}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditSave(tag.id)}
                          disabled={!editName.trim() || saving}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <>
                      <div className="flex items-center gap-3">
                        <TagBadge
                          name={tag.name}
                          color={tag.color}
                          size="md"
                          lightOpacity={tag.light_opacity}
                          darkOpacity={tag.dark_opacity}
                          lightTextOverride={tag.light_text_override}
                          darkTextOverride={tag.dark_text_override}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStart(tag)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tag)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredTags.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-dark-700">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-dark-400">Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-2 py-1 rounded-md border text-sm bg-white border-gray-300 text-gray-900 dark:bg-dark-800 dark:border-dark-600 dark:text-dark-100"
                >
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {getPageNumbers().map((page, index) => (
                  page === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400 dark:text-dark-500">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  )
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-500 dark:text-dark-400">
                {startIndex + 1}-{Math.min(endIndex, filteredTags.length)} of {filteredTags.length}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {ConfirmDialog}
    </>
  )
}
