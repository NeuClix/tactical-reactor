// ============================================================
// Brand Strategy Hub - Supabase CRUD Operations
// Uses the existing createClient() pattern from src/lib/supabase.ts
// ============================================================

import { createClient } from '@/lib/supabase'
import type { BrandProfile, TargetPersona, BrandProfileFormData, TargetPersonaFormData } from '@/types/brand'

// ---- Brand Profile ----

export async function getBrandProfile(): Promise<BrandProfile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching brand profile:', error)
    return null
  }

  return data as BrandProfile | null
}

export async function upsertBrandProfile(formData: Partial<BrandProfileFormData>): Promise<BrandProfile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if profile exists
  const existing = await getBrandProfile()

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('brand_profiles')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data as BrandProfile
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('brand_profiles')
      .insert({ ...formData, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return data as BrandProfile
  }
}

// ---- Target Personas ----

export async function getPersonas(): Promise<TargetPersona[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('target_personas')
    .select('*')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching personas:', error)
    return []
  }

  return (data as TargetPersona[]) || []
}

export async function createPersona(formData: TargetPersonaFormData): Promise<TargetPersona> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('target_personas')
    .insert({ ...formData, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data as TargetPersona
}

export async function updatePersona(id: string, formData: Partial<TargetPersonaFormData>): Promise<TargetPersona> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('target_personas')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return data as TargetPersona
}

export async function deletePersona(id: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('target_personas')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
}
