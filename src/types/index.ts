// User types
export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

// Brand types
export interface BrandProfile {
  id: string
  user_id: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  font_family?: string
  created_at: string
  updated_at: string
}

// Content types
export interface ContentItem {
  id: string
  user_id: string
  title: string
  content: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

// Subscription types
export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: 'active' | 'past_due' | 'canceled'
  plan: 'starter' | 'pro' | 'agency'
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

// Generation types
export interface GenerationHistory {
  id: string
  user_id: string
  prompt: string
  response: string
  tokens_used: number
  created_at: string
}
