// ============================================================
// Brand Strategy Types — Tactical Reactor
// ============================================================

export interface BrandProfile {
  id: string
  user_id: string
  // Core identity
  business_name: string | null
  tagline: string | null
  industry: string | null
  service_area: string | null
  website_url: string | null
  phone: string | null
  email: string | null
  address: string | null
  // Visual
  logo_url: string | null
  primary_color: string | null
  secondary_color: string | null
  accent_color: string | null
  font_family: string | null
  // Voice & content
  brand_voice: string | null
  tone: string | null
  voice_description: string | null
  visual_instructions: string | null
  content_guardrails: string | null
  // SEO & positioning
  target_keywords: string[]
  unique_selling_points: string[]
  // Timestamps
  created_at: string
  updated_at: string
}

export interface TargetPersona {
  id: string
  user_id: string
  persona_name: string
  age_range: string | null
  income_level: string | null
  pain_points: string[]
  motivations: string[]
  preferred_channels: string[]
  description: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

// Form-friendly types (strip server-managed fields)
export type BrandProfileFormData = Omit<BrandProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type TargetPersonaFormData = Omit<TargetPersona, 'id' | 'user_id' | 'created_at' | 'updated_at'>
