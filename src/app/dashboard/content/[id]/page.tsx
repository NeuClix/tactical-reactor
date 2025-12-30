'use client'

import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { PageLoading } from '@/components/ui/loading-spinner'
import ContentEditor from '@/components/content-editor'
import { useAsyncData } from '@/hooks'

interface ContentItem {
  id: string
  user_id: string
  title: string
  content: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export default function EditContentPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const id = params.id as string

  const {
    data: content,
    isLoading,
    error,
  } = useAsyncData<ContentItem | null>({
    fetchFn: async () => {
      // Get current user first
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return null
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
          throw new Error('Content not found or access denied')
        }
        throw queryError
      }

      return data
    },
    dependencies: [id],
  })

  if (isLoading) {
    return <PageLoading message="Loading content..." />
  }

  if (error || !content) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">{error?.message || 'Content not found'}</p>
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
