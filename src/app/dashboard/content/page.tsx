'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageLoading } from '@/components/ui/loading-spinner'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { ViewToggle } from '@/components/ui/view-toggle'
import { ContentTable } from '@/components/content-table'
import { TagFilter } from '@/components/tag-filter'
import { TagBadge } from '@/components/tag-badge'
import { useAsyncData } from '@/hooks'
import Link from 'next/link'
import { Plus, Trash2, Eye, Pencil, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ContentPreviewModal } from '@/components/content-preview-modal'
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

type ViewMode = 'grid' | 'table'
type SortOrder = 'newest' | 'oldest'
type SortColumn = 'title' | 'content_type' | 'status' | 'updated_at'
type SortDirection = 'asc' | 'desc'
type ContentTypeFilter = 'all' | 'blog' | 'social' | 'email' | 'page'

const contentTypeLabels: Record<string, string> = {
  all: 'All Types',
  blog: 'Blog Post',
  social: 'Social Media',
  email: 'Email',
  page: 'Page',
}

const contentTypeColors: Record<string, string> = {
  blog: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  social: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  email: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  page: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
}

export default function ContentHubPage() {
  const supabase = createClient()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>('all')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [tableSortColumn, setTableSortColumn] = useState<SortColumn>('updated_at')
  const [tableSortDirection, setTableSortDirection] = useState<SortDirection>('desc')
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const { confirm, ConfirmDialog } = useConfirmDialog()

  // Load view preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('contentViewMode')
    if (saved === 'grid' || saved === 'table') {
      setViewMode(saved)
    }
  }, [])

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

  // Save view preference to localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('contentViewMode', mode)
  }

  const {
    data: items,
    isLoading,
    setData: setItems,
  } = useAsyncData<ContentItem[]>({
    fetchFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('content_items')
        .select(`
          *,
          content_item_tags (
            tag:tags (id, user_id, name, color, created_at, updated_at)
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Transform the nested tags structure
      return (data || []).map((item) => ({
        ...item,
        tags: item.content_item_tags
          ?.map((cit: { tag: Tag }) => cit.tag)
          .filter(Boolean) || [],
      }))
    },
    initialData: [],
  })

  // Filter and sort items
  const filteredItems = useMemo(() => {
    if (!items) return []

    let result = [...items]

    // Filter by search query (includes tag names)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.name.toLowerCase().includes(query))
      )
    }

    // Filter by content type
    if (contentTypeFilter !== 'all') {
      result = result.filter(item => item.content_type === contentTypeFilter)
    }

    // Filter by tags (OR logic - show content with ANY selected tag)
    if (selectedTagIds.length > 0) {
      result = result.filter(item =>
        item.tags?.some(tag => selectedTagIds.includes(tag.id))
      )
    }

    // Sort based on view mode
    if (viewMode === 'table') {
      result.sort((a, b) => {
        let comparison = 0
        switch (tableSortColumn) {
          case 'title':
            comparison = a.title.localeCompare(b.title)
            break
          case 'content_type':
            comparison = a.content_type.localeCompare(b.content_type)
            break
          case 'status':
            comparison = a.status.localeCompare(b.status)
            break
          case 'updated_at':
            comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
            break
        }
        return tableSortDirection === 'asc' ? comparison : -comparison
      })
    } else {
      // Grid view uses simple date sort
      result.sort((a, b) => {
        const dateA = new Date(a.updated_at).getTime()
        const dateB = new Date(b.updated_at).getTime()
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
      })
    }

    return result
  }, [items, searchQuery, contentTypeFilter, selectedTagIds, sortOrder, viewMode, tableSortColumn, tableSortDirection])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, contentTypeFilter, selectedTagIds, sortOrder, viewMode, tableSortColumn, tableSortDirection])

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      // Show all pages if there aren't many
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      // Always show last page
      if (!pages.includes(totalPages)) pages.push(totalPages)
    }

    return pages
  }

  const handleTableSort = (column: SortColumn) => {
    if (tableSortColumn === column) {
      setTableSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setTableSortColumn(column)
      setTableSortDirection('asc')
    }
  }

  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Content',
      description: 'Are you sure you want to delete this content? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    })

    if (!confirmed) return

    try {
      setDeleting(id)
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      setItems((items || []).filter((item) => item.id !== id))
    } catch (error) {
      console.error('Error deleting content:', error)
    } finally {
      setDeleting(null)
    }
  }, [supabase, confirm, items, setItems])

  if (isLoading) {
    return <PageLoading message="Loading content..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-dark-50">
            Content Hub
          </h1>
          <p className="mt-2 text-gray-600 dark:text-dark-300">
            Create, edit, and manage your content
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const res = await fetch('/api/seed-content', { method: 'POST' })
              const data = await res.json()
              if (res.ok) {
                window.location.reload()
              } else {
                alert(data.error || 'Failed to seed')
              }
            }}
          >
            Seed Test Data
          </Button>
          <Link href="/dashboard/content/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Content
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      {items && items.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-dark-400" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Content Type Filter */}
          <select
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value as ContentTypeFilter)}
            className="px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 bg-white border-gray-300 text-gray-900 focus:ring-offset-white dark:bg-dark-800 dark:border-dark-600 dark:text-dark-100 dark:focus:ring-offset-dark-900"
          >
            {Object.entries(contentTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <TagFilter
              tags={availableTags}
              selectedTagIds={selectedTagIds}
              onSelectionChange={setSelectedTagIds}
            />
          )}

          {/* Sort Order (Grid view only) */}
          {viewMode === 'grid' && (
            <Button
              variant="outline"
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </Button>
          )}

          {/* View Toggle */}
          <ViewToggle mode={viewMode} onModeChange={handleViewModeChange} />
        </div>
      )}

      {/* Results count */}
      {items && items.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-dark-400">
          {filteredItems.length === items.length
            ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredItems.length)} of ${filteredItems.length} items`
            : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredItems.length)} of ${filteredItems.length} filtered items (${items.length} total)`
          }
        </p>
      )}

      {!items || items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50 mb-2">
              No content yet
            </h3>
            <p className="text-gray-600 dark:text-dark-300 mb-6">
              Create your first piece of content to get started
            </p>
            <Link href="/dashboard/content/new">
              <Button>Create Content</Button>
            </Link>
          </CardContent>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50 mb-2">
              No matching content
            </h3>
            <p className="text-gray-600 dark:text-dark-300 mb-4">
              Try adjusting your search or filters
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('')
              setContentTypeFilter('all')
              setSelectedTagIds([])
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <ContentTable
          items={paginatedItems}
          sortColumn={tableSortColumn}
          sortDirection={tableSortDirection}
          onSort={handleTableSort}
          onDelete={handleDelete}
          onPreview={setPreviewItem}
          deleting={deleting}
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedItems.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col">
              <CardHeader className="pb-3 flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', contentTypeColors[item.content_type])}>
                    {contentTypeLabels[item.content_type]}
                  </span>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', statusColors[item.status])}>
                    {item.status}
                  </span>
                </div>
                <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                <CardDescription className="mt-2 line-clamp-2 text-sm">
                  {item.content.substring(0, 80)}...
                </CardDescription>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 3).map((tag) => (
                      <TagBadge
                        key={tag.id}
                        name={tag.name}
                        color={tag.color}
                        size="sm"
                        lightOpacity={tag.light_opacity}
                        darkOpacity={tag.dark_opacity}
                        lightTextOverride={tag.light_text_override}
                        darkTextOverride={tag.dark_text_override}
                      />
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-gray-400 dark:text-dark-500 self-center">
                        +{item.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-400">
                  <span>{new Date(item.updated_at).toLocaleDateString()}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPreviewItem(item)}
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Link href={`/dashboard/content/${item.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      title="Delete"
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

      {/* Pagination Controls */}
      {filteredItems.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-dark-400">Items per page:</span>
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
              <option value={48}>48</option>
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

          {/* Page indicator for mobile */}
          <div className="text-sm text-gray-500 dark:text-dark-400 sm:hidden">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {ConfirmDialog}
      <ContentPreviewModal
        item={previewItem}
        isOpen={previewItem !== null}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  )
}
