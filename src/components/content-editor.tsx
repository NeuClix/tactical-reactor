'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TagInput } from '@/components/tag-input'
import type { Tag } from '@/types'

interface ContentItemData {
  id?: string
  title?: string
  content?: string
  content_type?: 'blog' | 'social' | 'email' | 'page'
  status?: 'draft' | 'published'
  tags?: Tag[]
}

interface ContentEditorProps {
  initialData?: ContentItemData
  onSave: () => void
  title: string
  description: string
}

export default function ContentEditor({
  initialData,
  onSave,
  title,
  description,
}: ContentEditorProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialData?.tags || [])

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    content_type: initialData?.content_type || 'blog' as 'blog' | 'social' | 'email' | 'page',
    status: initialData?.status || 'draft' as 'draft' | 'published',
  })

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (data) {
        setAvailableTags(data)
      }
    }
    fetchTags()
  }, [supabase])

  const handleTagAdd = useCallback((tag: Tag) => {
    setSelectedTags((prev) => [...prev, tag])
  }, [])

  const handleTagRemove = useCallback((tagId: string) => {
    setSelectedTags((prev) => prev.filter((t) => t.id !== tagId))
  }, [])

  const handleTagCreate = useCallback(async (name: string, color: string): Promise<Tag | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('tags')
      .insert({ user_id: user.id, name, color })
      .select()
      .single()

    if (error || !data) {
      console.error('Error creating tag:', error)
      return null
    }

    setAvailableTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }, [supabase])

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      let contentItemId: string

      if (initialData?.id) {
        // Update existing content
        const { error } = await supabase
          .from('content_items')
          .update(formData)
          .eq('id', initialData.id)

        if (error) throw error
        contentItemId = initialData.id
      } else {
        // Create new content
        const { data, error } = await supabase
          .from('content_items')
          .insert({
            user_id: user.id,
            ...formData,
          })
          .select()
          .single()

        if (error) throw error
        contentItemId = data.id
      }

      // Update tag associations
      // First, remove all existing associations
      await supabase
        .from('content_item_tags')
        .delete()
        .eq('content_item_id', contentItemId)

      // Then, add new associations
      if (selectedTags.length > 0) {
        const tagAssociations = selectedTags.map((tag) => ({
          content_item_id: contentItemId,
          tag_id: tag.id,
        }))

        const { error: tagError } = await supabase
          .from('content_item_tags')
          .insert(tagAssociations)

        if (tagError) {
          console.error('Error saving tags:', tagError)
          // Don't throw - content was saved successfully
        }
      }

      setMessage({ type: 'success', text: 'Content saved successfully!' })
      setTimeout(onSave, 1500)
    } catch (error) {
      console.error('Error saving content:', error)
      setMessage({ type: 'error', text: 'Failed to save content' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-dark-50">
          {title}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-dark-300">{description}</p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="content-title" className="text-sm font-medium text-gray-900 dark:text-dark-50">
              Title
            </label>
            <Input
              id="content-title"
              placeholder="Enter content title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label htmlFor="content-body" className="text-sm font-medium text-gray-900 dark:text-dark-50">
              Content
            </label>
            <textarea
              id="content-body"
              placeholder="Write your content here..."
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full h-64 px-3 py-2 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-offset-white dark:bg-dark-800 dark:border-dark-600 dark:text-dark-100 dark:placeholder:text-dark-400 dark:focus:ring-offset-dark-900"
            />
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <label htmlFor="content-type" className="text-sm font-medium text-gray-900 dark:text-dark-50">
              Content Type
            </label>
            <select
              id="content-type"
              value={formData.content_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content_type: e.target.value as 'blog' | 'social' | 'email' | 'page',
                })
              }
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-white border-gray-300 text-gray-900 focus:ring-offset-white dark:bg-dark-800 dark:border-dark-600 dark:text-dark-100 dark:focus:ring-offset-dark-900"
            >
              <option value="blog">Blog Post</option>
              <option value="social">Social Media</option>
              <option value="email">Email</option>
              <option value="page">Page</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label htmlFor="content-status" className="text-sm font-medium text-gray-900 dark:text-dark-50">
              Status
            </label>
            <select
              id="content-status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'draft' | 'published',
                })
              }
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-white border-gray-300 text-gray-900 focus:ring-offset-white dark:bg-dark-800 dark:border-dark-600 dark:text-dark-100 dark:focus:ring-offset-dark-900"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-dark-50">
              Tags
            </label>
            <TagInput
              selectedTags={selectedTags}
              availableTags={availableTags}
              onTagAdd={handleTagAdd}
              onTagRemove={handleTagRemove}
              onTagCreate={handleTagCreate}
              placeholder="Add tags to categorize your content..."
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Content'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
