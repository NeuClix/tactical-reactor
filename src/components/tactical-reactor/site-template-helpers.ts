// TR helper types â exported for reuse
export interface TRSite {
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
  address_country: string
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
  twitter_url: string | null
  youtube_url: string | null
  google_business_url: string | null
  yelp_url: string | null
  meta_title: string | null
  meta_description: string | null
  keywords: string[]
  pwa_name: string | null
  pwa_short_name: string | null
  pwa_theme_color: string
  pwa_background_color: string
  show_map: boolean
  show_testimonials: boolean
  show_contact_form: boolean
  cta_text: string
  cta_phone_text: string
  google_analytics_id: string | null
  facebook_pixel_id: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface TRService {
  id: string
  site_id: string
  user_id: string
  title: string
  description: string | null
  icon: string
  image_url: string | null
  price_range: string | null
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface TRTestimonial {
  id: string
  site_id: string
  user_id: string
  customer_name: string
  customer_location: string | null
  customer_avatar_url: string | null
  rating: number
  review_text: string
  service_type: string | null
  review_date: string | null
  source: string
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface TRImage {
  id: string
  site_id: string
  user_id: string
  image_url: string
  alt_text: string | null
  caption: string | null
  category: string
  sort_order: number
  created_at: string
}
