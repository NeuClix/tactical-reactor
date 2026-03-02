'use client'

import { useState } from 'react'
import { X, Loader2, Save } from 'lucide-react'
import { createPersona, updatePersona } from '@/lib/supabase/brand'
import type { TargetPersona, TargetPersonaFormData } from '@/types/brand'

interface PersonaDialogProps {
  persona: TargetPersona | null  // null = creating new
  onClose: () => void
  onSaved: () => void
}

const EMPTY_FORM: TargetPersonaFormData = {
  persona_name: '',
  age_range: '',
  income_level: '',
  pain_points: [],
  motivations: [],
  preferred_channels: [],
  description: '',
  is_primary: false,
}

export function PersonaDialog({ persona, onClose, onSaved }: PersonaDialogProps) {
  const isEditing = !!persona
  const [form, setForm] = useState<TargetPersonaFormData>(
    persona
      ? {
          persona_name: persona.persona_name,
          age_range: persona.age_range,
          income_level: persona.income_level,
          pain_points: persona.pain_points || [],
          motivations: persona.motivations || [],
          preferred_channels: persona.preferred_channels || [],
          description: persona.description,
          is_primary: persona.is_primary,
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)

  const updateField = (field: keyof TargetPersonaFormData, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.persona_name.trim()) return

    setSaving(true)
    try {
      if (isEditing && persona) {
        await updatePersona(persona.id, form)
      } else {
        await createPersona(form)
      }
      onSaved()
    } catch (err) {
      console.error('Save persona failed:', err)
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? 'Edit Persona' : 'New Target Persona'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Persona Name *</label>
            <input
              type="text"
              value={form.persona_name}
              onChange={e => updateField('persona_name', e.target.value)}
              placeholder="e.g. Homeowner Helen"
              required
              className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
            />
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Age Range</label>
              <input
                type="text"
                value={form.age_range || ''}
                onChange={e => updateField('age_range', e.target.value)}
                placeholder="e.g. 35-55"
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Income Level</label>
              <input
                type="text"
                value={form.income_level || ''}
                onChange={e => updateField('income_level', e.target.value)}
                placeholder="e.g. Middle to upper"
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={form.description || ''}
              onChange={e => updateField('description', e.target.value)}
              placeholder="Describe this persona â who are they, what's their situation, what do they need?"
              rows={3}
              className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 resize-y"
            />
          </div>

          {/* Tag fields */}
          <DialogTagField
            label="Pain Points"
            tags={form.pain_points}
            onChange={v => updateField('pain_points', v)}
            placeholder="e.g. Leaking roof"
            color="red"
          />
          <DialogTagField
            label="Motivations"
            tags={form.motivations}
            onChange={v => updateField('motivations', v)}
            placeholder="e.g. Protect family"
            color="green"
          />
          <DialogTagField
            label="Preferred Channels"
            tags={form.preferred_channels}
            onChange={v => updateField('preferred_channels', v)}
            placeholder="e.g. Google Search"
            color="blue"
          />

          {/* Primary toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_primary}
              onChange={e => updateField('is_primary', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-primary-500 focus:ring-primary-500/30"
            />
            <span className="text-sm text-gray-300">Primary persona (used as default for content generation)</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.persona_name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-black rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : isEditing ? 'Update Persona' : 'Create Persona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Mini tag input for the dialog
function DialogTagField({
  label, tags, onChange, placeholder, color,
}: {
  label: string; tags: string[]; onChange: (v: string[]) => void; placeholder?: string; color: 'red' | 'green' | 'blue'
}) {
  const [input, setInput] = useState('')

  const colorMap = {
    red: 'bg-red-500/10 text-red-400',
    green: 'bg-accent-500/10 text-accent-400',
    blue: 'bg-blue-500/10 text-blue-400',
  }

  const addTag = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
      setInput('')
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {tags.map((tag, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${colorMap[color]}`}
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((_, idx) => idx !== i))}
              className="hover:text-white ml-0.5"
            >
              Ã
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  )
}

