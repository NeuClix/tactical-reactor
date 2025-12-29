'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PRICING_TIERS, type PricingTier } from '@/lib/stripe'
import { Check } from 'lucide-react'

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<PricingTier>('starter')

  const handleCheckout = async (tier: PricingTier) => {
    setLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: PRICING_TIERS[tier].priceId,
          tier,
        }),
      })

      const { url } = await response.json()

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600">
            Choose the perfect plan for your business intelligence needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {(Object.entries(PRICING_TIERS) as [PricingTier, typeof PRICING_TIERS.starter][]).map(
            ([tier, details]) => (
              <Card
                key={tier}
                className={`flex flex-col ${
                  tier === 'pro' ? 'ring-2 ring-blue-500 relative' : ''
                }`}
              >
                {tier === 'pro' && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{details.name}</CardTitle>
                  <CardDescription>{details.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-6">
                    {/* Price */}
                    <div>
                      <div className="text-5xl font-bold text-slate-900">
                        ${details.monthlyPrice}
                      </div>
                      <p className="text-slate-600 text-sm mt-2">
                        per month, billed annually at ${details.annualPrice}/year
                      </p>
                    </div>

                    {/* CTA */}
                    <Button
                      onClick={() => handleCheckout(tier)}
                      disabled={loading}
                      className="w-full"
                      variant={tier === 'pro' ? 'default' : 'outline'}
                    >
                      {loading ? 'Processing...' : 'Get Started'}
                    </Button>

                    {/* Features */}
                    <div className="space-y-3">
                      {details.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900">
                Can I change my plan anytime?
              </h3>
              <p className="text-slate-600 mt-2">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Do you offer a free trial?
              </h3>
              <p className="text-slate-600 mt-2">
                Contact us for a free trial of any plan. We're happy to help you get started.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                What happens if I exceed my request limit?
              </h3>
              <p className="text-slate-600 mt-2">
                We'll notify you when you're approaching your limit. You can upgrade to a higher tier or purchase additional requests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
