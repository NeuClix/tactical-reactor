'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { Plus, Trash2, Eye } from 'lucide-react'

interface ContentItem {
  id: string
  user_id: string
  title: string
  content: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export default function ContentHubPage() {
  const supabase = createClient()
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      setItems(data || [])
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      setDeleting(id)
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      setItems(items.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Error deleting content:', error)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Content Hub
          </h1>
          <p className="mt-2 text-slate-600">
            Create, edit, and manage your content
          </p>
        </div>
        <Link href="/dashboard/content/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Content
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No content yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first piece of content to get started
            </p>
            <Link href="/dashboard/content/new">
              <Button>Create Content</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {item.content.substring(0, 100)}...
                    </CardDescription>
                  </div>
                  <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Updated {new Date(item.updated_at).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/content/${item.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
