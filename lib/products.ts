export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  interval?: "month" | "year"
  features: string[]
  popular?: boolean
  credits?: number
  nuclearTier?: "isotope" | "reactor" | "fusion" | "supernova"
}

// Subscription Plans - Nuclear Themed (Free Website as Entry Point)
export const SUBSCRIPTION_PLANS: Product[] = [
  {
    id: "free",
    name: "Isotope",
    description: "Free local SEO website + hosting",
    priceInCents: 0,
    interval: "month",
    nuclearTier: "isotope",
    features: [
      "Custom Local SEO Website",
      "Free Hosting Forever",
      "Mobile-Optimized Design",
      "SSL Security Included",
      "Basic Visitor Analytics",
      "Contact Form Integration",
    ],
    credits: 5,
  },
  {
    id: "starter",
    name: "Reactor",
    description: "Add AI content & lead capture",
    priceInCents: 2900,
    interval: "month",
    nuclearTier: "reactor",
    features: [
      "Everything in Isotope, plus:",
      "25 AI Content Fusions/month",
      "Advanced Local SEO Tools",
      "Lead Fission Forms (100/month)",
      "Content Half-Life Calendar",
      "Priority Wavelength Support",
    ],
    credits: 25,
  },
  {
    id: "professional",
    name: "Fusion",
    description: "Full marketing reactor suite",
    priceInCents: 7900,
    interval: "month",
    nuclearTier: "fusion",
    features: [
      "Everything in Reactor, plus:",
      "150 AI Content Fusions/month",
      "Competitor Decay Analysis",
      "Lead Fission (500/month)",
      "Multi-Location Support",
      "Social Media Reactor",
      "API Reactor Access",
    ],
    popular: true,
    credits: 150,
  },
  {
    id: "enterprise",
    name: "Supernova",
    description: "Unlimited power for agencies",
    priceInCents: 19900,
    interval: "month",
    nuclearTier: "supernova",
    features: [
      "Everything in Fusion, plus:",
      "Unlimited AI Fusions",
      "White-label Reactor Core",
      "Dedicated Nuclear Engineer",
      "Custom AI Isotope Training",
      "Multi-Brand Management",
      "Critical Mass SLA",
    ],
    credits: -1, // Unlimited
  },
]

// A La Carte Credits - Energy Cells
export const CREDIT_PACKS: Product[] = [
  {
    id: "credits-10",
    name: "10 Energy Cells",
    description: "Quick charge",
    priceInCents: 999,
    features: ["10 Fusion generations"],
    credits: 10,
  },
  {
    id: "credits-50",
    name: "50 Energy Cells",
    description: "Power surge",
    priceInCents: 3999,
    features: ["50 Fusion generations"],
    credits: 50,
    popular: true,
  },
  {
    id: "credits-100",
    name: "100 Energy Cells",
    description: "Reactor boost",
    priceInCents: 6999,
    features: ["100 Fusion generations"],
    credits: 100,
  },
  {
    id: "credits-500",
    name: "500 Energy Cells",
    description: "Critical mass pack",
    priceInCents: 29999,
    features: ["500 Fusion generations"],
    credits: 500,
  },
]

// All products for Stripe
export const PRODUCTS: Product[] = [...SUBSCRIPTION_PLANS.filter((p) => p.id !== "free"), ...CREDIT_PACKS]
