'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface BrandProfile {
  id: string
  user_id: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  font_family?: string
  created_at: string
  updated_at: string
}

export default function BrandHubPage() {
  const supabase = createClient()
  const [brand, setBrand] = useState<BrandProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    logo_url: '',
    primary_color: '#3b82f6',
    secondary_color: '#10b981',
    font_family: 'Inter',
  })

  useEffect(() => {
    loadBrandProfile()
  }, [])

  const loadBrandProfile = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setBrand(data)
        setFormData({
          logo_url: data.logo_url || '',
          primary_color: data.primary_color || '#3b82f6',
          secondary_color: data.secondary_color || '#10b981',
          font_family: data.font_family || 'Inter',
        })
      }
    } catch (error) {
      console.error('Error loading brand profile:', error)
      setMessage({ type: 'error', text: 'Failed to load brand profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      if (brand) {
        // Update existing
        const { error } = await supabase
          .from('brand_profiles')
          .update(formData)
          .eq('id', brand.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase.from('brand_profiles').insert({
          user_id: user.id,
          ...formData,
        })

        if (error) throw error
      }

      setMessage({ type: 'success', text: 'Brand profile saved successfully!' })
      await loadBrandProfile()
    } catch (error) {
      console.error('Error saving brand profile:', error)
      setMessage({ type: 'error', text: 'Failed to save brand profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Brand Hub
        </h1>
        <p className="mt-2 text-slate-600">
          Customize your brand identity with logos, colors, and fonts
        </p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Brand Settings</CardTitle>
          <CardDescription>
            Configure your brand's visual identity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Logo URL
            </label>
            <Input
              placeholder="https://example.com/logo.png"
              value={formData.logo_url}
              onChange={(e) =>
                setFormData({ ...formData, logo_url: e.target.value })
              }
            />
            <p className="text-xs text-slate-500">
              URL to your brand logo image
            </p>
          </div>

          {/* Primary Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) =>
                  setFormData({ ...formData, primary_color: e.target.value })
                }
                className="h-10 w-20 rounded cursor-pointer"
              />
              <Input
                value={formData.primary_color}
                onChange={(e) =>
                  setFormData({ ...formData, primary_color: e.target.value })
                }
                className="flex-1"
              />
            </div>
            <p className="text-xs text-slate-500">
              Your brand's main color (hex format)
            </p>
          </div>

          {/* Secondary Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Secondary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.secondary_color}
                onChange={(e) =>
                  setFormData({ ...formData, secondary_color: e.target.value })
                }
                className="h-10 w-20 rounded cursor-pointer"
              />
              <Input
                value={formData.secondary_color}
                onChange={(e) =>
                  setFormData({ ...formData, secondary_color: e.target.value })
                }
                className="flex-1"
              />
            </div>
            <p className="text-xs text-slate-500">
              Your brand's accent color (hex format)
            </p>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Font Family
            </label>
            <select
              value={formData.font_family}
              onChange={(e) =>
                setFormData({ ...formData, font_family: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-sm"
            >
              <option>Inter</option>
              <option>Helvetica</option>
              <option>Times New Roman</option>
              <option>Georgia</option>
              <option>Courier New</option>
            </select>
            <p className="text-xs text-slate-500">
              Default font family for your brand
            </p>
          </div>

          {/* Preview */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-slate-900 mb-4">Preview</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded"
                  style={{ backgroundColor: formData.primary_color }}
                />
                <span className="text-sm text-slate-600">
                  Primary: {formData.primary_color}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded"
                  style={{ backgroundColor: formData.secondary_color }}
                />
                <span className="text-sm text-slate-600">
                  Secondary: {formData.secondary_color}
                </span>
              </div>
              <div>
                <p
                  className="text-sm"
                  style={{ fontFamily: formData.font_family }}
                >
                  Font: {formData.font_family}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Saving...' : 'Save Brand Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
