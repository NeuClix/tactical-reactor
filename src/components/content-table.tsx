'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TagBadge } from '@/components/tag-badge'
import { Eye, Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
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

type SortColumn = 'title' | 'content_type' | 'status' | 'updated_at'
type SortDirection = 'asc' | 'desc'

interface ContentTableProps {
  items: ContentItem[]
  sortColumn: SortColumn
  sortDirection: SortDirection
  onSort: (column: SortColumn) => void
  onDelete: (id: string) => void
  onPreview: (item: ContentItem) => void
  deleting: string | null
}

const contentTypeLabels: Record<string, string> = {
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
  published: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
}

function SortIcon({ column, currentColumn, direction }: { column: SortColumn; currentColumn: SortColumn; direction: SortDirection }) {
  if (column !== currentColumn) {
    return <ArrowUpDown className="h-4 w-4 opacity-50" />
  }
  return direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
}

export function ContentTable({ items, sortColumn, sortDirection, onSort, onDelete, onPreview, deleting }: ContentTableProps) {
  const headerClass = 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors'
  const cellClass = 'px-4 py-3 whitespace-nowrap'

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
        <thead className="bg-gray-50 dark:bg-dark-800">
          <tr>
            <th
              className={cn(headerClass, 'text-gray-500 dark:text-dark-400')}
              onClick={() => onSort('title')}
            >
              <div className="flex items-center gap-2">
                Title
                <SortIcon column="title" currentColumn={sortColumn} direction={sortDirection} />
              </div>
            </th>
            <th
              className={cn(headerClass, 'text-gray-500 dark:text-dark-400')}
              onClick={() => onSort('content_type')}
            >
              <div className="flex items-center gap-2">
                Type
                <SortIcon column="content_type" currentColumn={sortColumn} direction={sortDirection} />
              </div>
            </th>
            <th
              className={cn(headerClass, 'text-gray-500 dark:text-dark-400')}
              onClick={() => onSort('status')}
            >
              <div className="flex items-center gap-2">
                Status
                <SortIcon column="status" currentColumn={sortColumn} direction={sortDirection} />
              </div>
            </th>
            <th className={cn(headerClass, 'text-gray-500 dark:text-dark-400 cursor-default hover:bg-transparent dark:hover:bg-transparent')}>
              Tags
            </th>
            <th
              className={cn(headerClass, 'text-gray-500 dark:text-dark-400')}
              onClick={() => onSort('updated_at')}
            >
              <div className="flex items-center gap-2">
                Updated
                <SortIcon column="updated_at" currentColumn={sortColumn} direction={sortDirection} />
              </div>
            </th>
            <th className={cn(headerClass, 'text-gray-500 dark:text-dark-400 cursor-default hover:bg-transparent dark:hover:bg-transparent')}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-dark-700 dark:bg-dark-900">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors">
              <td className={cn(cellClass)}>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-dark-100">{item.title}</span>
                  <span className="text-sm text-gray-500 dark:text-dark-400 truncate max-w-xs">
                    {item.content.substring(0, 60)}...
                  </span>
                </div>
              </td>
              <td className={cn(cellClass)}>
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', contentTypeColors[item.content_type])}>
                  {contentTypeLabels[item.content_type]}
                </span>
              </td>
              <td className={cn(cellClass)}>
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', statusColors[item.status])}>
                  {item.status}
                </span>
              </td>
              <td className={cn(cellClass)}>
                {item.tags && item.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {item.tags.slice(0, 2).map((tag) => (
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
                    {item.tags.length > 2 && (
                      <span className="text-xs text-gray-400 dark:text-dark-500 self-center">
                        +{item.tags.length - 2}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-dark-500">—</span>
                )}
              </td>
              <td className={cn(cellClass, 'text-sm text-gray-500 dark:text-dark-400')}>
                {new Date(item.updated_at).toLocaleDateString()}
              </td>
              <td className={cn(cellClass)}>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreview(item)}
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Link href={`/dashboard/content/${item.id}`}>
                    <Button variant="ghost" size="sm" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    disabled={deleting === item.id}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
