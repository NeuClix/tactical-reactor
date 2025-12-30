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

// Tag types
export type TagOpacityLevel = 1 | 2 | 3 | 4

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  light_opacity: TagOpacityLevel  // 1=Subtle, 2=Medium, 3=Bold, 4=Solid
  dark_opacity: TagOpacityLevel   // 1=Subtle, 2=Medium, 3=Bold, 4=Solid
  light_text_override?: string | null  // Manual override for light mode text color (null = auto)
  dark_text_override?: string | null   // Manual override for dark mode text color (null = auto)
  created_at: string
  updated_at: string
}

// Content types
export type ContentType = 'blog' | 'social' | 'email' | 'page'
export type ContentStatus = 'draft' | 'published' | 'archived'

export interface ContentItem {
  id: string
  user_id: string
  title: string
  content: string
  content_type: ContentType
  status: ContentStatus
  created_at: string
  updated_at: string
  tags?: Tag[] // Populated via join query
}

// Junction table type for content-tag relationships
export interface ContentItemTag {
  content_item_id: string
  tag_id: string
  created_at: string
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
