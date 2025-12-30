'use client'

import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { PageLoading } from '@/components/ui/loading-spinner'
import ContentEditor from '@/components/content-editor'
import { useAsyncData } from '@/hooks'
import type { Tag } from '@/types'

interface ContentItem {
  id: string
  user_id: string
  title: string
  content: string
  content_type: 'blog' | 'social' | 'email' | 'page'
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  tags?: Tag[]
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
        .select(`
          *,
          content_item_tags (
            tag:tags (id, user_id, name, color, created_at, updated_at)
          )
        `)
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

      // Transform the nested tags structure
      const tags = data.content_item_tags
        ?.map((cit: { tag: Tag }) => cit.tag)
        .filter(Boolean) || []

      return { ...data, tags }
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
