'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageLoading } from '@/components/ui/loading-spinner'
import { useFormData, useNotification, useAsyncData, getAlertVariant } from '@/hooks'

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

interface BrandFormData {
  logo_url: string
  primary_color: string
  secondary_color: string
  font_family: string
}

const defaultFormData: BrandFormData = {
  logo_url: '',
  primary_color: '#3b82f6',
  secondary_color: '#10b981',
  font_family: 'Inter',
}

export default function BrandHubPage() {
  const supabase = createClient()
  const { notification, showSuccess, showError } = useNotification()

  // Load brand profile
  const {
    data: brand,
    isLoading,
    refetch,
  } = useAsyncData<BrandProfile | null>({
    fetchFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data
    },
  })

  // Form state
  const form = useFormData<BrandFormData>({
    initialValues: brand ? {
      logo_url: brand.logo_url || '',
      primary_color: brand.primary_color || '#3b82f6',
      secondary_color: brand.secondary_color || '#10b981',
      font_family: brand.font_family || 'Inter',
    } : defaultFormData,
  })

  // Update form when brand data loads
  const handleSave = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (brand) {
        // Update existing
        const { error } = await supabase
          .from('brand_profiles')
          .update(form.values)
          .eq('id', brand.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase.from('brand_profiles').insert({
          user_id: user.id,
          ...form.values,
        })

        if (error) throw error
      }

      showSuccess('Brand profile saved successfully!')
      await refetch()
    } catch (error) {
      console.error('Error saving brand profile:', error)
      showError('Failed to save brand profile')
    }
  }, [supabase, brand, form.values, showSuccess, showError, refetch])

  if (isLoading) {
    return <PageLoading message="Loading brand profile..." />
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

      {notification && (
        <Alert variant={getAlertVariant(notification.type)}>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Brand Settings</CardTitle>
          <CardDescription>
            Configure your brand&apos;s visual identity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo URL */}
          <div className="space-y-2">
            <label htmlFor="logo-url" className="text-sm font-medium text-slate-900">
              Logo URL
            </label>
            <Input
              id="logo-url"
              placeholder="https://example.com/logo.png"
              value={form.values.logo_url}
              onChange={(e) => form.setFieldValue('logo_url', e.target.value)}
            />
            <p className="text-xs text-slate-500">
              URL to your brand logo image
            </p>
          </div>

          {/* Primary Color */}
          <div className="space-y-2">
            <label htmlFor="primary-color" className="text-sm font-medium text-slate-900">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                id="primary-color"
                type="color"
                value={form.values.primary_color}
                onChange={(e) => form.setFieldValue('primary_color', e.target.value)}
                className="h-10 w-20 rounded cursor-pointer"
                aria-label="Primary color picker"
              />
              <Input
                aria-label="Primary color hex value"
                value={form.values.primary_color}
                onChange={(e) => form.setFieldValue('primary_color', e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-slate-500">
              Your brand&apos;s main color (hex format)
            </p>
          </div>

          {/* Secondary Color */}
          <div className="space-y-2">
            <label htmlFor="secondary-color" className="text-sm font-medium text-slate-900">
              Secondary Color
            </label>
            <div className="flex gap-2">
              <input
                id="secondary-color"
                type="color"
                value={form.values.secondary_color}
                onChange={(e) => form.setFieldValue('secondary_color', e.target.value)}
                className="h-10 w-20 rounded cursor-pointer"
                aria-label="Secondary color picker"
              />
              <Input
                aria-label="Secondary color hex value"
                value={form.values.secondary_color}
                onChange={(e) => form.setFieldValue('secondary_color', e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-slate-500">
              Your brand&apos;s accent color (hex format)
            </p>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <label htmlFor="font-family" className="text-sm font-medium text-slate-900">
              Font Family
            </label>
            <select
              id="font-family"
              value={form.values.font_family}
              onChange={(e) => form.setFieldValue('font_family', e.target.value)}
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
                  style={{ backgroundColor: form.values.primary_color }}
                />
                <span className="text-sm text-slate-600">
                  Primary: {form.values.primary_color}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded"
                  style={{ backgroundColor: form.values.secondary_color }}
                />
                <span className="text-sm text-slate-600">
                  Secondary: {form.values.secondary_color}
                </span>
              </div>
              <div>
                <p
                  className="text-sm"
                  style={{ fontFamily: form.values.font_family }}
                >
                  Font: {form.values.font_family}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={form.isSubmitting}
            className="w-full"
          >
            {form.isSubmitting ? 'Saving...' : 'Save Brand Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
