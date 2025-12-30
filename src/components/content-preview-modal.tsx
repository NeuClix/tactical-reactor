'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TagBadge } from './tag-badge'
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

interface ContentPreviewModalProps {
  item: ContentItem | null
  isOpen: boolean
  onClose: () => void
}

const contentTypeLabels: Record<string, string> = {
  blog: 'Blog Post',
  social: 'Social Media',
  email: 'Email',
  page: 'Page',
}

export function ContentPreviewModal({ item, isOpen, onClose }: ContentPreviewModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] mx-4 bg-white dark:bg-dark-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wide">
              Preview
            </span>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              item.status === 'published'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            )}>
              {item.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-dark-400" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Article Header */}
          <div className="px-6 py-8 border-b border-gray-100 dark:border-dark-800">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400 mb-3">
              <span>{contentTypeLabels[item.content_type]}</span>
              <span>·</span>
              <span>{new Date(item.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-50 mb-4">
              {item.title}
            </h1>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    name={tag.name}
                    color={tag.color}
                    lightOpacity={tag.light_opacity}
                    darkOpacity={tag.dark_opacity}
                    lightTextOverride={tag.light_text_override}
                    darkTextOverride={tag.dark_text_override}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Article Body */}
          <div className="px-6 py-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {/* Render content with basic formatting - split by paragraphs */}
              {item.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 dark:text-dark-200 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800/50">
          <p className="text-xs text-gray-500 dark:text-dark-400 text-center">
            This is a preview of how your content will appear when published
          </p>
        </div>
      </div>
    </div>
  )
}
