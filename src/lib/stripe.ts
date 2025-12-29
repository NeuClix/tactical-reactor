import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export const PRICING_TIERS = {
  starter: {
    name: 'Starter',
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!,
    monthlyPrice: 29,
    annualPrice: 290,
    description: 'Perfect for getting started',
    features: [
      'Basic AI generation',
      '100 requests/month',
      'Content management',
      'Brand customization',
    ],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
    monthlyPrice: 99,
    annualPrice: 990,
    description: 'For growing teams',
    features: [
      'Advanced AI features',
      '1,000 requests/month',
      'Team collaboration',
      'Priority support',
      'Advanced analytics',
    ],
  },
  agency: {
    name: 'Agency',
    priceId: process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID!,
    monthlyPrice: 299,
    annualPrice: 2990,
    description: 'For large organizations',
    features: [
      'Unlimited requests',
      'Unlimited users',
      'Priority support',
      'Custom integrations',
      'Dedicated account manager',
    ],
  },
}

export type PricingTier = keyof typeof PRICING_TIERS

export const featureAccess: Record<PricingTier, string[]> = {
  starter: ['basic_generation', 'content_management', 'brand_hub'],
  pro: ['advanced_generation', 'content_management', 'brand_hub', 'analytics'],
  agency: [
    'advanced_generation',
    'content_management',
    'brand_hub',
    'analytics',
    'api_access',
  ],
}
