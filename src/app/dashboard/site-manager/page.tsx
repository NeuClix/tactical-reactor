'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Building2, Phone, MapPin, Clock, Palette, Globe, Image,
  Save, Loader2, Check, Eye, Plus, Trash2, GripVertical,
  Star, MessageSquare, Wrench
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

// ============================================================
// Types
// ============================================================
interface SiteData {
  id: string
  slug: string
  business_name: string
  tagline: string | null
  description: string | null
  industry: string | null
  phone: string | null
  email: string | null
  website_url: string | null
  address_street: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  latitude: number | null
  longitude: number | null
  service_radius_miles: number | null
  business_hours: Record<string, { open: string; close: string }> | null
  logo_url: string | null
  hero_image_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  facebook_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  youtube_url: string | null
  google_business_url: string | null
  yelp_url: string | null
  meta_title: string | null
  meta_description: string | null
  keywords: string[]
  cta_text: string
  cta_phone_text: string
  show_map: boolean
  show_testimonials: boolean
  show_contact_form: boolean
  is_published: boolean
}

interface ServiceData {
  id: string
  title: string
  description: string | null
  icon: string
  price_range: string | null
  is_featured: boolean
  sort_order: number
}

interface TestimonialData {
  id: string
  customer_name: string
  customer_location: string | null
  rating: number
  review_text: string
  service_type: string | null
  is_featured: boolean
}

// ============================================================
// Tab definitions
// ============================================================
const TABS = [
  { id: 'basics', label: 'Business Info', icon: Building2 },
  { id: 'contact', label: 'Contact & Hours', icon: Phone },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'testimonials', label: 'Reviews', icon: Star },
  { id: 'seo', label: 'SEO & Social', icon: Globe },
] as const

type TabId = typeof TABS[number]['id']

// ============================================================
// Main Dashboard Page
// ============================================================
export default function SiteManagerPage() {
  const [activeTab, setActiveTab] = useState<TabId>('basics')
  const [site, setSite] = useState<SiteData | null>(null)
  const [services, setServices] = useState<ServiceData[]>([])
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<Partial<SiteData>>({})

  const supabase = createClient()

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const [siteRes, servicesRes, testimonialsRes] = await Promise.all([
      supabase.from('tr_sites').select('*').eq('user_id', user.id).single(),
      supabase.from('tr_services').select('*').eq('user_id', user.id).order('sort_order'),
      supabase.from('tr_testimonials').select('*').eq('user_id', user.id).order('sort_order'),
    ])

    if (siteRes.data) {
      setSite(siteRes.data as SiteData)
      setForm(siteRes.data)
    }
    setServices((servicesRes.data || []) as ServiceData[])
    setTestimonials((testimonialsRes.data || []) as TestimonialData[])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!site) return
    setSaving(true)
    const { error } = await supabase
      .from('tr_sites')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', site.id)

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  // Service CRUD
  const addService = async () => {
    if (!site) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tr_services')
      .insert({
        site_id: site.id,
        user_id: user.id,
        title: 'New Service',
        description: '',
        icon: 'shield',
        sort_order: services.length,
      })
      .select()
      .single()

    if (data) setServices(prev => [...prev, data as ServiceData])
  }

  const updateService = async (id: string, updates: Partial<ServiceData>) => {
    await supabase.from('tr_services').update(updates).eq('id', id)
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const deleteService = async (id: string) => {
    await supabase.from('tr_services').delete().eq('id', id)
    setServices(prev => prev.filter(s => s.id !== id))
  }

  // Testimonial CRUD
  const addTestimonial = async () => {
    if (!site) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tr_testimonials')
      .insert({
        site_id: site.id,
        user_id: user.id,
        customer_name: 'New Customer',
        review_text: '',
        rating: 5,
        sort_order: testimonials.length,
      })
      .select()
      .single()

    if (data) setTestimonials(prev => [...prev, data as TestimonialData])
  }

  const updateTestimonial = async (id: string, updates: Partial<TestimonialData>) => {
    await supabase.from('tr_testimonials').update(updates).eq('id', id)
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTestimonial = async (id: string) => {
    await supabase.from('tr_testimonials').delete().eq('id', id)
    setTestimonials(prev => prev.filter(t => t.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    )
  }

  if (!site) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-500" />
        <h2 className="text-xl font-bold text-white mb-2">No Site Found</h2>
        <p className="text-gray-400">You don&apos;t have a Tactical Reactor site yet. Contact your administrator to set one up.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Manager</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your Tactical Reactor website â {site.business_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {site.is_published && site.slug && (
            <a
              href={`/site/${site.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Site
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-black font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
        <button
          onClick={() => updateField('is_published', !form.is_published)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            form.is_published ? 'bg-accent-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              form.is_published ? 'left-6' : 'left-0.5'
            }`}
          />
        </button>
        <span className="text-sm text-gray-300">
          {form.is_published ? 'Published â your site is live' : 'Unpublished â site is hidden from the public'}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-800/50 rounded-lg overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
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

        {/* BASICS TAB */}
        {activeTab === 'basics' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Business Name" value={form.business_name} onChange={v => updateField('business_name', v)} />
              <InputField label="Tagline" value={form.tagline} onChange={v => updateField('tagline', v)} placeholder="Your catchy tagline" />
              <InputField label="Industry" value={form.industry} onChange={v => updateField('industry', v)} placeholder="e.g. Roofing" />
              <InputField label="URL Slug" value={form.slug} onChange={v => updateField('slug', v)} placeholder="roof-rescue" />
            </div>
            <TextAreaField label="Description" value={form.description} onChange={v => updateField('description', v)} rows={3} placeholder="Describe your business..." />
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Contact & Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Phone" value={form.phone} onChange={v => updateField('phone', v)} />
              <InputField label="Email" value={form.email} onChange={v => updateField('email', v)} />
              <InputField label="Street Address" value={form.address_street} onChange={v => updateField('address_street', v)} />
              <InputField label="City" value={form.address_city} onChange={v => updateField('address_city', v)} />
              <InputField label="State" value={form.address_state} onChange={v => updateField('address_state', v)} />
              <InputField label="ZIP Code" value={form.address_zip} onChange={v => updateField('address_zip', v)} />
            </div>
            <h3 className="text-lg font-semibold text-white pt-4">CTA Buttons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="CTA Text" value={form.cta_text} onChange={v => updateField('cta_text', v)} placeholder="Get a Free Quote" />
              <InputField label="Phone Button Text" value={form.cta_phone_text} onChange={v => updateField('cta_phone_text', v)} placeholder="Call Now" />
            </div>
          </div>
        )}

        {/* BRANDING TAB */}
        {activeTab === 'branding' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Branding & Appearance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ColorInput label="Primary Color" value={form.primary_color || '#1e40af'} onChange={v => updateField('primary_color', v)} />
              <ColorInput label="Secondary Color" value={form.secondary_color || '#f59e0b'} onChange={v => updateField('secondary_color', v)} />
              <ColorInput label="Accent Color" value={form.accent_color || '#10b981'} onChange={v => updateField('accent_color', v)} />
            </div>
            <InputField label="Font Family" value={form.font_family} onChange={v => updateField('font_family', v)} placeholder="Inter" />
            <InputField label="Logo URL" value={form.logo_url} onChange={v => updateField('logo_url', v)} placeholder="https://..." />
            <InputField label="Hero Image URL" value={form.hero_image_url} onChange={v => updateField('hero_image_url', v)} placeholder="https://..." />
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Services</h3>
              <button onClick={addService} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm">
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>
            {services.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No services yet. Add your first service.</p>
            ) : (
              <div className="space-y-4">
                {services.map(service => (
                  <div key={service.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 space-y-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-600" />
                      <input
                        type="text"
                        value={service.title}
                        onChange={e => updateService(service.id, { title: e.target.value })}
                        className="flex-1 bg-transparent text-white font-semibold outline-none"
                      />
                      <button onClick={() => deleteService(service.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={service.description || ''}
                      onChange={e => updateService(service.id, { description: e.target.value })}
                      placeholder="Describe this service..."
                      className="w-full bg-gray-800/50 text-gray-300 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                      rows={2}
                    />
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={service.price_range || ''}
                        onChange={e => updateService(service.id, { price_range: e.target.value })}
                        placeholder="Price range (optional)"
                        className="flex-1 bg-gray-800/50 text-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-400">
                        <input
                          type="checkbox"
                          checked={service.is_featured}
                          onChange={e => updateService(service.id, { is_featured: e.target.checked })}
                          className="rounded"
                        />
                        Featured
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TESTIMONIALS TAB */}
        {activeTab === 'testimonials' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Customer Reviews</h3>
              <button onClick={addTestimonial} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm">
                <Plus className="w-4 h-4" /> Add Review
              </button>
            </div>
            {testimonials.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet. Add customer testimonials.</p>
            ) : (
              <div className="space-y-4">
                {testimonials.map(t => (
                  <div key={t.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={t.customer_name}
                        onChange={e => updateTestimonial(t.id, { customer_name: e.target.value })}
                        className="bg-transparent text-white font-semibold outline-none"
                        placeholder="Customer name"
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={t.rating}
                          onChange={e => updateTestimonial(t.id, { rating: parseInt(e.target.value) })}
                          className="bg-gray-800 text-gray-300 rounded px-2 py-1 text-sm outline-none"
                        >
                          {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{r} stars</option>
                          ))}
                        </select>
                        <button onClick={() => deleteTestimonial(t.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={t.review_text}
                      onChange={e => updateTestimonial(t.id, { review_text: e.target.value })}
                      placeholder="Customer review text..."
                      className="w-full bg-gray-800/50 text-gray-300 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                      rows={3}
                    />
                    <input
                      type="text"
                      value={t.customer_location || ''}
                      onChange={e => updateTestimonial(t.id, { customer_location: e.target.value })}
                      placeholder="Location (e.g. Dallas, TX)"
                      className="w-full bg-gray-800/50 text-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">SEO & Meta</h3>
            <InputField label="Meta Title" value={form.meta_title} onChange={v => updateField('meta_title', v)} placeholder="Custom page title for Google" />
            <TextAreaField label="Meta Description" value={form.meta_description} onChange={v => updateField('meta_description', v)} rows={2} placeholder="Description shown in search results (150 chars max)" />
            <h3 className="text-lg font-semibold text-white pt-4">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Facebook" value={form.facebook_url} onChange={v => updateField('facebook_url', v)} placeholder="https://facebook.com/..." />
              <InputField label="Instagram" value={form.instagram_url} onChange={v => updateField('instagram_url', v)} placeholder="https://instagram.com/..." />
              <InputField label="LinkedIn" value={form.linkedin_url} onChange={v => updateField('linkedin_url', v)} placeholder="https://linkedin.com/..." />
              <InputField label="YouTube" value={form.youtube_url} onChange={v => updateField('youtube_url', v)} placeholder="https://youtube.com/..." />
              <InputField label="Google Business" value={form.google_business_url} onChange={v => updateField('google_business_url', v)} placeholder="https://g.page/..." />
              <InputField label="Yelp" value={form.yelp_url} onChange={v => updateField('yelp_url', v)} placeholder="https://yelp.com/..." />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Reusable Form Components
// ============================================================
function InputField({ label, value, onChange, placeholder }: {
  label: string; value: any; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-900/50 text-white border border-gray-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500/50 transition-colors"
      />
    </div>
  )
}

function TextAreaField({ label, value, onChange, rows, placeholder }: {
  label: string; value: any; onChange: (v: string) => void; rows?: number; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        rows={rows || 3}
        placeholder={placeholder}
        className="w-full bg-gray-900/50 text-white border border-gray-700/50 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500/50 transition-colors resize-none"
      />
    </div>
  )
}

function ColorInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer border border-gray-700"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-gray-900/50 text-white border border-gray-700/50 rounded-lg px-3 py-2.5 text-sm outline-none font-mono"
        />
      </div>
    </div>
  )
}
