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

  const id = params.id as string

  useEffect(() => {
    loadContent()
  }, [id])

  const loadContent = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setContent(data)
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!content) {
    return <div className="text-center py-8">Content not found</div>
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
