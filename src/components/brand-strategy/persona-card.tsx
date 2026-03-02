'use client'

import { useState } from 'react'
import { Pencil, Trash2, Star, User } from 'lucide-react'
import { deletePersona } from '@/lib/supabase/brand'
import type { TargetPersona } from '@/types/brand'

interface PersonaCardProps {
  persona: TargetPersona
  onEdit: () => void
  onDeleted: () => void
}

export function PersonaCard({ persona, onEdit, onDeleted }: PersonaCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete persona "${persona.persona_name}"?`)) return
    setDeleting(true)
    try {
      await deletePersona(persona.id)
      onDeleted()
    } catch (err) {
      console.error('Delete failed:', err)
    }
    setDeleting(false)
  }

  return (
    <div className="relative bg-gray-900/50 border border-gray-700/50 rounded-xl p-5 hover:border-primary-500/30 transition-colors group">
      {/* Primary badge */}
      {persona.is_primary && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs text-primary-400 bg-primary-500/15 px-2 py-0.5 rounded-full">
          <Star className="w-3 h-3" />
          Primary
        </div>
      )}

      {/* Avatar + Name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{persona.persona_name}</h3>
          {persona.age_range && (
            <p className="text-xs text-gray-400">
              {persona.age_range}
              {persona.income_level ? ` Â· ${persona.income_level}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {persona.description && (
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">{persona.description}</p>
      )}

      {/* Pain Points */}
      {persona.pain_points.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Pain Points</p>
          <div className="flex flex-wrap gap-1.5">
            {persona.pain_points.map((p, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Motivations */}
      {persona.motivations.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Motivations</p>
          <div className="flex flex-wrap gap-1.5">
            {persona.motivations.map((m, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-accent-500/10 text-accent-400 rounded-full">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Channels */}
      {persona.preferred_channels.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Channels</p>
          <div className="flex flex-wrap gap-1.5">
            {persona.preferred_channels.map((c, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-400 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
