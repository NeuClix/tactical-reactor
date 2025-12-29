'use client'

import { useRouter } from 'next/navigation'
import ContentEditor from '@/components/content-editor'

export default function NewContentPage() {
  const router = useRouter()

  const handleSave = () => {
    router.push('/dashboard/content')
  }

  return (
    <ContentEditor
      onSave={handleSave}
      title="Create New Content"
      description="Start creating your content here"
    />
  )
}
