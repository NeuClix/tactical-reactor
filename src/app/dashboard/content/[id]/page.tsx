'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import ContentEditor from '@/components/content-editor'

export default function EditContentPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const id = params.id as string

  useEffect(() => {
    loadContent()
  }, [id])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user first
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Explicit user_id check for defense-in-depth (RLS also protects)
      const { data, error: queryError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (queryError) {
        if (queryError.code === 'PGRST116') {
          // No rows returned - either doesn't exist or not owned by user
          setError('Content not found or access denied')
        } else {
          throw queryError
        }
        return
      }

      setContent(data)
    } catch (err) {
      console.error('Error loading content:', err)
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error || !content) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">{error || 'Content not found'}</p>
        <button
          onClick={() => router.push('/dashboard/content')}
          className="mt-4 text-accent-400 hover:underline"
        >
          Back to Content Hub
        </button>
      </div>
    )
  }

  const handleSave = () => {
    router.push('/dashboard/content')
  }

  return (
    <ContentEditor
      initialData={content}
      onSave={handleSave}
      title="Edit Content"
      description="Update your content here"
    />
  )
}
