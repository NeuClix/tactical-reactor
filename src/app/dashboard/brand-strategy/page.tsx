'use client'

import { useState, useEffect, useCallback } from 'react'
import { Building2, Mic, Eye, ShieldAlert, Users, Save, Loader2, Plus, Check } from 'lucide-react'
import { getBrandProfile, upsertBrandProfile, getPersonas } from '@/lib/supabase/brand'
import type { BrandProfile, BrandProfileFormData, TargetPersona } from '@/types/brand'
import { PersonaCard } from '@/components/brand-strategy/persona-card'
import { PersonaDialog } from '@/components/brand-strategy/persona-dialog'

const TABS = [
  { id: 'identity', label: 'Identity', icon: Building2 },
  { id: 'voice', label: 'Voice & Tone', icon: Mic },
  { id: 'visual', label: 'Visual', icon: Eye },
  { id: 'guardrails', label: 'Guardrails', icon: ShieldAlert },
  { id: 'personas', label: 'Personas', icon: Users },
] as const

type TabId = typeof TABS[number]['id']

export default function BrandStrategyPage() {
  const [activeTab, setActiveTab] = useState<TabId>('identity')
  const [profile, setProfile] = useState<BrandProfile | null>(null)
  const [personas, setPersonas] = useState<TargetPersona[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPersonaDialog, setShowPersonaDialog] = useState(false)
  const [editingPersona, setEditingPersona] = useState<TargetPersona | null>(null)

  // Form state â holds unsaved edits
  const [form, setForm] = useState<Partial<BrandProfileFormData>>({})

  const loadData = useCallback(async () => {
    setLoading(true)
    const [brandData, personaData] = await Promise.all([
      getBrandProfile(),
      getPersonas(),
    ])
    if (brandData) {
      setProfile(brandData)
      setForm(brandData)
    }
    setPersonas(personaData)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateField = (field: keyof BrandProfileFormData, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await upsertBrandProfile(form)
      if (updated) setProfile(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save failed:', err)
    }
    setSaving(false)
  }

  const handlePersonaSaved = () => {
    setShowPersonaDialog(false)
    setEditingPersona(null)
    loadData()
  }

  const handlePersonaDeleted = () => {
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Brand Strategy</h1>
          <p className="text-sm text-gray-400 mt-1">
            Define your brand identity, voice, and target audience
          </p>
        </div>
        {activeTab !== 'personas' && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-black font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-800/50 rounded-lg">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                isActive
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">

        {/* ---- IDENTITY TAB ---- */}
        {activeTab === 'identity' && (
          <div className="space-y-6">
            <SectionHeading
              title="Business Identity"
              description="Core information about your business that feeds into all generated content."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Business Name" value={form.business_name} onChange={v => updateField('business_name', v)} placeholder="e.g. Roof Rescue" />
              <Field label="Industry" value={form.industry} onChange={v => updateField('industry', v)} placeholder="e.g. Roofing & Home Services" />
              <Field label="Tagline" value={form.tagline} onChange={v => updateField('tagline', v)} placeholder="e.g. Your Roof's Best Friend" />
              <Field label="Service Area" value={form.service_area} onChange={v => updateField('service_area', v)} placeholder="e.g. Dallas-Fort Worth Metro" />
              <Field label="Website" value={form.website_url} onChange={v => updateField('website_url', v)} placeholder="https://roofrescue.com" />
              <Field label="Phone" value={form.phone} onChange={v => updateField('phone', v)} placeholder="(555) 123-4567" />
              <Field label="Email" value={form.email} onChange={v => updateField('email', v)} placeholder="info@roofrescue.com" />
              <Field label="Address" value={form.address} onChange={v => updateField('address', v)} placeholder="123 Main St, Dallas, TX 75201" />
            </div>

            <div className="pt-4 border-t border-gray-700/50">
              <TagField
                label="Unique Selling Points"
                description="What sets you apart from competitors?"
                tags={form.unique_selling_points || []}
                onChange={v => updateField('unique_selling_points', v)}
                placeholder="Type a selling point and press Enter"
              />
            </div>

            <div>
              <TagField
                label="Target Keywords"
                description="SEO keywords you want to rank for"
                tags={form.target_keywords || []}
                onChange={v => updateField('target_keywords', v)}
                placeholder="Type a keyword and press Enter"
              />
            </div>
          </div>
        )}

        {/* ---- VOICE & TONE TAB ---- */}
        {activeTab === 'voice' && (
          <div className="space-y-6">
            <SectionHeading
              title="Brand Voice & Tone"
              description="How your brand speaks across all content. This drives AI-generated content style."
            />
            <Field
              label="Brand Voice (short)"
              value={form.brand_voice}
              onChange={v => updateField('brand_voice', v)}
              placeholder="e.g. Expert, trustworthy, and community-focused"
            />
            <TextArea
              label="Voice Description (detailed)"
              value={form.voice_description}
              onChange={v => updateField('voice_description', v)}
              placeholder="Describe your brand's personality in detail. How do you talk to customers? What words do you use and avoid? What's the energy level?"
              rows={5}
            />
            <Field
              label="Tone"
              value={form.tone}
              onChange={v => updateField('tone', v)}
              placeholder="e.g. Professional yet approachable, confident but never arrogant"
            />
          </div>
        )}

        {/* ---- VISUAL TAB ---- */}
        {activeTab === 'visual' && (
          <div className="space-y-6">
            <SectionHeading
              title="Visual Identity"
              description="Colors, fonts, and visual style that define your brand look."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <ColorField label="Primary Color" value={form.primary_color} onChange={v => updateField('primary_color', v)} />
              <ColorField label="Secondary Color" value={form.secondary_color} onChange={v => updateField('secondary_color', v)} />
              <ColorField label="Accent Color" value={form.accent_color} onChange={v => updateField('accent_color', v)} />
            </div>
            <Field
              label="Font Family"
              value={form.font_family}
              onChange={v => updateField('font_family', v)}
              placeholder="e.g. Inter, Montserrat, Open Sans"
            />
            <Field
              label="Logo URL"
              value={form.logo_url}
              onChange={v => updateField('logo_url', v)}
              placeholder="https://... (upload to Media Hub later)"
            />
            <TextArea
              label="Visual Instructions"
              value={form.visual_instructions}
              onChange={v => updateField('visual_instructions', v)}
              placeholder="Describe the visual style for AI-generated images and media. Include preferences for photography style, illustration style, color treatment, composition, etc."
              rows={4}
            />
          </div>
        )}

        {/* ---- GUARDRAILS TAB ---- */}
        {activeTab === 'guardrails' && (
          <div className="space-y-6">
            <SectionHeading
              title="Content Guardrails"
              description="Rules and restrictions that all AI-generated content must follow."
            />
            <TextArea
              label="Content Guardrails"
              value={form.content_guardrails}
              onChange={v => updateField('content_guardrails', v)}
              placeholder={`List what to AVOID in all generated content. Examples:\n- Never mention competitor names directly\n- Don't use fear-based language about roof damage\n- Avoid technical jargon unless explaining it\n- Never promise exact timelines or pricing\n- Don't use stock phrases like "look no further"`}
              rows={10}
            />
          </div>
        )}

        {/* ---- PERSONAS TAB ---- */}
        {activeTab === 'personas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <SectionHeading
                title="Target Personas"
                description="Define your ideal customers. Personas shape the voice and angle of all generated content."
              />
              <button
                onClick={() => { setEditingPersona(null); setShowPersonaDialog(true) }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Persona
              </button>
            </div>

            {personas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">No personas yet</p>
                <p className="text-sm mt-1">Add your first target customer persona to shape your content.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personas.map(persona => (
                  <PersonaCard
                    key={persona.id}
                    persona={persona}
                    onEdit={() => { setEditingPersona(persona); setShowPersonaDialog(true) }}
                    onDeleted={handlePersonaDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Persona Dialog */}
      {showPersonaDialog && (
        <PersonaDialog
          persona={editingPersona}
          onClose={() => { setShowPersonaDialog(false); setEditingPersona(null) }}
          onSaved={handlePersonaSaved}
        />
      )}
    </div>
  )
}

// ============================================================
// Shared sub-components (local to this page)
// ============================================================

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="text-sm text-gray-400 mt-0.5">{description}</p>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder,
}: {
  label: string; value: string | null | undefined; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors"
      />
    </div>
  )
}

function TextArea({
  label, value, onChange, placeholder, rows = 4,
}: {
  label: string; value: string | null | undefined; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors resize-y"
      />
    </div>
  )
}

function ColorField({
  label, value, onChange,
}: {
  label: string; value: string | null | undefined; onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer bg-transparent border border-gray-700"
        />
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors font-mono text-sm"
        />
      </div>
    </div>
  )
}

function TagField({
  label, description, tags, onChange, placeholder,
}: {
  label: string; description?: string; tags: string[]; onChange: (v: string[]) => void; placeholder?: string
}) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
      setInput('')
    }
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/15 text-primary-400 rounded-full text-sm"
          >
            {tag}
            <button
              onClick={() => removeTag(i)}
              className="hover:text-red-400 transition-colors ml-1"
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
          className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors"
        />
        <button
          onClick={addTag}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  )
}
