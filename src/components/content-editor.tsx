'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ContentEditorProps {
  initialData?: any
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

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    content_type: initialData?.content_type || 'blog' as 'blog' | 'social' | 'email' | 'page',
    status: initialData?.status || 'draft' as 'draft' | 'published',
  })

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      if (initialData) {
        // Update
        const { error } = await supabase
          .from('content_items')
          .update(formData)
          .eq('id', initialData.id)

        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('content_items')
          .insert({
            user_id: user.id,
            ...formData,
          })

        if (error) throw error
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-2 text-slate-600">{description}</p>
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
            <label className="text-sm font-medium text-slate-900">
              Title
            </label>
            <Input
              placeholder="Enter content title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Content
            </label>
            <textarea
              placeholder="Write your content here..."
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full h-64 px-3 py-2 border border-slate-200 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Content Type
            </label>
            <select
              value={formData.content_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content_type: e.target.value as 'blog' | 'social' | 'email' | 'page',
                })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-sm"
            >
              <option value="blog">Blog Post</option>
              <option value="social">Social Media</option>
              <option value="email">Email</option>
              <option value="page">Page</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'draft' | 'published',
                })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
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
