"use client"

// Platform connection types and configurations

export interface PlatformConnection {
  id: string
  companyId: string
  platform: PlatformType
  platformUserId?: string
  platformUsername?: string
  accessToken?: string
  refreshToken?: string
  tokenExpiresAt?: Date
  scopes?: string[]
  isActive: boolean
  lastSyncAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export type PlatformType = 
  | "twitter"
  | "linkedin" 
  | "facebook"
  | "instagram"
  | "youtube"
  | "tiktok"
  | "pinterest"
  | "threads"
  | "google_analytics"
  | "google_search_console"
  | "hubspot"
  | "salesforce"
  | "pipedrive"
  | "mailchimp"
  | "sendgrid"
  | "convertkit"
  | "wordpress"
  | "webflow"
  | "shopify"
  | "ghost"

export interface PlatformConfig {
  id: PlatformType
  name: string
  category: "social" | "analytics" | "crm" | "email" | "cms" | "ecommerce"
  description: string
  icon: string
  color: string
  authType: "oauth2" | "api_key" | "basic_auth"
  scopes?: string[]
  features: string[]
  publishSupport: boolean
  analyticsSupport: boolean
  docsUrl: string
  setupInstructions?: string
}

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  // Social Media Platforms
  {
    id: "twitter",
    name: "Twitter / X",
    category: "social",
    description: "Post tweets, threads, and engage with your audience",
    icon: "twitter",
    color: "#1DA1F2",
    authType: "oauth2",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    features: ["Post tweets", "Schedule threads", "Analytics", "Auto-retweet"],
    publishSupport: true,
    analyticsSupport: true,
    docsUrl: "https://developer.twitter.com/en/docs",
    setupInstructions: "Create a Twitter Developer App at developer.twitter.com and add your API keys",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "social",
    description: "Share posts to your profile and company pages",
    icon: "linkedin",
    color: "#0A66C2",
    authType: "oauth2",
    scopes: ["r_liteprofile", "r_emailaddress", "w_member_social", "r_organization_social", "w_organization_social"],
    features: ["Personal posts", "Company page posts", "Article publishing", "Analytics"],
    publishSupport: true,
    analyticsSupport: true,
    docsUrl: "https://developer.linkedin.com/",
    setupInstructions: "Create a LinkedIn App at linkedin.com/developers and configure OAuth 2.0",
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "social",
    description: "Post to pages and groups, run ads",
    icon: "facebook",
    color: "#1877F2",
    authType: "oauth2",
    scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
    features: ["Page posts", "Stories", "Reels", "Ad management", "Insights"],
    publishSupport: true,
    analyticsSupport: true,
    docsUrl: "https://developers.facebook.com/",
    setupInstructions: "Create a Facebook App at developers.facebook.com and add Pages permissions",
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "social",
    description: "Share photos, videos, stories and reels",
    icon: "instagram",
    color: "#E4405F",
    authType: "oauth2",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_read_engagement"],
    features: ["Feed posts", "Stories", "Reels", "Carousels", "Insights"],
    publishSupport: true,
    analyticsSupport: true,
    docsUrl: "https://developers.facebook.com/docs/instagram-api/",
    setupInstructions: "Connect via Facebook Business Suite - requires a Facebook Page linked to Instagram",
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "social",
    description: "Upload videos and manage your channel",
    icon: "youtube",
    color: "#FF0000",
    authType: "oauth2",
    scopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"],
    features: ["Video uploads", "Thumbnails", "Playlists", "Analytics", "Comments"],
    publishSupport: true,
    analyticsSupport: true,
    docsUrl: "https://developers.google.com/youtube/v3",
    setupInstructions: "Create credentials in Google Cloud Console with YouTube Data API enabled",
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "social",
    description: "Share short-form videos to TikTok",
    icon: "tiktok",
    color: "#000000",
    authType: "oauth2",
    scopes: ["video.upload", "video.list", "user.info.basic"],
    features: ["Video posts", "Duets", "Analytics"],
    publishSupport: true,
    analyticsSupport: true,
    docsUrl: "https://developers.tiktok.com/",
    setupInstructions: "Register at TikTok for Developers and create an app",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    category: "social",
    description: "Create pins and manage boards",
    icon: "pinterest",
    color: "#E60023",
    authType: "oauth2",
    scopes: ["boards:read", "boards:write", "pins:read", "pins:write"],
    features: ["Pins", "Boards", "Rich pins", "Analytics"],
    publishSupport: true,
    analyticsSupport: true,
    docsUrl: "https://developers.pinterest.com/",
    setupInstructions: "Apply for Pinterest API access and create an app",
  },
  {
    id: "threads",
    name: "Threads",
    category: "social",
    description: "Share posts on Meta's Threads platform",
    icon: "threads",
    color: "#000000",
    authType: "oauth2",
    scopes: ["threads_basic", "threads_content_publish"],
    features: ["Text posts", "Image posts", "Reply threads"],
    publishSupport: true,
    analyticsSupport: false,
    docsUrl: "https://developers.facebook.com/docs/threads/",
    setupInstructions: "Connect via Meta Business Suite",
  },

  // Analytics Platforms
  {
    id: "google_analytics",
    name: "Google Analytics",
    category: "analytics",
    description: "Track website traffic and user behavior",
    icon: "bar-chart",
    color: "#F9AB00",
    authType: "oauth2",
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    features: ["Traffic data", "User behavior", "Conversions", "Real-time"],
    publishSupport: false,
    analyticsSupport: true,
    docsUrl: "https://developers.google.com/analytics",
    setupInstructions: "Create OAuth credentials in Google Cloud Console with Analytics API enabled",
  },
  {
    id: "google_search_console",
    name: "Google Search Console",
    category: "analytics",
    description: "Monitor search performance and SEO",
    icon: "search",
    color: "#4285F4",
    authType: "oauth2",
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    features: ["Search queries", "Click data", "Index status", "Sitemap"],
    publishSupport: false,
    analyticsSupport: true,
    docsUrl: "https://developers.google.com/webmaster-tools",
    setupInstructions: "Verify your site ownership and enable Search Console API",
  },

  // CRM Platforms
  {
    id: "hubspot",
    name: "HubSpot",
    category: "crm",
    description: "Sync contacts, deals, and marketing data",
    icon: "database",
    color: "#FF7A59",
    authType: "oauth2",
    scopes: ["contacts", "content", "forms", "crm.objects.contacts.read"],
    features: ["Contact sync", "Deal tracking", "Email tracking", "Forms"],
    publishSupport: false,
    analyticsSupport: true,
    docsUrl: "https://developers.hubspot.com/",
    setupInstructions: "Create a HubSpot private app or OAuth app in your HubSpot account",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "crm",
    description: "Enterprise CRM integration",
    icon: "database",
    color: "#00A1E0",
    authType: "oauth2",
    scopes: ["api", "refresh_token"],
    features: ["Lead sync", "Opportunity tracking", "Campaign tracking"],
    publishSupport: false,
    analyticsSupport: true,
    docsUrl: "https://developer.salesforce.com/",
    setupInstructions: "Create a Connected App in Salesforce Setup",
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    category: "crm",
    description: "Sales pipeline and deal management",
    icon: "database",
    color: "#1ABC9C",
    authType: "api_key",
    features: ["Deal sync", "Contact management", "Activity tracking"],
    publishSupport: false,
    analyticsSupport: true,
    docsUrl: "https://developers.pipedrive.com/",
    setupInstructions: "Generate an API token in Pipedrive Settings > Personal preferences > API",
  },

  // Email Marketing
  {
    id: "mailchimp",
    name: "Mailchimp",
    category: "email",
    description: "Email campaigns and audience management",
    icon: "mail",
    color: "#FFE01B",
    authType: "oauth2",
    features: ["Campaign creation", "List management", "Automation", "Templates"],
    publishSupport: true,
    analyticsSupport: true,
    docsUrl: "https://mailchimp.com/developer/",
    setupInstructions: "Create an app in Mailchimp's registered apps section",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    category: "email",
    description: "Transactional and marketing emails",
    icon: "mail",
    color: "#1A82E2",
    authType: "api_key",
    features: ["Email sending", "Templates", "Analytics", "Webhooks"],
    publishSupport: true,
    analyticsSupport: true,
    docsUrl: "https://docs.sendgrid.com/",
    setupInstructions: "Create an API key in SendGrid Settings > API Keys",
  },
  {
    id: "convertkit",
    name: "ConvertKit",
    category: "email",
    description: "Email marketing for creators",
    icon: "mail",
    color: "#FB6970",
    authType: "api_key",
    features: ["Sequences", "Forms", "Tags", "Broadcasts"],
    publishSupport: true,
    analyticsSupport: true,
    docsUrl: "https://developers.convertkit.com/",
    setupInstructions: "Find your API key in ConvertKit Settings > Advanced",
  },

  // CMS Platforms
  {
    id: "wordpress",
    name: "WordPress",
    category: "cms",
    description: "Publish content to your WordPress site",
    icon: "globe",
    color: "#21759B",
    authType: "api_key",
    features: ["Post publishing", "Media upload", "Categories", "Tags"],
    publishSupport: true,
    analyticsSupport: false,
    docsUrl: "https://developer.wordpress.org/rest-api/",
    setupInstructions: "Install Application Passwords plugin or use JWT Authentication plugin",
  },
  {
    id: "webflow",
    name: "Webflow",
    category: "cms",
    description: "Publish to Webflow CMS collections",
    icon: "globe",
    color: "#4353FF",
    authType: "api_key",
    features: ["CMS items", "Collections", "Media"],
    publishSupport: true,
    analyticsSupport: false,
    docsUrl: "https://developers.webflow.com/",
    setupInstructions: "Generate an API token in Webflow Project Settings",
  },
  {
    id: "ghost",
    name: "Ghost",
    category: "cms",
    description: "Publish to your Ghost blog",
    icon: "globe",
    color: "#15171A",
    authType: "api_key",
    features: ["Post publishing", "Members", "Tags", "Authors"],
    publishSupport: true,
    analyticsSupport: false,
    docsUrl: "https://ghost.org/docs/admin-api/",
    setupInstructions: "Create a Custom Integration in Ghost Admin > Settings > Integrations",
  },

  // E-commerce
  {
    id: "shopify",
    name: "Shopify",
    category: "ecommerce",
    description: "Sync products and manage your store",
    icon: "shopping-bag",
    color: "#96BF48",
    authType: "oauth2",
    scopes: ["read_products", "write_products", "read_content", "write_content"],
    features: ["Product sync", "Blog posts", "Pages", "Analytics"],
    publishSupport: true,
    analyticsSupport: true,
    docsUrl: "https://shopify.dev/",
    setupInstructions: "Create a custom app in Shopify Admin > Settings > Apps > Develop apps",
  },
]

export function getPlatformConfig(platformId: PlatformType): PlatformConfig | undefined {
  return PLATFORM_CONFIGS.find(p => p.id === platformId)
}

export function getPlatformsByCategory(category: PlatformConfig["category"]): PlatformConfig[] {
  return PLATFORM_CONFIGS.filter(p => p.category === category)
}

export function getPublishablePlatforms(): PlatformConfig[] {
  return PLATFORM_CONFIGS.filter(p => p.publishSupport)
}

// Aliases for compatibility with other components
export type PlatformId = PlatformType

// Platform data for social connections tab
export interface Platform {
  id: PlatformId
  name: string
  category: "social" | "analytics" | "crm" | "email" | "cms" | "ecommerce"
  description: string
  brandColor: string
}

export const PLATFORMS: Platform[] = PLATFORM_CONFIGS.map(config => ({
  id: config.id,
  name: config.name,
  category: config.category,
  description: config.description,
  brandColor: config.color,
}))

// Platform icons mapping
export const PLATFORM_ICONS: Record<string, string> = {
  twitter: "https://abs.twimg.com/favicons/twitter.3.ico",
  linkedin: "https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca",
  facebook: "https://static.xx.fbcdn.net/rsrc.php/yD/r/d4ZIVX-5C-b.ico",
  instagram: "https://static.cdninstagram.com/rsrc.php/v3/yI/r/VsNE-OHk_8a.png",
  youtube: "https://www.youtube.com/s/desktop/c01ea7e3/img/favicon_32x32.png",
  tiktok: "https://www.tiktok.com/favicon.ico",
  pinterest: "https://s.pinimg.com/webapp/favicon-56c00ec5.png",
  threads: "https://static.cdninstagram.com/rsrc.php/v3/yI/r/VsNE-OHk_8a.png",
}
